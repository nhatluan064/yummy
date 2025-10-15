"use client";
import { useEffect, useState } from 'react';
import { orderService } from '@/lib/sdk';
import type { Order } from '@/lib/types';
import type { WithId } from '@/lib/firestore.service';
import Link from 'next/link';

export default function OrderTrackingPage({ params }: { params: { code: string } }) {
  const [order, setOrder] = useState<WithId<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const code = decodeURIComponent(params.code);

  useEffect(() => {
    orderService.getByOrderCode(code).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [code]);

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;
  if (!order) return (
    <div className="p-6">
      <p>Không tìm thấy đơn hàng với mã: <span className="font-semibold">{code}</span></p>
      <Link href="/thuc-don" className="text-primary-600 underline">Quay lại Thực đơn</Link>
    </div>
  );

  const statusLabel = {
    pending: 'Chờ xử lý',
    preparing: 'Đang làm',
    ready: 'Sẵn sàng',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
  }[order.status];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theo dõi đơn hàng</h1>
        <span className="text-sm text-neutral-500">Mã đơn: {order.orderCode ?? order.id}</span>
      </div>

      <div className="card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Khách: {order.customerName}</p>
            <p className="text-sm text-neutral-500">Bàn số: {order.tableNumber ?? '-'}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">{statusLabel}</span>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Món đã gọi</h2>
        <div className="space-y-2">
          {order.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span>{it.quantity}x {it.name}</span>
              <span className="font-medium">{it.price.toLocaleString()}₫</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-neutral-600">Tổng cộng:</span>
          <span className="font-bold text-primary-600">{order.totalAmount.toLocaleString()}₫</span>
        </div>
      </div>
    </div>
  );
}
