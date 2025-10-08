<<<<<<< HEAD
# YUMMY - Hệ thống Order Nhà hàng

Hệ thống quản lý nhà hàng hiện đại với chức năng order tại bàn và giao hàng, được tối ưu hóa cho cả khách hàng và admin.

## 🚀 Tính năng chính

### Cho khách hàng:

### Cho admin:

## 📁 Cấu trúc thư mục

```
yummy/
├── css/
│   ├── styles.css      # CSS chung
│   ├── customer.css    # CSS cho giao diện khách hàng
│   └── admin.css       # CSS cho giao diện admin
├── js/
│   ├── app.js          # JavaScript chung
│   ├── cart.js         # Quản lý giỏ hàng
│   ├── booking.js      # Quản lý đặt bàn
│   └── admin.js        # Dashboard admin
├── customer/
│   └── index.html      # Giao diện khách hàng
├── admin/
│   └── dashboard.html  # Giao diện admin
├── index.html          # Trang landing chính
├── firebase.json       # Cấu hình Firebase
└── README.md          # Tài liệu này
```

## 🎯 Hướng dẫn sử dụng

### Khách hàng:
1. Truy cập `index.html` - trang chủ
2. Chọn "Order ngay" để vào giao diện order
3. Chọn loại order:
   - **Tại chỗ**: Chọn bàn và order
   - **Giao hàng**: Nhập địa chỉ và thông tin
4. Thêm món vào giỏ hàng
5. Xem lại và đặt hàng

### Admin:
1. Truy cập `admin/dashboard.html`
2. Xem tổng quan trong Dashboard
3. Quản lý đơn hàng: Duyệt, cập nhật trạng thái
4. Quản lý bàn: Theo dõi tình trạng bàn
5. Quản lý chi tiêu: Thêm chi phí, xem báo cáo

## 💾 Lưu trữ dữ liệu

Ứng dụng sử dụng `localStorage` để lưu trữ:

## 🛠️ Công nghệ sử dụng


## 🎨 Thiết kế


## 🚀 Triển khai

### Local Development:
```bash
# Chạy server local
python -m http.server 8000
# hoặc
npx serve .
```

### Firebase Hosting:
```bash
# Cài đặt Firebase CLI
npm install -g firebase-tools

# Đăng nhập Firebase
firebase login

# Triển khai
firebase deploy
```

## 📱 Tính năng Mobile


## 🔧 Tùy chỉnh

### Thêm món ăn mới:
1. Cập nhật menu trong `customer/index.html`
2. Thêm data attributes: `data-name` và `data-price`

### Thay đổi màu sắc:
1. Chỉnh sửa CSS variables trong `css/styles.css`
2. Cập nhật `--primary-color` và các màu khác

### Tích hợp thanh toán:
1. Thêm payment gateway vào `js/cart.js`
2. Cập nhật checkout process

## 📊 Analytics & Tracking


## 🔒 Bảo mật


## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 📞 Liên hệ



**YUMMY Restaurant Management System** - Được phát triển với ❤️ bởi nhóm phát triển YUMMY
Mỳ cay Yummy - Oder Table, Shipping
<!-- CLEAN MERGED README -->
# YUMMY – Hệ thống Order & Quản lý Nhà hàng

=======


## 🚀 Tính năng
### Khách hàng
- Order tại bàn (chọn số bàn) hoặc giao hàng (form địa chỉ, phí ship động)
- Đặt bàn trước theo ngày/giờ
- Giỏ hàng + tính tổng / phí ship
- Xem menu công khai (public)

### Bếp / Kitchen
- Màn hình hiển thị đơn theo trạng thái: pending / preparing / completed
- Phục vụ việc cập nhật real-time (qua Firestore listeners – planned)

### Admin
- Đăng nhập / bootstrap tài khoản admin đầu tiên (rule đặc biệt)
- Dashboard tổng quan (đơn hôm nay, doanh thu, bàn đang dùng, món active)
- Quản lý menu (CRUD món, trạng thái bán)
- Quản lý đơn hàng (lọc theo ngày / trạng thái / loại)
- Quản lý bàn (thêm bàn, theo dõi trạng thái)
- Khởi tạo dữ liệu mẫu (dev seed)

## �️ Cấu trúc thư mục hiện tại
```
admin/
   admin-panel.html        # (Đã gộp nội dung dashboard) – điểm vào /admin/**
   admin-auth-debug.html   # Trang thử nghiệm đăng nhập / bootstrap admin
   dashboard.html          # Bản cũ (có thể xóa sau khi xác nhận không còn dùng)
customer/
   order-booking.html      # Trang order (tại chỗ / giao hàng) + đặt bàn
menu/
   public-menu.html        # Menu công khai cho khách
kitchen/
   kitchen-display.html    # Màn hình bếp theo dõi đơn
css/                      # styles.css, admin.css, customer.css, ...
js/                       # firebase-service.js, admin.js, cart.js...
index.html                # Router: lần đầu -> landing-home.html, tái truy cập -> order booking
landing-home.html         # Landing marketing
firebase.json             # Hosting rewrites (trỏ tới file đã rename)
firestore.rules           # Quy tắc bảo mật (bootstrap admin)
.firebaserc               # Firebase project mapping
```

## � Bản đồ đổi tên (Migration Map)
| Cũ | Mới |
|----|-----|
| customer/index.html | customer/order-booking.html |
| menu/index.html | menu/public-menu.html |
| kitchen/index.html | kitchen/kitchen-display.html |
| admin/simple.html | admin/admin-auth-debug.html |
| (placeholder) admin-panel.html | (đã gộp dashboard) admin/admin-panel.html |

Sau khi xác nhận: `dashboard.html` có thể xóa (hiện giữ lại để rollback nhanh).

## � Firebase & Bảo mật
- Auth: Email/Password, trang debug để tạo admin đầu tiên
- Firestore: Rule cho phép tạo document user đầu tiên (bootstrap) với UID = doc id
- Service layer: `js/firebase-service.js` bao đóng CRUD (menu, tables, orders)

## 🧭 Điều hướng & Redirect
- `index.html` chạy script: lần đầu → `landing-home.html`, tái truy cập → `customer/order-booking.html` (localStorage key `yummyVisitCount`)
- Hosting rewrites: `/admin/**` → `admin/admin-panel.html`, `/customer` → order-booking, `/menu` → public-menu, `/kitchen` → kitchen-display

## 🛠️ Dev nhanh
```powershell
# Chạy server tĩnh (PowerShell)
python -m http.server 8000
# hoặc
npx serve .
```

## 🚀 Triển khai Firebase Hosting
```powershell
firebase login
firebase use --add   # nếu cần chọn project
firebase deploy --only hosting
```

## 🧪 Tạo dữ liệu mẫu
- Trong Admin Panel: nút “Dữ liệu mẫu” (gọi `initializeSampleData()` trong service)

## 📦 Các file quan trọng
- `firebase.json` – rewrites + headers cache
- `firestore.rules` – rule bootstrap admin
- `js/firebase-service.js` – API lớp dịch vụ
- `admin/admin-panel.html` – SPA admin sau khi gộp

## 📄 Kế hoạch tiếp theo (Đề xuất)
1. Xoá `admin/dashboard.html` sau khi verify mọi chức năng hoạt động trong `admin-panel.html`
2. Loại bỏ inline styles (lint)
3. Bổ sung listener Firestore real-time cho kitchen & orders
4. Thêm test nhẹ (smoke) bằng Playwright/GHA (tùy chọn)

## 🤝 Đóng góp
Fork → Branch → Commit → PR.

## License
MIT

---
Made with ❤️ for YUMMY.
A simple single-page restaurant site with booking and ordering UI, deployed to Firebase Hosting.

- Live: https://order-yummy.web.app
- Tech: HTML/CSS/JS, Firebase Hosting (+ Analytics)

## Develop
Open `index.html` in a browser or a local static server.

## Deploy (Firebase Hosting)
1. Ensure Firebase CLI is installed and logged in.
2. Deploy:
   ```powershell
   firebase deploy --only hosting
   ```
>>>>>>> 588269d (chore: initial commit with Firebase Hosting setup)
