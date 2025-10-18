"use client";

import { useEffect, useState } from "react";
import { reservationService } from "@/lib/reservation.service";
import { TableReservation } from "@/lib/types";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

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

    // Tìm kiếm theo tên khách hoặc SĐT
    const searchLower = search.trim().toLowerCase();
    const filtered = reservations.filter(r => {
      if (searchLower) {
        // Tách họ tên thành từng từ
        const name = r.customerName?.toLowerCase() || '';
        const nameParts = name.split(/\s+/);
        // Số điện thoại dạng chuỗi, loại bỏ ký tự không phải số
        const phone = (r.customerPhone || '').replace(/[^0-9]/g, '');
        const phoneLower = phone;
        // Tìm kiếm khớp bất kỳ phần nào của tên, hoặc toàn bộ tên
        const nameMatch = name.includes(searchLower) || nameParts.some(part => part.includes(searchLower));
        // Tìm kiếm số điện thoại: khớp toàn bộ, 3 số cuối, số giữa
        const phoneMatch = phoneLower.includes(searchLower);
        if (!nameMatch && !phoneMatch) return false;
      }
      if (filter === 'all') return true;
      return r.status === filter;
    });
    const pendingReservations = filtered.filter(r => r.status === 'pending');
    const historyReservations = filtered.filter(r => r.status !== 'pending');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Quản Lý Đặt Bàn</h1>
            <p className="text-neutral-600 mt-1">Xem và quản lý các đơn đặt bàn của khách hàng</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Tìm theo tên khách/SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'confirmed' | 'cancelled')}
              className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tất cả</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card p-8 text-center text-neutral-500">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Danh sách đặt bàn mới (pending) */}
            <div className="card p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-primary-700">Danh sách đặt bàn mới</h2>
              {pendingReservations.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">Không có đơn đặt bàn mới.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingReservations.map((r) => (
                    <div
                      key={r.id}
                      className="card p-4 bg-white border border-primary-300 shadow-sm"
                    >
                      <div className="font-bold text-lg mb-2 text-primary-700">{r.customerName}</div>
                      <div className="mb-1">Số khách: {r.numberOfGuests}</div>
                      <div className="mb-1">Thời gian: {r.reservationDate.toDate().toLocaleDateString()} {r.reservationTime}</div>
                      <div className="mb-1">SĐT: {r.customerPhone}</div>
                      {r.notes && (<div className="mb-1">Ghi chú: {r.notes}</div>)}
                      <div className="mb-1">Trạng thái: <span className="text-primary-600 font-semibold">{r.status}</span></div>
                      <div className="flex gap-2 mt-2">
                        <button className="btn-primary px-4 py-2" onClick={() => handleConfirm(r.id!)}>Xác nhận</button>
                        <button className="btn-secondary px-4 py-2" onClick={() => handleCancel(r.id!)}>Hủy</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lịch sử đặt bàn */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-secondary-700">Lịch sử đặt bàn</h2>
              {historyReservations.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">Không có đơn nào.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historyReservations.map((r) => (
                    <div
                      key={r.id}
                      className="card p-4 bg-white border border-secondary-300 shadow-sm"
                    >
                      <div className="font-bold text-lg mb-2 text-secondary-700">{r.customerName}</div>
                      <div className="mb-1">Số khách: {r.numberOfGuests}</div>
                      <div className="mb-1">Thời gian: {r.reservationDate.toDate().toLocaleDateString()} {r.reservationTime}</div>
                      <div className="mb-1">SĐT: {r.customerPhone}</div>
                      {r.notes && (<div className="mb-1">Ghi chú: {r.notes}</div>)}
                      <div className="mb-1">
                        Trạng thái: {r.status === "confirmed" ? (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold">Đã xác nhận</span>
                        ) : r.status === "cancelled" ? (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold">Đã hủy</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold">{r.status}</span>
                        )}
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
