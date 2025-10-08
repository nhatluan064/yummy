/**
 * Shared Menu Data Manager
 * Manages menu data across different pages and components
 */

class SharedMenuManager {
    constructor() {
        this.storageKey = 'dailyMenu';
        this.cartKey = 'tempCart';
        this.orderContextKey = 'orderContext';
    }

    // Get menu data from storage
    getMenuData() {
        const savedMenu = localStorage.getItem(this.storageKey);
        if (savedMenu) {
            return JSON.parse(savedMenu);
        }
        
        // Return default menu if no saved data
        return this.getDefaultMenu();
    }

    // Save menu data to storage
    saveMenuData(menuData) {
        localStorage.setItem(this.storageKey, JSON.stringify(menuData));
    }

    // Get available menu items only
    getAvailableItems() {
        return this.getMenuData().filter(item => item.status === 'available' && item.inventory > 0);
    }

    // Get items by category
    getItemsByCategory(category = null) {
        const items = this.getAvailableItems();
        if (!category || category === 'all') {
            return items;
        }
        return items.filter(item => item.category === category);
    }

    // Get single item by ID
    getItemById(itemId) {
        return this.getMenuData().find(item => item.id === itemId);
    }

    // Update item inventory (when ordered)
    updateItemInventory(itemId, quantity) {
        const menuData = this.getMenuData();
        const item = menuData.find(i => i.id === itemId);
        
        if (item) {
            item.inventory = Math.max(0, (item.inventory || 0) - quantity);
            item.soldToday = (item.soldToday || 0) + quantity;
            
            // Mark as sold out if inventory reaches 0
            if (item.inventory === 0) {
                item.status = 'soldout';
            }
            
            this.saveMenuData(menuData);
            return true;
        }
        return false;
    }

    // Store temporary cart data for cross-page navigation
    setTempCart(cartData) {
        localStorage.setItem(this.cartKey, JSON.stringify(cartData));
    }

    // Get temporary cart data
    getTempCart() {
        const tempCart = localStorage.getItem(this.cartKey);
        return tempCart ? JSON.parse(tempCart) : [];
    }

    // Clear temporary cart
    clearTempCart() {
        localStorage.removeItem(this.cartKey);
    }

    // Store order context (table selection, delivery info, etc.)
    setOrderContext(context) {
        localStorage.setItem(this.orderContextKey, JSON.stringify(context));
    }

    // Get order context
    getOrderContext() {
        const context = localStorage.getItem(this.orderContextKey);
        return context ? JSON.parse(context) : null;
    }

    // Clear order context
    clearOrderContext() {
        localStorage.removeItem(this.orderContextKey);
    }

    // Navigate to order page with pre-selected items
    navigateToOrder(selectedItems = [], orderType = null, tableNumber = null) {
        // Store selected items in temp cart
        if (selectedItems.length > 0) {
            this.setTempCart(selectedItems);
        }

        // Store order context
        if (orderType || tableNumber) {
            this.setOrderContext({
                orderType: orderType,
                tableNumber: tableNumber,
                timestamp: Date.now()
            });
        }

        // Navigate to customer page
        window.location.href = '../customer/index.html';
    }

    // Get default menu data
    getDefaultMenu() {
        return [
            {
                id: 'item-1',
                name: 'Phở Bò Tái',
                description: 'Phở truyền thống với thịt bò tái, hành tây, ngò gai',
                price: 45000,
                category: 'Món Chính',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Phở+Bò',
                status: 'available',
                inventory: 20,
                soldToday: 15
            },
            {
                id: 'item-2',
                name: 'Bánh Mì Thịt Nướng',
                description: 'Bánh mì giòn với thịt nướng, đồ chua, rau thơm',
                price: 25000,
                category: 'Món Chính',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Bánh+Mì',
                status: 'available',
                inventory: 30,
                soldToday: 8
            },
            {
                id: 'item-3',
                name: 'Gỏi Cuốn Tôm',
                description: 'Gỏi cuốn tươi với tôm, bún, rau thơm, chấm nước mắm',
                price: 35000,
                category: 'Khai Vị',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Gỏi+Cuốn',
                status: 'available',
                inventory: 15,
                soldToday: 12
            },
            {
                id: 'item-4',
                name: 'Chè Ba Màu',
                description: 'Chè truyền thống 3 lớp với đậu xanh, đậu đỏ, thạch',
                price: 20000,
                category: 'Tráng Miệng',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Chè',
                status: 'soldout',
                inventory: 0,
                soldToday: 25
            },
            {
                id: 'item-5',
                name: 'Nước Chanh Dây',
                description: 'Nước chanh dây tươi mát, pha chế theo công thức riêng',
                price: 15000,
                category: 'Đồ Uống',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Chanh+Dây',
                status: 'available',
                inventory: 50,
                soldToday: 30
            },
            {
                id: 'item-6',
                name: 'Bún Bò Huế',
                description: 'Bún bò Huế cay nồng, đậm đà hương vị miền Trung',
                price: 42000,
                category: 'Món Chính',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Bún+Bò',
                status: 'available',
                inventory: 18,
                soldToday: 7
            },
            {
                id: 'item-7',
                name: 'Bánh Xèo Miền Tây',
                description: 'Bánh xèo giòn rụm với tôm, thịt, giá đỗ, rau sống',
                price: 38000,
                category: 'Món Chính',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Bánh+Xèo',
                status: 'available',
                inventory: 12,
                soldToday: 9
            },
            {
                id: 'item-8',
                name: 'Nem Nướng Nha Trang',
                description: 'Nem nướng thơm lừng, ăn kèm bánh tráng, rau thơm',
                price: 48000,
                category: 'Khai Vị',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Nem+Nướng',
                status: 'available',
                inventory: 25,
                soldToday: 5
            },
            {
                id: 'item-9',
                name: 'Cơm Tấm Sườn Nướng',
                description: 'Cơm tấm với sườn nướng, chả, bì, trứng ốp la',
                price: 52000,
                category: 'Món Chính',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Cơm+Tấm',
                status: 'available',
                inventory: 22,
                soldToday: 18
            },
            {
                id: 'item-10',
                name: 'Trà Đá Chanh',
                description: 'Trà đá chanh tươi mát, giải khát tuyệt vời',
                price: 8000,
                category: 'Đồ Uống',
                image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Trà+Chanh',
                status: 'available',
                inventory: 100,
                soldToday: 45
            }
        ];
    }

    // Get menu statistics
    getMenuStats() {
        const menuData = this.getMenuData();
        return {
            totalItems: menuData.length,
            availableItems: menuData.filter(item => item.status === 'available').length,
            soldOutItems: menuData.filter(item => item.status === 'soldout').length,
            todaySales: menuData.reduce((sum, item) => sum + (item.soldToday || 0), 0),
            totalRevenue: menuData.reduce((sum, item) => sum + ((item.soldToday || 0) * item.price), 0)
        };
    }

    // Generate URL with cart data for navigation
    generateOrderURL(cartItems = []) {
        if (cartItems.length === 0) {
            return '../customer/index.html';
        }

        const cartData = encodeURIComponent(JSON.stringify(cartItems));
        return `../customer/index.html?cart=${cartData}`;
    }
}

// Create global instance
window.sharedMenuManager = new SharedMenuManager();