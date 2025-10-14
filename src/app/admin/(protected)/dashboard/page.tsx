"use client";

import { useState } from 'react';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('today');

  // Mock data - trong thực tế sẽ fetch từ API
  const stats = [
    {
      title: 'Doanh Thu Hôm Nay',
      value: '15,250,000₫',
      change: '+12.5%',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'primary',
    },
    {
      title: 'Đơn Hàng Mới',
      value: '48',
      change: '+8',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'secondary',
    },
    {
      title: 'Đặt Bàn',
      value: '23',
      change: '+5',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'accent',
    },
    {
      title: 'Khách Hàng',
      value: '127',
      change: '+15',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'primary',
    },
  ];

  const recentOrders = [
    { id: '#ORD-2024-001', customer: 'Nguyễn Văn A', items: 'Phở Bò x2, Trà Đá x2', total: '240,000₫', status: 'pending', time: '5 phút trước' },
    { id: '#ORD-2024-002', customer: 'Trần Thị B', items: 'Cơm Tấm x1, Bánh Mì x1', total: '150,000₫', status: 'preparing', time: '12 phút trước' },
    { id: '#ORD-2024-003', customer: 'Lê Văn C', items: 'Bún Chả x3', total: '270,000₫', status: 'ready', time: '18 phút trước' },
    { id: '#ORD-2024-004', customer: 'Phạm Thị D', items: 'Gỏi Cuốn x2, Nem Nướng x1', total: '180,000₫', status: 'delivered', time: '25 phút trước' },
  ];

  const topDishes = [
    { name: 'Phở Bò', orders: 45, revenue: '2,250,000₫', trend: 'up' },
    { name: 'Cơm Tấm', orders: 38, revenue: '1,900,000₫', trend: 'up' },
    { name: 'Bánh Mì', orders: 32, revenue: '960,000₫', trend: 'down' },
    { name: 'Bún Chả', orders: 28, revenue: '2,520,000₫', trend: 'up' },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      preparing: 'bg-blue-100 text-blue-700 border-blue-200',
      ready: 'bg-primary-100 text-primary-700 border-primary-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
    };
    const labels = {
      pending: 'Chờ xử lý',
      preparing: 'Đang nấu',
      ready: 'Sẵn sàng',
      delivered: 'Đã giao',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Dashboard Tổng Quan</h1>
          <p className="text-neutral-600 mt-1">Theo dõi hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-neutral-800 mb-2">{stat.value}</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-neutral-500">vs hôm qua</span>
                </div>
              </div>
              <div className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-800">Biểu Đồ Doanh Thu</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg font-medium">Tuần</button>
              <button className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg">Tháng</button>
              <button className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg">Năm</button>
            </div>
          </div>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <p className="text-neutral-400">Biểu đồ doanh thu sẽ được hiển thị ở đây (Chart.js / Recharts)</p>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Món Ăn Bán Chạy</h3>
          <div className="space-y-4">
            {topDishes.map((dish, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{dish.name}</p>
                    <p className="text-xs text-neutral-500">{dish.orders} đơn</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neutral-800">{dish.revenue}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {dish.trend === 'up' ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-neutral-800">Đơn Hàng Gần Đây</h3>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1">
            <span>Xem tất cả</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Mã Đơn</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Khách Hàng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Món Ăn</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Tổng Tiền</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Trạng Thái</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Thời Gian</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-600">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-primary-600">{order.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-neutral-800">{order.customer}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-600">{order.items}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-neutral-800">{order.total}</span>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-500">{order.time}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Thêm Món Mới</h4>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm opacity-90">Cập nhật thực đơn với món ăn mới</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Quản Lý Đặt Bàn</h4>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm opacity-90">Xem và quản lý đặt bàn hôm nay</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-accent-400 to-accent-500 text-secondary-700 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Xem Báo Cáo</h4>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm opacity-90">Xem báo cáo doanh thu chi tiết</p>
        </div>
      </div>
    </div>
  );
}
