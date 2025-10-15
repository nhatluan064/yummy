"use client";

import { useEffect, useMemo, useState } from 'react';
import { billService } from '@/lib/sdk';
import type { WithId } from '@/lib/firestore.service';
import type { Bill } from '@/lib/types';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [bills, setBills] = useState<WithId<Bill>[]>([]);

  useEffect(() => {
    // Simple fetch of latest 10 bills, sorted by createdAt desc
    billService.getAll([billService.sortBy('createdAt', 'desc'), billService.take(10)]).then(setBills).catch(console.error);
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const isSameDay = (d: Date, e: Date) => d.toDateString() === e.toDateString();
    const billsToday = bills.filter(b => {
      const ts = (b.completedAt as unknown as { toDate?: () => Date })?.toDate?.();
      if (!ts) return false;
      return isSameDay(ts, now);
    });
    const revenueToday = billsToday.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      revenueToday,
      newOrders: 0, // could compute from orders later if needed
      reservations: 0,
      customers: new Set(bills.map(b => b.customerName)).size,
    };
  }, [bills]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard Tổng Quan</h1>
          <p className="text-neutral-600 mt-1">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex items-center space-x-3">
          <select aria-label="Chọn khoảng thời gian"
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value as 'today' | 'week' | 'month' | 'year')}
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
          </select>
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
          <p className="text-sm text-neutral-600 mb-1">Doanh Thu Hôm Nay</p>
          <p className="text-3xl font-bold text-neutral-800 mb-2">{metrics.revenueToday.toLocaleString()}₫</p>
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
