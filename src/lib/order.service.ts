import { FirestoreService } from './firestore.service';
import type { Order } from './types';
import { db } from './firebase';
import { doc, runTransaction } from 'firebase/firestore';

class OrderService extends FirestoreService<Order> {
  constructor() {
    super('orders');
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'orderCode'>) {
    if (!order.items?.length) throw new Error('Đơn hàng phải có ít nhất 1 món');
  if (!order.customerName) throw new Error('Thiếu thông tin khách hàng');
    if (order.totalAmount <= 0) throw new Error('Tổng tiền không hợp lệ');

    // Generate sequential code using a transaction on a meta doc
    const metaRef = doc(db, '_meta', 'order-seq');
    const { code } = await runTransaction(db, async (tx) => {
      const snap = await tx.get(metaRef);
      let current = 0;
      if (snap.exists()) {
        const data = snap.data() as { current?: number };
        current = Number(data.current) || 0;
      }
      const next = current + 1;
      tx.set(metaRef, { current: next }, { merge: true });
      const padded = String(next).padStart(3, '0');
      return { code: `#DONHANG-ORDER-${padded}` };
    });

    const id = await this.create({ ...order, status: 'pending', orderCode: code } as Order);
    return { id, orderCode: code };
  }

  async updateStatus(orderId: string, status: Order['status']) {
    return this.update(orderId, { status });
  }

  async getByOrderCode(code: string) {
    const list = await this.getAll([this.by('orderCode', '==', code)]);
    return list[0] ?? null;
  }
}

export const orderService = new OrderService();
