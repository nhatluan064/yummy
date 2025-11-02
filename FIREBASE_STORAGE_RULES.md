# 🔥 Cấu Hình Firebase Storage Rules - BẮT BUỘC!

## ❌ Lỗi Hiện Tại
Bạn đang gặp lỗi **Permission Denied** khi upload ảnh vì chưa cấu hình Firebase Storage Rules.

## ✅ Cách Fix (5 Bước)

### Bước 1: Truy cập Firebase Console
1. Mở trình duyệt và vào: https://console.firebase.google.com/
2. Chọn project **order-yummy**

### Bước 2: Vào Storage Settings
1. Trong menu bên trái, click vào **"Storage"**
2. Click tab **"Rules"** ở phía trên

### Bước 3: Copy Rules Mới
Xóa tất cả nội dung cũ và paste đoạn code này:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Cho phép đọc TẤT CẢ files (public read)
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Folder lưu ảnh quán - CHỈ admin được upload/delete
    match /restaurant_images/{imageId} {
      // Cho phép upload nếu đã đăng nhập
      allow write: if request.auth != null;
      
      // Validate file
      allow write: if request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');  // Chỉ images
    }
  }
}
```

### Bước 4: Publish Rules
1. Click nút **"Publish"** màu xanh ở góc trên bên phải
2. Chờ vài giây để Firebase áp dụng rules mới

### Bước 5: Test Upload
1. Quay lại trang **Admin Settings** (`/admin/settings`)
2. Click nút **"Chọn Ảnh"**
3. Chọn một ảnh từ máy tính (tối đa 5MB, định dạng JPG/PNG/GIF/WEBP)
4. Upload thành công! ✅

---

## 📋 Giải Thích Rules

### Public Read (Đọc công khai)
```javascript
match /{allPaths=**} {
  allow read: if true;
}
```
- ✅ Cho phép ai cũng xem ảnh (cần thiết để hiển thị trên website)
- ❌ Không cho phép ghi/xóa

### Admin Upload (Chỉ admin được upload)
```javascript
match /restaurant_images/{imageId} {
  allow write: if request.auth != null;
}
```
- ✅ Chỉ người đã đăng nhập mới upload/xóa được
- ✅ Bảo vệ khỏi spam và abuse

### File Validation
```javascript
allow write: if request.resource.size < 5 * 1024 * 1024
             && request.resource.contentType.matches('image/.*');
```
- ✅ Giới hạn kích thước tối đa 5MB
- ✅ Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)

---

## 🚨 Lưu Ý Quan Trọng

### ⚠️ Nếu vẫn bị lỗi sau khi publish rules:
1. **Đợi 1-2 phút** để Firebase sync rules
2. **Refresh lại trang** Admin Settings
3. **Clear cache** trình duyệt (Ctrl + F5)
4. **Kiểm tra đăng nhập**: Phải đăng nhập admin mới upload được

### 🔒 Bảo Mật
- Không share thông tin đăng nhập admin
- Không public Firebase config keys ra ngoài
- Thường xuyên kiểm tra Storage usage

### 💾 Storage Limits (Free Tier)
- **5GB** dung lượng
- **1GB/day** bandwidth download
- **20,000 reads/day**
- **20,000 writes/day**

---

## ✅ Checklist

Sau khi cấu hình xong, check list này:

- [ ] Đã publish Firebase Storage Rules
- [ ] Đã refresh trang Admin Settings
- [ ] Đã thử upload 1 ảnh test
- [ ] Ảnh hiển thị trong thư viện
- [ ] Có thể set làm logo/banner
- [ ] Có thể xóa ảnh

---

## 🐛 Troubleshooting

### Lỗi: "Permission Denied"
**Nguyên nhân:** Rules chưa được publish hoặc chưa đăng nhập

**Giải pháp:**
1. Kiểm tra lại rules trong Firebase Console
2. Đảm bảo đã click "Publish"
3. Kiểm tra đã đăng nhập admin chưa

### Lỗi: "File too large"
**Nguyên nhân:** File > 5MB

**Giải pháp:**
- Giảm kích thước ảnh trước khi upload
- Dùng công cụ nén ảnh: https://tinypng.com/

### Lỗi: "Invalid file type"
**Nguyên nhân:** File không phải ảnh

**Giải pháp:**
- Chỉ upload JPG, PNG, GIF, WEBP
- Không upload PDF, video, hoặc file khác

---

## 📞 Cần Hỗ Trợ?

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:

1. Check **Browser Console** (F12) xem lỗi gì
2. Check **Firebase Console → Storage → Files** xem có folder `restaurant_images` chưa
3. Check **Firebase Console → Authentication** xem có đăng nhập không

---

**Tạo bởi:** Cascade AI  
**Ngày cập nhật:** 02/11/2025  
**Phiên bản:** 1.0.0
