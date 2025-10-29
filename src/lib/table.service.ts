import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Table {
  id?: string;
  tableNumber: string; // Số bàn (B01, B02, B03...)
  status: "empty" | "occupied"; // Trạng thái: trống hoặc đang sử dụng
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = "tables";

export const tableService = {
  // Tạo bàn mới
  async createTable(tableNumber: string): Promise<string> {
    const now = Timestamp.now();
    const tableData = {
      tableNumber,
      status: "empty" as const,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), tableData);
    return docRef.id;
  },

  // Lấy tất cả bàn (sắp xếp theo số bàn)
  async getAllTables(): Promise<Table[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("tableNumber", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[];
  },

  // Cập nhật trạng thái bàn
  async updateTableStatus(
    tableId: string,
    status: "empty" | "occupied"
  ): Promise<void> {
    const tableRef = doc(db, COLLECTION_NAME, tableId);
    await updateDoc(tableRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  // Xóa bàn
  async deleteTable(tableId: string): Promise<void> {
    const tableRef = doc(db, COLLECTION_NAME, tableId);
    await deleteDoc(tableRef);
  },

  // Cập nhật số bàn
  async updateTableNumber(tableId: string, tableNumber: string): Promise<void> {
    const tableRef = doc(db, COLLECTION_NAME, tableId);
    await updateDoc(tableRef, {
      tableNumber,
      updatedAt: Timestamp.now(),
    });
  },
};
