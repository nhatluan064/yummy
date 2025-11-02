# 🔥 Hướng Dẫn Cấu Hình Firebase cho Quản Lý Ảnh

## Bước 1: Cấu Hình Firebase Storage Rules

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **order-yummy**
3. Vào **Storage** → **Rules**
4. Thay thế rules hiện tại bằng:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Cho phép đọc tất cả files công khai
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Chỉ cho phép admin upload/delete ảnh vào folder restaurant_images
    match /restaurant_images/{imageId} {
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

## Bước 2: Cấu Hình Firestore Rules

1. Vẫn ở Firebase Console, vào **Firestore Database** → **Rules**
2. Thay thế rules hiện tại bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection lưu metadata của ảnh
    match /uploaded_images/{imageId} {
      // Cho phép đọc công khai
      allow read: if true;
      
      // Chỉ admin được tạo và xóa
      allow create, delete: if request.auth != null;
      
      // Không cho phép update metadata
      allow update: if false;
    }
    
    // Document lưu cài đặt nhà hàng (logo, banner)
    match /settings/restaurant {
      // Cho phép đọc công khai
      allow read: if true;
      
      // Chỉ admin được cập nhật
      allow write: if request.auth != null;
    }
    
    // Các collections khác (nếu có)
    // ... thêm rules cho menu_categories, menu_items, etc.
  }
}
```

3. Click **Publish**

## Bước 3: Tạo Collections (Tự động)

Collections sẽ được tạo tự động khi bạn upload ảnh đầu tiên:
- `uploaded_images` - Lưu metadata của ảnh
- `settings` - Lưu cài đặt website

**Không cần tạo thủ công!**

## Bước 4: Test Hệ Thống

1. Đăng nhập vào Admin Panel
2. Vào **Chức năng nâng cao** → **Cài đặt & Quản lý Ảnh**
3. Upload một ảnh test
4. Kiểm tra:
   - ✅ Ảnh hiển thị trong thư viện
   - ✅ Có thể xem chi tiết ảnh
   - ✅ Có thể copy URL
   - ✅ Có thể đặt làm logo/banner
   - ✅ Có thể xóa ảnh

## Troubleshooting

### Lỗi: Permission Denied khi Upload

**Nguyên nhân:** Storage Rules chưa được cấu hình đúng

**Giải pháp:** 
- Kiểm tra lại Storage Rules
- Đảm bảo đã đăng nhập Admin
- Check console log để xem lỗi chi tiết

### Lỗi: Cannot read properties of undefined

**Nguyên nhân:** Firestore Rules chặn quyền đọc

**Giải pháp:**
- Kiểm tra lại Firestore Rules
- Đảm bảo `allow read: if true;` cho collections cần thiết

### Ảnh không hiển thị sau khi upload

**Nguyên nhân:** CORS hoặc Storage Rules

**Giải pháp:**
1. Kiểm tra Storage Rules cho phép public read
2. Kiểm tra URL ảnh có hợp lệ không
3. Refresh lại trang

### Collections không tồn tại

**Đây là bình thường!** Collections sẽ tự động được tạo khi:
- Upload ảnh đầu tiên → tạo `uploaded_images`
- Đặt logo/banner lần đầu → tạo `settings/restaurant`

## Security Best Practices

✅ **Đã áp dụng:**
- Chỉ admin được upload/delete ảnh
- Public read cho ảnh (cần thiết để hiển thị trên website)
- Validate file size (max 5MB)
- Validate file type (JPG, PNG, GIF, WEBP)

⚠️ **Lưu ý:**
- Không share thông tin đăng nhập admin
- Thường xuyên kiểm tra Storage usage
- Xóa ảnh không còn sử dụng để tiết kiệm dung lượng

## Monitoring

Kiểm tra sử dụng tài nguyên tại:
- Storage: Firebase Console → Storage → Usage
- Firestore: Firebase Console → Firestore Database → Usage

**Free Tier Limits:**
- Storage: 5GB
- Firestore Reads: 50,000/day
- Firestore Writes: 20,000/day

---

**Nếu gặp vấn đề, check console log và Firebase Console để debug!**
