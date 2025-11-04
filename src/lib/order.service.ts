import { FirestoreService, WithId } from "./firestore.service";
import type { Order } from "./types";
import { db } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";

class OrderService extends FirestoreService<Order> {
  constructor() {
    super("orders");
  }

  async createOrder(
    order: Omit<
      Order,
      "id" | "createdAt" | "updatedAt" | "status" | "orderCode"
    >
  ) {
    if (!order.items?.length) throw new Error("Đơn hàng phải có ít nhất 1 món");
    if (order.totalAmount <= 0) throw new Error("Tổng tiền không hợp lệ");

    // Determine order type prefix
    let typePrefix = "ORDER";
    if (order.orderType === "dine-in") {
      typePrefix = "ODER-TAIBAN";
    } else if (order.orderType === "takeaway") {
      typePrefix = "ODER-MANGDI";
    } else if (order.orderType === "delivery") {
      typePrefix = "ODER-SHIP";
    }

    // Get all existing orders of this type to find gaps
    const existingOrders = await this.getAll([
      this.by("orderType", "==", order.orderType || "dine-in")
    ]);
    
    // Extract numbers from orderCodes
    const usedNumbers = new Set<number>();
    const codePattern = new RegExp(`#DONHANG-${typePrefix}-(\\d+)`);
    
    for (const existingOrder of existingOrders) {
      if (existingOrder.orderCode) {
        const match = existingOrder.orderCode.match(codePattern);
        if (match) {
          usedNumbers.add(parseInt(match[1], 10));
        }
      }
    }
    
    // Find smallest available number (starting from 1)
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }
    
    const padded = String(nextNumber).padStart(3, "0");
    const code = `#DONHANG-${typePrefix}-${padded}`;

    const id = await this.create({
      ...order,
      status: "preparing", // Mặc định là "Đang làm" thay vì "Chờ xử lý"
      orderCode: code,
    } as Order);
    return { id, orderCode: code };
  }

  async updateStatus(orderId: string, status: Order["status"]) {
    return this.update(orderId, { status });
  }

  async getByOrderCode(code: string) {
    const list = await this.getAll([this.by("orderCode", "==", code)]);
    return list[0] ?? null;
  }

  async getByTableId(tableId: string) {
    return this.getAll([this.by("tableNumber", "==", tableId)]);
  }

  subscribeToOrders(callback: (orders: WithId<Order>[]) => void) {
    return this.subscribeAll([this.sortBy("createdAt", "desc")], callback);
  }
}

export const orderService = new OrderService();
