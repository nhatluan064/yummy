"use client";

import { useState } from "react";
import { cleanupService } from "@/lib/cleanup.service";

export default function DataCleanupPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCleanup = async () => {
    if (!confirm("Bạn có chắc muốn chạy cleanup? Dữ liệu đã xóa không thể khôi phục!")) {
      return;
    }

    setLoading(true);
    try {
      const result = await cleanupService.runCleanup();
      setResults(result);
      alert(`✅ Cleanup thành công!\n- Đơn hủy đã xóa: ${result.cancelledDeleted}\n- Đơn đã archive: ${result.ordersArchived}`);
    } catch (error) {
      console.error(error);
      alert("❌ Cleanup thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Quản Lý Dữ Liệu
        </h1>
        <p className="text-neutral-600 mt-1">
          Dọn dẹp và archive dữ liệu cũ tự động
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800">Đơn Hủy</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Tự động xóa các đơn hàng đã hủy sau <strong>7 ngày</strong>
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800">Archive</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Chuyển đơn hoàn thành sang archive sau <strong>1 năm</strong>
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800">Báo Cáo</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Tạo báo cáo tháng/năm, giữ <strong>vĩnh viễn</strong>
          </p>
        </div>
      </div>

      {/* Cleanup Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Chạy Cleanup Thủ Công
        </h2>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">⚠️ Cảnh Báo</h3>
              <p className="text-sm text-amber-700">
                Cleanup sẽ xóa vĩnh viễn dữ liệu cũ theo quy tắc trên. 
                Nên chạy vào lúc ít khách (đêm khuya) để tránh ảnh hưởng hiệu suất.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCleanup}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang xử lý...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Chạy Cleanup Ngay
            </>
          )}
        </button>

        {results && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Kết Quả Cleanup</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Đơn hủy đã xóa: <strong>{results.cancelledDeleted}</strong></li>
              <li>• Đơn đã archive: <strong>{results.ordersArchived}</strong></li>
            </ul>
          </div>
        )}
      </div>

      {/* Schedule Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          📅 Lịch Tự Động (Đề Xuất)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-32 font-medium text-neutral-700">Mỗi ngày:</span>
            <span className="text-neutral-600">Xóa đơn hủy cũ hơn 7 ngày</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-32 font-medium text-neutral-700">Mỗi tháng:</span>
            <span className="text-neutral-600">Tạo báo cáo tháng</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-32 font-medium text-neutral-700">Mỗi năm:</span>
            <span className="text-neutral-600">Archive đơn cũ hơn 1 năm</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Gợi ý:</strong> Dùng Firebase Functions hoặc Vercel Cron Jobs để tự động chạy cleanup hàng ngày.
          </p>
        </div>
      </div>
    </div>
  );
}
