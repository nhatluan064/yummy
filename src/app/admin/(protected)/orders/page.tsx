"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService, billService } from "@/lib/sdk";
import { tableService } from "@/lib/table.service";
import type { Order } from "@/lib/types";
import type { WithId } from "@/lib/firestore.service";
import type { OrderItem } from "@/lib/types";

type UIOrder = WithId<Order>;

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
  const [orders, setOrders] = useState<UIOrder[]>([]);
  
  // Date filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "this-week" | "this-month" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Expand/collapse state for date groups
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = orderService.subscribeToOrders((updatedOrders) => {
      // Chỉ lấy đơn đã hoàn thành
      const completedOrders = updatedOrders.filter(o => o.status === "completed");
      setOrders(completedOrders);
    });

    return () => unsubscribe();
  }, []);

  // Get order type label and color
  const getOrderTypeLabel = (orderType?: string) => {
    switch (orderType) {
      case "dine-in":
        return { label: "🏠 Đơn tại bàn", color: "purple" };
      case "takeaway":
        return { label: "🛍️ Mang đi", color: "orange" };
      case "delivery":
        return { label: "🚚 Ship", color: "pink" };
      default:
        return { label: "📦 Đơn hàng", color: "blue" };
    }
  };

  // Date filter helper
  const matchesDateFilter = (order: UIOrder) => {
    const ts = order.createdAt as unknown as { toDate?: () => Date } | undefined;
    const orderDate = ts?.toDate ? ts.toDate() : new Date();
    const now = new Date();
    
    switch (dateFilter) {
      case "today":
        return orderDate.toDateString() === now.toDateString();
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      case "this-week":
        // Bắt đầu từ Thứ 2 (Monday)
        const weekStart = new Date(now);
        const dayOfWeek = now.getDay(); // 0 (CN) -> 6 (T7)
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Nếu CN thì lùi 6 ngày, còn lại lùi (dayOfWeek - 1) ngày
        weekStart.setDate(now.getDate() - daysToMonday);
        weekStart.setHours(0, 0, 0, 0);
        return orderDate >= weekStart;
      case "this-month":
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      case "custom":
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate) : new Date(0);
        const end = customEndDate ? new Date(customEndDate) : new Date();
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      case "all":
      default:
        return true;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      (order.orderCode ?? order.id)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.totalAmount?.toString().includes(searchQuery);
    const matchesDate = matchesDateFilter(order);
    
    return matchesSearch && matchesDate;
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
  
  // Toggle expand/collapse for a date
  const toggleDateExpand = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };
  
  // Calculate total revenue for a date
  const getDateTotal = (dateKey: string) => {
    return groupedOrders[dateKey].reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  };

  // Check and reset table if no more pending orders
  const checkAndResetTable = async (tableNumber: string) => {
    try {
      // Fetch latest orders from Firebase to check if any pending orders exist
      const allOrders = await orderService.getAll([
        orderService.by('tableNumber', '==', tableNumber),
        orderService.by('status', '==', 'pending')
      ]);
      
      // If no pending orders, reset table to empty
      if (allOrders.length === 0) {
        const tables = await tableService.getAllTables();
        const table = tables.find((t) => t.tableNumber === tableNumber);
        if (table?.id && table.status === "occupied") {
          await tableService.updateTableStatus(table.id, "empty");
        }
      }
    } catch (error) {
      console.error("Error checking table status:", error);
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
    
    // If cancelled, check if table should be reset
    if (newStatus === "cancelled" && current?.tableNumber) {
      await checkAndResetTable(current.tableNumber);
    }
    
    // No need to manually refresh orders as subscription will handle it
  };

  const deleteOrder = async (orderId: string, orderCode: string) => {
    const confirmed = confirm(
      `⚠️ XÓA ĐỠN HÀNG\n\nBạn có chắc chắn muốn xóa đơn hàng ${orderCode}?\n\n🚨 CẢNH BÁO: Hành động này KHÔNG THỂ KHÔI PHỤC!\nĐơn hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.`
    );
    
    if (!confirmed) return;
    
    try {
      // Get order info before deleting
      const orderToDelete = orders.find((o) => o.id === orderId);
      const tableNumber = orderToDelete?.tableNumber;
      
      await orderService.delete(orderId);
      
      // Check and reset table if needed
      if (tableNumber) {
        await checkAndResetTable(tableNumber);
      }
      
      // Subscription will auto-update the list
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Không thể xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  const deleteBill = async (orderId: string, orderCode: string) => {
    const confirmed = confirm(
      `⚠️ XÓA BILL & ORDER\n\nBạn có chắc chắn muốn xóa Bill và Order ${orderCode}?\n\n🚨 CẢNH BÁO: Hành động này KHÔNG THỂ KHÔI PHỤC!\n- Bill sẽ bị xóa (doanh thu giảm)\n- Order sẽ bị xóa vĩnh viễn`
    );
    
    if (!confirmed) return;
    
    try {
      // Delete bill from Firebase
      await billService.delete(orderId);
      
      // Delete order from Firebase
      await orderService.delete(orderId);
      
      // Remove order from local state immediately for instant UI update
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
      
      alert("✓ Đã xóa Bill và Order thành công!");
    } catch (error) {
      console.error("Failed to delete bill/order:", error);
      alert("Không thể xóa. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Quản lý đơn hàng
          </h1>
          <p className="text-neutral-600 mt-1">
            Đơn hàng đã hoàn thành
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo mã đơn, ngày hoặc giá tiền..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

          {/* Filter Button */}
          <button 
            onClick={() => setShowFilterModal(true)}
            className="btn-secondary relative whitespace-nowrap"
          >
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
            {dateFilter !== "all" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="space-y-8">
        {sortedDateKeys.map((dateKey) => {
          const isExpanded = expandedDates[dateKey] === true; // Default false (collapsed)
          const dateTotal = getDateTotal(dateKey);
          
          return (
          <div key={dateKey} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => toggleDateExpand(dateKey)}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                title={isExpanded ? "Thu gọn" : "Mở rộng"}
              >
                <svg
                  className={`w-5 h-5 text-neutral-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <h2 className="text-sm sm:text-base font-bold text-neutral-800">
                {formatDateHeader(dateKey)}
              </h2>
              <div className="flex-1 h-px bg-neutral-200"></div>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="text-[10px] sm:text-xs text-neutral-500 bg-neutral-100 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                  {groupedOrders[dateKey].length} đơn hàng
                </span>
                <span className="text-xs sm:text-sm font-bold text-primary-600 bg-primary-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-primary-200 whitespace-nowrap">
                  {dateTotal.toLocaleString()}₫
                </span>
              </div>
            </div>

            {/* Orders for this date */}
            {isExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupedOrders[dateKey].map((order) => {
                const orderDate = typeof order.createdAt === 'object' && order.createdAt && 'toDate' in order.createdAt
                  ? order.createdAt.toDate()
                  : order.createdAt ? new Date(order.createdAt) : new Date();
                const orderTypeInfo = getOrderTypeLabel(order.orderType);
                return (
                <div
                  key={order.id}
                  className="card p-2.5 hover:shadow-lg transition-all duration-200 relative"
                >
                  {/* Order Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-${orderTypeInfo.color}-100 text-${orderTypeInfo.color}-700 border border-${orderTypeInfo.color}-200`}>
                      {orderTypeInfo.label}
                    </span>
                  </div>

                  {/* Order Code */}
                  <div className="mb-1.5 pr-24">
                    <h3 className="text-sm font-bold text-primary-600">
                      {order.orderCode ?? order.id}
                    </h3>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-1">
                    <p className="text-xs text-neutral-600">
                      {(() => {
                        const ts = order.createdAt as unknown as { toDate?: () => Date } | undefined;
                        const date = ts?.toDate ? ts.toDate() : new Date();
                        const dateStr = date.toLocaleDateString("vi-VN");
                        const timeStr = date.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return `${dateStr} - ${timeStr}`;
                      })()}
                    </p>
                  </div>

                  {/* Table Info */}
                  <div className="mb-2 pb-1.5 border-b border-neutral-200">
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold">Bàn:</span>{" "}
                      {order.orderType === "dine-in" 
                        ? (order.tableNumber || "-")
                        : order.orderType === "takeaway"
                        ? "Take a way"
                        : order.orderType === "delivery"
                        ? "Shiper"
                        : (order.tableNumber || "-")
                      }
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="mb-2 space-y-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[11px]"
                      >
                        <span className="text-neutral-700 truncate flex-1">
                          {item.name}
                        </span>
                        <span className="text-neutral-600 flex-shrink-0">
                          x{item.quantity}
                        </span>
                        <span className="font-semibold text-neutral-800 flex-shrink-0 min-w-[65px] text-right">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-700">
                        Tổng cộng:
                      </span>
                      <span className="text-base font-bold text-primary-600">
                        {(order.totalAmount ?? 0).toLocaleString()}₫
                      </span>
                    </div>
                  </div>

                  {/* Delete Bill Button for Completed Orders */}
                  {order.status === "completed" && (
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBill(order.id!, order.orderCode ?? order.id!);
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        title="Xóa Bill"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa Bill
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status !== "completed" &&
                    order.status !== "cancelled" && (
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex gap-1.5">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, "preparing");
                              }}
                              className="flex-1 btn-primary text-xs py-1.5"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, "cancelled");
                              }}
                              className="px-3 btn-secondary text-xs py-1.5"
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
                            className="flex-1 btn-primary text-xs py-1.5"
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
                            className="flex-1 btn-primary text-xs py-1.5"
                          >
                            Thanh toán xong
                          </button>
                        )}
                      </div>
                    )}
                </div>
              );
              })}
            </div>
            )}
          </div>
          );
        })}
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

      {/* Date Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Lọc theo thời gian</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { value: "all", label: "Tất cả" },
                { value: "today", label: "Hôm nay" },
                { value: "yesterday", label: "Hôm qua" },
                { value: "this-week", label: "Tuần này" },
                { value: "this-month", label: "Tháng này" },
                { value: "custom", label: "Tùy chỉnh" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDateFilter(option.value as "all" | "today" | "yesterday" | "this-week" | "this-month" | "custom");
                    if (option.value !== "custom") {
                      setShowFilterModal(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    dateFilter === option.value
                      ? "bg-primary-500 text-white font-semibold"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {dateFilter === "custom" && (
              <div className="mt-4 space-y-3 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full btn-primary"
                >
                  Áp dụng
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex gap-2">
              <button
                onClick={() => {
                  setDateFilter("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setShowFilterModal(false);
                }}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium text-neutral-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
