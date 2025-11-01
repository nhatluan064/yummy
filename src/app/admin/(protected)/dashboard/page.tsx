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
    "today" | "yesterday" | "week" | "last-week" | "month" | "last-month" | "year" | "last-year"
  >("month");
  const [bills, setBills] = useState<WithId<Bill>[]>([]);
  const [orders, setOrders] = useState<WithId<Order>[]>([]);
  const [feedbacks, setFeedbacks] = useState<WithId<Feedback>[]>([]);
  const [reservations, setReservations] = useState<WithId<TableReservation>[]>([]);
  const [contacts, setContacts] = useState<WithId<Contact>[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(""); // yyyy-mm-dd
  
  // Drill-down history for back button
  const [drillHistory, setDrillHistory] = useState<Array<{timeRange: string, selectedDate: string}>>([]);
  
  // Handle back navigation
  const handleBack = () => {
    if (drillHistory.length > 0) {
      const previous = drillHistory[drillHistory.length - 1];
      setTimeRange(previous.timeRange as any);
      setSelectedDate(previous.selectedDate);
      setDrillHistory(drillHistory.slice(0, -1));
    }
  };

  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date | undefined = undefined;
    if (selectedDate) {
      // Nếu chọn ngày cụ thể
      start = new Date(selectedDate);
      
      // Nếu là ngày 1 của tháng, query cả tháng đó
      if (start.getDate() === 1) {
        end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      } else {
        // Nếu không, query chỉ ngày đó
        end = new Date(selectedDate);
        end.setDate(end.getDate() + 1);
      }
    } else {
      if (timeRange === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === "yesterday") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (timeRange === "week") {
        const day = now.getDay() || 7;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day + 1
        );
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === "last-week") {
        const day = now.getDay() || 7;
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day - 6
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day + 1
        );
      } else if (timeRange === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (timeRange === "last-month") {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeRange === "year") {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      } else {
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear(), 0, 1);
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
      orderService.take(200),
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
      // Filter orders to only show completed ones
      const completedOrders = ordersData.filter(o => o.status === "completed");
      setOrders(completedOrders);
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
    
    // Đếm số lượng đơn hàng theo loại
    const dineInOrders = orders.filter(o => o.orderType === "dine-in").length;
    const takeawayOrders = orders.filter(o => o.orderType === "takeaway").length;
    const deliveryOrders = orders.filter(o => o.orderType === "delivery").length;
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
      } else if (timeRange === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isSameDay = (d: Date, e: Date) =>
          d.toDateString() === e.toDateString();
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return isSameDay(ts, yesterday);
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Hôm Qua";
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
      } else if (timeRange === "last-week") {
        // Tuần trước
        const day = now.getDay() || 7;
        const firstDayOfLastWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day - 6
        );
        const lastDayOfLastWeek = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day + 1
        );
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfLastWeek && ts < lastDayOfLastWeek;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Tuần trước";
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
      } else if (timeRange === "last-month") {
        // Tháng trước
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfLastMonth && ts < firstDayOfThisMonth;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Tháng trước";
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
      } else if (timeRange === "last-year") {
        // Năm trước
        const firstDayOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const firstDayOfThisYear = new Date(now.getFullYear(), 0, 1);
        revenue = bills
          .filter((b) => {
            const ts = (
              b.completedAt as unknown as { toDate?: () => Date }
            )?.toDate?.();
            if (!ts) return false;
            return ts >= firstDayOfLastYear && ts < firstDayOfThisYear;
          })
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = "Doanh Thu Năm trước";
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
      dineInOrders,
      takeawayOrders,
      deliveryOrders,
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

  // Chart data - Revenue by time range
  const revenueChartData = useMemo(() => {
    console.log('Calculating chart data. timeRange:', timeRange, 'selectedDate:', selectedDate, 'bills:', bills.length);
    
    // Nếu selectedDate là ngày 1, hiển thị tất cả ngày trong tháng đó
    if (selectedDate) {
      const targetDate = new Date(selectedDate);
      console.log('Target date:', targetDate, 'Is day 1:', targetDate.getDate() === 1);
      
      if (targetDate.getDate() === 1) {
        // Hiển thị tất cả ngày trong tháng
        const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const revenueByDay: Record<string, number> = {};
        bills.forEach((bill) => {
          const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
          if (ts) {
            const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
            revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
          }
        });
        return Array.from({ length: daysInMonth }, (_, i) => {
          const day = new Date(targetDate.getFullYear(), targetDate.getMonth(), i + 1);
          const dateKey = day.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          return { date: dateKey, revenue: revenueByDay[dateKey] || 0 };
        });
      } else {
        // Hiển thị 1 ngày
        const dateKey = targetDate.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        const revenue = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        return [{ date: dateKey, revenue }];
      }
    }
    
    if (timeRange === 'today' || timeRange === 'yesterday') {
      // Show single day
      const targetDate = timeRange === 'yesterday'
        ? new Date(new Date().setDate(new Date().getDate() - 1))
        : new Date();
      const dateKey = targetDate.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      const revenue = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      return [{ date: dateKey, revenue }];
    } else if (timeRange === 'week' || timeRange === 'last-week') {
      // Show 7 days of selected week
      const now = new Date();
      const dayOfWeek = now.getDay() || 7;
      const offset = timeRange === 'last-week' ? 7 : 0;
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - dayOfWeek - offset + i + 1);
        return d;
      });
      const revenueByDay: Record<string, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts) {
          const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
        }
      });
      return weekDays.map(d => {
        const dateKey = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        return { date: dateKey, revenue: revenueByDay[dateKey] || 0 };
      });
    } else if (timeRange === 'month' || timeRange === 'last-month') {
      // Show days in selected month
      const now = new Date();
      const targetMonth = timeRange === 'month' 
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      const revenueByDay: Record<string, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts) {
          const dateKey = ts.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
          revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + (bill.totalAmount || 0);
        }
      });
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), i + 1);
        const dateKey = day.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        return { date: dateKey, revenue: revenueByDay[dateKey] || 0 };
      });
    } else if (timeRange === 'year' || timeRange === 'last-year') {
      // Show all 12 months
      const now = new Date();
      const targetYear = timeRange === 'year' ? now.getFullYear() : now.getFullYear() - 1;
      const revenueByMonth: Record<number, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts && ts.getFullYear() === targetYear) {
          const month = ts.getMonth();
          revenueByMonth[month] = (revenueByMonth[month] || 0) + (bill.totalAmount || 0);
        }
      });
      return Array.from({ length: 12 }, (_, i) => ({
        date: `Tháng ${i + 1}`,
        revenue: revenueByMonth[i] || 0
      }));
    } else {
      // Show last 5 years
      const now = new Date();
      const currentYear = now.getFullYear();
      const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
      const revenueByYear: Record<number, number> = {};
      bills.forEach((bill) => {
        const ts = (bill.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (ts) {
          const year = ts.getFullYear();
          if (last5Years.includes(year)) {
            revenueByYear[year] = (revenueByYear[year] || 0) + (bill.totalAmount || 0);
          }
        }
      });
      return last5Years.map(year => ({
        date: `${year}`,
        revenue: revenueByYear[year] || 0
      }));
    }
  }, [bills, timeRange, selectedDate]);

  // Max value and chart title based on timeRange
  const chartConfig = useMemo(() => {
    if (timeRange === 'today') {
      return { max: 2000000, title: 'Doanh Thu Hôm Nay', threshold: 2000000 };
    }
    if (timeRange === 'yesterday') {
      return { max: 2000000, title: 'Doanh Thu Hôm Qua', threshold: 2000000 };
    }
    if (timeRange === 'week') {
      return { max: 15000000, title: 'Doanh Thu Tuần Này', threshold: 2000000 };
    }
    if (timeRange === 'last-week') {
      return { max: 15000000, title: 'Doanh Thu Tuần Trước', threshold: 2000000 };
    }
    if (timeRange === 'month') {
      return { max: 50000000, title: 'Doanh Thu Tháng Này', threshold: 50000000 };
    }
    if (timeRange === 'last-month') {
      return { max: 50000000, title: 'Doanh Thu Tháng Trước', threshold: 50000000 };
    }
    if (timeRange === 'year') {
      return { max: undefined, title: 'Doanh Thu Năm Nay', threshold: 50000000 * 12 };
    }
    if (timeRange === 'last-year') {
      return { max: undefined, title: 'Doanh Thu Năm Trước', threshold: 50000000 * 12 };
    }
    if (selectedDate) {
      const date = new Date(selectedDate);
      // Nếu là ngày 1, hiển thị tên tháng
      if (date.getDate() === 1) {
        const monthName = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        return { max: 50000000, title: `Doanh Thu ${monthName}`, threshold: 50000000 };
      }
      return { max: 2000000, title: `Doanh Thu ${date.toLocaleDateString('vi-VN')}`, threshold: 2000000 };
    }
    return { max: undefined, title: 'Doanh Thu', threshold: 50000000 * 12 };
  }, [timeRange, selectedDate]);

  // Pie chart data - Orders by type distribution
  const COLORS = ['#8B5CF6', '#F97316', '#EC4899'];
  const statsData = [
    { name: 'Orders tại bàn', value: metrics.dineInOrders, color: COLORS[0] },
    { name: 'Orders mang đi', value: metrics.takeawayOrders, color: COLORS[1] },
    { name: 'Orders Ship', value: metrics.deliveryOrders, color: COLORS[2] },
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
          {/* Ngày */}
          <select
            value={["today", "yesterday"].includes(timeRange) ? timeRange : ""}
            onChange={(e) => { if (e.target.value) { setTimeRange(e.target.value as any); setSelectedDate(""); setDrillHistory([]); } }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Ngày</option>
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
          </select>

          {/* Tuần */}
          <select
            value={["week", "last-week"].includes(timeRange) ? timeRange : ""}
            onChange={(e) => { if (e.target.value) { setTimeRange(e.target.value as any); setSelectedDate(""); setDrillHistory([]); } }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="" disabled>Tuần</option>
            <option value="week">Tuần này</option>
            <option value="last-week">Tuần trước</option>
          </select>

          {/* Tháng */}
          <select
            value={["month", "last-month"].includes(timeRange) ? timeRange : ""}
            onChange={(e) => { if (e.target.value) { setTimeRange(e.target.value as any); setSelectedDate(""); setDrillHistory([]); } }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="" disabled>Tháng</option>
            <option value="month">Tháng này</option>
            <option value="last-month">Tháng trước</option>
          </select>

          {/* Năm */}
          <select
            value={["year", "last-year"].includes(timeRange) ? timeRange : ""}
            onChange={(e) => { if (e.target.value) { setTimeRange(e.target.value as any); setSelectedDate(""); setDrillHistory([]); } }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="" disabled>Năm</option>
            <option value="year">Năm này</option>
            <option value="last-year">Năm trước</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            max={new Date().toISOString().slice(0, 10)}
          />
          <button className="btn-primary text-sm px-4 py-2">
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
            {metrics.revenue.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-xs text-primary-600">{bills.length} đơn</p>
        </div>

        {/* Orders Card with breakdown */}
        <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-700 font-medium mb-1">Đơn Hàng</p>
          <p className="text-2xl font-bold text-green-900 mb-2">{metrics.totalOrders}</p>
          
          {/* Chi tiết 3 loại đơn hàng */}
          <div className="space-y-1.5 mt-3 pt-3 border-t border-green-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Tại bàn
              </span>
              <span className="font-semibold text-green-800">{metrics.dineInOrders}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Mang đi
              </span>
              <span className="font-semibold text-green-800">{metrics.takeawayOrders}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Ship
              </span>
              <span className="font-semibold text-green-800">{metrics.deliveryOrders}</span>
            </div>
          </div>
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
        {/* Bar Chart - Revenue */}
        <div className="card p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-800">📊 {chartConfig.title}</h3>
              {drillHistory.length > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
              )}
            </div>
            {(timeRange === 'year' || timeRange === 'last-year') && (
              <p className="text-xs text-neutral-500 mt-1">💡 Click vào tháng để xem chi tiết các ngày</p>
            )}
            {(timeRange === 'month' || timeRange === 'last-month' || (selectedDate && new Date(selectedDate).getDate() === 1)) && (
              <p className="text-xs text-neutral-500 mt-1">💡 Click vào ngày để xem chi tiết ngày đó</p>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={revenueChartData} 
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                stroke="#6b7280"
                domain={[0, chartConfig.max || 'auto']}
                tickFormatter={(value: number) => `${value.toLocaleString('vi-VN')}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: number) => `${value.toLocaleString('vi-VN')}₫`}
              />
              <Bar 
                dataKey="revenue" 
                radius={[8, 8, 0, 0]}
                fill="#3b82f6"
                cursor="pointer"
                onClick={(data: any) => {
                  console.log('Bar clicked!', data);
                  if (data && data.date) {
                    const clickedDate = data.date;
                    
                    // Nếu đang lọc theo năm (hiển thị tháng), click vào tháng để xem chi tiết tháng đó
                    if (timeRange === 'year' || timeRange === 'last-year') {
                      const monthMatch = clickedDate.match(/Tháng (\d+)/);
                      if (monthMatch) {
                        const monthNum = parseInt(monthMatch[1]);
                        const now = new Date();
                        const currentYear = now.getFullYear();
                        const clickedYear = timeRange === 'year' ? currentYear : currentYear - 1;
                        
                        // Save current state to history
                        const newHistory = [...drillHistory, { timeRange, selectedDate }];
                        
                        // Set ngày đầu tháng để trigger xem tháng đó
                        const targetDate = new Date(clickedYear, monthNum - 1, 1);
                        const dateStr = targetDate.toISOString().slice(0, 10);
                        console.log('Drilling into month:', monthNum, 'Date:', dateStr);
                        
                        // Update both states together
                        setDrillHistory(newHistory);
                        setSelectedDate(dateStr);
                      }
                    }
                    // Nếu đang lọc theo tháng (hiển thị ngày), click vào ngày để xem chi tiết ngày đó
                    else if (timeRange === 'month' || timeRange === 'last-month' || (selectedDate && new Date(selectedDate).getDate() === 1)) {
                      // clickedDate format: "01/11" -> convert to full date
                      const [day, month] = clickedDate.split('/');
                      if (day && month) {
                        // Save current state to history
                        const newHistory = [...drillHistory, { timeRange, selectedDate }];
                        
                        const year = timeRange === 'month' 
                          ? new Date().getFullYear()
                          : timeRange === 'last-month'
                          ? new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
                          : selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear();
                        const targetDate = new Date(year, parseInt(month) - 1, parseInt(day));
                        const dateStr = targetDate.toISOString().slice(0, 10);
                        console.log('Drilling into day:', day, '/', month, 'Date:', dateStr);
                        
                        setDrillHistory(newHistory);
                        setSelectedDate(dateStr);
                      }
                    }
                  }
                }}
              >
                {revenueChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.revenue >= chartConfig.threshold ? '#10b981' : '#3b82f6'}
                  />
                ))}
              </Bar>
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
                label={(props: Record<string, unknown>) => {
                  const cx = typeof props.cx === 'number' ? props.cx : 0;
                  const cy = typeof props.cy === 'number' ? props.cy : 0;
                  const midAngle = typeof props.midAngle === 'number' ? props.midAngle : 0;
                  const outerRadius = typeof props.outerRadius === 'number' ? props.outerRadius : 0;
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  const name = typeof props.name === 'string' ? props.name : '';
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
              : timeRange === "yesterday"
              ? "Đơn Hàng Hôm Qua"
              : timeRange === "week"
              ? "Đơn Hàng Tuần Này"
              : timeRange === "last-week"
              ? "Đơn Hàng Tuần Trước"
              : timeRange === "month"
              ? "Đơn Hàng Tháng Này"
              : timeRange === "last-month"
              ? "Đơn Hàng Tháng Trước"
              : timeRange === "year"
              ? "Đơn Hàng Năm Này"
              : "Đơn Hàng Năm Trước"}
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
