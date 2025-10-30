"use client";

import { useEffect, useState } from "react";
import { reservationService } from "@/lib/reservation.service";
import { TableReservation } from "@/lib/types";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">(
    "all"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = reservationService.subscribeToReservations(
      (updatedReservations) => {
        setReservations(updatedReservations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleConfirm = async (id: string) => {
    await reservationService.confirm(id);
    // No need to manually update state as subscription will handle it
  };
  const handleCancel = async (id: string) => {
    await reservationService.cancel(id);
    // No need to manually update state as subscription will handle it
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn đặt bàn này?")) return;
    await reservationService.deleteReservation(id);
  };

  // Tìm kiếm theo tên khách hoặc SĐT
  const searchLower = search.trim().toLowerCase();
  const filtered = reservations.filter((r) => {
    if (searchLower) {
      // Tách họ tên thành từng từ
      const name = r.customerName?.toLowerCase() || "";
      const nameParts = name.split(/\s+/);
      // Số điện thoại dạng chuỗi, loại bỏ ký tự không phải số
      const phone = (r.customerPhone || "").replace(/[^0-9]/g, "");
      const phoneLower = phone;
      // Tìm kiếm khớp bất kỳ phần nào của tên, hoặc toàn bộ tên
      const nameMatch =
        name.includes(searchLower) ||
        nameParts.some((part) => part.includes(searchLower));
      // Tìm kiếm số điện thoại: khớp toàn bộ, 3 số cuối, số giữa
      const phoneMatch = phoneLower.includes(searchLower);
      if (!nameMatch && !phoneMatch) return false;
    }
    if (filter === "all") return true;
    return r.status === filter;
  });
  const pendingReservations = filtered.filter((r) => r.status === "pending");
  const historyReservations = filtered.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Quản Lý Đặt Bàn
          </h1>
          <p className="text-neutral-600 mt-1">
            Xem và quản lý các đơn đặt bàn của khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên khách/SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "confirmed" | "cancelled")
            }
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tất cả</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-neutral-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* Danh sách đặt bàn mới (pending) */}
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-primary-700">
              Danh sách đặt bàn mới
            </h2>
            {pendingReservations.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                Không có đơn đặt bàn mới.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingReservations.map((r) => (
                  <div
                    key={r.id}
                    className="relative bg-gradient-to-br from-white to-primary-50 border-2 border-primary-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-bl-full opacity-10"></div>
                    
                    <div className="p-5 relative">
                      {/* Header with Icon */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                          👤
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-primary-700 line-clamp-1">
                            {r.customerName}
                          </h3>
                          <div className="text-sm text-neutral-600 flex items-center gap-1 mt-0.5">
                            📞 {r.customerPhone}
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-primary-600">👥</span>
                          <span className="text-neutral-700">{r.numberOfGuests} khách</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-primary-600">📅</span>
                          <span className="text-neutral-700">
                            {r.reservationDate.toDate().toLocaleDateString("vi-VN")} - {r.reservationTime}
                          </span>
                        </div>
                        {r.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-primary-600">📝</span>
                            <span className="text-neutral-600 italic line-clamp-2">{r.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                          ⏳ Chờ xác nhận
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all text-sm flex items-center justify-center gap-1"
                          onClick={() => handleConfirm(r.id!)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Xác nhận
                        </button>
                        <button
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all text-sm flex items-center justify-center gap-1"
                          onClick={() => handleCancel(r.id!)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lịch sử đặt bàn */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-secondary-700">
              Lịch sử đặt bàn
            </h2>
            {historyReservations.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                Không có đơn nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyReservations.map((r) => (
                  <div
                    key={r.id}
                    className="relative bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Status Stripe */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${
                      r.status === "confirmed" 
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : "bg-gradient-to-r from-red-400 to-red-600"
                    }`}></div>
                    
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      {r.status === "confirmed" ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 shadow-sm">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-600">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-green-700">Đã xác nhận</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 shadow-sm">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-600">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-red-700">Đã hủy</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 relative">
                      {/* Header with Icon */}
                      <div className="flex items-start gap-3 mb-4">
                        {/* User Avatar Icon */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-neutral-400 to-neutral-500 shadow-md flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-neutral-800 line-clamp-1">
                            {r.customerName}
                          </h3>
                          <div className="text-sm text-neutral-600 flex items-center gap-1 mt-0.5">
                            📞 {r.customerPhone}
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span>👥</span>
                          <span className="text-neutral-700">{r.numberOfGuests} khách</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>📅</span>
                          <span className="text-neutral-700">
                            {r.reservationDate.toDate().toLocaleDateString("vi-VN")} - {r.reservationTime}
                          </span>
                        </div>
                        {r.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <span>📝</span>
                            <span className="text-neutral-600 italic line-clamp-2">{r.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        className="w-full px-3 py-2 bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 border border-neutral-200 hover:border-red-300 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 mt-2"
                        onClick={() => handleDelete(r.id!)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
