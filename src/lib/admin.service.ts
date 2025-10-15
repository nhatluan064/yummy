import { db } from './firebase';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

async function deleteCollection(colName: string): Promise<number> {
  const snap = await getDocs(collection(db, colName));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, colName, d.id));
    count++;
  }
  return count;
}

export const adminMaintenance = {
  async resetMenu() {
    return deleteCollection('menu');
  },
  async resetOrders() {
    // Also consider clearing active orders only; bills are kept separately
    return deleteCollection('orders');
  },
  async resetReservations() {
    return deleteCollection('reservations');
  },
  async resetFeedback() {
    return deleteCollection('feedback');
  },
  async resetBills() {
    return deleteCollection('bills');
  },
  async resetAll() {
    const results = await Promise.all([
      this.resetMenu(),
      this.resetOrders(),
      this.resetReservations(),
      this.resetFeedback(),
      this.resetBills(),
    ]);
    // Reset the order sequence meta counter to 0 if present
    await setDoc(doc(db, '_meta', 'order-seq'), { current: 0 }, { merge: true });
    return {
      menu: results[0],
      orders: results[1],
      reservations: results[2],
      feedback: results[3],
      bills: results[4],
    };
  },
};
