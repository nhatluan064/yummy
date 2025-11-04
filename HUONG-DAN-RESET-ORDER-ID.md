# 🔄 Hướng dẫn Reset Order ID

## Mục đích

Script này sẽ **đánh số lại tất cả #ID đơn hàng** trong database từ 001 → n theo thứ tự thời gian, loại bỏ các số bị trống.

## Trước và Sau

### ❌ Trước (ID rải rác):
```
#DONHANG-ORDER-006
#DONHANG-ORDER-007
#DONHANG-ORDER-008
#DONHANG-ORDER-009
#DONHANG-ORDER-010
#DONHANG-ORDER-011
#DONHANG-ORDER-012
#DONHANG-ORDER-013
#DONHANG-ORDER-014
#DONHANG-ORDER-015
#DONHANG-ORDER-016
#DONHANG-ORDER-017
#DONHANG-ORDER-018
#DONHANG-ORDER-019
#DONHANG-ORDER-030  ← Nhảy số!
```

### ✅ Sau (ID liên tục):
```
#DONHANG-ODER-TAIBAN-001  ← Đổi prefix + đánh lại
#DONHANG-ODER-TAIBAN-002
#DONHANG-ODER-TAIBAN-003
...
#DONHANG-ODER-TAIBAN-015
#DONHANG-ODER-MANGDI-001  ← Loại khác, bắt đầu từ 001
#DONHANG-ODER-MANGDI-002
```

## Cách chạy (4 bước đơn giản)

### 1️⃣ Mở PowerShell/Terminal

```powershell
cd c:\yummy\scripts
```

### 2️⃣ Cài đặt (chỉ làm 1 lần đầu)

```powershell
npm install
```

### 3️⃣ Test kết nối

```powershell
npm test
```

Phải thấy: ✅ Connection test successful

### 4️⃣ Chạy reset

```powershell
npm run reset-orders
```

## Kết quả mong đợi

```
🔄 Starting order code reset process...

📊 Found 25 orders total

📋 Processing dine-in orders (15 orders)...
  ✅ #DONHANG-ORDER-012 → #DONHANG-ODER-TAIBAN-001
  ✅ #DONHANG-ORDER-011 → #DONHANG-ODER-TAIBAN-002
  ...

📋 Processing takeaway orders (10 orders)...
  ✅ #DONHANG-ODER-MANGDI-007 → #DONHANG-ODER-MANGDI-001
  ...

✅ Reset complete! Updated 25 orders

🎉 All done! You can now continue creating new orders.
```

## Sau khi chạy xong

1. ✅ Vào Firebase Console → Firestore → orders
2. ✅ Kiểm tra orderCode đã đổi chưa
3. ✅ Tạo thử 1 đơn mới → Phải tiếp tục từ số cuối cùng + 1
4. ✅ Từ giờ các đơn mới sẽ tự động tăng dần 001, 002, 003...

## ⚠️ Lưu ý quan trọng

- Script này **thay đổi dữ liệu thực** trong Firebase
- Nên chạy vào **giờ ít người dùng** (đêm khuya)
- **Backup database** trước khi chạy (Firebase Console → Export)
- Sau khi reset, các đơn mới sẽ tiếp tục từ n+1

## Khắc phục lỗi

### Lỗi: Cannot find module

```powershell
cd scripts
npm install
```

### Lỗi: Connection failed

- Kiểm tra internet
- Kiểm tra Firebase config trong `src/lib/firebase.ts`

### Lỗi khác

Xem file `scripts/README.md` để biết thêm chi tiết.

---

📁 Chi tiết kỹ thuật: Xem `scripts/README.md`
