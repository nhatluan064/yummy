// ==========================================
// SCRIPT EXPORT LOCALSTORAGE
// ==========================================
// Copy toàn bộ script này và paste vào Console (F12)
// tại trang localhost:3000

console.log("🚀 Bắt đầu export dữ liệu...");

const exportData = {
  menuItems: localStorage.getItem("menuItems"),
  menuCategories: localStorage.getItem("menuCategories"),
  customerReviews: localStorage.getItem("customerReviews"),
  exportDate: new Date().toISOString(),
};

// Hiển thị trong console để copy
console.log("📋 Copy dữ liệu bên dưới:");
console.log(JSON.stringify(exportData, null, 2));

// Tự động download file
const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: "application/json",
});
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `localStorage-backup-${
  new Date().toISOString().split("T")[0]
}.json`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);

console.log("✅ Đã export và download file backup!");
