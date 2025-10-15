import { FirestoreService } from './firestore.service';
import type { Bill } from './types';
import { serverTimestamp } from 'firebase/firestore';

class BillService extends FirestoreService<Bill> {
  constructor() {
    super('bills');
  }

  async createFromOrder(order: {
    id: string;
    orderCode?: string;
    customerName: string;
    tableNumber?: string;
    items: { name: string; price: number; quantity: number }[];
    totalAmount: number;
  }) {
    const bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> = {
      orderId: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      totalAmount: order.totalAmount,
      status: 'completed',
      completedAt: serverTimestamp() as unknown as Bill['completedAt'],
    };
    return this.create(bill as Bill);
  }

  async ensureForOrder(order: {
    id: string;
    orderCode?: string;
    customerName: string;
    tableNumber?: string;
    items: { name: string; price: number; quantity: number }[];
    totalAmount: number;
  }) {
    const existing = await this.getAll([this.by('orderId', '==', order.id), this.take(1)]);
    if (existing.length) return existing[0].id;
    return this.createFromOrder(order);
  }
}

export const billService = new BillService();
