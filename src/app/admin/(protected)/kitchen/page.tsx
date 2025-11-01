"use client";
import { useEffect, useState } from "react";
import { orderService } from "@/lib/sdk";
import type { Order } from "@/lib/types";
import type { WithId } from "@/lib/firestore.service";
import { useToast } from "@/app/components/Toast";

export default function KitchenPage() {
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [expandedSections, setExpandedSections] = useState({
    dineIn: true,
    takeaway: true,
    delivery: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  async function load() {
    setLoading(true);
    const list = await orderService.getAll();
    // show only pending or preparing, sort by createdAt ascending (FIFO - oldest first)
    const filtered = list.filter((o) => o.status === "pending" || o.status === "preparing");
    filtered.sort((a, b) => {
      let aTime: Date;
      if (typeof a.createdAt === 'object' && a.createdAt && 'toDate' in a.createdAt) {
        aTime = a.createdAt.toDate();
      } else if (a.createdAt) {
        aTime = new Date(a.createdAt);
      } else {
        aTime = new Date();
      }
      
      let bTime: Date;
      if (typeof b.createdAt === 'object' && b.createdAt && 'toDate' in b.createdAt) {
        bTime = b.createdAt.toDate();
      } else if (b.createdAt) {
        bTime = new Date(b.createdAt);
      } else {
        bTime = new Date();
      }
      
      return aTime.getTime() - bTime.getTime();
    });
    setOrders(filtered);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Order["status"]) {
    await orderService.updateStatus(id, status);
    
    // If completed, create bill snapshot
    if (status === "completed") {
      const order = orders.find(o => o.id === id);
      if (order) {
        try {
          const { billService } = await import("@/lib/sdk");
          await billService.ensureForOrder({
            id: order.id!,
            orderCode: order.orderCode,
            customerName: order.customerName || "",
            tableNumber: order.tableNumber,
            items: order.items,
            totalAmount: order.totalAmount,
          });
        } catch (e) {
          console.warn("Persist bill failed:", e);
        }
      }
    }
    
    await load();
  }

  async function cancelOrder(order: WithId<Order>) {
    const confirmed = confirm(
      `Hủy đơn ${order.orderCode}?\n\nTất cả dữ liệu sẽ bị xóa vĩnh viễn. Không thể khôi phục!`
    );
    if (!confirmed) return;
    
    try {
      await orderService.delete(order.id!);
      
      // Sync with draftOrders in localStorage
      if (order.orderType === "dine-in" && order.tableNumber) {
        const saved = localStorage.getItem("draftOrders");
        if (saved) {
          try {
            const draftOrders = JSON.parse(saved) as { tableNumber: string; items: unknown[]; totalOrders: number }[];
            const draft = draftOrders.find((d) => d.tableNumber === order.tableNumber);
            if (draft) {
              // Decrease totalOrders count
              draft.totalOrders = Math.max(0, (draft.totalOrders || 1) - 1);
              
              // If no more orders and no pending items, remove draft
              if (draft.totalOrders === 0 && (!draft.items || draft.items.length === 0)) {
                const newDrafts = draftOrders.filter((d) => d.tableNumber !== order.tableNumber);
                localStorage.setItem("draftOrders", JSON.stringify(newDrafts));
              } else {
                localStorage.setItem("draftOrders", JSON.stringify(draftOrders));
              }
            }
          } catch (e) {
            console.error("Error syncing draft orders:", e);
          }
        }
      }
      
      showToast("✓ Đã hủy đơn thành công!", 3000, "success");
      await load();
    } catch (error) {
      console.error("Error canceling order:", error);
      showToast("Có lỗi xảy ra!", 3000, "error");
    }
  }

  if (loading) return <div>Đang tải đơn bếp…</div>;

  // Group orders by type
  const dineInOrders = orders.filter(o => o.orderType === "dine-in");
  const takeawayOrders = orders.filter(o => o.orderType === "takeaway");
  const deliveryOrders = orders.filter(o => o.orderType === "delivery");

  const renderOrderCard = (o: WithId<Order>) => {
    // Format time
    let createdTime: Date;
    if (typeof o.createdAt === 'object' && o.createdAt && 'toDate' in o.createdAt) {
      createdTime = o.createdAt.toDate();
    } else if (o.createdAt) {
      createdTime = new Date(o.createdAt);
    } else {
      createdTime = new Date();
    }
    const timeStr = createdTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = createdTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    
    return (
    <div key={o.id} className="card p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">{o.orderCode ?? o.id}</div>
        <span className="text-xs px-2 py-1 rounded bg-neutral-100">{o.status}</span>
      </div>
      <div className="text-xs text-neutral-500 mb-2">{dateStr} • {timeStr}</div>
      {o.orderType === "dine-in" && o.tableNumber && (
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 border-2 border-purple-500 rounded-lg font-bold text-sm">
            Bàn {o.tableNumber}
          </span>
        </div>
      )}
      {o.orderType === "delivery" && o.customerName && (
        <div className="text-xs text-neutral-600 mb-2 font-medium">{o.customerName} • {o.customerPhone}</div>
      )}
      <div className="space-y-1 mb-3">
        {o.items.map((it, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span>{it.quantity}x {it.name}</span>
            <span>{(it.price * it.quantity).toLocaleString()}₫</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Tổng: {o.totalAmount.toLocaleString()}₫</span>
        </div>
        <div className="flex gap-2">
          {o.status === "pending" && (
            <button className="btn-primary flex-1 text-sm py-1" onClick={() => updateStatus(o.id!, "preparing")}>Đang làm</button>
          )}
          {o.status === "preparing" && (
            <button className="btn-primary flex-1 text-sm py-1" onClick={() => updateStatus(o.id!, "ready")}>Đã xong</button>
          )}
          {o.status === "ready" && (
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-1 px-4 rounded-lg transition-colors flex-1" onClick={() => updateStatus(o.id!, "completed")}>💵 Thanh toán</button>
          )}
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-1 px-3 rounded-lg transition-colors"
            onClick={() => cancelOrder(o)}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <h1 className="text-2xl font-bold p-4 flex-shrink-0">Quản lý Bill gửi Bếp</h1>
      
      {orders.length === 0 && (
        <div className="card p-12 text-center m-4">Chưa có đơn nào.</div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 pb-4 overflow-hidden">
        {/* Column 1: Dine-in */}
        <div className={`flex flex-col ${expandedSections.dineIn ? 'overflow-hidden' : 'flex-shrink-0'}`}>
          <button
            onClick={() => toggleSection('dineIn')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold flex items-center justify-between transition-colors flex-shrink-0"
          >
            <span className="flex items-center gap-2">
              <svg className={`w-5 h-5 transition-transform ${expandedSections.dineIn ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              🪑 Orders tại bàn
            </span>
            <span className="bg-white text-purple-600 px-2 py-1 rounded text-sm">{dineInOrders.length}</span>
          </button>
          {expandedSections.dineIn && (
            <div className="flex-1 mt-2 border rounded-lg p-3 bg-neutral-50 overflow-y-auto">
              {dineInOrders.length === 0 ? (
                <p className="text-neutral-400 text-center text-sm py-8">Chưa có đơn</p>
              ) : (
                dineInOrders.map(renderOrderCard)
              )}
            </div>
          )}
        </div>

        {/* Column 2: Takeaway */}
        <div className={`flex flex-col ${expandedSections.takeaway ? 'overflow-hidden' : 'flex-shrink-0'}`}>
          <button
            onClick={() => toggleSection('takeaway')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg font-bold flex items-center justify-between transition-colors flex-shrink-0"
          >
            <span className="flex items-center gap-2">
              <svg className={`w-5 h-5 transition-transform ${expandedSections.takeaway ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              🛒 Orders mang đi
            </span>
            <span className="bg-white text-orange-600 px-2 py-1 rounded text-sm">{takeawayOrders.length}</span>
          </button>
          {expandedSections.takeaway && (
            <div className="flex-1 mt-2 border rounded-lg p-3 bg-neutral-50 overflow-y-auto">
              {takeawayOrders.length === 0 ? (
                <p className="text-neutral-400 text-center text-sm py-8">Chưa có đơn</p>
              ) : (
                takeawayOrders.map(renderOrderCard)
              )}
            </div>
          )}
        </div>

        {/* Column 3: Delivery */}
        <div className={`flex flex-col ${expandedSections.delivery ? 'overflow-hidden' : 'flex-shrink-0'}`}>
          <button
            onClick={() => toggleSection('delivery')}
            className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg font-bold flex items-center justify-between transition-colors flex-shrink-0"
          >
            <span className="flex items-center gap-2">
              <svg className={`w-5 h-5 transition-transform ${expandedSections.delivery ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              🏍️ Orders Ship
            </span>
            <span className="bg-white text-pink-600 px-2 py-1 rounded text-sm">{deliveryOrders.length}</span>
          </button>
          {expandedSections.delivery && (
            <div className="flex-1 mt-2 border rounded-lg p-3 bg-neutral-50 overflow-y-auto">
              {deliveryOrders.length === 0 ? (
                <p className="text-neutral-400 text-center text-sm py-8">Chưa có đơn</p>
              ) : (
                deliveryOrders.map(renderOrderCard)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
