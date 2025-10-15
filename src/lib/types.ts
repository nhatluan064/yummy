import type { Timestamp } from 'firebase/firestore';

export interface MenuItem {
  id?: string;
  name: string;
  category: 'food' | 'drink' | string; // keep string to be flexible with existing categories
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  popular?: boolean;
  bestSeller?: boolean;
  prepTime?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  items: OrderItem[];
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tableNumber?: string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  orderCode?: string; // Human-friendly sequential code like #DONHANG-ORDER-001
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BillItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Bill {
  id?: string;
  orderId: string;
  orderCode?: string;
  customerName: string;
  tableNumber?: string;
  items: BillItem[];
  totalAmount: number;
  status: 'completed' | 'refunded' | 'cancelled';
  completedAt?: Timestamp; // duplicate for easier queries
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Feedback {
  id?: string;
  customerName: string;
  customerEmail?: string;
  rating: number; // 1..5
  comment: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TableReservation {
  id?: string;
  customerName: string;
  customerPhone: string;
  numberOfGuests: number;
  reservationDate: Timestamp;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
