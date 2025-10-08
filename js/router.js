/**
 * YUMMY Restaurant Router System
 * Quản lý routing và xác định trang đầu tiên user sẽ truy cập
 */

class YummyRouter {
    constructor() {
        this.routes = {
            landing: '/',
            customer: '/customer/index.html',
            menu: '/menu/index.html',
            booking: '/customer/index.html#booking',
            kitchen: '/kitchen/index.html',
            admin: '/admin/dashboard.html'
        };

        this.routingConfig = {
            // Trang đích mặc định cho user lần đầu
            defaultFirstVisit: 'landing',
            // Trang đích cho returning visitor
            defaultReturningVisit: 'customer',
            // Có tự động redirect hay không
            autoRedirect: true,
            // Thời gian delay trước khi redirect (ms)
            redirectDelay: 2000,
            // Có hiển thị welcome message cho user lần đầu
            showWelcomeMessage: true
        };

        this.userState = {
            isFirstVisit: false,
            lastVisitedPage: null,
            visitCount: 0,
            preferences: {}
        };

        this.init();
    }

    init() {
        this.loadUserState();
        this.detectUserType();
        this.handleRouting();
    }

    /**
     * Load trạng thái user từ localStorage
     */
    loadUserState() {
        try {
            const savedState = localStorage.getItem('yummy_user_state');
            if (savedState) {
                this.userState = { ...this.userState, ...JSON.parse(savedState) };
            } else {
                this.userState.isFirstVisit = true;
            }
        } catch (error) {
            console.log('Router: Khởi tạo trạng thái user mới');
            this.userState.isFirstVisit = true;
        }
    }

    /**
     * Lưu trạng thái user vào localStorage
     */
    saveUserState() {
        try {
            localStorage.setItem('yummy_user_state', JSON.stringify(this.userState));
        } catch (error) {
            console.warn('Router: Không thể lưu trạng thái user');
        }
    }

    /**
     * Phát hiện loại user (lần đầu, returning, direct access)
     */
    detectUserType() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // Tăng số lần visit
        this.userState.visitCount += 1;
        
        // Cập nhật trang hiện tại
        this.userState.lastVisitedPage = currentPath + currentHash;
        
        // Log thông tin user
        console.log('Router: User Type Detection', {
            isFirstVisit: this.userState.isFirstVisit,
            visitCount: this.userState.visitCount,
            currentPath: currentPath,
            lastVisited: this.userState.lastVisitedPage
        });
    }

    /**
     * Xử lý routing logic
     */
    handleRouting() {
        const currentPath = window.location.pathname;
        
        // Nếu user đang ở trang chủ (index.html hoặc root)
        if (currentPath === '/' || currentPath.includes('index.html')) {
            if (this.routingConfig.autoRedirect) {
                this.executeRouting();
            }
        }
        
        // Lưu trạng thái
        this.saveUserState();
    }

    /**
     * Thực hiện routing dựa trên cấu hình
     */
    executeRouting() {
        let targetRoute;
        
        if (this.userState.isFirstVisit) {
            targetRoute = this.routingConfig.defaultFirstVisit;
            
            if (this.routingConfig.showWelcomeMessage) {
                this.showWelcomeMessage();
            }
        } else {
            // Returning visitor
            targetRoute = this.userState.preferences.defaultPage || this.routingConfig.defaultReturningVisit;
        }

        // Nếu targetRoute là 'landing', không redirect, ở lại trang chủ
        if (targetRoute === 'landing') {
            console.log('Router: Hiển thị landing page');
            return;
        }

        // Thực hiện redirect
        if (this.routes[targetRoute]) {
            this.redirectTo(targetRoute);
        }
    }

    /**
     * Hiển thị welcome message cho user lần đầu
     */
    showWelcomeMessage() {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'router-welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-overlay">
                <div class="welcome-content">
                    <h2><i class="fa-solid fa-heart"></i> Chào mừng đến với YUMMY!</h2>
                    <p>Lần đầu ghé thăm? Hãy khám phá những tính năng tuyệt vời của chúng tôi!</p>
                    <div class="welcome-buttons">
                        <button onclick="yummyRouter.redirectTo('customer')" class="btn btn-primary">
                            <i class="fa-solid fa-utensils"></i> Order ngay
                        </button>
                        <button onclick="yummyRouter.redirectTo('menu')" class="btn btn-secondary">
                            <i class="fa-solid fa-list"></i> Xem menu
                        </button>
                        <button onclick="yummyRouter.closeWelcomeMessage()" class="btn btn-outline">
                            <i class="fa-solid fa-eye"></i> Khám phá trang chủ
                        </button>
                    </div>
                </div>
            </div>
        `;

        // CSS cho welcome message
        const style = document.createElement('style');
        style.textContent = `
            .router-welcome-message {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-in;
            }
            .welcome-overlay {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 500px;
                margin: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .welcome-content h2 {
                color: #ff6b35;
                margin-bottom: 1rem;
            }
            .welcome-content h2 i {
                color: #ff4757;
            }
            .welcome-buttons {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                margin-top: 1.5rem;
            }
            .welcome-buttons .btn {
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }
            .welcome-buttons .btn-primary {
                background: #ff6b35;
                color: white;
            }
            .welcome-buttons .btn-primary:hover {
                background: #e55a2e;
            }
            .welcome-buttons .btn-secondary {
                background: #4834d4;
                color: white;
            }
            .welcome-buttons .btn-secondary:hover {
                background: #3c2bb8;
            }
            .welcome-buttons .btn-outline {
                background: transparent;
                color: #333;
                border: 2px solid #ddd;
            }
            .welcome-buttons .btn-outline:hover {
                background: #f8f9fa;
                border-color: #aaa;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            @media (max-width: 768px) {
                .welcome-overlay {
                    padding: 1.5rem;
                    margin: 1rem;
                }
                .welcome-buttons {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(welcomeMessage);

        // Đánh dấu user đã không còn là first visit
        this.userState.isFirstVisit = false;
    }

    /**
     * Đóng welcome message
     */
    closeWelcomeMessage() {
        const welcomeElement = document.querySelector('.router-welcome-message');
        if (welcomeElement) {
            welcomeElement.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                welcomeElement.remove();
            }, 300);
        }
    }

    /**
     * Redirect đến route được chỉ định
     */
    redirectTo(routeName, immediate = false) {
        if (!this.routes[routeName]) {
            console.warn(`Router: Route "${routeName}" không tồn tại`);
            return;
        }

        const targetUrl = this.routes[routeName];
        const delay = immediate ? 0 : this.routingConfig.redirectDelay;

        console.log(`Router: Chuyển hướng đến ${routeName} sau ${delay}ms`);

        // Hiển thị loading indicator nếu có delay
        if (delay > 0) {
            this.showLoadingIndicator(routeName);
        }

        setTimeout(() => {
            window.location.href = targetUrl;
        }, delay);
    }

    /**
     * Hiển thị loading indicator khi redirect
     */
    showLoadingIndicator(routeName) {
        const indicator = document.createElement('div');
        indicator.className = 'router-loading-indicator';
        indicator.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>Đang chuyển hướng đến ${this.getRouteDisplayName(routeName)}...</p>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .router-loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .loading-content {
                text-align: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #ff6b35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicator);
    }

    /**
     * Lấy tên hiển thị của route
     */
    getRouteDisplayName(routeName) {
        const displayNames = {
            landing: 'Trang chủ',
            customer: 'Order Online',
            menu: 'Menu',
            booking: 'Đặt bàn',
            kitchen: 'Bếp',
            admin: 'Admin Dashboard'
        };
        return displayNames[routeName] || routeName;
    }

    /**
     * Cập nhật cấu hình routing
     */
    updateConfig(newConfig) {
        this.routingConfig = { ...this.routingConfig, ...newConfig };
        console.log('Router: Đã cập nhật cấu hình', this.routingConfig);
    }

    /**
     * Cập nhật preferences của user
     */
    updateUserPreferences(preferences) {
        this.userState.preferences = { ...this.userState.preferences, ...preferences };
        this.saveUserState();
        console.log('Router: Đã cập nhật preferences user', this.userState.preferences);
    }

    /**
     * Reset trạng thái user (debug purpose)
     */
    resetUserState() {
        localStorage.removeItem('yummy_user_state');
        this.userState = {
            isFirstVisit: true,
            lastVisitedPage: null,
            visitCount: 0,
            preferences: {}
        };
        console.log('Router: Đã reset trạng thái user');
    }

    /**
     * Lấy thông tin trạng thái hiện tại
     */
    getStatus() {
        return {
            userState: this.userState,
            routingConfig: this.routingConfig,
            currentPath: window.location.pathname + window.location.hash
        };
    }
}

// Khởi tạo router global
let yummyRouter;

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    yummyRouter = new YummyRouter();
    
    // Expose router globally cho debugging
    window.yummyRouter = yummyRouter;
    
    console.log('YUMMY Router initialized:', yummyRouter.getStatus());
});

// Export cho module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YummyRouter;
}