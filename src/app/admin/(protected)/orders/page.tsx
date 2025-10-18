"use client";

import { useEffect, useState } from "react";
import { orderService, billService } from "@/lib/sdk";
import type { Order } from "@/lib/types";
import type { WithId } from "@/lib/firestore.service";
import type { OrderItem } from "@/lib/types";

type UIOrder = WithId<Order>;

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
  const [orders, setOrders] = useState<UIOrder[]>([]);

  useEffect(() => {
    const unsubscribe = orderService.subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    return () => unsubscribe();
  }, []);

  const statusConfig = {
    all: { label: "Tất cả", color: "neutral", count: orders.length },
    pending: {
      label: "Chờ xử lý",
      color: "amber",
      count: orders.filter((o) => o.status === "pending").length,
    },
    preparing: {
      label: "Đang nấu",
      color: "blue",
      count: orders.filter((o) => o.status === "preparing").length,
    },
    ready: {
      label: "Sẵn sàng",
      color: "primary",
      count: orders.filter((o) => o.status === "ready").length,
    },
    completed: {
      label: "Đã thanh toán",
      color: "green",
      count: orders.filter((o) => o.status === "completed").length,
    },
    cancelled: {
      label: "Đã hủy",
      color: "red",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border bg-${config.color}-100 text-${config.color}-700 border-${config.color}-200`}
      >
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch =
      (order.orderCode ?? order.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (order.customerName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group orders by date
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const ts = order.createdAt as unknown as
      | { toDate?: () => Date }
      | undefined;
    const date = ts?.toDate ? ts.toDate() : new Date();
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(order);
    return groups;
  }, {} as Record<string, UIOrder[]>);

  // Sort orders within each date group by time (newest first)
  Object.keys(groupedOrders).forEach((dateKey) => {
    groupedOrders[dateKey].sort((a, b) => {
      const aTime =
        (a.createdAt as unknown as { toDate?: () => Date })
          ?.toDate?.()
          ?.getTime() || 0;
      const bTime =
        (b.createdAt as unknown as { toDate?: () => Date })
          ?.toDate?.()
          ?.getTime() || 0;
      return bTime - aTime; // Newest first
    });
  });

  // Sort date groups (newest dates first)
  const sortedDateKeys = Object.keys(groupedOrders).sort((a, b) =>
    b.localeCompare(a)
  );

  // Helper function to format date headers
  const formatDateHeader = (dateKey: string) => {
    const date = new Date(dateKey + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    // find current order snapshot for bill persistence when completed
    const current = orders.find((o) => o.id === orderId) || null;
    await orderService.updateStatus(orderId, newStatus);
    // If mark completed, persist a bill snapshot
    if (newStatus === "completed" && current) {
      try {
        await billService.ensureForOrder({
          id: current.id!,
          orderCode: current.orderCode,
          customerName: current.customerName || "",
          tableNumber: current.tableNumber,
          items: current.items,
          totalAmount: current.totalAmount,
        });
      } catch (e) {
        // best-effort; ignore if rules forbid or already exists
        console.warn("Persist bill failed:", e);
      }
    }
    // No need to manually refresh orders as subscription will handle it
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-neutral-600 mt-1">
            Theo dõi và xử lý tất cả đơn hàng
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Lọc
          </button>
          <button className="btn-primary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tạo Đơn Mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedStatus === key
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {config.label}
                <span
                  className={`ml-2 ${
                    selectedStatus === key
                      ? "text-white/80"
                      : "text-neutral-500"
                  }`}
                >
                  ({config.count})
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="space-y-8">
        {sortedDateKeys.map((dateKey) => (
          <div key={dateKey} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-neutral-800">
                {formatDateHeader(dateKey)}
              </h2>
              <div className="flex-1 h-px bg-neutral-200"></div>
              <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                {groupedOrders[dateKey].length} đơn hàng
              </span>
            </div>

            {/* Orders for this date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupedOrders[dateKey].map((order) => (
                <div
                  key={order.id}
                  className="card p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary-600">
                        {order.orderCode ?? order.id}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        {(() => {
                          const ts = order.createdAt as unknown as
                            | { toDate?: () => Date }
                            | undefined;
                          return ts?.toDate
                            ? ts.toDate().toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "";
                        })()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 pb-4 border-b border-neutral-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">
                          {order.customerName}
                        </p>
                        {order.customerPhone && (
                          <p className="text-sm text-neutral-500">
                            {order.customerPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-neutral-700">
                          <span className="font-medium text-primary-600">
                            {item.quantity}x
                          </span>{" "}
                          {item.name}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {item.price.toLocaleString()}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-neutral-600">
                        Tổng cộng:
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {(order.totalAmount ?? 0).toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <span>Bàn {order.tableNumber ?? "-"}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                          />
                        </svg>
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status !== "completed" &&
                    order.status !== "cancelled" && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, "preparing");
                              }}
                              className="flex-1 btn-primary text-sm py-2"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, "cancelled");
                              }}
                              className="px-4 btn-secondary text-sm py-2"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id!, "ready");
                            }}
                            className="flex-1 btn-primary text-sm py-2"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {order.status === "ready" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id!, "completed");
                            }}
                            className="flex-1 btn-primary text-sm py-2"
                          >
                            Thanh toán xong
                          </button>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Chi Tiết Đơn Hàng
                  </h2>
                  <p className="text-neutral-600 mt-1">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">
                  Trạng Thái
                </h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer */}
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">
                  Thông Tin Khách Hàng
                </h3>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                  <p className="text-neutral-700">
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedOrder.customerName}
                  </p>
                  {selectedOrder.customerPhone && (
                    <p className="text-neutral-700">
                      <span className="font-medium">Số ĐT:</span>{" "}
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                  <p className="text-neutral-700">
                    <span className="font-medium">Email:</span>{" "}
                    {/* email optional */}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-neutral-800 mb-2">Món Ăn</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: OrderItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-primary-600">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-neutral-800">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {selectedOrder.totalAmount.toLocaleString()}₫
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 mb-1">Số bàn</p>
                  <p className="font-medium text-neutral-800">
                    {selectedOrder.tableNumber}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 mb-1">Trạng thái</p>
                  <p className="font-medium text-neutral-800">
                    {selectedOrder.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="card p-12 text-center">
          <svg
            className="w-16 h-16 text-neutral-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            Không tìm thấy đơn hàng
          </h3>
          <p className="text-neutral-600">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </p>
        </div>
      )}
    </div>
  );
}
