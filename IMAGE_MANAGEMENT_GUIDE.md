# 📸 Hướng Dẫn Quản Lý Ảnh

## Tổng Quan
Hệ thống quản lý ảnh cho phép bạn upload và quản lý tất cả hình ảnh cho website nhà hàng, bao gồm logo, banner và các hình ảnh khác mà không cần phải lấy từ nguồn bên ngoài.

## Tính Năng

### 1. Upload Ảnh
- ✅ Upload ảnh lên Firebase Storage
- ✅ Hỗ trợ các định dạng: JPG, PNG, GIF, WEBP
- ✅ Giới hạn kích thước: 5MB
- ✅ Tự động lưu metadata vào Firestore

### 2. Quản Lý Ảnh
- ✅ Xem tất cả ảnh đã upload trong thư viện
- ✅ Xem chi tiết ảnh (kích thước, loại, ngày upload)
- ✅ Sao chép URL để sử dụng
- ✅ Xóa ảnh không cần thiết

### 3. Cài Đặt Website
- ✅ Đặt ảnh làm Logo quán
- ✅ Đặt ảnh làm Banner quán
- ✅ Xem trước các hình ảnh hiện tại

## Cách Sử Dụng

### Bước 1: Truy Cập Trang Cài Đặt
1. Đăng nhập vào Admin Panel
2. Mở menu **"Chức năng nâng cao"**
3. Click vào **"Cài đặt & Quản lý Ảnh"**

### Bước 2: Upload Ảnh Mới
1. Trong phần **"Upload Ảnh Mới"**, click nút **"Chọn Ảnh"**
2. Chọn file ảnh từ máy tính (tối đa 5MB)
3. Ảnh sẽ tự động được upload và hiển thị trong thư viện

### Bước 3: Sử Dụng Ảnh
#### Đặt làm Logo/Banner:
1. Click vào ảnh trong thư viện để xem chi tiết
2. Click nút **"Đặt làm Logo"** hoặc **"Đặt làm Banner"**
3. Ảnh sẽ được cập nhật ngay lập tức

#### Copy URL để sử dụng:
1. Click vào ảnh trong thư viện
2. Click nút **"Copy"** bên cạnh URL
3. Paste URL vào bất kỳ đâu bạn cần (menu items, banner sections, etc.)

### Bước 4: Xóa Ảnh
1. Click vào ảnh cần xóa
2. Click nút **"Xóa Ảnh"** (màu đỏ)
3. Xác nhận để hoàn tất

## Cấu Trúc Database

### Firebase Storage
```
restaurant_images/
├── 1730512345_image1.jpg
├── 1730512456_image2.png
└── ...
```

### Firestore Collection
```
uploaded_images/
├── {imageId}
│   ├── name: "image1.jpg"
│   ├── url: "https://firebasestorage..."
│   ├── path: "restaurant_images/1730512345_image1.jpg"
│   ├── size: 245678
│   ├── type: "image/jpeg"
│   ├── uploadedAt: Timestamp
│   └── uploadedBy: "admin@example.com"
```

### Settings Document
```
settings/restaurant
├── logo: "https://firebasestorage..."
├── banner: "https://firebasestorage..."
└── updatedAt: Timestamp
```

## API Services

### imageStorageService
```typescript
// Upload ảnh
await imageStorageService.uploadImage(file, userEmail);

// Lấy tất cả ảnh
const images = await imageStorageService.getAllImages();

// Xóa ảnh
await imageStorageService.deleteImage(imageId, imagePath);

// Validate ảnh
const validation = imageStorageService.validateImage(file);

// Format file size
const size = imageStorageService.formatFileSize(bytes);
```

### settingsService
```typescript
// Lấy cài đặt
const settings = await settingsService.getSettings();

// Cập nhật logo
await settingsService.updateLogo(imageUrl);

// Cập nhật banner
await settingsService.updateBanner(imageUrl);

// Cập nhật nhiều settings cùng lúc
await settingsService.updateSettings({
  logo: url1,
  banner: url2,
  name: "Tên quán"
});
```

## Lưu Ý Quan Trọng

### Bảo Mật
- ⚠️ Chỉ admin có quyền truy cập trang này
- ⚠️ Cần đăng nhập Firebase Authentication
- ⚠️ Storage rules cần được cấu hình đúng

### Storage Rules (Firebase Console)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /restaurant_images/{imageId} {
      // Cho phép đọc công khai
      allow read: if true;
      
      // Chỉ admin được upload/xóa
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /uploaded_images/{imageId} {
      // Cho phép đọc công khai
      allow read: if true;
      
      // Chỉ admin được tạo/xóa
      allow create, delete: if request.auth != null;
    }
    
    match /settings/restaurant {
      // Cho phép đọc công khai
      allow read: if true;
      
      // Chỉ admin được cập nhật
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Lỗi Upload Thất Bại
- Kiểm tra kích thước file (max 5MB)
- Kiểm tra định dạng file (JPG, PNG, GIF, WEBP)
- Kiểm tra kết nối internet
- Kiểm tra Firebase Storage rules

### Ảnh Không Hiển Thị
- Kiểm tra URL có hợp lệ không
- Kiểm tra Storage rules cho phép public read
- Thử refresh lại trang

### Không Thể Xóa Ảnh
- Kiểm tra quyền admin
- Kiểm tra ảnh có tồn tại trong Storage không
- Kiểm tra Firestore rules

## Mở Rộng Trong Tương Lai

- [ ] Tối ưu và resize ảnh tự động
- [ ] Thêm image editor (crop, rotate)
- [ ] Tổ chức ảnh theo folders/categories
- [ ] Bulk upload nhiều ảnh cùng lúc
- [ ] Search và filter ảnh
- [ ] Thêm watermark tự động

---

**Cập nhật lần cuối:** 02/11/2025  
**Phiên bản:** 1.0.0
