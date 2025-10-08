/**
 * Kitchen Manager System
 * Manages kitchen display, order status, and auto-refresh functionality
 */

class KitchenManager {
    constructor() {
        this.orders = [];
        this.currentFilter = 'all';
        this.autoRefreshInterval = null;
        this.autoRefreshTime = 30; // seconds
        this.soundEnabled = true;
        this.displayMode = 'grid';
        
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        this.updateStats();
        this.updateClock();
        this.startAutoRefresh();
        
        // Update clock every second
        setInterval(() => this.updateClock(), 1000);
    }

    loadOrders() {
        // Load orders from localStorage
        const savedOrders = localStorage.getItem('kitchenOrders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            // Demo orders for testing
            this.orders = this.generateDemoOrders();
            this.saveOrders();
        }
    }

    saveOrders() {
        localStorage.setItem('kitchenOrders', JSON.stringify(this.orders));
    }

    generateDemoOrders() {
        const now = new Date();
        const statuses = ['pending', 'cooking', 'ready'];
        const orderTypes = ['Tại bàn', 'Mang về', 'Giao hàng'];
        
        const sampleItems = [
            { name: 'Phở Bò Tái', category: 'Món Chính', notes: 'Ít hành' },
            { name: 'Bánh Mì Thịt Nướng', category: 'Món Chính', notes: 'Không cay' },
            { name: 'Gỏi Cuốn Tôm', category: 'Khai Vị', notes: '' },
            { name: 'Nước Chanh Dây', category: 'Đồ Uống', notes: 'Ít đường' },
            { name: 'Trà Đá Chanh', category: 'Đồ Uống', notes: 'Nhiều đá' },
            { name: 'Cơm Tấm Sườn', category: 'Món Chính', notes: 'Thêm trứng' },
            { name: 'Bún Bò Huế', category: 'Món Chính', notes: 'Cay vừa' }
        ];

        const demoOrders = [];
        
        for (let i = 1; i <= 8; i++) {
            const orderTime = new Date(now.getTime() - (Math.random() * 60 * 60 * 1000)); // Random time within last hour
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
            
            // Generate random items for this order
            const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
            const orderItems = [];
            
            for (let j = 0; j < numItems; j++) {
                const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                
                orderItems.push({
                    ...item,
                    quantity: quantity
                });
            }

            demoOrders.push({
                id: `order-${Date.now()}-${i}`,
                tableNumber: orderType === 'Tại bàn' ? Math.floor(Math.random() * 20) + 1 : null,
                orderTime: orderTime.toISOString(),
                status: status,
                orderType: orderType,
                items: orderItems,
                total: Math.floor(Math.random() * 200000) + 50000,
                customerInfo: orderType !== 'Tại bàn' ? {
                    name: `Khách hàng ${i}`,
                    phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`
                } : null,
                notes: Math.random() > 0.7 ? 'Giao hàng nhanh' : '',
                startTime: status !== 'pending' ? new Date(orderTime.getTime() + 5 * 60 * 1000).toISOString() : null,
                completeTime: status === 'ready' ? new Date(orderTime.getTime() + 20 * 60 * 1000).toISOString() : null
            });
        }

        return demoOrders;
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderOrders();
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadOrders();
                this.renderOrders();
                this.updateStats();
                Utils.showNotification('Đã cập nhật danh sách đơn hàng', 'success');
            });
        }

        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const saveSettings = document.getElementById('saveSettings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }

        if (closeSettings || closeSettingsBtn) {
            [closeSettings, closeSettingsBtn].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => this.hideModal('settingsModal'));
                }
            });
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }

        // Order detail modal
        const closeOrderDetail = document.getElementById('closeOrderDetail');
        const closeOrderDetailBtn = document.getElementById('closeOrderDetailBtn');
        
        [closeOrderDetail, closeOrderDetailBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.hideModal('orderDetailModal'));
            }
        });

        // Click outside to close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    renderOrders() {
        const ordersGrid = document.getElementById('ordersGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!ordersGrid) return;

        // Filter orders
        const filteredOrders = this.getFilteredOrders();
        
        // Sort orders: pending and cooking first, ready next, completed last
        const sortedOrders = this.sortOrders(filteredOrders);

        if (sortedOrders.length === 0) {
            ordersGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        ordersGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Render order cards
        ordersGrid.innerHTML = sortedOrders.map(order => this.createOrderCard(order)).join('');

        // Update filter counts
        this.updateFilterCounts();
    }

    getFilteredOrders() {
        switch (this.currentFilter) {
            case 'pending':
                return this.orders.filter(order => order.status === 'pending');
            case 'cooking':
                return this.orders.filter(order => order.status === 'cooking');
            case 'ready':
                return this.orders.filter(order => order.status === 'ready');
            case 'all':
            default:
                return this.orders.filter(order => order.status !== 'completed');
        }
    }

    sortOrders(orders) {
        return orders.sort((a, b) => {
            // Priority order: pending > cooking > ready > completed
            const statusPriority = { pending: 0, cooking: 1, ready: 2, completed: 3 };
            
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
            
            // If same status, sort by order time (oldest first)
            return new Date(a.orderTime) - new Date(b.orderTime);
        });
    }

    createOrderCard(order) {
        const orderTime = new Date(order.orderTime);
        const timeElapsed = this.getTimeElapsed(orderTime);
        const displayTime = orderTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        // Group items by category
        const itemsByCategory = this.groupItemsByCategory(order.items);
        
        return `
            <div class="order-card ${order.status}" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="table-number">
                            ${order.tableNumber ? `Bàn ${order.tableNumber}` : order.orderType}
                        </div>
                        <div class="order-time">${displayTime} - ${timeElapsed}</div>
                        ${order.orderType !== 'Tại bàn' ? `<div class="order-type">${order.orderType}</div>` : ''}
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${order.status}">
                            ${this.getStatusText(order.status)}
                        </span>
                        <div class="order-timer" data-order-time="${order.orderTime}">
                            ${timeElapsed}
                        </div>
                    </div>
                </div>

                <div class="order-items">
                    ${Object.entries(itemsByCategory).map(([category, items]) => `
                        <div class="items-section">
                            <div class="section-title">
                                <i class="fas ${this.getCategoryIcon(category)}"></i>
                                ${category}
                            </div>
                            <ul class="item-list">
                                ${items.map(item => `
                                    <li class="order-item">
                                        <div class="item-details">
                                            <div class="item-name">${item.name}</div>
                                            ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
                                        </div>
                                        <span class="item-quantity">${item.quantity}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>

                ${order.notes ? `
                    <div class="order-notes">
                        <strong>Ghi chú:</strong> ${order.notes}
                    </div>
                ` : ''}

                <div class="order-actions">
                    ${this.getOrderActions(order)}
                </div>
            </div>
        `;
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

    getCategoryIcon(category) {
        const icons = {
            'Món Chính': 'fa-utensils',
            'Khai Vị': 'fa-seedling',
            'Tráng Miệng': 'fa-ice-cream',
            'Đồ Uống': 'fa-coffee',
            'Món Chay': 'fa-leaf'
        };
        return icons[category] || 'fa-utensils';
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Chờ làm',
            cooking: 'Đang làm',
            ready: 'Sẵn sàng',
            completed: 'Hoàn thành'
        };
        return statusTexts[status] || status;
    }

    getOrderActions(order) {
        switch (order.status) {
            case 'pending':
                return `
                    <button class="action-btn start" onclick="kitchenManager.startCooking('${order.id}')">
                        <i class="fas fa-play"></i> Bắt đầu làm
                    </button>
                    <button class="action-btn view" onclick="kitchenManager.viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            case 'cooking':
                return `
                    <button class="action-btn complete" onclick="kitchenManager.markReady('${order.id}')">
                        <i class="fas fa-check"></i> Hoàn thành
                    </button>
                    <button class="action-btn view" onclick="kitchenManager.viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            case 'ready':
                return `
                    <button class="action-btn complete" onclick="kitchenManager.markCompleted('${order.id}')">
                        <i class="fas fa-check-double"></i> Đã giao
                    </button>
                    <button class="action-btn undo" onclick="kitchenManager.markCooking('${order.id}')">
                        <i class="fas fa-undo"></i> Quay lại
                    </button>
                    <button class="action-btn view" onclick="kitchenManager.viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            default:
                return `
                    <button class="action-btn view" onclick="kitchenManager.viewOrderDetail('${order.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
        }
    }

    getTimeElapsed(orderTime) {
        const now = new Date();
        const elapsed = now - orderTime;
        const minutes = Math.floor(elapsed / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}p`;
        }
        return `${minutes}p`;
    }

    // Order Status Management
    startCooking(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cooking';
            order.startTime = new Date().toISOString();
            this.saveOrders();
            this.renderOrders();
            this.updateStats();
            
            if (this.soundEnabled) {
                this.playNotificationSound();
            }
            
            Utils.showNotification(`Đã bắt đầu làm đơn ${order.tableNumber ? `Bàn ${order.tableNumber}` : order.orderType}`, 'success');
        }
    }

    markReady(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'ready';
            order.readyTime = new Date().toISOString();
            this.saveOrders();
            this.renderOrders();
            this.updateStats();
            
            if (this.soundEnabled) {
                this.playNotificationSound();
            }
            
            Utils.showNotification(`Đơn ${order.tableNumber ? `Bàn ${order.tableNumber}` : order.orderType} đã sẵn sàng!`, 'success');
        }
    }

    markCompleted(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'completed';
            order.completeTime = new Date().toISOString();
            this.saveOrders();
            this.renderOrders();
            this.updateStats();
            
            Utils.showNotification(`Đã hoàn thành đơn ${order.tableNumber ? `Bàn ${order.tableNumber}` : order.orderType}`, 'success');
        }
    }

    markCooking(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'cooking';
            this.saveOrders();
            this.renderOrders();
            this.updateStats();
            
            Utils.showNotification(`Đã chuyển đơn về trạng thái đang làm`, 'info');
        }
    }

    // Order Detail Modal
    viewOrderDetail(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const orderDetailBody = document.getElementById('orderDetailBody');
        const orderTime = new Date(order.orderTime);
        
        orderDetailBody.innerHTML = `
            <div class="order-detail">
                <div class="detail-section">
                    <h4>Thông tin đơn hàng</h4>
                    <p><strong>Đơn hàng:</strong> ${order.tableNumber ? `Bàn ${order.tableNumber}` : order.orderType}</p>
                    <p><strong>Thời gian đặt:</strong> ${orderTime.toLocaleString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> ${this.getStatusText(order.status)}</p>
                    ${order.customerInfo ? `
                        <p><strong>Khách hàng:</strong> ${order.customerInfo.name}</p>
                        <p><strong>SĐT:</strong> ${order.customerInfo.phone}</p>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h4>Chi tiết món ăn</h4>
                    ${Object.entries(this.groupItemsByCategory(order.items)).map(([category, items]) => `
                        <div class="category-detail">
                            <h5>${category}</h5>
                            <ul>
                                ${items.map(item => `
                                    <li>
                                        ${item.quantity}x ${item.name}
                                        ${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>

                ${order.notes ? `
                    <div class="detail-section">
                        <h4>Ghi chú đơn hàng</h4>
                        <p>${order.notes}</p>
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h4>Thời gian</h4>
                    <p><strong>Đặt hàng:</strong> ${orderTime.toLocaleString('vi-VN')}</p>
                    ${order.startTime ? `<p><strong>Bắt đầu làm:</strong> ${new Date(order.startTime).toLocaleString('vi-VN')}</p>` : ''}
                    ${order.readyTime ? `<p><strong>Sẵn sàng:</strong> ${new Date(order.readyTime).toLocaleString('vi-VN')}</p>` : ''}
                    ${order.completeTime ? `<p><strong>Hoàn thành:</strong> ${new Date(order.completeTime).toLocaleString('vi-VN')}</p>` : ''}
                </div>
            </div>
        `;

        this.showModal('orderDetailModal');
    }

    // Statistics and UI Updates
    updateStats() {
        const pendingCount = this.orders.filter(o => o.status === 'pending').length;
        const cookingCount = this.orders.filter(o => o.status === 'cooking').length;
        const completedToday = this.orders.filter(o => {
            const orderDate = new Date(o.orderTime);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString() && o.status === 'completed';
        }).length;

        document.getElementById('pendingOrders').textContent = pendingCount;
        document.getElementById('cookingOrders').textContent = cookingCount;
        document.getElementById('completedToday').textContent = completedToday;
    }

    updateFilterCounts() {
        const pendingCount = this.orders.filter(o => o.status === 'pending').length;
        const cookingCount = this.orders.filter(o => o.status === 'cooking').length;
        const readyCount = this.orders.filter(o => o.status === 'ready').length;

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('cookingCount').textContent = cookingCount;
        document.getElementById('readyCount').textContent = readyCount;
    }

    updateClock() {
        const clockElement = document.getElementById('currentTime');
        if (clockElement) {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString('vi-VN');
        }

        // Update order timers
        document.querySelectorAll('.order-timer').forEach(timer => {
            const orderTime = new Date(timer.dataset.orderTime);
            timer.textContent = this.getTimeElapsed(orderTime);
        });
    }

    // Auto Refresh
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        if (this.autoRefreshTime > 0) {
            this.autoRefreshInterval = setInterval(() => {
                this.loadOrders();
                this.renderOrders();
                this.updateStats();
            }, this.autoRefreshTime * 1000);
        }
    }

    // Settings Management
    saveSettings() {
        const autoRefresh = document.getElementById('autoRefresh').value;
        const soundNotification = document.getElementById('soundNotification').checked;
        const orderDisplay = document.getElementById('orderDisplay').value;

        this.autoRefreshTime = parseInt(autoRefresh);
        this.soundEnabled = soundNotification;
        this.displayMode = orderDisplay;

        // Save to localStorage
        localStorage.setItem('kitchenSettings', JSON.stringify({
            autoRefreshTime: this.autoRefreshTime,
            soundEnabled: this.soundEnabled,
            displayMode: this.displayMode
        }));

        this.startAutoRefresh();
        this.hideModal('settingsModal');
        Utils.showNotification('Đã lưu cài đặt', 'success');
    }

    loadSettings() {
        const settings = localStorage.getItem('kitchenSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.autoRefreshTime = parsed.autoRefreshTime || 30;
            this.soundEnabled = parsed.soundEnabled !== false;
            this.displayMode = parsed.displayMode || 'grid';

            // Update UI
            document.getElementById('autoRefresh').value = this.autoRefreshTime;
            document.getElementById('soundNotification').checked = this.soundEnabled;
            document.getElementById('orderDisplay').value = this.displayMode;
        }
    }

    // Utility Functions
    playNotificationSound() {
        // Simple notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

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
        }
    }

    // Add new order (called from other systems)
    addNewOrder(orderData) {
        const newOrder = {
            id: `order-${Date.now()}`,
            tableNumber: orderData.tableNumber,
            orderTime: new Date().toISOString(),
            status: 'pending',
            orderType: orderData.orderType || 'Tại bàn',
            items: orderData.items || [],
            total: orderData.total || 0,
            customerInfo: orderData.customerInfo || null,
            notes: orderData.notes || '',
            startTime: null,
            readyTime: null,
            completeTime: null
        };

        this.orders.push(newOrder);
        this.saveOrders();
        this.renderOrders();
        this.updateStats();

        if (this.soundEnabled) {
            this.playNotificationSound();
        }

        Utils.showNotification('Có đơn hàng mới!', 'info');
        return newOrder.id;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ordersGrid')) {
        window.kitchenManager = new KitchenManager();
    }
});