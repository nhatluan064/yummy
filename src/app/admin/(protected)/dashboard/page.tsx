"use client";

import { useEffect, useMemo, useState } from 'react';
import { billService } from '@/lib/sdk';
import type { WithId } from '@/lib/firestore.service';
import type { Bill } from '@/lib/types';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [bills, setBills] = useState<WithId<Bill>[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(''); // yyyy-mm-dd

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
      if (timeRange === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === 'week') {
        const day = now.getDay() || 7;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (timeRange === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }
    }
    // Query theo khoảng [start, end)
    const constraints = [
      billService.by('completedAt', '>=', start),
      billService.by('completedAt', '<', end),
      billService.sortBy('completedAt', 'desc'),
      billService.take(50)
    ];
    billService.getAll(constraints).then(setBills).catch(console.error);
  }, [timeRange, selectedDate]);

  const metrics = useMemo(() => {
    let revenue = 0;
    let label = '';
    const customers = new Set(bills.map(b => b.customerName)).size;
    const now = new Date();
    if (selectedDate) {
      // Tính doanh thu đúng ngày đã chọn
      const target = new Date(selectedDate);
      const isSameDay = (d: Date, e: Date) => d.getFullYear() === e.getFullYear() && d.getMonth() === e.getMonth() && d.getDate() === e.getDate();
      revenue = bills.filter(b => {
        const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
        if (!ts) return false;
        return isSameDay(ts, target);
      }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      // Định dạng dd/mm/yyyy
      const ddmmyyyy = target.toLocaleDateString('vi-VN');
      label = `Doanh Thu ${ddmmyyyy}`;
    } else {
      // Tính doanh thu theo timeRange
      if (timeRange === 'today') {
        const isSameDay = (d: Date, e: Date) => d.toDateString() === e.toDateString();
        revenue = bills.filter(b => {
          const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
          if (!ts) return false;
          return isSameDay(ts, now);
        }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = 'Doanh Thu Hôm Nay';
      } else if (timeRange === 'week') {
        // Tuần này
        const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() || 7) + 1);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);
        revenue = bills.filter(b => {
          const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
          if (!ts) return false;
          return ts >= firstDayOfWeek && ts < lastDayOfWeek;
        }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = 'Doanh Thu Tuần này';
      } else if (timeRange === 'month') {
        // Tháng này
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        revenue = bills.filter(b => {
          const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
          if (!ts) return false;
          return ts >= firstDayOfMonth && ts < nextMonth;
        }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = 'Doanh Thu Tháng này';
      } else if (timeRange === 'year') {
        // Năm này
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        revenue = bills.filter(b => {
          const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
          if (!ts) return false;
          return ts >= firstDayOfYear && ts < nextYear;
        }).reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        label = 'Doanh Thu Năm này';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard Tổng Quan</h1>
          <p className="text-neutral-600 mt-1">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            aria-label="Chọn khoảng thời gian"
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setTimeRange(e.target.value as 'today' | 'week' | 'month' | 'year');
              setSelectedDate(''); // reset date khi chọn lại dropdown
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            max={new Date().toISOString().slice(0, 10)}
          />
          <button className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-sm text-neutral-600 mb-1">{metrics.revenueLabel}</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">{metrics.revenue.toLocaleString()}₫</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-600 mb-1">Đơn Hoàn Tất (gần đây)</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">{bills.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-600 mb-1">Khách Hàng</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">{metrics.customers}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-neutral-600 mb-1">Đơn mới</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">—</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-neutral-800">Đơn Hàng Gần Đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Mã Đơn</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Khách Hàng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Món Ăn</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Tổng Tiền</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Thời Gian</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-b border-neutral-100">
                  <td className="py-4 px-4"><span className="font-medium text-primary-600">{b.orderCode ?? b.orderId}</span></td>
                  <td className="py-4 px-4">{b.customerName}</td>
                  <td className="py-4 px-4 text-sm text-neutral-600">{b.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                  <td className="py-4 px-4 font-medium">{(b.totalAmount||0).toLocaleString()}₫</td>
                  <td className="py-4 px-4 text-sm text-neutral-500">{(() => {
                    const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
                    return ts ? ts.toLocaleString() : '';
                  })()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
