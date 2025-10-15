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
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending"
  );
  const filteredReservations = reservations.filter((r) => {
    if (filter === "all") return r.status !== "pending";
    return r.status === filter;
  });

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      const data = await reservationService.getAll();
      setReservations(data);
      setLoading(false);
    }
    fetchReservations();
  }, []);

  const handleConfirm = async (id: string) => {
    await reservationService.confirm(id);
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };
  const handleCancel = async (id: string) => {
    await reservationService.cancel(id);
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản Lý Đặt Bàn</h1>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Danh sách đặt bàn mới (pending) */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-primary-700 bg-primary-50 px-4 py-2 rounded-t-lg border-b-2 border-primary-300">
              Danh sách đặt bàn mới
            </h2>
            <div className="bg-primary-50 border border-primary-200 rounded-b-lg p-4">
              {pendingReservations.length === 0 ? (
                <div className="card p-8 text-center text-neutral-500">
                  Không có đơn đặt bàn mới.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingReservations.map((r) => (
                    <div
                      key={r.id}
                      className="card p-4 bg-white border border-primary-300 shadow-sm"
                    >
                      <div className="font-bold text-lg mb-2 text-primary-700">
                        {r.customerName}
                      </div>
                      <div className="mb-1">Số khách: {r.numberOfGuests}</div>
                      <div className="mb-1">
                        Thời gian:{" "}
                        {r.reservationDate.toDate().toLocaleDateString()}{" "}
                        {r.reservationTime}
                      </div>
                      <div className="mb-1">SĐT: {r.customerPhone}</div>
                      {r.notes && (
                        <div className="mb-1">Ghi chú: {r.notes}</div>
                      )}
                      <div className="mb-1">
                        Trạng thái:{" "}
                        <span className="text-primary-600 font-semibold">
                          {r.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="btn-primary px-4 py-2"
                          onClick={() => handleConfirm(r.id!)}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="btn-secondary px-4 py-2"
                          onClick={() => handleCancel(r.id!)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Phân tách rõ ràng với lịch sử đặt bàn */}
          <hr className="my-8 border-t-4 border-primary-200" />

          {/* Lịch sử đặt bàn */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-secondary-700 bg-secondary-50 px-4 py-2 rounded-t-lg border-b-2 border-secondary-300">
              Lịch sử đặt bàn
            </h2>
            <div className="bg-secondary-50 border border-secondary-200 rounded-b-lg p-4">
              {filteredReservations.length === 0 ? (
                <div className="card p-8 text-center text-neutral-500">
                  Không có đơn nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReservations.map((r) => (
                    <div
                      key={r.id}
                      className="card p-4 bg-white border border-secondary-300 shadow-sm"
                    >
                      <div className="font-bold text-lg mb-2 text-secondary-700">
                        {r.customerName}
                      </div>
                      <div className="mb-1">Số khách: {r.numberOfGuests}</div>
                      <div className="mb-1">
                        Thời gian:{" "}
                        {r.reservationDate.toDate().toLocaleDateString()}{" "}
                        {r.reservationTime}
                      </div>
                      <div className="mb-1">SĐT: {r.customerPhone}</div>
                      {r.notes && (
                        <div className="mb-1">Ghi chú: {r.notes}</div>
                      )}
                      <div className="mb-1">
                        Trạng thái:{" "}
                        {r.status === "confirmed" ? (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold">
                            Đã xác nhận
                          </span>
                        ) : r.status === "cancelled" ? (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold">
                            Đã hủy
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold">
                            {r.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
