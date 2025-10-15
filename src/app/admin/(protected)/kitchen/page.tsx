"use client";
import { useEffect, useState } from "react";
import { orderService } from "@/lib/sdk";
import type { Order } from "@/lib/types";
import type { WithId } from "@/lib/firestore.service";

export default function KitchenPage() {
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
  const list = await orderService.getAll();
    // show only pending or preparing
    setOrders(list.filter((o) => o.status === "pending" || o.status === "preparing"));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Order["status"]) {
    await orderService.updateStatus(id, status);
    await load();
  }

  if (loading) return <div>Đang tải đơn bếp…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nhà Bếp</h1>
      {orders.length === 0 && (
        <div className="card p-12 text-center">Chưa có đơn nào.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">{o.orderCode ?? o.id} • Bàn {o.tableNumber || "-"}</div>
              <span className="text-xs px-2 py-1 rounded bg-neutral-100">{o.status}</span>
            </div>
            <div className="space-y-1 mb-3">
              {o.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{it.quantity}x {it.name}</span>
                  <span>{(it.price * it.quantity).toLocaleString()}₫</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tổng: {o.totalAmount.toLocaleString()}₫</span>
              {o.status === "pending" && (
                <button className="btn-primary" onClick={() => updateStatus(o.id!, "preparing")}>Đang làm</button>
              )}
              {o.status === "preparing" && (
                <button className="btn-primary" onClick={() => updateStatus(o.id!, "ready")}>Đã xong</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
