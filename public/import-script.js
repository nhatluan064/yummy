// ==========================================
// SCRIPT IMPORT LOCALSTORAGE
// ==========================================
// Copy toàn bộ script này và paste vào Console (F12)
// tại trang localhost:3001

console.log("🚀 Sẵn sàng import dữ liệu...");
console.log("📋 Paste dữ liệu JSON vào biến exportData bên dưới:");

// PASTE DỮ LIỆU VÀO ĐÂY (thay thế object rỗng)
const exportData = {
  // Paste JSON data here
};

// Import vào localStorage
if (exportData.menuItems) {
  localStorage.setItem("menuItems", exportData.menuItems);
  console.log("✅ Đã import menuItems");
}

if (exportData.menuCategories) {
  localStorage.setItem("menuCategories", exportData.menuCategories);
  console.log("✅ Đã import menuCategories");
}

if (exportData.customerReviews) {
  localStorage.setItem("customerReviews", exportData.customerReviews);
  console.log("✅ Đã import customerReviews");
}

console.log("🎉 Import hoàn tất! Reload trang để xem dữ liệu.");
// window.location.reload();
