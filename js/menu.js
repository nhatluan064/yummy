/**
 * Menu Management System
 * Handles CRUD operations, search/filter, and status management for daily menu items
 */

class MenuManager {
    constructor() {
        this.sharedManager = window.sharedMenuManager;
        this.menuItems = [];
        this.categories = ['Món Chính', 'Khai Vị', 'Tráng Miệng', 'Đồ Uống', 'Món Chay'];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.quickOrder = [];
        
        this.init();
    }

    init() {
        this.loadMenuData();
        this.setupEventListeners();
        this.renderStats();
        this.renderMenu();
        this.updateDateTime();
        
        // Update datetime every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    loadMenuData() {
        // Load from shared manager
        this.menuItems = this.sharedManager.getMenuData();
    }

    saveMenuData() {
        this.sharedManager.saveMenuData(this.menuItems);
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchMenu');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderMenu();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderMenu();
            });
        });

        // Category select
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.renderMenu();
            });
        }

        // Modal events
        this.setupModalEvents();
        
        // Admin control buttons
        this.setupAdminControls();
        
        // Quick order sidebar
        this.setupQuickOrder();
    }

    setupModalEvents() {
        // Add item modal
        const addItemBtn = document.getElementById('addItemBtn');
        const addItemModal = document.getElementById('addItemModal');
        const addItemForm = document.getElementById('addItemForm');
        
        if (addItemBtn && addItemModal) {
            addItemBtn.addEventListener('click', () => this.showModal('addItemModal'));
        }
        
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddItem(new FormData(addItemForm));
            });
        }

        // Edit item modal
        const editItemModal = document.getElementById('editItemModal');
        const editItemForm = document.getElementById('editItemForm');
        
        if (editItemForm) {
            editItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditItem(new FormData(editItemForm));
            });
        }

        // Bulk update modal
        const bulkUpdateBtn = document.getElementById('bulkUpdateBtn');
        const bulkUpdateModal = document.getElementById('bulkUpdateModal');
        const bulkUpdateForm = document.getElementById('bulkUpdateForm');
        
        if (bulkUpdateBtn && bulkUpdateModal) {
            bulkUpdateBtn.addEventListener('click', () => {
                this.renderBulkItems();
                this.showModal('bulkUpdateModal');
            });
        }
        
        if (bulkUpdateForm) {
            bulkUpdateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBulkUpdate();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });

        // Click outside to close modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    setupAdminControls() {
        // Toggle admin view
        const toggleAdminBtn = document.getElementById('toggleAdminBtn');
        if (toggleAdminBtn) {
            toggleAdminBtn.addEventListener('click', () => {
                const adminControls = document.querySelector('.admin-controls');
                const isHidden = adminControls.classList.contains('hidden');
                
                if (isHidden) {
                    adminControls.classList.remove('hidden');
                    toggleAdminBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ẩn Quản Lý';
                } else {
                    adminControls.classList.add('hidden');
                    toggleAdminBtn.innerHTML = '<i class="fas fa-cog"></i> Quản Lý Menu';
                }
            });
        }
    }

    setupQuickOrder() {
        const quickOrderToggle = document.getElementById('quickOrderBtn');
        const quickOrderSidebar = document.getElementById('quickOrderSidebar');
        const closeQuickOrder = document.getElementById('closeQuickOrder');
        
        if (quickOrderToggle && quickOrderSidebar) {
            quickOrderToggle.addEventListener('click', () => {
                quickOrderSidebar.classList.toggle('show');
                this.renderQuickOrder();
            });
        }
        
        if (closeQuickOrder) {
            closeQuickOrder.addEventListener('click', () => {
                quickOrderSidebar.classList.remove('show');
            });
        }
    }

    updateDateTime() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'Asia/Ho_Chi_Minh'
            };
            dateElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    renderStats() {
        const totalItems = this.menuItems.length;
        const availableItems = this.menuItems.filter(item => item.status === 'available').length;
        const soldOutItems = this.menuItems.filter(item => item.status === 'soldout').length;
        const todaySales = this.menuItems.reduce((sum, item) => sum + (item.soldToday || 0), 0);

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('availableItems').textContent = availableItems;
        document.getElementById('soldOutItems').textContent = soldOutItems;
        document.getElementById('todaySales').textContent = todaySales;
    }

    renderMenu() {
        const menuContainer = document.getElementById('menuCategories');
        if (!menuContainer) return;

        // Filter items
        const filteredItems = this.getFilteredItems();
        
        // Group by category
        const itemsByCategory = this.groupItemsByCategory(filteredItems);
        
        // Render categories
        menuContainer.innerHTML = '';
        
        Object.entries(itemsByCategory).forEach(([category, items]) => {
            if (items.length > 0) {
                const categoryElement = this.createCategoryElement(category, items);
                menuContainer.appendChild(categoryElement);
            }
        });

        if (Object.keys(itemsByCategory).length === 0) {
            menuContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Không tìm thấy món ăn nào</h3>
                    <p>Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
                </div>
            `;
        }
    }

    getFilteredItems() {
        return this.menuItems.filter(item => {
            // Search filter
            const matchesSearch = !this.searchTerm || 
                item.name.toLowerCase().includes(this.searchTerm) ||
                item.description.toLowerCase().includes(this.searchTerm);
            
            // Status filter
            const matchesStatus = this.currentFilter === 'all' || 
                (this.currentFilter === 'available' && item.status === 'available') ||
                (this.currentFilter === 'soldout' && item.status === 'soldout');
            
            // Category filter
            const matchesCategory = this.currentCategory === 'all' || 
                item.category === this.currentCategory;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }

    groupItemsByCategory(items) {
        const grouped = {};
        
        items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        return grouped;
    }

    createCategoryElement(category, items) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h3 class="category-title">${category}</h3>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="category-count">${items.length} món</span>
                    <button class="btn btn-sm btn-primary" onclick="menuManager.orderByCategory('${category}')" 
                            title="Order tất cả món trong danh mục ${category}">
                        <i class="fas fa-utensils"></i> Order ${category}
                    </button>
                </div>
            </div>
            <div class="category-items">
                ${items.map(item => this.createItemElement(item)).join('')}
            </div>
        `;
        
        return categoryDiv;
    }

    createItemElement(item) {
        const isAdmin = !document.querySelector('.admin-controls').classList.contains('hidden');
        
        return `
            <div class="menu-item ${item.status}" data-item-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=No+Image'">
                
                <div class="item-header">
                    <h4 class="item-name">${item.name}</h4>
                    <span class="item-price">${Utils.formatCurrency(item.price)}</span>
                </div>
                
                <p class="item-description">${item.description}</p>
                
                <div class="item-actions">
                    <div class="item-status">
                        <span class="status-${item.status}">
                            <span class="status-icon"></span>
                            ${item.status === 'available' ? 'Còn món' : 'Hết món'}
                        </span>
                        ${item.inventory !== undefined ? `<span class="item-inventory">(Còn: ${item.inventory})</span>` : ''}
                    </div>
                    
                    <div class="item-buttons">
                        ${item.status === 'available' ? `
                            <button class="item-btn order" onclick="menuManager.addToQuickOrder('${item.id}')">
                                <i class="fas fa-plus"></i> Thêm
                            </button>
                            <button class="item-btn order" onclick="menuManager.orderNow('${item.id}')">
                                <i class="fas fa-shopping-cart"></i> Order Ngay
                            </button>
                        ` : ''}
                        
                        ${isAdmin ? `
                            <button class="item-btn edit" onclick="menuManager.showEditModal('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="item-btn toggle-status" onclick="menuManager.toggleItemStatus('${item.id}')">
                                <i class="fas fa-toggle-${item.status === 'available' ? 'on' : 'off'}"></i>
                            </button>
                            <button class="item-btn delete" onclick="menuManager.deleteItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Item Management Methods
    handleAddItem(formData) {
        const newItem = {
            id: 'item-' + Date.now(),
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            price: parseInt(formData.get('itemPrice')),
            category: formData.get('itemCategory'),
            image: formData.get('itemImage') || 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=No+Image',
            status: 'available',
            inventory: parseInt(formData.get('itemInventory')) || 0,
            soldToday: 0
        };

        this.menuItems.push(newItem);
        this.saveMenuData();
        this.renderStats();
        this.renderMenu();
        this.hideModal('addItemModal');
        
        Utils.showNotification('Đã thêm món mới thành công!', 'success');
    }

    showEditModal(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        // Populate edit form
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemDescription').value = item.description;
        document.getElementById('editItemPrice').value = item.price;
        document.getElementById('editItemCategory').value = item.category;
        document.getElementById('editItemImage').value = item.image;
        document.getElementById('editItemInventory').value = item.inventory || 0;

        this.showModal('editItemModal');
    }

    handleEditItem(formData) {
        const itemId = formData.get('itemId');
        const itemIndex = this.menuItems.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) return;

        this.menuItems[itemIndex] = {
            ...this.menuItems[itemIndex],
            name: formData.get('itemName'),
            description: formData.get('itemDescription'),
            price: parseInt(formData.get('itemPrice')),
            category: formData.get('itemCategory'),
            image: formData.get('itemImage'),
            inventory: parseInt(formData.get('itemInventory')) || 0
        };

        this.saveMenuData();
        this.renderStats();
        this.renderMenu();
        this.hideModal('editItemModal');
        
        Utils.showNotification('Đã cập nhật món ăn thành công!', 'success');
    }

    toggleItemStatus(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        item.status = item.status === 'available' ? 'soldout' : 'available';
        if (item.status === 'soldout') {
            item.inventory = 0;
        }

        this.saveMenuData();
        this.renderStats();
        this.renderMenu();
        
        const statusText = item.status === 'available' ? 'có sẵn' : 'hết món';
        Utils.showNotification(`Đã chuyển "${item.name}" thành ${statusText}`, 'success');
    }

    deleteItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        if (confirm(`Bạn có chắc chắn muốn xóa "${item.name}"?`)) {
            this.menuItems = this.menuItems.filter(i => i.id !== itemId);
            this.saveMenuData();
            this.renderStats();
            this.renderMenu();
            
            Utils.showNotification(`Đã xóa "${item.name}" thành công!`, 'success');
        }
    }

    // Bulk Operations
    renderBulkItems() {
        const container = document.getElementById('bulkItemsList');
        if (!container) return;

        container.innerHTML = this.menuItems.map(item => `
            <div class="bulk-item">
                <input type="checkbox" value="${item.id}" id="bulk-${item.id}">
                <label for="bulk-${item.id}" class="bulk-item-info">
                    <div class="bulk-item-name">${item.name}</div>
                    <div class="bulk-item-category">${item.category} - ${item.status === 'available' ? 'Còn món' : 'Hết món'}</div>
                </label>
            </div>
        `).join('');
    }

    handleBulkUpdate() {
        const selectedItems = Array.from(document.querySelectorAll('#bulkItemsList input:checked'))
            .map(input => input.value);
        
        if (selectedItems.length === 0) {
            Utils.showNotification('Vui lòng chọn ít nhất một món ăn', 'warning');
            return;
        }

        const action = document.querySelector('input[name="bulkAction"]:checked').value;
        
        selectedItems.forEach(itemId => {
            const item = this.menuItems.find(i => i.id === itemId);
            if (item) {
                switch (action) {
                    case 'markAvailable':
                        item.status = 'available';
                        break;
                    case 'markSoldOut':
                        item.status = 'soldout';
                        item.inventory = 0;
                        break;
                    case 'delete':
                        this.menuItems = this.menuItems.filter(i => i.id !== itemId);
                        break;
                }
            }
        });

        this.saveMenuData();
        this.renderStats();
        this.renderMenu();
        this.hideModal('bulkUpdateModal');
        
        Utils.showNotification(`Đã cập nhật ${selectedItems.length} món ăn`, 'success');
    }

    // Quick Order Management
    addToQuickOrder(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item || item.status !== 'available') return;

        const existingOrder = this.quickOrder.find(o => o.id === itemId);
        if (existingOrder) {
            existingOrder.quantity += 1;
        } else {
            this.quickOrder.push({
                id: itemId,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        this.renderQuickOrder();
        Utils.showNotification(`Đã thêm "${item.name}" vào đơn hàng`, 'success');
    }

    removeFromQuickOrder(itemId) {
        this.quickOrder = this.quickOrder.filter(o => o.id !== itemId);
        this.renderQuickOrder();
    }

    updateQuickOrderQuantity(itemId, quantity) {
        const order = this.quickOrder.find(o => o.id === itemId);
        if (order) {
            if (quantity <= 0) {
                this.removeFromQuickOrder(itemId);
            } else {
                order.quantity = quantity;
                this.renderQuickOrder();
            }
        }
    }

    renderQuickOrder() {
        const container = document.getElementById('quickOrderItems');
        const totalElement = document.getElementById('quickOrderTotal');
        
        if (!container || !totalElement) return;

        if (this.quickOrder.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">Chưa có món nào được chọn</div>';
            totalElement.innerHTML = '<strong>Tổng: 0₫</strong>';
            return;
        }

        container.innerHTML = this.quickOrder.map(order => `
            <div class="quick-order-item">
                <div class="quick-item-info">
                    <div class="quick-item-name">${order.name}</div>
                    <div class="quick-item-price">${Utils.formatCurrency(order.price)}</div>
                </div>
                <div class="quick-item-controls">
                    <button class="btn btn-sm btn-outline-secondary" onclick="menuManager.updateQuickOrderQuantity('${order.id}', ${order.quantity - 1})">-</button>
                    <span class="mx-2">${order.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="menuManager.updateQuickOrderQuantity('${order.id}', ${order.quantity + 1})">+</button>
                    <button class="btn btn-sm btn-danger ms-2" onclick="menuManager.removeFromQuickOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const total = this.quickOrder.reduce((sum, order) => sum + (order.price * order.quantity), 0);
        totalElement.innerHTML = `<strong>Tổng: ${Utils.formatCurrency(total)}</strong>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="menuManager.processQuickOrder()" style="flex: 1;">
                    <i class="fas fa-shopping-cart"></i> Đi Đến Order
                </button>
                <button class="btn btn-secondary" onclick="menuManager.quickOrder = []; menuManager.renderQuickOrder();">
                    <i class="fas fa-trash"></i> Xóa Tất Cả
                </button>
            </div>`;
    }

    processQuickOrder() {
        if (this.quickOrder.length === 0) {
            Utils.showNotification('Đơn hàng trống', 'warning');
            return;
        }

        // Navigate to order page with cart data
        this.sharedManager.setTempCart(this.quickOrder);
        this.sharedManager.navigateToOrder(this.quickOrder);
    }

    // Order single item immediately
    orderNow(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item || item.status !== 'available') return;

        const orderItem = {
            id: itemId,
            name: item.name,
            price: item.price,
            quantity: 1
        };

        // Navigate to order page with single item
        this.sharedManager.navigateToOrder([orderItem]);
    }

    // Start order with selected category
    orderByCategory(category) {
        const categoryItems = this.menuItems.filter(item => 
            item.category === category && item.status === 'available'
        );
        
        if (categoryItems.length === 0) {
            Utils.showNotification(`Không có món nào trong danh mục ${category}`, 'warning');
            return;
        }

        // Navigate to order page and filter by category
        this.sharedManager.setOrderContext({
            filterCategory: category,
            timestamp: Date.now()
        });
        
        window.location.href = '../customer/index.html';
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
}

// Initialize menu manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuManager = new MenuManager();
});