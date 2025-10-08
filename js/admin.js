/**
 * YUMMY Restaurant - Admin Dashboard
 * Quản lý menu, bàn, đơn hàng với Firebase integration
 */

// Import Firebase Service
import { YummyFirebaseService } from './firebase-service.js';

class YummyAdmin {
  constructor() {
    this.currentPage = 'auth';
    this.currentUser = null;
    this.isAuthenticated = false;
    this.firebaseService = new YummyFirebaseService();
    this.currentEditItemId = null;

    this.init();
  }

  async init() {
    // Firebase service already initialized in constructor
    console.log('🔥 Firebase service ready:', this.firebaseService);
    
    // Initialize authentication listener
    this.initAuthListener();
    
    // Initialize page navigation
    this.initNavigation();
    
    // Initialize modals and forms
    this.initModals();
    
    console.log('✅ YummyAdmin initialized');
  }

  initAuthListener() {
    // Listen for auth state changes
    window.addEventListener('yummy-auth-changed', (event) => {
      const { user, isLoggedIn } = event.detail;
      this.handleAuthStateChange(user, isLoggedIn);
    });

    // Initialize login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  async handleAuthStateChange(user, isLoggedIn) {
    this.currentUser = user;
    this.isAuthenticated = isLoggedIn;

    if (isLoggedIn && user) {
      // Check if user is admin
      const isAdmin = await this.firebaseService.isAdmin();
      if (isAdmin) {
        this.showAdminDashboard();
      } else {
        this.showError('Tài khoản không có quyền admin');
        await this.firebaseService.signOut();
      }
    } else {
      this.showAuthPage();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (!email || !password) {
      this.showError('Vui lòng nhập email và mật khẩu');
      return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';
    submitBtn.disabled = true;

    try {
      const result = await this.firebaseService.signIn(email, password);
      if (!result.success) {
        this.showError(result.error || 'Đăng nhập thất bại');
        return;
      }
    } catch (error) {
      this.showError('Lỗi kết nối. Vui lòng thử lại');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  showAuthPage() {
    this.switchToPage('auth');
    this.updateNavigation();
  }

  showAdminDashboard() {
    this.switchToPage('dashboard');
    this.updateNavigation();
    this.loadDashboardData();
  }

  initNavigation() {
    // Page navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        
        if (!this.isAuthenticated && page !== 'auth') {
          this.showError('Vui lòng đăng nhập để tiếp tục');
          return;
        }
        
        this.switchToPage(page);
      });
    });

    // Button handlers
    this.initButtonHandlers();
  }

  initButtonHandlers() {
    // Add menu item button
    const addMenuBtn = document.getElementById('add-menu-item-btn');
    if (addMenuBtn) {
      addMenuBtn.addEventListener('click', () => this.openMenuItemModal());
    }

    // Sync menu button
    const syncMenuBtn = document.getElementById('sync-menu-btn');
    if (syncMenuBtn) {
      syncMenuBtn.addEventListener('click', () => this.loadMenuItems());
    }

    // Add table button
    const addTableBtn = document.getElementById('add-table-btn');
    if (addTableBtn) {
      addTableBtn.addEventListener('click', () => this.openTableModal());
    }

    // Initialize sample data button
    window.initializeSampleData = () => this.initializeSampleData();
  }

  switchToPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageName;
      
      // Load page-specific data
      this.loadPageData(pageName);
    }

    this.updateNavigation();
  }

  updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const page = link.getAttribute('data-page');
      if (page === this.currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  async loadPageData(pageName) {
    switch (pageName) {
      case 'dashboard':
        await this.loadDashboardData();
        break;
      case 'menu-management':
        await this.loadMenuItems();
        break;
      case 'orders':
        await this.loadOrders();
        break;
      case 'tables':
        await this.loadTables();
        break;
    }
  }

  async loadDashboardData() {
    try {
      // Load basic stats
      const [ordersResult, tablesResult, menuResult] = await Promise.all([
        this.firebaseService.getOrders({ limit: 100 }),
        this.firebaseService.getTables(),
        this.firebaseService.getMenuItems()
      ]);

      // Update dashboard stats
      if (ordersResult.success) {
        const todayOrders = ordersResult.data.filter(order => {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        });

        document.getElementById('orders-today').textContent = todayOrders.length;
        
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        document.getElementById('revenue-today').textContent = this.formatCurrency(todayRevenue);
      }

      if (tablesResult.success) {
        const occupiedTables = tablesResult.data.filter(table => table.status === 'occupied');
        document.getElementById('tables-occupied').textContent = occupiedTables.length;
      }

      if (menuResult.success) {
        const activeItems = menuResult.data.filter(item => item.isActive !== false);
        document.getElementById('menu-items-active').textContent = activeItems.length;
      }

    } catch (error) {
      console.error('❌ Load dashboard data error:', error);
    }
  }

  async loadMenuItems() {
    const container = document.getElementById('menu-items-grid');
    if (!container) return;

    // Show loading
    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Đang tải menu...</p>
      </div>
    `;

    try {
      const result = await this.firebaseService.getMenuItems();
      
      if (result.success) {
        this.displayMenuItems(result.data);
        this.updateMenuStats(result.data);
      } else {
        container.innerHTML = `
          <div class="error-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>Lỗi tải menu: ${result.error}</p>
            <button class="btn btn-secondary" onclick="yummyAdmin.loadMenuItems()">Thử lại</button>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Load menu items error:', error);
      container.innerHTML = `
        <div class="error-message">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>Lỗi kết nối Firebase</p>
          <button class="btn btn-secondary" onclick="yummyAdmin.loadMenuItems()">Thử lại</button>
        </div>
      `;
    }
  }

  displayMenuItems(items) {
    const container = document.getElementById('menu-items-grid');
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-utensils"></i>
          <h3>Chưa có món ăn nào</h3>
          <p>Thêm món ăn đầu tiên cho nhà hàng</p>
          <button class="btn btn-primary" onclick="yummyAdmin.openMenuItemModal()">
            <i class="fa-solid fa-plus"></i> Thêm món mới
          </button>
        </div>
      `;
      return;
    }

    const menuItemsHtml = items.map(item => `
      <div class="menu-item-card" data-id="${item.id}">
        <div class="item-image">
          <img src="${item.image || this.getPlaceholderImage(item.name)}" alt="${item.name}" 
               onerror="this.src='https://placehold.co/300x200/e9a28a/FFFFFF?text=${encodeURIComponent(item.name)}'">
          <div class="item-status ${item.isActive !== false ? 'active' : 'inactive'}">
            ${item.isActive !== false ? 'Đang bán' : 'Ngừng bán'}
          </div>
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          <p class="item-category">${item.category || 'Chưa phân loại'}</p>
          <p class="item-description">${item.description || 'Chưa có mô tả'}</p>
          <div class="item-price">${this.formatCurrency(item.price)}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-secondary" onclick="yummyAdmin.editMenuItem('${item.id}')">
            <i class="fa-solid fa-edit"></i> Sửa
          </button>
          <button class="btn btn-sm btn-danger" onclick="yummyAdmin.deleteMenuItem('${item.id}', '${item.name}')">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
          <button class="btn btn-sm ${item.isActive !== false ? 'btn-warning' : 'btn-success'}" 
                  onclick="yummyAdmin.toggleMenuItemStatus('${item.id}', ${item.isActive !== false})">
            <i class="fa-solid fa-${item.isActive !== false ? 'pause' : 'play'}"></i> 
            ${item.isActive !== false ? 'Ngừng bán' : 'Bán lại'}
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = menuItemsHtml;
  }

  updateMenuStats(items) {
    const totalItems = items.length;
    const activeItems = items.filter(item => item.isActive !== false).length;
    const inactiveItems = totalItems - activeItems;
    const avgPrice = totalItems > 0 ? items.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems : 0;

    document.getElementById('total-menu-items').textContent = totalItems;
    document.getElementById('active-menu-items').textContent = activeItems;
    document.getElementById('inactive-menu-items').textContent = inactiveItems;
    document.getElementById('avg-menu-price').textContent = this.formatCurrency(avgPrice);
  }

  // ==================== MODAL MANAGEMENT ====================

  initModals() {
    // Menu item form
    const menuForm = document.getElementById('menu-item-form');
    if (menuForm) {
      menuForm.addEventListener('submit', (e) => this.handleMenuItemSubmit(e));
    }

    // Table form
    const tableForm = document.getElementById('table-form');
    if (tableForm) {
      tableForm.addEventListener('submit', (e) => this.handleTableSubmit(e));
    }

    // Close modals on background click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
    });
  }

  openMenuItemModal(itemId = null) {
    const modal = document.getElementById('menu-item-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('menu-item-form');
    
    this.currentEditItemId = itemId;
    
    if (itemId) {
      title.textContent = 'Chỉnh sửa món ăn';
      this.loadMenuItemForEdit(itemId);
    } else {
      title.textContent = 'Thêm món mới';
      form.reset();
    }
    
    modal.classList.add('active');
  }

  async loadMenuItemForEdit(itemId) {
    try {
      const result = await this.firebaseService.getMenuItems();
      if (result.success) {
        const item = result.data.find(i => i.id === itemId);
        if (item) {
          document.getElementById('item-name').value = item.name || '';
          document.getElementById('item-category').value = item.category || '';
          document.getElementById('item-price').value = item.price || '';
          document.getElementById('item-status').value = item.isActive !== false ? 'true' : 'false';
          document.getElementById('item-description').value = item.description || '';
          document.getElementById('item-image').value = item.image || '';
        }
      }
    } catch (error) {
      console.error('❌ Load menu item for edit error:', error);
    }
  }

  async handleMenuItemSubmit(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('item-name').value.trim(),
      category: document.getElementById('item-category').value,
      price: parseInt(document.getElementById('item-price').value),
      isActive: document.getElementById('item-status').value === 'true',
      description: document.getElementById('item-description').value.trim(),
      image: document.getElementById('item-image').value.trim()
    };

    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      this.showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Auto-generate image if empty
    if (!formData.image) {
      formData.image = this.getPlaceholderImage(formData.name);
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    submitBtn.disabled = true;

    try {
      let result;
      if (this.currentEditItemId) {
        result = await this.firebaseService.updateMenuItem(this.currentEditItemId, formData);
      } else {
        result = await this.firebaseService.addMenuItem(formData);
      }

      if (result.success) {
        this.showSuccess(this.currentEditItemId ? 'Cập nhật món ăn thành công!' : 'Thêm món ăn thành công!');
        this.closeMenuItemModal();
        await this.loadMenuItems();
      } else {
        this.showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('❌ Save menu item error:', error);
      this.showError('Lỗi kết nối Firebase');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  closeMenuItemModal() {
    const modal = document.getElementById('menu-item-modal');
    modal.classList.remove('active');
    this.currentEditItemId = null;
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
    this.currentEditItemId = null;
  }

  // Menu item actions
  editMenuItem(itemId) {
    this.openMenuItemModal(itemId);
  }

  async deleteMenuItem(itemId, itemName) {
    if (!confirm(`Bạn có chắc muốn xóa món "${itemName}"?`)) {
      return;
    }

    try {
      const result = await this.firebaseService.deleteMenuItem(itemId);
      if (result.success) {
        this.showSuccess('Xóa món ăn thành công!');
        await this.loadMenuItems();
      } else {
        this.showError(result.error || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('❌ Delete menu item error:', error);
      this.showError('Lỗi kết nối Firebase');
    }
  }

  async toggleMenuItemStatus(itemId, currentStatus) {
    try {
      const result = await this.firebaseService.updateMenuItem(itemId, {
        isActive: !currentStatus
      });
      
      if (result.success) {
        this.showSuccess(`${!currentStatus ? 'Bật' : 'Tắt'} bán món ăn thành công!`);
        await this.loadMenuItems();
      } else {
        this.showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('❌ Toggle menu item status error:', error);
      this.showError('Lỗi kết nối Firebase');
    }
  }

  // ==================== TABLES MANAGEMENT ====================

  async loadTables() {
    const container = document.getElementById('tables-grid');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Đang tải danh sách bàn...</p>
      </div>
    `;

    try {
      const result = await this.firebaseService.getTables();
      
      if (result.success) {
        this.displayTables(result.data);
      } else {
        container.innerHTML = `
          <div class="error-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>Lỗi tải danh sách bàn: ${result.error}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Load tables error:', error);
    }
  }

  displayTables(tables) {
    const container = document.getElementById('tables-grid');
    
    if (tables.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-table"></i>
          <h3>Chưa có bàn nào</h3>
          <p>Thêm bàn đầu tiên cho nhà hàng</p>
        </div>
      `;
      return;
    }

    const tablesHtml = tables.map(table => `
      <div class="table-card ${table.status}" data-id="${table.id}">
        <div class="table-number">Bàn ${table.tableNumber}</div>
        <div class="table-info">
          <div class="table-capacity">
            <i class="fa-solid fa-user"></i> ${table.capacity} ghế
          </div>
          <div class="table-location">
            <i class="fa-solid fa-map-marker"></i> ${table.location || 'Chưa xác định'}
          </div>
          <div class="table-status ${table.status}">
            ${this.getTableStatusText(table.status)}
          </div>
        </div>
        <div class="table-actions">
          <button class="btn btn-sm btn-primary" onclick="yummyAdmin.updateTableStatus('${table.id}', 'available')">
            <i class="fa-solid fa-unlock"></i> Mở bàn
          </button>
          <button class="btn btn-sm btn-warning" onclick="yummyAdmin.updateTableStatus('${table.id}', 'occupied')">
            <i class="fa-solid fa-lock"></i> Đóng bàn
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = tablesHtml;
  }

  getTableStatusText(status) {
    const statusMap = {
      'available': 'Trống',
      'occupied': 'Có khách',
      'reserved': 'Đã đặt',
      'cleaning': 'Đang dọn'
    };
    return statusMap[status] || status;
  }

  openTableModal() {
    const modal = document.getElementById('table-modal');
    const form = document.getElementById('table-form');
    form.reset();
    modal.classList.add('active');
  }

  closeTableModal() {
    const modal = document.getElementById('table-modal');
    modal.classList.remove('active');
  }

  async handleTableSubmit(e) {
    e.preventDefault();
    
    const formData = {
      tableNumber: parseInt(document.getElementById('table-number').value),
      capacity: parseInt(document.getElementById('table-capacity').value),
      location: document.getElementById('table-location').value.trim(),
      notes: document.getElementById('table-notes').value.trim()
    };

    if (!formData.tableNumber) {
      this.showError('Vui lòng nhập số bàn');
      return;
    }

    try {
      const result = await this.firebaseService.createTable(formData);
      if (result.success) {
        this.showSuccess('Tạo bàn thành công!');
        this.closeTableModal();
        await this.loadTables();
      } else {
        this.showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('❌ Create table error:', error);
      this.showError('Lỗi kết nối Firebase');
    }
  }

  async updateTableStatus(tableId, status) {
    try {
      const result = await this.firebaseService.updateTableStatus(tableId, status);
      if (result.success) {
        this.showSuccess('Cập nhật trạng thái bàn thành công!');
        await this.loadTables();
      } else {
        this.showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('❌ Update table status error:', error);
      this.showError('Lỗi kết nối Firebase');
    }
  }

  // ==================== ORDERS MANAGEMENT ====================

  async loadOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Đang tải đơn hàng...</p>
      </div>
    `;

    try {
      const result = await this.firebaseService.getOrders({ limit: 50 });
      
      if (result.success) {
        this.displayOrders(result.data);
      } else {
        container.innerHTML = `
          <div class="error-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>Lỗi tải đơn hàng: ${result.error}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Load orders error:', error);
    }
  }

  displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Đơn hàng sẽ hiển thị ở đây khi có khách order</p>
        </div>
      `;
      return;
    }

    const ordersHtml = orders.map(order => `
      <div class="order-card ${order.status}" data-id="${order.id}">
        <div class="order-header">
          <div class="order-id">#${order.id.substring(0, 8)}</div>
          <div class="order-time">${this.formatDateTime(order.createdAt)}</div>
          <div class="order-status ${order.status}">${this.getOrderStatusText(order.status)}</div>
        </div>
        <div class="order-details">
          <div class="order-table">
            ${order.tableNumber ? `Bàn ${order.tableNumber}` : 'Mang về/Giao hàng'}
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                ${item.quantity}x ${item.name} - ${this.formatCurrency(item.price * item.quantity)}
              </div>
            `).join('')}
          </div>
          <div class="order-total">
            Tổng: ${this.formatCurrency(order.totalAmount)}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = ordersHtml;
  }

  getOrderStatusText(status) {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'ready': 'Sẵn sàng',
      'served': 'Đã phục vụ',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  // ==================== UTILITY METHODS ====================

  async initializeSampleData() {
    if (!confirm('Bạn có chắc muốn khởi tạo dữ liệu mẫu? Thao tác này sẽ thêm menu và bàn mẫu.')) {
      return;
    }

    try {
      const result = await this.firebaseService.initializeSampleData();
      if (result.success) {
        this.showSuccess('Khởi tạo dữ liệu mẫu thành công!');
        // Reload current page data
        await this.loadPageData(this.currentPage);
      } else {
        this.showError(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('❌ Initialize sample data error:', error);
      this.showError('Lỗi kết nối Firebase');
    }
  }

  getPlaceholderImage(itemName) {
    const cleanName = encodeURIComponent(itemName.substring(0, 20));
    return `https://placehold.co/400x300/e9a28a/FFFFFF?text=${cleanName}`;
  }

  formatCurrency(amount) {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
      <span>${message}</span>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .admin-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #333;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10002;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
      }
      .admin-notification.success {
        border-left: 4px solid #28a745;
      }
      .admin-notification.error {
        border-left: 4px solid #dc3545;
      }
      .admin-notification.info {
        border-left: 4px solid #007bff;
      }
      .admin-notification.show {
        transform: translateX(0);
        opacity: 1;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 3000);
  }
}

// Global functions for modal handling
window.closeMenuItemModal = () => {
  if (window.yummyAdmin) {
    window.yummyAdmin.closeMenuItemModal();
  }
};

window.closeTableModal = () => {
  if (window.yummyAdmin) {
    window.yummyAdmin.closeTableModal();
  }
};

window.switchToPage = (page) => {
  if (window.yummyAdmin) {
    window.yummyAdmin.switchToPage(page);
  }
};

// Export for ES6 modules
export { YummyAdmin };

// Initialize admin when DOM is loaded (for backward compatibility)
document.addEventListener('DOMContentLoaded', function() {
  window.yummyAdmin = new YummyAdmin();
});