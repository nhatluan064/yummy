"use client";
import { useState } from "react";
import { useOrder } from "./OrderContext";
import { orderService } from "@/lib/sdk";
import type { Order } from "@/lib/types";
import { useToast } from "@/app/components/Toast";

export default function OrderDrawer() {
  const {
    items,
    removeItem,
    setQuantity,
    total,
    isOpen,
    close,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    clear,
  } = useOrder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const submitOrder = async () => {
    setError(null);
    if (items.length === 0) {
      setError("Bạn chưa chọn món nào");
      return;
    }
    if (!tableNumber) {
      setError("Vui lòng nhập số bàn");
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        menuItemId: i.menuItemId || i.name,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      const { orderCode } = await orderService.createOrder({
        items: orderItems,
        customerName,
        totalAmount: total,
        orderType: "dine-in",
        tableNumber,
        notes: "",
        paymentMethod: "unpaid",
      } as Omit<Order, "id" | "createdAt" | "updatedAt" | "status">);
      showToast(
        `Oder của bạn đã được gửi cho Bếp trưởng, vui lòng chờ trong ít phút để món ăn được đưa ra !\nMã đơn: ${orderCode}`
      );
      clear();
      close();
    } catch (e) {
      const err = e as Error;
      setError(err?.message || "Không thể tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay: click to close */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={close}
        aria-label="Đóng Drawer"
      />
      {/* Drawer */}
      <div
        className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl transition-transform duration-300"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Đơn gọi món</h2>
            <button
              onClick={close}
              aria-label="Đóng"
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Bàn số</label>
                <input
                  value={tableNumber}
                  placeholder="Số bàn"
                  aria-label="Số bàn"
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-neutral-500">Chưa có món nào.</p>
              )}
              {items.map((it) => (
                <div
                  key={it.name}
                  className="flex items-center justify-between border rounded p-2"
                >
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-neutral-500">
                      {it.price.toLocaleString()}₫
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-neutral-100 rounded"
                      onClick={() => setQuantity(it.name, it.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="min-w-[2ch] text-center">
                      {it.quantity}
                    </span>
                    <button
                      className="px-2 py-1 bg-neutral-100 rounded"
                      onClick={() => setQuantity(it.name, it.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="text-red-600 ml-2"
                      onClick={() => removeItem(it.name)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {/* success handled via toast */}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary-600">
                {total.toLocaleString()}₫
              </span>
            </div>
            <button
              onClick={submitOrder}
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              {submitting ? "Đang tạo đơn..." : "Gửi Oder đến Bếp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
