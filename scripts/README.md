# Reset Order Codes Script

Script này sẽ đánh số lại tất cả orderCode (#ID) trong database theo thứ tự thời gian tạo đơn, loại bỏ các khoảng trống.

## Cách chạy

### Bước 1: Mở Terminal/PowerShell trong thư mục scripts

```bash
cd c:\yummy\scripts
```

### Bước 2: Cài đặt dependencies (chỉ cần làm 1 lần)

```bash
npm install
```

### Bước 3: Test kết nối Firebase (khuyến nghị)

```bash
npm test
```

Nếu thấy ✅ Connection test successful, tiếp tục bước 4.

### Bước 4: Chạy script reset orderCode

```bash
npm run reset-orders
```

hoặc:

```bash
npx tsx reset-order-codes.ts
```

### ⚠️ Quan trọng: Backup trước khi chạy!

Script này sẽ **thay đổi dữ liệu thực** trong Firebase. Nên:
1. Export database từ Firebase Console (Firestore → Export/Import)
2. Hoặc chạy vào giờ ít người dùng
3. Kiểm tra kỹ kết quả sau khi chạy

## Script sẽ làm gì?

1. ✅ Lấy tất cả orders từ Firebase
2. ✅ Sắp xếp theo thời gian tạo (cũ nhất → mới nhất)
3. ✅ Nhóm theo loại đơn (dine-in, takeaway, delivery)
4. ✅ Đánh số lại từ 001, 002, 003... cho mỗi loại
5. ✅ Cập nhật lại vào Firebase
6. ✅ Hiển thị log chi tiết

## Ví dụ output

```
🔄 Starting order code reset process...

📊 Found 25 orders total

📋 Processing dine-in orders (15 orders)...
  ✅ #DONHANG-ORDER-012 → #DONHANG-ODER-TAIBAN-001
  ✅ #DONHANG-ORDER-011 → #DONHANG-ODER-TAIBAN-002
  ✅ #DONHANG-ORDER-010 → #DONHANG-ODER-TAIBAN-003
  ...

📋 Processing takeaway orders (10 orders)...
  ✅ #DONHANG-ODER-MANGDI-007 → #DONHANG-ODER-MANGDI-001
  ✅ #DONHANG-ORDER-030 → #DONHANG-ODER-MANGDI-002
  ...

✅ Reset complete! Updated 25 orders

Summary:
  - Dine-in orders: 15
  - Takeaway orders: 10
  - Delivery orders: 0

🎉 All done! You can now continue creating new orders.
```

## Lưu ý

- ⚠️ Script này sẽ thay đổi dữ liệu trong Firebase
- ⚠️ Nên backup database trước khi chạy
- ⚠️ Chạy trong giờ ít người dùng để tránh conflict
- ✅ Sau khi chạy, các đơn mới sẽ tự động tiếp tục đánh số từ n+1

## Kiểm tra sau khi chạy

1. Vào Firebase Console
2. Mở collection "orders"
3. Kiểm tra orderCode đã được đánh số lại chưa
4. Tạo thử 1 đơn mới xem có tiếp tục đánh số đúng không
