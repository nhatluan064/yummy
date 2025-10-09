# YUMMY Restaurant - Simplified Access Guide

## � **Hệ thống đã được đơn giản hóa thành 2 trang chính**

### 📱 **1. User Page (Khách hàng - Công khai)**

**URL**: `https://order-yummy.web.app`

**Navigation**:

- **🏠 Trang chủ**: Xem thông tin nhà hàng
- **🛒 Order**: Đặt món ăn online
- **📋 Menu Hôm Nay**: Xem thực đơn hôm nay
- **📅 Đặt bàn**: Đặt bàn trước

### 👨‍💼 **2. Admin Page (Tích hợp tất cả chức năng quản lý)**

**URL**: `https://order-yummy.web.app/admin/admin-panel.html`

**Thông tin đăng nhập**:

- Email: `admin@yummy.vn`
- Password: `admin123`

**Tính năng Admin Panel (All-in-One)**:

- ✅ **Dashboard**: Tổng quan hệ thống
- ✅ **Menu**: Quản lý thực đơn
- ✅ **Đơn hàng**: Quản lý orders
- ✅ **Bàn**: Quản lý bàn ăn
- ✅ **🍳 Bếp**: Màn hình kitchen display tích hợp
- ✅ **Đăng xuất**: Logout khỏi hệ thống

### 🔐 **Phân quyền đơn giản**

| Vai trò                | URL Truy cập              | Chức năng                         |
| ---------------------- | ------------------------- | --------------------------------- |
| **👥 Khách hàng**      | `/`                       | Trang chủ, Order, Menu, Đặt bàn   |
| **👨‍💼 Admin/Nhân viên** | `/admin/admin-panel.html` | Quản lý toàn bộ + Kitchen Display |

### 🚀 **Luồng hoạt động đơn giản**

**Khách hàng**:

1. Vào trang chủ → Order → Chọn món → Thanh toán
2. Hoặc: Menu Hôm Nay → Xem thực đơn
3. Hoặc: Đặt bàn → Book bàn trước

**Admin/Nhân viên (Bao gồm nhân viên bếp)**:

1. Truy cập `/admin/admin-panel.html`
2. Đăng nhập bằng tài khoản admin
3. **Quản lý Menu**: Tab "Menu"
4. **Quản lý Đơn hàng**: Tab "Đơn hàng"
5. **Quản lý Bàn**: Tab "Bàn"
6. **🍳 Theo dõi Bếp**: Tab "Bếp" - Kitchen Display tích hợp
7. Đăng xuất khi hoàn thành

### 🍳 **Kitchen Display tích hợp**

- ✅ **Không cần trang riêng**: Kitchen đã được tích hợp vào Admin Panel
- ✅ **Truy cập**: Admin Panel → Click tab "Bếp"
- ✅ **Chức năng đầy đủ**: Xem đơn hàng, cập nhật trạng thái, quản lý orders
- ✅ **Real-time**: Theo dõi trạng thái đơn hàng trực tiếp

### 🛡️ **Bảo mật & Đơn giản**

- ✅ **Chỉ 2 trang chính**: User page + Admin page
- ✅ **Navbar công khai sạch sẽ**: Không có link admin/kitchen
- ✅ **Single Sign-On**: Admin login cho tất cả chức năng
- ✅ **Tích hợp hoàn toàn**: Kitchen không cần đăng nhập riêng

### 📊 **Lợi ích của hệ thống mới**

- 🎯 **Đơn giản**: Chỉ 2 URL chính cần nhớ
- 🚀 **Nhanh chóng**: Không cần chuyển đổi giữa nhiều trang
- 🔒 **Bảo mật**: Single point of authentication
- 📱 **Responsive**: Tối ưu cho mọi thiết bị
- 🛠 **Dễ bảo trì**: Ít file, ít phức tạp
