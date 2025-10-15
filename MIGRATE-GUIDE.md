# 🔄 Hướng Dẫn Migrate Dữ Liệu Giữa Các Port

## 🔴 Vấn đề: Mất dữ liệu khi chuyển Port

Khi Next.js chuyển từ port 3000 → 3001 (hoặc port khác), **dữ liệu localStorage không tự động chuyển theo** vì:

- `localhost:3000` có localStorage riêng
- `localhost:3001` có localStorage riêng
- Trình duyệt coi chúng như 2 domain khác nhau

## ✅ Giải Pháp

### **Phương án 1: Sử dụng Trang Migrate (Khuyến nghị)**

#### Bước 1: Export dữ liệu từ Port CŨ

1. Truy cập: `http://localhost:3000/admin/migrate` (hoặc port cũ)
2. Click **"📥 Export Dữ Liệu LocalStorage"**
3. Click **"📋 Copy"** để copy JSON

#### Bước 2: Import vào Port MỚI

1. Truy cập: `http://localhost:3001/admin/migrate` (port mới)
2. Paste JSON vào ô textarea
3. Click **"⬆️ Import Dữ Liệu"**
4. Đợi redirect → Xong!

---

### **Phương án 2: Sử dụng Developer Console**

#### Tại Port CŨ (3000):

1. Mở trang bất kỳ: `http://localhost:3000`
2. Nhấn `F12` → Chọn tab **Console**
3. Copy script từ file: `public/export-script.js`
4. Paste vào Console và Enter
5. File JSON sẽ tự động download

#### Tại Port MỚI (3001):

1. Mở trang: `http://localhost:3001`
2. Nhấn `F12` → Chọn tab **Console**
3. Copy script từ file: `public/import-script.js`
4. **Chỉnh sửa** dòng `const exportData = {...}` → Paste JSON đã export
5. Enter để chạy script
6. Reload trang (`Ctrl + R`)

---

### **Phương án 3: Sử dụng Data Management**

1. Truy cập: `http://localhost:3001/admin/data-management`
2. Chọn **"📥 Import dữ liệu"**
3. Upload file JSON hoặc paste dữ liệu
4. Click **"⬆️ Import dữ liệu"**

---

## 🛡️ Phòng Tránh Mất Dữ Liệu

### 1. **Backup Định Kỳ**

- Vào `/admin/data-management`
- Click **"📤 Export Dữ Liệu"**
- Lưu file JSON vào máy

### 2. **Sử dụng Port Cố Định**

Thêm vào `package.json`:

```json
"scripts": {
  "dev": "next dev -p 3001",
  "start": "next start -p 3001"
}
```

### 3. **Tắt Port Cũ Trước Khi Chạy Port Mới**

```bash
# Windows: Tìm và kill process trên port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Sau đó chạy dev
npm run dev
```

---

## 📝 Các File Script Hỗ Trợ

- **Export Script**: `public/export-script.js`
- **Import Script**: `public/import-script.js`

---

## 🚀 Demo Scripts

### Export (Copy vào Console tại port cũ):

```javascript
const data = {
  menuItems: localStorage.getItem("menuItems"),
  menuCategories: localStorage.getItem("menuCategories"),
  customerReviews: localStorage.getItem("customerReviews"),
};
console.log(JSON.stringify(data, null, 2));
```

### Import (Copy vào Console tại port mới):

```javascript
const data = {
  /* PASTE JSON HERE */
};
localStorage.setItem("menuItems", data.menuItems);
localStorage.setItem("menuCategories", data.menuCategories);
localStorage.setItem("customerReviews", data.customerReviews);
location.reload();
```

---

## ❓ FAQ

**Q: Tại sao không lưu vào Database?**  
A: Đây là demo project dùng localStorage. Để production, nên dùng Firebase/MongoDB.

**Q: Có thể tự động sync giữa các port không?**  
A: Không, vì localStorage bị giới hạn bởi Same-Origin Policy.

**Q: Dữ liệu có mất khi xóa cache không?**  
A: Có. Nên backup định kỳ.

---

## 🎯 Kết Luận

**Luôn backup dữ liệu trước khi:**

- Chuyển port
- Clear cache
- Đóng trình duyệt (nếu dùng Incognito)
- Update code liên quan localStorage

**Trang hỗ trợ:**

- `/admin/migrate` - Migrate giữa các port
- `/admin/data-management` - Export/Import/Reset dữ liệu
