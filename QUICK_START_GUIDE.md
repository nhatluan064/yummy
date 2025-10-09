# 🚀 Hướng dẫn Khởi động Nhanh - YUMMY Restaurant

> **Ngày tạo:** 09/10/2025  
> **Mục đích:** Hướng dẫn Admin thêm dữ liệu ban đầu vào hệ thống

---

## 📋 Thứ tự Thao tác Ban đầu

### ✅ BƯỚC 1: Tạo Danh mục trước (BẮT BUỘC)

**Tại sao phải làm trước?**
- Mỗi món ăn cần thuộc 1 danh mục
- Không có danh mục → Không thể tạo món ăn

**Cách làm:**

1. Đăng nhập Admin tại: http://127.0.0.1:5500/admin/admin-panel.html
   
2. Vào mục **"Quản lý Menu"** (sidebar bên trái)

3. **Click vào tab "Danh mục"** (góc trên bên phải, cạnh tab "Món ăn")
   ```
   [Món ăn] [Danh mục] ← Click vào đây
   ```

4. Nút **"Thêm danh mục"** sẽ xuất hiện → Click vào

5. Điền thông tin:
   - **Tên danh mục:** VD: "Món chính", "Khai vị", "Tráng miệng", "Đồ uống"
   - **Mô tả:** (Tùy chọn) VD: "Các món ăn chính của nhà hàng"
   - **Thứ tự hiển thị:** VD: 1, 2, 3... (số càng nhỏ hiển thị càng trước)
   - **Icon:** (Tùy chọn) Font Awesome class, VD: `fa-solid fa-bowl-food`

6. Click **"Lưu"**

**💡 Gợi ý danh mục phổ biến:**
```
📌 Món chính (Main Dishes) - Thứ tự: 1
🥗 Khai vị (Appetizers) - Thứ tự: 2
🍰 Tráng miệng (Desserts) - Thứ tự: 3
🍹 Đồ uống (Beverages) - Thứ tự: 4
🍜 Món phụ (Side Dishes) - Thứ tự: 5
```

---

### ✅ BƯỚC 2: Thêm Món ăn

**Sau khi đã có ít nhất 1 danh mục:**

1. Quay lại tab **"Món ăn"**

2. Click nút **"Thêm món mới"**

3. Điền thông tin:
   - **Tên món:** VD: "Phở bò Hà Nội"
   - **Mô tả:** VD: "Phở bò truyền thống với nước dùng hầm xương 24 tiếng"
   - **Giá:** VD: 45000
   - **Danh mục:** Chọn từ dropdown (các danh mục đã tạo ở Bước 1)
   - **Hình ảnh:** Link URL hoặc upload
   - **Trạng thái:** Còn món / Hết món

4. Click **"Lưu"**

---

### ✅ BƯỚC 3: Kiểm tra Trang Khách hàng

**Sau khi đã thêm ít nhất 1 món ăn:**

Mở các trang sau để kiểm tra:

1. **Trang đặt món tại bàn:**
   - http://127.0.0.1:5500/customer/order-booking.html
   - Các món ăn đã hiển thị chưa?
   - Có thêm được vào giỏ hàng không?

2. **Trang đặt giao hàng:**
   - http://127.0.0.1:5500/customer/delivery.html
   - Menu có load ra không?
   - Danh mục có hiển thị đúng thứ tự không?

3. **Trang menu công khai:**
   - http://127.0.0.1:5500/menu/public-menu.html

---

## ⚠️ Lưu ý Quan trọng

### ❌ Lỗi thường gặp:

**1. "Không thấy nút Thêm danh mục"**
- ✅ Phải click vào **tab "Danh mục"** mới thấy nút

**2. "Dropdown Danh mục khi thêm món bị trống"**
- ✅ Phải tạo ít nhất 1 danh mục trước

**3. "Trang khách hàng vẫn loading hoài"**
- ✅ Kiểm tra Console (F12) xem có lỗi Firebase không
- ✅ Đảm bảo đã thêm ít nhất 1 món ăn vào database

**4. "Firebase Permission Denied"**
- ✅ Kiểm tra file `firestore.rules` đã deploy chưa
- ✅ Chạy: `firebase deploy --only firestore:rules`

---

## 📊 Cấu trúc Dữ liệu Firebase

### Collection: `categories`
```javascript
{
  id: "auto-generated",
  name: "Món chính",
  description: "Các món ăn chính",
  displayOrder: 1,
  icon: "fa-solid fa-bowl-food",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `menuItems`
```javascript
{
  id: "auto-generated",
  name: "Phở bò",
  description: "Phở bò Hà Nội",
  price: 45000,
  categoryId: "categories/{id}",
  imageUrl: "https://...",
  available: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔗 Links Hữu ích

- **Firebase Console:** https://console.firebase.google.com/project/order-yummy
- **Live Site:** https://order-yummy.web.app
- **GitHub Repo:** https://github.com/nhatluan064/yummy

---

## 📞 Troubleshooting

Nếu gặp vấn đề:
1. Mở DevTools Console (F12)
2. Xem lỗi đỏ
3. Check file `firestore.rules` có cho phép read/write không
4. Kiểm tra Firebase Authentication đã đăng nhập Admin chưa

---

**Chúc bạn setup thành công! 🎉**
