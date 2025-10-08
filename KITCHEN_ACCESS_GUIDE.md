# YUMMY Restaurant - Kitchen Access Guide

## 🍳 Hướng dẫn truy cập cho Nhân viên Bếp

### 📱 **Dành cho Khách hàng (Công khai)**
- **Trang chủ**: Xem thông tin nhà hàng
- **Order**: Đặt món ăn online 
- **Menu Hôm Nay**: Xem thực đơn hôm nay
- **Đặt bàn**: Đặt bàn trước

### 👨‍🍳 **Dành cho Nhân viên Bếp**
**URL truy cập**: `/kitchen/kitchen-login.html`

**Thông tin đăng nhập**: 
- Email: `kitchen@yummy.vn`
- Password: `kitchen123`

**Tính năng**:
- ✅ Đăng nhập riêng biệt cho nhân viên bếp
- ✅ Xem danh sách đơn hàng theo trạng thái
- ✅ Cập nhật trạng thái chế biến
- ✅ Tự động đăng xuất sau 24h
- ✅ Bảo mật với Firebase Authentication

### 👨‍💼 **Dành cho Admin**
**URL truy cập**: `/admin/admin-panel.html`

**Thông tin đăng nhập**:
- Email: `admin@yummy.vn` 
- Password: `admin123`

**Tính năng Admin**:
- ✅ Dashboard tổng quan
- ✅ Quản lý Menu
- ✅ Quản lý Đơn hàng  
- ✅ Quản lý Bàn
- ✅ **Truy cập Màn hình Bếp** (sidebar → Bếp)
- ✅ Không cần đăng nhập riêng cho kitchen

### 🔐 **Phân quyền truy cập**

| Vai trò | Trang truy cập | Yêu cầu đăng nhập |
|---------|----------------|-------------------|
| Khách hàng | Trang chủ, Order, Menu, Đặt bàn | ❌ Không |
| Nhân viên Bếp | Kitchen Display | ✅ Kitchen Login |
| Admin | Admin Panel + Kitchen View | ✅ Admin Login |

### 🚀 **Luồng hoạt động**

**Khách hàng**:
1. Vào trang chủ → Order → Chọn món → Thanh toán
2. Hoặc: Menu Hôm Nay → Xem thực đơn
3. Hoặc: Đặt bàn → Book bàn trước

**Nhân viên Bếp**:
1. Truy cập `/kitchen/kitchen-login.html`
2. Đăng nhập bằng tài khoản bếp
3. Xem đơn hàng → Cập nhật trạng thái
4. Đăng xuất khi hết ca

**Admin**:
1. Truy cập `/admin/admin-panel.html`
2. Đăng nhập admin
3. Quản lý toàn bộ hệ thống
4. Theo dõi bếp qua sidebar → Bếp

### 🛡️ **Bảo mật**
- Navbar công khai không còn link Bếp/Admin
- Kitchen Display yêu cầu authentication riêng
- Admin có quyền truy cập tất cả module
- Session timeout 24h cho kitchen staff