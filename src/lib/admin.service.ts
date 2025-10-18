import { db } from "./firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

async function deleteCollection(colName: string): Promise<number> {
  const snap = await getDocs(collection(db, colName));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, colName, d.id));
    count++;
  }
  return count;
}

async function deleteBillsByDateRange(
  range: "today" | "week" | "month" | "year"
): Promise<number> {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (range === "week") {
    const day = now.getDay() || 7;
    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - day + 1
    );
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (range === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }

  const q = query(
    collection(db, "bills"),
    where("completedAt", ">=", Timestamp.fromDate(start)),
    where("completedAt", "<", Timestamp.fromDate(end))
  );

  const snap = await getDocs(q);
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "bills", d.id));
    count++;
  }
  return count;
}

export const adminMaintenance = {
  async resetMenu() {
    return deleteCollection("menu");
  },
  async resetOrders() {
    // Also consider clearing active orders only; bills are kept separately
    return deleteCollection("orders");
  },
  async resetReservations() {
    return deleteCollection("reservations");
  },
  async resetFeedback() {
    return deleteCollection("feedback");
  },
  async resetBills() {
    return deleteCollection("bills");
  },
  async resetContacts() {
    return deleteCollection("contacts");
  },
  async resetRevenue(range: "today" | "week" | "month" | "year") {
    return deleteBillsByDateRange(range);
  },
  async resetAll() {
    const results = await Promise.all([
      this.resetMenu(),
      this.resetOrders(),
      this.resetReservations(),
      this.resetFeedback(),
      this.resetBills(),
      this.resetContacts(),
    ]);
    // Reset the order sequence meta counter to 0 if present
    await setDoc(
      doc(db, "_meta", "order-seq"),
      { current: 0 },
      { merge: true }
    );
    return {
      menu: results[0],
      orders: results[1],
      reservations: results[2],
      feedback: results[3],
      bills: results[4],
      contacts: results[5],
    };
  },
};
