/**
 * YUMMY Restaurant Router Configuration
 * File cấu hình để customize routing behavior
 */

// Cấu hình routing mặc định
const YUMMY_ROUTER_CONFIG = {
    // ====== CẤU HÌNH ROUTING ======
    routes: {
        landing: '/',
        customer: '/customer/index.html',
        menu: '/menu/index.html', 
        booking: '/customer/index.html#booking',
        kitchen: '/kitchen/index.html',
        admin: '/admin/dashboard.html'
    },

    // ====== CẤU HÌNH HÀNH VI ======
    routing: {
        // Trang đích cho user lần đầu tiên vào website
        // Options: 'landing', 'customer', 'menu', 'booking'
        defaultFirstVisit: 'landing',
        
        // Trang đích cho user quay lại (returning visitor)
        // Options: 'landing', 'customer', 'menu', 'booking'
        defaultReturningVisit: 'customer',
        
        // Có tự động redirect hay không
        autoRedirect: true,
        
        // Thời gian delay trước khi redirect (milliseconds)
        // Set = 0 để redirect ngay lập tức
        redirectDelay: 2000,
        
        // Hiển thị welcome message cho user lần đầu
        showWelcomeMessage: true,
        
        // Hiển thị loading indicator khi redirect
        showLoadingIndicator: true
    },

    // ====== CẤU HÌNH HIỂN THỊ ======
    display: {
        // Tên hiển thị cho từng route
        routeDisplayNames: {
            landing: 'Trang chủ',
            customer: 'Order Online',
            menu: 'Menu Hôm Nay', 
            booking: 'Đặt bàn',
            kitchen: 'Bếp',
            admin: 'Admin Dashboard'
        },
        
        // Welcome message content
        welcomeMessage: {
            title: 'Chào mừng đến với YUMMY!',
            subtitle: 'Lần đầu ghé thăm? Hãy khám phá những tính năng tuyệt vời của chúng tôi!',
            buttons: [
                {
                    text: 'Order ngay',
                    icon: 'fa-solid fa-utensils',
                    route: 'customer',
                    style: 'primary'
                },
                {
                    text: 'Xem menu',
                    icon: 'fa-solid fa-list',
                    route: 'menu',
                    style: 'secondary'
                },
                {
                    text: 'Khám phá trang chủ',
                    icon: 'fa-solid fa-eye',
                    action: 'stay',
                    style: 'outline'
                }
            ]
        }
    },

    // ====== CẤU HÌNH NÂNG CAO ======
    advanced: {
        // Ghi nhớ preference của user
        rememberUserPreference: true,
        
        // Thời gian hết hạn của user state (days)
        userStateExpiration: 30,
        
        // Enable debug logging
        debugMode: false,
        
        // Analytics tracking
        enableAnalytics: true
    }
};

// ====== PRESET ROUTING CONFIGURATIONS ======

// Preset 1: Tập trung vào Order (Restaurant chú trọng delivery)
const PRESET_ORDER_FOCUSED = {
    routing: {
        defaultFirstVisit: 'customer',
        defaultReturningVisit: 'customer',
        autoRedirect: true,
        redirectDelay: 1000,
        showWelcomeMessage: false
    }
};

// Preset 2: Tập trung vào Menu (Showcase món ăn)
const PRESET_MENU_FOCUSED = {
    routing: {
        defaultFirstVisit: 'menu',
        defaultReturningVisit: 'menu',
        autoRedirect: true,
        redirectDelay: 1500,
        showWelcomeMessage: true
    }
};

// Preset 3: Landing page showcase (Marketing focused)
const PRESET_LANDING_FOCUSED = {
    routing: {
        defaultFirstVisit: 'landing',
        defaultReturningVisit: 'landing',
        autoRedirect: false,
        showWelcomeMessage: false
    }
};

// Preset 4: Quick booking (Dine-in restaurant)
const PRESET_BOOKING_FOCUSED = {
    routing: {
        defaultFirstVisit: 'booking',
        defaultReturningVisit: 'booking',
        autoRedirect: true,
        redirectDelay: 1000,
        showWelcomeMessage: true
    }
};

// ====== FUNCTIONS TO APPLY PRESETS ======

/**
 * Apply một preset cấu hình
 * @param {string} presetName - Tên preset ('order', 'menu', 'landing', 'booking')
 */
function applyRoutingPreset(presetName) {
    const presets = {
        'order': PRESET_ORDER_FOCUSED,
        'menu': PRESET_MENU_FOCUSED,
        'landing': PRESET_LANDING_FOCUSED,
        'booking': PRESET_BOOKING_FOCUSED
    };

    if (presets[presetName] && window.yummyRouter) {
        window.yummyRouter.updateConfig(presets[presetName]);
        console.log(`Applied routing preset: ${presetName}`);
    }
}

/**
 * Apply custom configuration
 * @param {Object} customConfig - Custom routing configuration
 */
function applyCustomRoutingConfig(customConfig) {
    if (window.yummyRouter) {
        window.yummyRouter.updateConfig(customConfig);
        console.log('Applied custom routing config:', customConfig);
    }
}

// ====== QUICK SETUP EXAMPLES ======

/*
// EXAMPLE 1: Chuyển về order-focused mode
applyRoutingPreset('order');

// EXAMPLE 2: Custom configuration
applyCustomRoutingConfig({
    routing: {
        defaultFirstVisit: 'menu',
        defaultReturningVisit: 'customer',
        redirectDelay: 3000
    }
});

// EXAMPLE 3: Disable auto redirect
applyCustomRoutingConfig({
    routing: {
        autoRedirect: false
    }
});

// EXAMPLE 4: Quick redirect, no welcome message
applyCustomRoutingConfig({
    routing: {
        redirectDelay: 0,
        showWelcomeMessage: false
    }
});
*/

// Export cấu hình để sử dụng
if (typeof window !== 'undefined') {
    window.YUMMY_ROUTER_CONFIG = YUMMY_ROUTER_CONFIG;
    window.applyRoutingPreset = applyRoutingPreset;
    window.applyCustomRoutingConfig = applyCustomRoutingConfig;
}