"use client";

import { useEffect, useMemo, useState } from "react";
import { billService } from "@/lib/sdk";
import type { WithId } from "@/lib/firestore.service";
import type { Bill } from "@/lib/types";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "year"
  >("today");
  const [bills, setBills] = useState<WithId<Bill>[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(""); // yyyy-mm-dd
  const [sortColumn, setSortColumn] = useState<
    "orderCode" | "customerName" | "totalAmount" | "completedAt"
  >("completedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date | undefined = undefined;
    if (selectedDate) {
      // Nếu chọn ngày cụ thể, lọc đúng ngày đó
      start = new Date(selectedDate);
      end = new Date(selectedDate);
      end.setDate(end.getDate() + 1);
    } else {
      if (timeRange === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === "week") {
        const day = now.getDay() || 7;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day + 1
        );
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }
    }
    // Query theo khoảng [start, end)
    const constraints = [
      billService.by("completedAt", ">=", start),
      billService.by("completedAt", "<", end),
      billService.take(50),
    ];
    billService.getAll(constraints).then(setBills).catch(console.error);
  }, [timeRange, selectedDate]);

  const metrics = useMemo(() => {
    let revenue = 0;
    let label = "";
    const customers = new Set(bills.map((b) => b.customerName)).size;
    const now = new Date();
    if (selectedDate) {
      // Tính doanh thu đúng ngày đã chọn
      const target = new Date(selectedDate);
      const isSameDay = (d: Date, e: Date) =>
        d.getFullYear() === e.getFullYear() &&
        d.getMonth() === e.getMonth() &&
        d.getDate() === e.getDate();
      revenue = bills
        .filter((b) => {
          const ts = (
            b.completedAt as unknown as { toDate?: () => Date }
          )?.toDate?.();
          if (!ts) return false;
          return isSameDay(ts, target);
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      // Định dạng dd/mm/yyyy
      const ddmmyyyy = target.toLocaleDateString("vi-VN");
      label = `Doanh Thu ${ddmmyyyy}`;
    } else {
      // Tính doanh thu theo timeRange
      if (timeRange === "today") {
        const isSameDay = (d: Date, e: Date) =>
          d.toDateString() === e.toDateString();
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return isSameDay(ts, now);
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Hôm Nay";
      } else if (timeRange === "week") {
        // Tuần này
        const firstDayOfWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - (now.getDay() || 7) + 1
        );
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfWeek && ts < lastDayOfWeek;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Tuần này";
      } else if (timeRange === "month") {
        // Tháng này
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfMonth && ts < nextMonth;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Tháng này";
      } else if (timeRange === "year") {
        // Năm này
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfYear && ts < nextYear;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Năm này";
      }
    }
    return {
      revenue,
      revenueLabel: label,
      newOrders: 0,
      reservations: 0,
      customers,
    };
  }, [bills, selectedDate, timeRange]);

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;
      switch (sortColumn) {
        case "orderCode":
          aVal = a.orderCode ?? a.orderId ?? "";
          bVal = b.orderCode ?? b.orderId ?? "";
          break;
        case "customerName":
          aVal = a.customerName ?? "";
          bVal = b.customerName ?? "";
          break;
        case "totalAmount":
          aVal = a.totalAmount || 0;
          bVal = b.totalAmount || 0;
          break;
        case "completedAt":
          aVal =
            (a.completedAt as unknown as { toDate?: () => Date })?.toDate?.() ||
            new Date(0);
          bVal =
            (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.() ||
            new Date(0);
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [bills, sortColumn, sortDirection]);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-800">
            Dashboard Tổng Quan
          </h1>
          <p className="text-neutral-600 mt-1 text-sm md:text-base">
            Theo dõi hoạt động kinh doanh của bạn
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            aria-label="Chọn khoảng thời gian"
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setTimeRange(
                e.target.value as "today" | "week" | "month" | "year"
              );
              setSelectedDate(""); // reset date khi chọn lại dropdown
            }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
            max={new Date().toISOString().slice(0, 10)}
          />
          <button className="btn-primary text-sm px-4 py-2 w-full sm:w-auto">
            <svg
              className="w-4 h-4 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="card p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-600 mb-1">
            {metrics.revenueLabel}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            {metrics.revenue.toLocaleString()}₫
          </p>
        </div>
        <div className="card p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-600 mb-1">
            Đơn Hoàn Tất (gần đây)
          </p>
          <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            {bills.length}
          </p>
        </div>
        <div className="card p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-600 mb-1">Khách Hàng</p>
          <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            {metrics.customers}
          </p>
        </div>
        <div className="card p-4 md:p-6">
          <p className="text-xs md:text-sm text-neutral-600 mb-1">Đơn mới</p>
          <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            —
          </p>
        </div>
      </div>

      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-neutral-800">
            Đơn Hàng Gần Đây
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th
                  className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-neutral-600 cursor-pointer hover:text-neutral-800"
                  onClick={() => handleSort("orderCode")}
                >
                  Mã Đơn{" "}
                  {sortColumn === "orderCode" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-neutral-600 cursor-pointer hover:text-neutral-800"
                  onClick={() => handleSort("customerName")}
                >
                  Khách Hàng{" "}
                  {sortColumn === "customerName" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-neutral-600">
                  Món Ăn
                </th>
                <th
                  className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-neutral-600 cursor-pointer hover:text-neutral-800"
                  onClick={() => handleSort("totalAmount")}
                >
                  Tổng Tiền{" "}
                  {sortColumn === "totalAmount" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-neutral-600 cursor-pointer hover:text-neutral-800"
                  onClick={() => handleSort("completedAt")}
                >
                  Thời Gian{" "}
                  {sortColumn === "completedAt" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBills.map((b) => (
                <tr key={b.id} className="border-b border-neutral-100">
                  <td className="py-3 md:py-4 px-2 md:px-4">
                    <span className="font-medium text-primary-600 text-sm">
                      {b.orderCode ?? b.orderId}
                    </span>
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-sm">
                    {b.customerName}
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-neutral-600">
                    {b.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 font-medium text-sm">
                    {(b.totalAmount || 0).toLocaleString()}₫
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm text-neutral-500">
                    {(() => {
                      const ts = (
                        b.completedAt as unknown as { toDate?: () => Date }
                      )?.toDate?.();
                      return ts ? ts.toLocaleString() : "";
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
