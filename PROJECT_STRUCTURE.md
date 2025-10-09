# 📂 Cấu trúc Project YUMMY (Sau khi dọn dẹp)

## 📋 Tổng quan
Dự án quản lý nhà hàng với Firebase, hỗ trợ order tại bàn, giao hàng và đặt bàn online.

---

## 🗂️ Cấu trúc thư mục

```
yummy/
├── 📄 index.html                    # Router tự động (lần đầu → landing, returning → order)
├── 📄 landing-home.html             # Landing page chính
│
├── 📁 admin/                        # Quản lý Admin
│   ├── admin-panel.html             # ✅ Admin panel chính (ĐANG DÙNG)
│   └── admin-auth-debug.html        # ⚠️ File debug (xóa khi production)
│
├── 📁 customer/                     # Giao diện khách hàng
│   ├── order-booking.html           # ✅ Trang order & đặt bàn chính
│   └── delivery.html                # ✅ Trang đặt giao hàng
│
├── 📁 kitchen/                      # Màn hình bếp
│   └── kitchen-display.html         # ✅ Màn hình hiển thị order cho bếp
│
├── 📁 menu/                         # Menu công khai
│   └── public-menu.html             # ✅ Thực đơn cho khách xem
│
├── 📁 css/                          # Stylesheets
│   ├── styles.css                   # Styles chung
│   ├── admin.css                    # Admin styles
│   ├── customer.css                 # Customer styles
│   ├── delivery.css                 # Delivery styles
│   ├── kitchen.css                  # Kitchen styles
│   └── menu.css                     # Menu styles
│
├── 📁 js/                           # JavaScript modules
│   ├── firebase-service.js          # ✅ Firebase service chính
│   ├── admin.js                     # ✅ Admin logic
│   ├── app.js                       # ✅ App initialization
│   ├── booking.js                   # ✅ Booking logic
│   ├── cart.js                      # ✅ Shopping cart
│   ├── kitchen.js                   # ✅ Kitchen logic
│   ├── menu.js                      # ✅ Menu management
│   └── shared-menu.js               # ✅ Shared menu utilities
│
├── 📁 .firebase/                    # Firebase cache (gitignore)
├── 📄 firebase.json                 # Firebase config
├── 📄 firestore.rules               # Firestore security rules
├── 📄 firestore.indexes.json        # Firestore indexes
├── 📄 .firebaserc                   # Firebase project config
│
└── 📁 Docs/                         # Documentation
    ├── README.md                    # Project readme
    ├── DEVELOPMENT.md               # Development guide
    ├── FIREBASE_SETUP.md            # Firebase setup guide
    ├── KITCHEN_ACCESS_GUIDE.md      # Kitchen access guide
    ├── FILES_TO_DELETE.md           # ✅ Cleanup log
    └── PROJECT_STRUCTURE.md         # 👈 File này
```

---

## 🎯 File chính cần biết

### 🌐 Entry Points (Điểm vào chính)
| File | Mô tả | Người dùng |
|------|-------|------------|
| `index.html` | Router tự động dựa trên lượt visit | Tất cả |
| `landing-home.html` | Landing page cho lần đầu | Khách mới |
| `customer/order-booking.html` | Trang order & đặt bàn | Khách hàng |
| `admin/admin-panel.html` | Admin dashboard | Admin |
| `kitchen/kitchen-display.html` | Màn hình bếp | Nhân viên bếp |

### 🔥 Firebase Integration
| File | Chức năng |
|------|-----------|
| `js/firebase-service.js` | Service chính, xử lý Auth & Firestore |
| `firestore.rules` | Quy tắc bảo mật database |
| `firebase.json` | Cấu hình hosting & deployment |

### 🎨 Styling
Mỗi module có CSS riêng, import `styles.css` làm base.

---

## 🔄 Flow người dùng

### Khách hàng
1. `index.html` → Kiểm tra lần đầu/returning
2. Lần đầu: `landing-home.html` (giới thiệu)
3. Returning: `customer/order-booking.html` (order trực tiếp)
4. Có thể: Xem menu (`menu/public-menu.html`), Đặt giao hàng (`customer/delivery.html`)

### Admin
1. Truy cập `admin/admin-panel.html`
2. Đăng nhập Firebase Auth
3. Quản lý: Menu, Orders, Bookings, Kitchen, Settings

### Bếp
1. Truy cập `kitchen/kitchen-display.html`
2. Xem orders realtime
3. Cập nhật trạng thái món

---

## 📦 Collections Firebase

| Collection | Mô tả | Example ID |
|------------|-------|------------|
| `menuItems` | Danh sách món ăn | AUTO_ID |
| `categories` | Danh mục món | AUTO_ID |
| `orders` | Đơn hàng (dine-in, delivery) | AUTO_ID |
| `bookings` | Đặt bàn trước | AUTO_ID |
| `tables` | Quản lý bàn | AUTO_ID |
| `admins` | Danh sách admin (auth) | USER_UID |
| `users` | Thông tin user | USER_UID |

---

## 🚀 Development

### Chạy local
```bash
firebase serve
# hoặc
python -m http.server 8000
```

### Deploy
```bash
firebase deploy
```

### Test
- Admin: http://localhost:8000/admin/admin-panel.html
- Customer: http://localhost:8000/customer/order-booking.html
- Kitchen: http://localhost:8000/kitchen/kitchen-display.html

---

## ✅ Đã dọn dẹp (09/10/2025)
- Xóa 11 files backup/legacy/unused
- Giữ lại 1 file debug: `admin-auth-debug.html` (xóa khi production)
- Tiết kiệm ~250-400 KB

---

## 📝 Notes

### Development Mode
- `admin-auth-debug.html`: Giữ lại để test authentication
- Console logs: Bật để debug

### Production Mode
- Xóa `admin-auth-debug.html`
- Tắt console logs
- Minify CSS/JS
- Enable Firebase security rules

---

*Last updated: 09/10/2025*
*Project: YUMMY Restaurant Management System*
