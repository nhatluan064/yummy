# 🚀 YUMMY Development Guide

## 📁 File Structure (Sau khi đổi tên)

```
📦 yummy/
├── 🎯 index.html                    ← CHẠY FILE NÀY với Live Server
├── 🏠 landing-home.html             ← Trang chủ (first visit)
├── 📂 customer/
│   ├── ✅ order-booking.html        ← Trang order chính (active)
│   └── 🗂️ customer-legacy.html     ← Cũ (không dùng)
├── 📂 menu/
│   ├── ✅ public-menu.html          ← Menu page chính (active)  
│   └── 🗂️ menu-legacy.html         ← Cũ (không dùng)
├── 📂 kitchen/
│   ├── ✅ kitchen-display.html      ← Kitchen page chính (active)
│   └── 🗂️ kitchen-legacy.html      ← Cũ (không dùng)
├── 📂 admin/
│   └── ✅ admin-panel.html          ← Admin dashboard
└── 📂 js/, css/, etc.
```

## 🎮 Chạy Development Server

### Option 1: Live Server (Khuyến nghị)
1. Cài **Live Server extension** trong VS Code
2. **Click chuột phải vào `index.html` (file ROOT)**
3. Chọn **"Open with Live Server"**
4. Tự động mở: `http://127.0.0.1:5500/`

### Option 2: Manual URLs (Live Server)
- 🏠 Landing: `http://127.0.0.1:5500/landing-home.html`
- 🛒 Order: `http://127.0.0.1:5500/customer/order-booking.html`
- 📋 Menu: `http://127.0.0.1:5500/menu/public-menu.html`
- 👨‍🍳 Kitchen: `http://127.0.0.1:5500/kitchen/kitchen-display.html`
- ⚙️ Admin: `http://127.0.0.1:5500/admin/admin-panel.html`

## 🔄 Development Workflow

1. **Edit code** → Save (Ctrl+S)
2. **Live Server auto-reload** → Test ngay
3. **Khi OK** → `firebase deploy` lên production

## ⚠️ Lưu ý quan trọng

- **File để RUN**: `index.html` (ROOT) - đây là router chính
- **Các file legacy**: `*-legacy.html` - không dùng nữa, có thể xóa sau
- **Firebase rewrites**: Chỉ hoạt động trên hosting, không trên Live Server
- **Local vs Production**: URLs khác nhau nhưng chức năng giống nhau

## 🎯 Files chính đang dùng

| Page | Production URL | Local URL |
|------|---------------|-----------|
| Home | `/` → `landing-home.html` | `http://127.0.0.1:5500/` |
| Order | `/customer` → `order-booking.html` | `http://127.0.0.1:5500/customer/order-booking.html` |
| Menu | `/menu` → `public-menu.html` | `http://127.0.0.1:5500/menu/public-menu.html` |
| Kitchen | `/kitchen` → `kitchen-display.html` | `http://127.0.0.1:5500/kitchen/kitchen-display.html` |
| Admin | `/admin` → `admin-panel.html` | `http://127.0.0.1:5500/admin/admin-panel.html` |

---
💡 **Tip**: Bookmark `index.html` trong VS Code Explorer để dễ dàng click "Open with Live Server"!