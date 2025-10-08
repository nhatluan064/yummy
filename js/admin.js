// === ADMIN.JS - QUẢN LÝ DASHBOARD ADMIN ===

class AdminManager {
  constructor() {
    this.currentView = 'dashboard';
    this.orders = [];
    this.bookings = [];
    this.expenses = [];
    this.revenue = [];
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadData();
      this.setupEventListeners();
      this.renderDashboard();
      this.updateStats();
    });
  }

  loadData() {
    this.orders = Utils.loadFromStorage('orders', []);
    this.bookings = Utils.loadFromStorage('bookings', []);
    this.expenses = Utils.loadFromStorage('expenses', []);
    this.revenue = Utils.loadFromStorage('revenue', []);
  }

  setupEventListeners() {
    // Order status updates
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('action-btn')) {
        this.handleOrderAction(e);
      }
    });

    // Filter controls
    const dateFilter = document.getElementById('date-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (dateFilter) {
      dateFilter.addEventListener('change', () => this.filterOrders());
    }
    
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterOrders());
    }

    // Expense form
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addExpense(e.target);
      });
    }

    // Auto-refresh every 30 seconds
    setInterval(() => {
      this.loadData();
      this.updateStats();
      this.renderRecentOrders();
    }, 30000);
  }

  renderDashboard() {
    this.renderRecentOrders();
    this.renderTableManagement();
    this.renderExpenseTracking();
  }

  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(order => 
      order.timestamp?.startsWith(today) || 
      order.createdAt?.startsWith(today)
    );
    const todayBookings = this.bookings.filter(booking => 
      booking.date === today
    );

    // Update stat cards
    this.updateStatCard('orders-today', todayOrders.length);
    this.updateStatCard('bookings-today', todayBookings.length);
    this.updateStatCard('revenue-today', this.calculateTodayRevenue());
    this.updateStatCard('total-customers', this.calculateTotalCustomers());
  }

  updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
      if (typeof value === 'number' && id.includes('revenue')) {
        element.textContent = Utils.formatCurrency(value);
      } else {
        element.textContent = value;
      }
    }
  }

  calculateTodayRevenue() {
    const today = new Date().toISOString().split('T')[0];
    return this.orders
      .filter(order => 
        (order.timestamp?.startsWith(today) || order.createdAt?.startsWith(today)) &&
        order.status === 'completed'
      )
      .reduce((total, order) => total + (order.total || 0), 0);
  }

  calculateTotalCustomers() {
    const uniqueCustomers = new Set();
    this.orders.forEach(order => {
      if (order.shippingInfo?.phone) {
        uniqueCustomers.add(order.shippingInfo.phone);
      }
    });
    this.bookings.forEach(booking => {
      if (booking.phone) {
        uniqueCustomers.add(booking.phone);
      }
    });
    return uniqueCustomers.size;
  }

  renderRecentOrders() {
    const container = document.getElementById('recent-orders-container');
    if (!container) return;

    const recentOrders = this.orders
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .slice(0, 10);

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Đơn hàng gần đây</h2>
        <div class="filters">
          <div class="filter-group">
            <label>Ngày:</label>
            <input type="date" id="date-filter" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="filter-group">
            <label>Trạng thái:</label>
            <select id="status-filter">
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="ready">Sẵn sàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>
      <div class="orders-list">
        ${recentOrders.length > 0 ? this.renderOrdersTable(recentOrders) : '<p>Chưa có đơn hàng nào</p>'}
      </div>
    `;
  }

  renderOrdersTable(orders) {
    return `
      <table class="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Loại</th>
            <th>Bàn/Địa chỉ</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td>#${order.id}</td>
              <td>${this.getOrderTypeText(order)}</td>
              <td>${this.getOrderLocation(order)}</td>
              <td>${Utils.formatCurrency(order.total || 0)}</td>
              <td>${this.renderOrderStatus(order.status)}</td>
              <td>${this.formatOrderTime(order)}</td>
              <td>${this.renderOrderActions(order)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  getOrderTypeText(order) {
    if (order.type === 'reservation') return 'Đặt bàn';
    return order.orderType === 'delivery' ? 'Giao hàng' : 'Tại chỗ';
  }

  getOrderLocation(order) {
    if (order.type === 'reservation') {
      return `${order.people} người`;
    }
    if (order.orderType === 'delivery') {
      return order.shippingInfo?.address || 'N/A';
    }
    return `Bàn ${order.table || 'N/A'}`;
  }

  formatOrderTime(order) {
    const time = new Date(order.timestamp || order.createdAt);
    return time.toLocaleString('vi-VN');
  }

  renderOrderStatus(status) {
    const statusMap = {
      pending: { text: 'Chờ xác nhận', class: 'status-pending' },
      preparing: { text: 'Đang chuẩn bị', class: 'status-preparing' },
      ready: { text: 'Sẵn sàng', class: 'status-ready' },
      completed: { text: 'Hoàn thành', class: 'status-completed' },
      cancelled: { text: 'Đã hủy', class: 'status-cancelled' },
      confirmed: { text: 'Đã xác nhận', class: 'status-completed' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'status-pending' };
    return `<span class="order-status ${statusInfo.class}">${statusInfo.text}</span>`;
  }

  renderOrderActions(order) {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return '<span class="text-muted">Đã hoàn tất</span>';
    }

    const actions = [];
    
    if (order.status === 'pending') {
      actions.push(`<button class="action-btn approve" data-id="${order.id}" data-action="approve">Duyệt</button>`);
      actions.push(`<button class="action-btn reject" data-id="${order.id}" data-action="cancel">Hủy</button>`);
    } else if (order.status === 'preparing') {
      actions.push(`<button class="action-btn view" data-id="${order.id}" data-action="ready">Sẵn sàng</button>`);
    } else if (order.status === 'ready') {
      actions.push(`<button class="action-btn approve" data-id="${order.id}" data-action="complete">Hoàn thành</button>`);
    }

    return `<div class="action-buttons">${actions.join('')}</div>`;
  }

  handleOrderAction(e) {
    const orderId = parseInt(e.target.dataset.id);
    const action = e.target.dataset.action;
    
    this.updateOrderStatus(orderId, action);
  }

  updateOrderStatus(orderId, action) {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;

    const statusMap = {
      approve: 'preparing',
      ready: 'ready',
      complete: 'completed',
      cancel: 'cancelled'
    };

    const newStatus = statusMap[action];
    if (newStatus) {
      this.orders[orderIndex].status = newStatus;
      this.orders[orderIndex].updatedAt = new Date().toISOString();
      
      Utils.saveToStorage('orders', this.orders);
      this.renderRecentOrders();
      this.updateStats();
      
      Utils.showNotification(`Đã cập nhật trạng thái đơn hàng #${orderId}`, 'success');
    }
  }

  filterOrders() {
    const dateFilter = document.getElementById('date-filter')?.value;
    const statusFilter = document.getElementById('status-filter')?.value;
    
    let filteredOrders = [...this.orders];
    
    if (dateFilter) {
      filteredOrders = filteredOrders.filter(order => 
        (order.timestamp?.startsWith(dateFilter)) || 
        (order.createdAt?.startsWith(dateFilter)) ||
        (order.date === dateFilter)
      );
    }
    
    if (statusFilter) {
      filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    const container = document.querySelector('.orders-list');
    if (container) {
      container.innerHTML = filteredOrders.length > 0 ? 
        this.renderOrdersTable(filteredOrders) : 
        '<p>Không tìm thấy đơn hàng nào</p>';
    }
  }

  renderTableManagement() {
    const container = document.getElementById('table-management-container');
    if (!container) return;

    // Generate table status (1-20 tables)
    const tables = [];
    for (let i = 1; i <= 20; i++) {
      const table = {
        number: i,
        status: this.getTableStatus(i),
        currentOrder: this.getCurrentTableOrder(i)
      };
      tables.push(table);
    }

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Quản lý bàn</h2>
      </div>
      <div class="table-management-grid">
        ${tables.map(table => `
          <div class="admin-table-card ${table.status}" data-table="${table.number}">
            <div class="table-info">
              <h4>Bàn ${table.number}</h4>
              <p class="table-status">${this.getTableStatusText(table.status)}</p>
              ${table.currentOrder ? `<small>Đơn #${table.currentOrder}</small>` : ''}
            </div>
            <div class="table-actions">
              ${this.renderTableActions(table)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getTableStatus(tableNumber) {
    const activeOrders = this.orders.filter(order => 
      order.table == tableNumber && 
      ['pending', 'preparing', 'ready'].includes(order.status)
    );
    
    if (activeOrders.length > 0) return 'occupied';
    
    const reservations = this.bookings.filter(booking => 
      booking.status === 'confirmed' && 
      booking.date === new Date().toISOString().split('T')[0]
    );
    
    if (reservations.length > 0) return 'reserved';
    
    return 'available';
  }

  getCurrentTableOrder(tableNumber) {
    const activeOrder = this.orders.find(order => 
      order.table == tableNumber && 
      ['pending', 'preparing', 'ready'].includes(order.status)
    );
    
    return activeOrder ? activeOrder.id : null;
  }

  getTableStatusText(status) {
    const statusMap = {
      available: 'Trống',
      occupied: 'Có khách',
      reserved: 'Đã đặt'
    };
    return statusMap[status] || status;
  }

  renderTableActions(table) {
    if (table.status === 'available') {
      return '<button class="action-btn view">Đặt bàn</button>';
    } else if (table.status === 'occupied') {
      return '<button class="action-btn approve">Thanh toán</button>';
    } else {
      return '<button class="action-btn view">Xem</button>';
    }
  }

  renderExpenseTracking() {
    const container = document.getElementById('expense-tracking-container');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    
    const todayExpenses = this.calculateExpenses(today);
    const monthlyExpenses = this.calculateExpenses(thisMonth, 'month');
    const revenue = this.calculateTodayRevenue();
    const monthlyRevenue = this.calculateRevenue(thisMonth, 'month');

    container.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Quản lý chi tiêu</h2>
        <button class="btn btn-primary" onclick="adminManager.showExpenseForm()">
          <i class="fas fa-plus"></i> Thêm chi tiêu
        </button>
      </div>
      
      <div class="expense-summary">
        <div class="expense-card">
          <div class="expense-amount">${Utils.formatCurrency(revenue)}</div>
          <div class="expense-label">Doanh thu hôm nay</div>
        </div>
        <div class="expense-card">
          <div class="expense-amount">${Utils.formatCurrency(todayExpenses)}</div>
          <div class="expense-label">Chi tiêu hôm nay</div>
        </div>
        <div class="expense-card">
          <div class="expense-amount">${Utils.formatCurrency(revenue - todayExpenses)}</div>
          <div class="expense-label">Lợi nhuận hôm nay</div>
        </div>
        <div class="expense-card">
          <div class="expense-amount">${Utils.formatCurrency(monthlyRevenue - monthlyExpenses)}</div>
          <div class="expense-label">Lợi nhuận tháng này</div>
        </div>
      </div>

      <div id="expense-form-container" style="display: none;">
        <form id="expense-form" class="admin-form">
          <div class="form-group">
            <label for="expense-description">Mô tả chi tiêu</label>
            <input type="text" id="expense-description" name="description" required>
          </div>
          <div class="form-group">
            <label for="expense-amount">Số tiền</label>
            <input type="number" id="expense-amount" name="amount" required>
          </div>
          <div class="form-group">
            <label for="expense-category">Danh mục</label>
            <select id="expense-category" name="category" required>
              <option value="food">Nguyên liệu</option>
              <option value="utilities">Tiện ích</option>
              <option value="staff">Nhân viên</option>
              <option value="equipment">Thiết bị</option>
              <option value="marketing">Marketing</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Thêm chi tiêu</button>
          <button type="button" class="btn btn-secondary" onclick="adminManager.hideExpenseForm()">Hủy</button>
        </form>
      </div>

      <div class="recent-expenses">
        <h3>Chi tiêu gần đây</h3>
        ${this.renderRecentExpenses()}
      </div>
    `;
  }

  calculateExpenses(period, type = 'day') {
    return this.expenses
      .filter(expense => {
        if (type === 'month') {
          return expense.date.startsWith(period);
        }
        return expense.date === period;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  calculateRevenue(period, type = 'day') {
    return this.orders
      .filter(order => {
        const orderDate = (order.timestamp || order.createdAt)?.substring(0, type === 'month' ? 7 : 10);
        return orderDate === period && order.status === 'completed';
      })
      .reduce((total, order) => total + (order.total || 0), 0);
  }

  renderRecentExpenses() {
    const recentExpenses = this.expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recentExpenses.length === 0) {
      return '<p>Chưa có chi tiêu nào được ghi nhận</p>';
    }

    return `
      <table class="orders-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Mô tả</th>
            <th>Danh mục</th>
            <th>Số tiền</th>
          </tr>
        </thead>
        <tbody>
          ${recentExpenses.map(expense => `
            <tr>
              <td>${new Date(expense.date).toLocaleDateString('vi-VN')}</td>
              <td>${expense.description}</td>
              <td>${this.getCategoryText(expense.category)}</td>
              <td>${Utils.formatCurrency(expense.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  getCategoryText(category) {
    const categories = {
      food: 'Nguyên liệu',
      utilities: 'Tiện ích',
      staff: 'Nhân viên',
      equipment: 'Thiết bị',
      marketing: 'Marketing',
      other: 'Khác'
    };
    return categories[category] || category;
  }

  showExpenseForm() {
    const container = document.getElementById('expense-form-container');
    if (container) {
      container.style.display = 'block';
    }
  }

  hideExpenseForm() {
    const container = document.getElementById('expense-form-container');
    if (container) {
      container.style.display = 'none';
    }
    const form = document.getElementById('expense-form');
    if (form) {
      form.reset();
    }
  }

  addExpense(form) {
    if (!Utils.validateForm(form)) {
      Utils.showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    const expenseData = {
      id: Date.now(),
      description: form.description.value,
      amount: parseFloat(form.amount.value),
      category: form.category.value,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    this.expenses.push(expenseData);
    Utils.saveToStorage('expenses', this.expenses);
    
    this.hideExpenseForm();
    this.renderExpenseTracking();
    this.updateStats();
    
    Utils.showNotification('Đã thêm chi tiêu thành công!', 'success');
  }
}

// Initialize admin manager
const adminManager = new AdminManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminManager;
} else {
  window.AdminManager = AdminManager;
  window.adminManager = adminManager;
}