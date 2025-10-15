"use client";

import { useEffect, useState } from "react";
import { reservationService } from "@/lib/reservation.service";
import { TableReservation } from "@/lib/types";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      const data = await reservationService.getAll();
      setReservations(data);
      setLoading(false);
    }
    fetchReservations();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản Lý Đặt Bàn</h1>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : reservations.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500">Chưa có đặt bàn nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="font-bold text-lg mb-2">{r.customerName}</div>
              <div className="mb-1">Số khách: {r.numberOfGuests}</div>
              <div className="mb-1">Thời gian: {r.reservationDate.toDate().toLocaleDateString()} {r.reservationTime}</div>
              <div className="mb-1">SĐT: {r.customerPhone}</div>
              {r.notes && <div className="mb-1">Ghi chú: {r.notes}</div>}
              <div className="mb-1">Trạng thái: {r.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
