import type { Timestamp } from "firebase/firestore";

export interface MenuItem {
  id?: string;
  name: string;
  category: "food" | "drink" | string; // keep string to be flexible with existing categories
  categoryName?: string; // Display name for category
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  bestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isNew?: boolean; // Flag for new dishes
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
  customerName?: string; // Optional now
  customerPhone?: string;
  customerEmail?: string;
  tableNumber?: string;
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  notes?: string;
  orderCode?: string; // Human-friendly sequential code like #DONHANG-ORDER-001
  orderType?: "dine-in" | "takeaway" | "delivery"; // Type of order
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
  customerName?: string; // Optional now
  tableNumber?: string;
  items: BillItem[];
  totalAmount: number;
  status: "completed" | "refunded" | "cancelled";
  completedAt?: Timestamp; // duplicate for easier queries
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Feedback {
  id?: string;
  customerName?: string; // Optional now
  customerEmail?: string;
  rating: number; // 1..5
  comment: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  hidden?: boolean;
  dishName?: string;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  order?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Review {
  id?: string;
  customerName?: string; // Optional now
  rating: number;
  comment: string;
  createdAt?: Timestamp;
}

export interface TableReservation {
  id?: string;
  customerName?: string; // Optional now
  customerPhone: string;
  numberOfGuests: number;
  reservationDate: Timestamp;
  reservationTime: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  subjectLabel?: string; // Display label for the subject
  message: string;
  status: "pending" | "responded" | "closed";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
