"use client";
import { useEffect, useState } from "react";
import { orderService } from "@/lib/order.service";
import { reservationService } from "@/lib/reservation.service";
import type { Order, TableReservation, OrderItem } from "@/lib/types";

export default function UserOrderStatusPage() {
  // For demo: assume user/tableId is stored in localStorage (replace with real auth/session in prod)
  const [tableId, setTableId] = useState<string | null>(null);
  const [reservation, setReservation] = useState<TableReservation | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get tableId from local/session (replace with real logic)
    const tid = localStorage.getItem("currentTableId");
    setTableId(tid);
    if (!tid) return;
    async function fetchData() {
      setLoading(true);
      const resv = await reservationService.getByTableId(tid!);
      setReservation(resv);
      const ords = await orderService.getByTableId(tid!);
      setOrders(ords);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (!tableId) {
    return <div className="p-8 text-center text-lg">Bạn chưa chọn bàn. Vui lòng đặt bàn để xem trạng thái Oder.</div>;
  }
  if (loading) {
    return <div className="p-8 text-center text-lg">Đang tải thông tin bàn và đơn hàng...</div>;
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thông Tin Bàn & Đơn Hàng</h1>
      <div className="card p-4 mb-6">
        <div className="font-semibold">Bàn số: <span className="text-primary-600">{tableId}</span></div>
        <div>Thời gian nhận bàn: <span className="text-neutral-700">{reservation?.createdAt ? new Date(reservation.createdAt.toDate()).toLocaleTimeString() : "--"}</span></div>
        <div>Tên khách: <span className="text-neutral-700">{reservation?.customerName || "--"}</span></div>
      </div>
      <h2 className="text-lg font-bold mb-2">Các đơn đã Oder</h2>
      {orders.length === 0 ? (
        <div className="p-4 text-neutral-500">Chưa có đơn hàng nào cho bàn này.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Mã đơn: <span className="text-primary-600">{order.orderCode}</span></div>
                <div className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700">{order.status}</div>
              </div>
              <div>Thời gian Oder: <span className="text-neutral-700">{order.createdAt ? new Date(order.createdAt.toDate()).toLocaleTimeString() : "--"}</span></div>
              <div>Bàn số: <span className="text-neutral-700">{order.tableNumber || tableId}</span></div>
              <div className="mt-2">
                <div className="font-medium mb-1">Món đã gọi:</div>
                <ul className="list-disc pl-5">
                  {order.items?.map((item: OrderItem, idx: number) => (
                    <li key={idx}>{item.name} <span className="text-xs text-neutral-500">x{item.quantity}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
