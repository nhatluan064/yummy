"use client";

import { useState } from "react";

export default function MigratePage() {
  const [exportedData, setExportedData] = useState("");
  const [message, setMessage] = useState("");

  // Export dữ liệu từ localStorage hiện tại
  const handleExport = () => {
    const data = {
      menuItems: localStorage.getItem("menuItems"),
      menuCategories: localStorage.getItem("menuCategories"),
      customerReviews: localStorage.getItem("customerReviews"),
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    setExportedData(jsonString);
    setMessage("✅ Đã export dữ liệu! Copy text bên dưới.");
  };

  // Import dữ liệu vào localStorage hiện tại
  const handleImport = () => {
    try {
      const data = JSON.parse(exportedData);

      if (data.menuItems) {
        localStorage.setItem("menuItems", data.menuItems);
      }
      if (data.menuCategories) {
        localStorage.setItem("menuCategories", data.menuCategories);
      }
      if (data.customerReviews) {
        localStorage.setItem("customerReviews", data.customerReviews);
      }

      setMessage("✅ Import thành công! Đang reload trang...");
      setTimeout(() => {
        window.location.href = "/admin/menu";
      }, 1500);
    } catch {
      setMessage("❌ Lỗi: Dữ liệu JSON không hợp lệ!");
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportedData);
    setMessage("✅ Đã copy vào clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔄 Di Chuyển Dữ Liệu Giữa Các Port
          </h1>
          <p className="text-gray-600">
            Export dữ liệu từ port này và import vào port khác (VD: 3000 → 3001)
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded mb-6">
          <h3 className="font-bold text-yellow-800 mb-3">
            📋 Hướng dẫn di chuyển dữ liệu:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>
              <strong>Tại port CŨ (có dữ liệu):</strong> Mở trang này và click
              &quot;Export Dữ Liệu&quot;
            </li>
            <li>
              <strong>Copy text JSON</strong> từ ô bên dưới (hoặc click
              &quot;Copy&quot;)
            </li>
            <li>
              <strong>Tại port MỚI:</strong> Mở trang này, paste vào ô, click
              &quot;Import Dữ Liệu&quot;
            </li>
            <li>
              <strong>Xong!</strong> Dữ liệu đã được chuyển sang port mới
            </li>
          </ol>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📤 Export Dữ Liệu (Port hiện tại)
          </h2>
          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition mb-4"
          >
            📥 Export Dữ Liệu LocalStorage
          </button>

          {exportedData && (
            <>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-semibold">
                  Dữ liệu đã export (Copy text này):
                </label>
                <button
                  onClick={handleCopy}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  📋 Copy
                </button>
              </div>
              <textarea
                value={exportedData}
                readOnly
                aria-label="Exported data"
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
              />
            </>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📥 Import Dữ Liệu (Paste vào port mới)
          </h2>
          <label className="block text-gray-700 font-semibold mb-2">
            Paste dữ liệu JSON vào đây:
          </label>
          <textarea
            value={exportedData}
            onChange={(e) => setExportedData(e.target.value)}
            placeholder="Paste dữ liệu JSON đã export từ port khác..."
            className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-xs mb-4 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleImport}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ⬆️ Import Dữ Liệu
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800">
            <strong>💡 Lưu ý:</strong> Mỗi port (3000, 3001, 3002...) có
            localStorage riêng biệt. Khi chuyển port, dữ liệu không tự động
            chuyển theo. Sử dụng trang này để migrate dữ liệu giữa các port.
          </p>
        </div>
      </div>
    </div>
  );
}
