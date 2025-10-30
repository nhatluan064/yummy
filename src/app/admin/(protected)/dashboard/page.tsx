"use client";

import { useEffect, useMemo, useState } from "react";
import { billService } from "@/lib/sdk";
import { orderService } from "@/lib/order.service";
import { feedbackService } from "@/lib/feedback.service";
import { reservationService } from "@/lib/reservation.service";
import { contactService } from "@/lib/contact.service";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WithId } from "@/lib/firestore.service";
import type { Bill, Order, Feedback, TableReservation, Contact } from "@/lib/types";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "year"
  >("month");
  const [bills, setBills] = useState<WithId<Bill>[]>([]);
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [feedbacks, setFeedbacks] = useState<WithId<Feedback>[]>([]);
  const [reservations, setReservations] = useState<WithId<TableReservation>[]>([]);
  const [contacts, setContacts] = useState<WithId<Contact>[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(""); // yyyy-mm-dd

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
    const billConstraints = [
      billService.by("completedAt", ">=", start),
      billService.by("completedAt", "<", end),
      billService.take(50),
    ];
    const orderConstraints = [
      orderService.by("createdAt", ">=", start),
      orderService.by("createdAt", "<", end),
      orderService.take(50),
    ];
    const feedbackConstraints = [
      feedbackService.by("createdAt", ">=", start),
      feedbackService.by("createdAt", "<", end),
      feedbackService.take(50),
    ];
    const reservationConstraints = [
      reservationService.by("createdAt", ">=", start),
      reservationService.by("createdAt", "<", end),
      reservationService.take(50),
    ];
    const contactConstraints = [
      contactService.by("createdAt", ">=", start),
      contactService.by("createdAt", "<", end),
      contactService.take(50),
    ];
    
    Promise.all([
      billService.getAll(billConstraints),
      orderService.getAll(orderConstraints),
      feedbackService.getAll(feedbackConstraints),
      reservationService.getAll(reservationConstraints),
      contactService.getAll(contactConstraints),
    ]).then(([billsData, ordersData, feedbacksData, reservationsData, contactsData]) => {
      setBills(billsData);
      setOrders(ordersData);
      setFeedbacks(feedbacksData);
      setReservations(reservationsData);
      setContacts(contactsData);
    }).catch(console.error);
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
      totalOrders: orders.length,
      totalFeedbacks: feedbacks.length,
      totalReservations: reservations.length,
      totalContacts: contacts.length,
      customers,
    };
  }, [bills, orders, feedbacks, reservations, contacts, selectedDate, timeRange]);

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      const aVal = (a.completedAt as { toDate?: () => Date })?.toDate?.() || new Date(0);
      const bVal = (b.completedAt as { toDate?: () => Date })?.toDate?.() || new Date(0);
      // Sort descending (newest first)
      return bVal.getTime() - aVal.getTime();
    });
  }, [bills]);

  // Chart data - Daily revenue
  const dailyRevenueData = useMemo(() => {
    const revenueByDay: Record<string, number> = {};
    bills.forEach((bill) => {
      const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
      if (ts) {
        const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
      }
    });
    return Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-7); // Last 7 days
  }, [bills]);

  // Pie chart data - Stats distribution (no menu items)
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const statsData = [
    { name: 'Đơn hàng', value: metrics.totalOrders, color: COLORS[0] },
    { name: 'Feedback', value: metrics.totalFeedbacks, color: COLORS[1] },
    { name: 'Đặt bàn', value: metrics.totalReservations, color: COLORS[2] },
    { name: 'Liên hệ', value: metrics.totalContacts, color: COLORS[3] },
  ].filter(item => item.value > 0); // Only show items with values
  
  // Calculate total for percentage
  const totalStats = statsData.reduce((sum, item) => sum + item.value, 0);

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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-primary-700 font-medium mb-1">Doanh Thu</p>
          <p className="text-2xl font-bold text-primary-900 mb-1">
            {(metrics.revenue / 1000).toFixed(0)}K₫
          </p>
          <p className="text-xs text-primary-600">{bills.length} đơn</p>
        </div>

        {/* Orders Card */}
        <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-700 font-medium mb-1">Đơn Hàng</p>
          <p className="text-2xl font-bold text-green-900 mb-1">{metrics.totalOrders}</p>
          <p className="text-xs text-green-600">Tổng đơn</p>
        </div>

        {/* Feedback Card */}
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-amber-700 font-medium mb-1">Feedback</p>
          <p className="text-2xl font-bold text-amber-900 mb-1">{metrics.totalFeedbacks}</p>
          <p className="text-xs text-amber-600">Phản hồi</p>
        </div>

        {/* Reservations Card */}
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-blue-700 font-medium mb-1">Đặt Bàn</p>
          <p className="text-2xl font-bold text-blue-900 mb-1">{metrics.totalReservations}</p>
          <p className="text-xs text-blue-600">Lịch đặt</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Daily Revenue */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">📊 Doanh Thu Theo Ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => `${value.toLocaleString()}₫`}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Stats Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">🥧 Phân Bổ Hoạt Động</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#9ca3af',
                  strokeWidth: 1,
                }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 30;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="#374151"
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="text-sm font-semibold"
                    >
                      {`${name}: ${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, 'Số lượng']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value: string) => {
                  const item = statsData.find(d => d.name === value);
                  return `${value} (${item?.value || 0})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders List */}
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-neutral-800">
            📦 {selectedDate 
              ? `Đơn Hàng Ngày ${new Date(selectedDate).toLocaleDateString("vi-VN")}`
              : timeRange === "today"
              ? "Đơn Hàng Hôm Nay"
              : timeRange === "week"
              ? "Đơn Hàng Tuần Này"
              : timeRange === "month"
              ? "Đơn Hàng Tháng Này"
              : "Đơn Hàng Năm Này"}
          </h3>
        </div>
        <div className="space-y-4">
          {(() => {
            // Nhóm bills theo ngày
            const billsByDate: Record<string, WithId<Bill>[]> = {};
            sortedBills.forEach((bill) => {
              const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
              if (ts) {
                const dateKey = ts.toLocaleDateString("vi-VN");
                if (!billsByDate[dateKey]) {
                  billsByDate[dateKey] = [];
                }
                billsByDate[dateKey].push(bill);
              }
            });

            return Object.entries(billsByDate).map(([dateKey, dayBills], index) => (
              <div key={dateKey}>
                {index > 0 && <hr className="my-4 border-neutral-300" />}
                
                {/* Ngày */}
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-neutral-700 bg-neutral-100 inline-block px-3 py-1 rounded">
                    📅 {dateKey}
                  </h4>
                </div>

                {/* Bills trong ngày - thụt vào */}
                <div className="ml-6 space-y-3">
                  {dayBills.map((bill) => {
                    const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
                    const timeStr = ts ? ts.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "";
                    
                    return (
                      <div key={bill.id} className="border border-neutral-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary-600 text-sm">
                              {bill.orderCode ?? bill.orderId}
                            </span>
                            <span className="text-xs text-neutral-500">•</span>
                            <span className="text-xs font-medium text-neutral-600">
                              🕐 {timeStr}
                            </span>
                            {bill.tableNumber && (
                              <>
                                <span className="text-xs text-neutral-500">•</span>
                                <span className="text-xs font-medium text-neutral-600">
                                  🪑 {bill.tableNumber}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="font-bold text-primary-700">
                            {(bill.totalAmount || 0).toLocaleString()}₫
                          </div>
                        </div>
                        
                        {bill.customerName && (
                          <div className="text-xs text-neutral-600 mb-2">
                            👤 {bill.customerName}
                          </div>
                        )}
                        
                        {/* Chi tiết món ăn */}
                        <div className="bg-neutral-50 rounded p-2 mt-2">
                          <div className="text-xs font-semibold text-neutral-700 mb-1">Món ăn:</div>
                          <div className="space-y-1">
                            {bill.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-neutral-600">
                                  <span className="font-medium text-neutral-800">{item.quantity}x</span> {item.name}
                                </span>
                                <span className="text-neutral-700 font-medium">
                                  {(item.price * item.quantity).toLocaleString()}₫
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
          
          {sortedBills.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              Không có đơn hàng nào trong khoảng thời gian này
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
