<<<<<<< HEAD
# YUMMY - Hệ thống Order Nhà hàng

Hệ thống quản lý nhà hàng hiện đại với chức năng order tại bàn và giao hàng, được tối ưu hóa cho cả khách hàng và admin.

## 🚀 Tính năng chính

### Cho khách hàng:
- **Order tại bàn**: Chọn bàn và order trực tiếp
- **Order giao hàng**: Đặt món và giao hàng tận nơi
- **Đặt bàn trước**: Đặt chỗ ngồi theo thời gian
- **Giỏ hàng thông minh**: Quản lý món ăn và tính toán tự động
- **Tính phí ship**: Tự động tính phí giao hàng theo khu vực

### Cho admin:
- **Dashboard tổng quan**: Thống kê doanh thu, đơn hàng, khách hàng
- **Quản lý đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng
- **Quản lý bàn**: Theo dõi trạng thái tất cả bàn trong nhà hàng
- **Quản lý chi tiêu**: Ghi nhận chi phí và tính toán lợi nhuận
- **Báo cáo**: Xuất báo cáo hàng ngày/tháng

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
- Giỏ hàng khách hàng
- Đơn hàng và đặt bàn
- Chi tiêu và doanh thu
- Cài đặt người dùng

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework CSS**: Custom CSS với CSS Variables
- **Icons**: Font Awesome 6.4.2
- **Fonts**: Be Vietnam Pro
- **Hosting**: Firebase Hosting
- **Analytics**: Firebase Analytics

## 🎨 Thiết kế

- **Responsive**: Tối ưu cho mobile, tablet và desktop
- **Modern UI**: Giao diện hiện đại với màu sắc nhã nhặn
- **UX tối ưu**: Phân chia rõ ràng cho từng loại người dùng
- **Performance**: Load nhanh với CSS/JS được tối ưu

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

- Touch-friendly interface
- Swipe gestures
- Responsive menu layout
- Optimized for small screens
- Fast loading on mobile networks

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

- Firebase Analytics integration
- Order tracking
- Revenue monitoring
- Customer behavior analysis

## 🔒 Bảo mật

- Input validation
- XSS protection
- Safe data handling
- Firebase security rules

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 📞 Liên hệ

- Email: contact@yummy.vn
- Phone: 0123 456 789
- Website: https://order-yummy.web.app

---

**YUMMY Restaurant Management System** - Được phát triển với ❤️ bởi nhóm phát triển YUMMY
Mỳ cay Yummy - Oder Table, Shipping
=======
# Yummy Restaurant Website

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
