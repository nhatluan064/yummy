"use client";

import { useEffect, useMemo, useState } from "react";
import { billService } from "@/lib/sdk";
import { orderService } from "@/lib/order.service";
import { feedbackService } from "@/lib/feedback.service";
import { reservationService } from "@/lib/reservation.service";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WithId } from "@/lib/firestore.service";
import type { Bill, Order, Feedback, TableReservation } from "@/lib/types";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"last-7-days" | "month" | "year">("year");
  const [bills, setBills] = useState<WithId<Bill>[]>([]);
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [feedbacks, setFeedbacks] = useState<WithId<Feedback>[]>([]);
  const [reservations, setReservations] = useState<WithId<TableReservation>[]>([]);
  
  // State riêng cho phần Đơn Hàng - hiển thị tất cả từ trước đến nay
  const [allBills, setAllBills] = useState<WithId<Bill>[]>([]);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  useEffect(() => {
    const now = new Date();
    let start: Date, end: Date;
    
    if (timeRange === "last-7-days") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (timeRange === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
    }
    
    // Realtime subscriptions for instant updates
    const unsubscribeBills = billService.subscribeAll(
      [billService.by("completedAt", ">=", start), billService.by("completedAt", "<", end), billService.take(200)],
      (billsData) => setBills(billsData)
    );
    
    const unsubscribeOrders = orderService.subscribeAll(
      [orderService.by("createdAt", ">=", start), orderService.by("createdAt", "<", end), orderService.take(200)],
      (ordersData) => setOrders(ordersData.filter(o => o.status === "completed"))
    );
    
    const unsubscribeFeedbacks = feedbackService.subscribeAll(
      [feedbackService.by("createdAt", ">=", start), feedbackService.by("createdAt", "<", end)],
      (feedbacksData) => setFeedbacks(feedbacksData)
    );
    
    const unsubscribeReservations = reservationService.subscribeAll(
      [reservationService.by("createdAt", ">=", start), reservationService.by("createdAt", "<", end)],
      (reservationsData) => setReservations(reservationsData)
    );
    
    return () => {
      unsubscribeBills();
      unsubscribeOrders();
      unsubscribeFeedbacks();
      unsubscribeReservations();
    };
  }, [timeRange]);

  // useEffect riêng để subscribe TẤT CẢ bills cho phần Đơn Hàng (realtime)
  useEffect(() => {
    const unsubscribe = billService.subscribeAll(
      [billService.take(500)],
      (billsData) => setAllBills(billsData)
    );
    
    return () => unsubscribe();
  }, []);

  const metrics = useMemo(() => {
    const revenue = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const dineInOrders = orders.filter(o => o.orderType === "dine-in").length;
    const takeawayOrders = orders.filter(o => o.orderType === "takeaway").length;
    const deliveryOrders = orders.filter(o => o.orderType === "delivery").length;
    
    let label = "";
    if (timeRange === "last-7-days") label = "Doanh Thu 7 Ngày Gần Nhất";
    else if (timeRange === "month") label = "Doanh Thu Tháng Này";
    else label = "Doanh Thu Năm Nay";
    
    return { revenue, revenueLabel: label, totalOrders: orders.length, totalFeedbacks: feedbacks.length, 
             totalReservations: reservations.length, dineInOrders, takeawayOrders, deliveryOrders };
  }, [bills, orders, feedbacks, reservations, timeRange]);

  const revenueChartData = useMemo(() => {
    if (timeRange === "last-7-days") {
      const now = new Date();
      const revenueByDay: Record<string, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts) {
          const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
        }
      });
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
        const dateKey = day.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        return { date: dateKey, revenue: revenueByDay[dateKey] || 0 };
      });
    } else if (timeRange === "month") {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const revenueByDay: Record<string, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts) {
          const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
        }
      });
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(now.getFullYear(), now.getMonth(), i + 1);
        const dateKey = day.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        return { date: dateKey, revenue: revenueByDay[dateKey] || 0 };
      });
    } else {
      const now = new Date();
      const revenueByMonth: Record<number, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts && ts.getFullYear() === now.getFullYear()) {
          const month = ts.getMonth();
          revenueByMonth[month] = (revenueByMonth[month] || 0) + (bill.totalAmount || 0);
        }
      });
      return Array.from({ length: 12 }, (_, i) => ({
        date: `Tháng ${i + 1}`,
        revenue: revenueByMonth[i] || 0
      }));
    }
  }, [bills, timeRange]);

  const sortedBills = useMemo(() => [...bills].sort((a, b) => {
    const aVal = (a.completedAt as { toDate?: () => Date })?.toDate?.() || new Date(0);
    const bVal = (b.completedAt as { toDate?: () => Date })?.toDate?.() || new Date(0);
    return bVal.getTime() - aVal.getTime();
  }), [bills]);

  const COLORS = ['#8B5CF6', '#F97316', '#EC4899'];
  const statsData = [
    { name: 'Orders tại bàn', value: metrics.dineInOrders, color: COLORS[0] },
    { name: 'Orders mang đi', value: metrics.takeawayOrders, color: COLORS[1] },
    { name: 'Orders Ship', value: metrics.deliveryOrders, color: COLORS[2] },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-800">Dashboard Tổng Quan</h1>
          <p className="text-neutral-600 mt-1 text-sm md:text-base">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500">
            <option value="last-7-days">7 Ngày Gần Nhất</option>
            <option value="month">Tháng Này</option>
            <option value="year">Năm Nay</option>
          </select>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Làm mới dữ liệu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-primary-700 font-medium mb-1">Doanh Thu</p>
          <p className="text-2xl font-bold text-primary-900">{metrics.revenue.toLocaleString('vi-VN')} VNĐ</p>
          <p className="text-xs text-primary-600">{bills.length} đơn</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-700 font-medium mb-1">Đơn Hàng</p>
          <p className="text-2xl font-bold text-green-900">{metrics.totalOrders}</p>
          <div className="space-y-1 mt-2 pt-2 border-t border-green-200">
            <div className="flex justify-between text-xs"><span className="text-green-600">Tại bàn</span><span className="font-semibold">{metrics.dineInOrders}</span></div>
            <div className="flex justify-between text-xs"><span className="text-green-600">Mang đi</span><span className="font-semibold">{metrics.takeawayOrders}</span></div>
            <div className="flex justify-between text-xs"><span className="text-green-600">Ship</span><span className="font-semibold">{metrics.deliveryOrders}</span></div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-amber-700 font-medium mb-1">Feedback</p>
          <p className="text-2xl font-bold text-amber-900">{metrics.totalFeedbacks}</p>
          <p className="text-xs text-amber-600">Phản hồi</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-blue-700 font-medium mb-1">Đặt Bàn</p>
          <p className="text-2xl font-bold text-blue-900">{metrics.totalReservations}</p>
          <p className="text-xs text-blue-600">Lịch đặt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">📊 {metrics.revenueLabel}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" tickFormatter={(value: number) => `${value.toLocaleString('vi-VN')}`} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => `${value.toLocaleString('vi-VN')}₫`} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">🥧 Phân Bổ Hoạt Động</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statsData} cx="50%" cy="50%" labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                label={(props: any) => {
                  const RADIAN = Math.PI / 180;
                  const radius = props.outerRadius + 30;
                  const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                  const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
                  return <text x={x} y={y} fill="#374151" textAnchor={x > props.cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-semibold">
                    {`${props.name}: ${(props.percent * 100).toFixed(1)}%`}
                  </text>;
                }}
                outerRadius={90} fill="#8884d8" dataKey="value">
                {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Số lượng']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-neutral-800 mb-4">
          📦 Đơn Hàng Tổng Hợp
        </h3>
        <div className="space-y-4">
          {(() => {
            // Nhóm bills theo năm và tháng
            const billsByYear: Record<number, Record<number, WithId<Bill>[]>> = {};
            allBills.forEach((bill) => {
              const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
              if (ts) {
                const year = ts.getFullYear();
                const month = ts.getMonth();
                if (!billsByYear[year]) billsByYear[year] = {};
                if (!billsByYear[year][month]) billsByYear[year][month] = [];
                billsByYear[year][month].push(bill);
              }
            });

            // Sắp xếp năm giảm dần (mới nhất trước)
            const sortedYears = Object.keys(billsByYear).map(Number).sort((a, b) => b - a);

            return sortedYears.map((year) => {
              const isExpanded = expandedYears.has(year);
              const yearBills = Object.values(billsByYear[year]).flat();
              const yearRevenue = yearBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
              
              return (
                <div key={year} className="border border-neutral-200 rounded-lg overflow-hidden">
                  {/* Header năm - Click để mở/đóng */}
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedYears);
                      if (isExpanded) newExpanded.delete(year);
                      else newExpanded.add(year);
                      setExpandedYears(newExpanded);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 text-neutral-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-bold text-neutral-800">📅 Năm {year}</span>
                      <span className="text-sm text-neutral-600">({yearBills.length} đơn)</span>
                    </div>
                    <div className="font-bold text-primary-700">{yearRevenue.toLocaleString('vi-VN')}₫</div>
                  </button>

                  {/* Nội dung các tháng */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {Object.keys(billsByYear[year]).map(Number).sort((a, b) => b - a).map((month) => {
                        const monthBills = billsByYear[year][month];
                        const monthRevenue = monthBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                        const monthName = new Date(year, month).toLocaleDateString('vi-VN', { month: 'long' });
                        
                        return (
                          <div key={month} className="border-l-4 border-primary-200 pl-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-neutral-700">🗓️ {monthName}</h4>
                              <div className="text-sm">
                                <span className="font-semibold text-primary-600">{monthRevenue.toLocaleString('vi-VN')}₫</span>
                                <span className="text-neutral-500 ml-2">({monthBills.length} đơn)</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {monthBills.sort((a, b) => {
                                const aTime = (a.completedAt as { toDate?: () => Date })?.toDate?.()?.getTime() || 0;
                                const bTime = (b.completedAt as { toDate?: () => Date })?.toDate?.()?.getTime() || 0;
                                return bTime - aTime;
                              }).map((bill) => {
                                const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
                                const dateStr = ts ? ts.toLocaleDateString("vi-VN") : "";
                                const timeStr = ts ? ts.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "";
                                
                                return (
                                  <div key={bill.id} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary-600 text-sm">{bill.orderCode ?? bill.orderId}</span>
                                        <span className="text-xs text-neutral-500">•</span>
                                        <span className="text-xs font-medium text-neutral-600">{dateStr} {timeStr}</span>
                                        {bill.tableNumber && (<><span className="text-xs text-neutral-500">•</span><span className="text-xs font-medium text-neutral-600">🪑 {bill.tableNumber}</span></>)}
                                      </div>
                                      <div className="font-bold text-primary-700">{(bill.totalAmount || 0).toLocaleString()}₫</div>
                                    </div>
                                    {bill.customerName && <div className="text-xs text-neutral-600 mb-2">👤 {bill.customerName}</div>}
                                    <div className="bg-white rounded p-2 mt-2">
                                      <div className="text-xs font-semibold text-neutral-700 mb-1">Món ăn:</div>
                                      <div className="space-y-1">
                                        {bill.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-neutral-600"><span className="font-medium text-neutral-800">{item.quantity}x</span> {item.name}</span>
                                            <span className="text-neutral-700 font-medium">{(item.price * item.quantity).toLocaleString()}₫</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
          {allBills.length === 0 && <div className="text-center py-8 text-neutral-500">Không có đơn hàng nào</div>}
        </div>
      </div>
    </div>
  );
}
