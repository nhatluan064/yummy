import { FirestoreService } from "./firestore.service";
import type { TableReservation } from "./types";

class ReservationService extends FirestoreService<TableReservation> {
  constructor() {
    super("reservations");
  }

  async createReservation(
    data: Omit<TableReservation, "id" | "createdAt" | "updatedAt" | "status">
  ) {
    if (!data.customerName || !data.customerPhone)
      throw new Error("Thiếu thông tin khách hàng");
    if (data.numberOfGuests < 1) throw new Error("Số khách không hợp lệ");
    return this.create({ ...data, status: "pending" } as TableReservation);
  }

  async confirm(id: string) {
    return this.update(id, { status: "confirmed" });
  }
  async cancel(id: string) {
    return this.update(id, { status: "cancelled" });
  }

  async getByTableId(tableId: string) {
    const list = await this.getAll([this.by("tableNumber", "==", tableId)]);
    return list[0] ?? null;
  }

  subscribeToReservations(
    callback: (reservations: TableReservation[]) => void
  ) {
    return this.subscribeAll([this.sortBy("createdAt", "desc")], callback);
  }
}

export const reservationService = new ReservationService();
