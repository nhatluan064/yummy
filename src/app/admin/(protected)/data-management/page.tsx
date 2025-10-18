"use client";

import { useState } from "react";
import { resetToDefaults, exportData, importData } from "@/lib/menuData";
import { adminMaintenance } from "@/lib/sdk";

export default function DataManagementPage() {
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleReset = () => {
    if (
      confirm(
        "⚠️ Xóa sạch dữ liệu LocalStorage (menu, categories, reviews)?\nThao tác này không thể hoàn tác."
      )
    ) {
      resetToDefaults();
      try {
        localStorage.removeItem("customerReviews");
      } catch {}
      showMessage("✅ Đã xóa sạch dữ liệu LocalStorage!", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Firestore resets
  const confirmAndRun = async (msg: string, fn: () => Promise<unknown>) => {
    if (confirm(msg)) {
      try {
        await fn();
        showMessage("✅ Đã reset thành công!", "success");
      } catch (e) {
        console.error(e);
        showMessage(
          "❌ Không thể reset. Kiểm tra quyền Firestore Rules.",
          "error"
        );
      }
    }
  };

  const resetAllFirestore = () =>
    confirmAndRun(
      "⚠️ Reset TẤT CẢ dữ liệu trên Firestore (menu, orders, reservations, feedback, bills, contacts)?",
      () => adminMaintenance.resetAll()
    );

  const resetMenuFirestore = () =>
    confirmAndRun("Reset Thực đơn (menu) trên Firestore?", () =>
      adminMaintenance.resetMenu()
    );
  const resetOrdersFirestore = () =>
    confirmAndRun("Reset Đơn hàng (orders) trên Firestore?", () =>
      adminMaintenance.resetOrders()
    );
  const resetReservationsFirestore = () =>
    confirmAndRun("Reset Đơn đặt bàn (reservations) trên Firestore?", () =>
      adminMaintenance.resetReservations()
    );
  const resetFeedbackFirestore = () =>
    confirmAndRun("Reset Feedback trên Firestore?", () =>
      adminMaintenance.resetFeedback()
    );
  const resetContactsFirestore = () =>
    confirmAndRun("Reset Liên hệ trên Firestore?", () =>
      adminMaintenance.resetContacts()
    );
  const resetRevenueFirestore = (range: "today" | "week" | "month" | "year") =>
    confirmAndRun(
      `Reset Doanh thu ${
        range === "today"
          ? "Hôm nay"
          : range === "week"
          ? "Tuần này"
          : range === "month"
          ? "Tháng này"
          : "Năm này"
      } trên Firestore?`,
      () => adminMaintenance.resetRevenue(range)
    );

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("✅ Đã export dữ liệu thành công!", "success");
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showMessage("❌ Vui lòng nhập dữ liệu JSON!", "error");
      return;
    }

    const success = importData(importText);
    if (success) {
      showMessage(
        "✅ Đã import dữ liệu thành công! Đang tải lại trang...",
        "success"
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showMessage(
        "❌ Import thất bại! Vui lòng kiểm tra dữ liệu JSON.",
        "error"
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🗄️ Quản Lý Dữ Liệu
          </h1>
          <p className="text-gray-600">
            Quản lý dữ liệu menu, danh mục - Export, Import, Reset
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Reset Section (LocalStorage) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🗑️ Xóa Dữ Liệu LocalStorage
          </h2>
          <p className="text-gray-600 mb-4">
            Xóa tất cả dữ liệu menu, danh mục và feedback đã lưu trong trình
            duyệt.
          </p>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ⚠️ Xóa sạch LocalStorage
          </button>
        </div>

        {/* Firestore Reset Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🧹 Reset Dữ Liệu (Firestore)
          </h2>
          <p className="text-gray-600 mb-4">
            Thao tác này sẽ xóa dữ liệu trong Firestore collections tương ứng.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={resetAllFirestore}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Tất Cả
            </button>
            <button
              onClick={resetMenuFirestore}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Thực Đơn
            </button>
            <button
              onClick={resetOrdersFirestore}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Đơn Hàng
            </button>
            <button
              onClick={resetReservationsFirestore}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Đơn Đặt Bàn
            </button>
            <button
              onClick={resetFeedbackFirestore}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Feedback
            </button>
            <button
              onClick={resetContactsFirestore}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Liên Hệ
            </button>
          </div>
        </div>

        {/* Revenue Reset Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            💰 Reset Doanh Thu (Firestore)
          </h2>
          <p className="text-gray-600 mb-4">
            Xóa dữ liệu hóa đơn (bills) theo khoảng thời gian để reset doanh
            thu.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => resetRevenueFirestore("today")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Doanh Thu Hôm Nay
            </button>
            <button
              onClick={() => resetRevenueFirestore("week")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Doanh Thu Tuần Này
            </button>
            <button
              onClick={() => resetRevenueFirestore("month")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Doanh Thu Tháng Này
            </button>
            <button
              onClick={() => resetRevenueFirestore("year")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Doanh Thu Năm Này
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📤 Export Dữ Liệu
          </h2>
          <p className="text-gray-600 mb-4">
            Tải xuống tất cả dữ liệu hiện tại dưới dạng file JSON
          </p>
          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            📥 Tải xuống dữ liệu
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📥 Import Dữ Liệu
          </h2>
          <p className="text-gray-600 mb-4">
            Nhập dữ liệu từ file JSON hoặc paste trực tiếp
          </p>

          <div className="mb-4">
            <label
              htmlFor="fileUpload"
              className="block text-gray-700 font-semibold mb-2"
            >
              Chọn file JSON:
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Hoặc paste dữ liệu JSON:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"categories": [...], "menuItems": [...]}'
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
            />
          </div>

          <button
            onClick={handleImport}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ⬆️ Import dữ liệu
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-800">
            <strong>⚠️ Lưu ý:</strong> Dữ liệu được lưu trong localStorage của
            trình duyệt. Khi tắt server và mở lại, dữ liệu vẫn được giữ nguyên.
            Chỉ khi bạn xóa cache hoặc dùng chế độ ẩn danh thì mới mất dữ liệu.
          </p>
        </div>
      </div>
    </div>
  );
}
