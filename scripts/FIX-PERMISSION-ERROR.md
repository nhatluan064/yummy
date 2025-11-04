# ❌ Fix Permission Error

Bạn gặp lỗi: **Missing or insufficient permissions**

## 🎯 Chọn 1 trong 2 cách dưới đây

---

## 🚀 Cách 1: Tạm thời mở Firestore Rules (NHANH NHẤT - 5 phút)

### ⚠️ CHỈ LÀM TRONG VÀI PHÚT để chạy script!

### Bước 1: Vào Firebase Console
```
https://console.firebase.google.com
```

### Bước 2: Chọn project **order-yummy**

### Bước 3: Vào **Firestore Database** → **Rules** (tab bên trái)

### Bước 4: Copy rules cũ ra (để restore sau)

### Bước 5: Thay rules thành:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ TẠM THỜI MỞ HẾT
    }
  }
}
```

### Bước 6: Click **Publish**

### Bước 7: Chạy lại script
```powershell
cd c:\yummy\scripts
npm run reset-orders
```

### Bước 8: ⚠️ QUAN TRỌNG - Đổi lại rules cũ NGAY!

Paste lại rules cũ và **Publish** lại để bảo mật.

---

## 🔐 Cách 2: Dùng Firebase Admin SDK (AN TOÀN HƠN)

### Bước 1: Lấy Service Account Key

1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project **order-yummy**
3. **⚙️ Project Settings** (góc trên bên trái)
4. Tab **Service Accounts**
5. Click **Generate new private key**
6. Download file JSON

### Bước 2: Đổi tên và di chuyển file

```powershell
# Đổi tên file download thành:
service-account-key.json

# Di chuyển vào thư mục scripts:
# Từ: C:\Users\YourName\Downloads\order-yummy-xxxxx.json
# Đến: C:\yummy\scripts\service-account-key.json
```

### Bước 3: Cài thêm firebase-admin

```powershell
cd c:\yummy\scripts
npm install
```

### Bước 4: Chạy script với Admin SDK

```powershell
npm run reset-orders-admin
```

---

## 🤔 Chọn cách nào?

| Tiêu chí | Cách 1: Mở Rules | Cách 2: Admin SDK |
|----------|------------------|-------------------|
| Tốc độ | ⚡ Nhanh (2 phút) | 🐢 Lâu hơn (5 phút) |
| An toàn | ⚠️ Cần đóng lại ngay | ✅ An toàn |
| Setup | 🟢 Dễ | 🟡 Hơi phức tạp |
| Khuyến nghị | Nếu gấp | Nếu có thời gian |

## 💡 Khuyến nghị

**Dùng Cách 1** nếu:
- Bạn đang vội
- Chỉ chạy 1 lần rồi thôi
- Nhớ **đóng lại rules ngay sau khi xong**

**Dùng Cách 2** nếu:
- Bạn muốn an toàn
- Sẽ chạy script nhiều lần
- Không sợ setup phức tạp

---

## ✅ Sau khi chạy xong

Kiểm tra Firebase Console → Firestore → orders → Xem orderCode đã đổi chưa

---

## 🆘 Vẫn lỗi?

Báo lại và gửi screenshot của:
1. Lỗi trong terminal
2. Firestore Rules trong Firebase Console
