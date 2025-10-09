# 🍜 Yummy Restaurant - Firebase Setup Guide

## 📋 Tổng quan

Dự án Yummy Restaurant với Firebase integration hoàn chỉnh bao gồm:

- **Authentication**: Đăng nhập admin/customer
- **Firestore Database**: Menu, Tables, Orders management
- **Firebase Hosting**: Deploy website lên production

## 🚀 Cài đặt và Setup

### 1. Firebase Configuration

```javascript
// File: js/firebase-service.js
const firebaseConfig = {
  apiKey: "AIzaSyCbUNjBPEaZOTr_CNOcCJDBXUUdrP_GoE",
  authDomain: "order-yummy.firebaseapp.com",
  projectId: "order-yummy",
  storageBucket: "order-yummy.firebasestorage.app",
  messagingSenderId: "142798848175",
  appId: "1:142798848175:web:1091d297f8d4312c1f6e489a",
  measurementId: "G-GQ7MEPZSSJ",
};
```

### 2. Setup Admin User Đầu Tiên

```javascript
// Mở Browser Console tại http://localhost:8000/admin/dashboard.html
// Chạy lệnh sau để tạo admin và dữ liệu mẫu:
setupYummyRestaurant("admin@yummy.com", "password123");
```

### 3. Firestore Security Rules

```javascript
// File: firestore.rules (đoạn quan trọng rút gọn)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bootstrap admin: user được phép tự tạo doc admin của chính mình 1 lần
    match /admins/{adminId} {
      allow create: if request.auth != null && request.auth.uid == adminId; // first-time
      allow read, update, delete: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /menuItems/{itemId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    // ... other rules
  }
}
```

#### Vì sao cần bootstrap rule?

Nếu không cho phép `create` ở `/admins/{uid}` user đầu tiên không thể tự nâng quyền vì rule cũ yêu cầu doc admin đã tồn tại. Quy tắc mới cho phép tạo đúng 1 document của chính họ; các thao tác khác vẫn yêu cầu đã là admin.

### 4. Simple Auth Page (debug)

Trang `admin/simple.html` được thêm để kiểm tra nhanh:

- Chuyển mode Đăng ký/Đăng nhập.
- Nếu gặp `auth/email-already-in-use` sẽ tự động chuyển sang chế độ Đăng nhập.
- Khi đăng ký admin: truyền `{ role: 'admin' }` và service sẽ tạo `users/{uid}` + `admins/{uid}`.

Sau khi xác nhận hoạt động ổn, bạn có thể quay lại `dashboard.html` hoặc xoá trang này trong production.

## 🔧 Development Commands

### Local Development

```bash
# Start local server
python -m http.server 8000

# Access admin dashboard
http://localhost:8000/admin/dashboard.html

# Access customer interface
http://localhost:8000
```

### Firebase Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (đã có firebase.json)
firebase init

# Deploy to Firebase Hosting
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting
```

## 📱 Tính năng đã hoàn thành

### ✅ Admin Dashboard

- **Authentication**: Email/Password login
- **Menu Management**: CRUD operations cho menu items
- **Table Management**: Quản lý bàn ăn với status tracking
- **Order Management**: Xem và cập nhật trạng thái đơn hàng
- **Real-time Updates**: Auto-refresh khi data thay đổi

### ✅ Firebase Integration

- **Firestore Database**: Collections cho menu, tables, orders, users
- **Authentication**: User management với role-based access
- **Security Rules**: Bảo mật theo role (admin vs customer)
- **Real-time Listeners**: Cập nhật data real-time

### ✅ UI/UX

- **Responsive Design**: Mobile-friendly interface
- **Modern CSS**: Cards, modals, animations
- **Loading States**: Spinner và empty states
- **Notifications**: Success/error messages

## 🔄 Workflow Hoàn chỉnh

### Admin Workflow:

1. **Login** → `admin@yummy.com` / `password123`
2. **Manage Menu** → Add/Edit/Delete món ăn
3. **Manage Tables** → Tạo bàn và cập nhật status
4. **Process Orders** → Xem đơn hàng và update status

### Customer Workflow (Sắp triển khai):

1. **Browse Menu** → Xem menu từ Firestore
2. **Select Table** → Chọn bàn available
3. **Place Order** → Đặt món và thanh toán
4. **Track Order** → Theo dõi trạng thái đơn hàng

## 📂 Cấu trúc Files

```
yummy/
├── admin/
│   └── dashboard.html          # Admin interface
├── css/
│   ├── styles.css              # Base styles
│   └── admin.css               # Admin-specific styles
├── js/
│   ├── firebase-service.js     # Firebase service module
│   ├── admin.js                # Admin controller
│   └── admin-setup.js          # Setup scripts
├── firebase.json               # Firebase hosting config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Database indexes
└── index.html                  # Customer interface
```

## 🌐 Production URLs

- **Main Site**: https://order-yummy.web.app
- **Admin Dashboard**: https://order-yummy.web.app/admin
- **Custom Domain**: https://order-yummy.firebaseapp.com

## 🔜 Next Steps

1. **Customer Interface**: Update `index.html` với Firebase integration
2. **Kitchen Display**: Real-time orders cho bếp
3. **Payment Integration**: Tích hợp thanh toán online
4. **Mobile App**: React Native hoặc Flutter app
5. **Analytics**: Firebase Analytics và reporting

## 🆘 Troubleshooting

### Authentication Issues

```javascript
// Check if user is logged in
firebase.auth().onAuthStateChanged((user) => {
  console.log("User:", user);
});
```

### Firestore Permission Issues

```javascript
// Check admin status
const isAdmin = await firebaseService.isAdmin(user.uid);
console.log("Is Admin:", isAdmin);
```

### Database Connection

```javascript
// Test Firestore connection
const menuItems = await firebaseService.getMenuItems();
console.log("Menu Items:", menuItems);
```

---

🎉 **Yummy Restaurant Firebase setup hoàn tất!** 🎉
