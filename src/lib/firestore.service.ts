import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, app } from './firebase';

export type WithId<T extends DocumentData> = T & { id: string };

export class FirestoreService<T extends DocumentData> {
  constructor(private readonly colName: string) {}

  protected colRef() {
    return collection(db, this.colName);
  }

  private assertConfigured() {
    // Provide a clear message if Firebase is not configured to avoid cryptic errors
    const opts = (app?.options || {}) as Record<string, unknown>;
    const required = ['apiKey', 'projectId', 'appId'];
    const missing = required.filter((k) => !opts[k]);
    if (missing.length) {
      throw new Error(
        `Firebase chưa được cấu hình đầy đủ (${missing.join(', ')} thiếu). ` +
          `Hãy tạo file .env.local với các biến NEXT_PUBLIC_FIREBASE_* rồi khởi động lại dev server.`
      );
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    this.assertConfigured();
    const ref = await addDoc(this.colRef(), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as DocumentData);
    return ref.id;
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<WithId<T>[]> {
    this.assertConfigured();
    const q = constraints.length ? query(this.colRef(), ...constraints) : this.colRef();
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as WithId<T>));
  }

  async getById(id: string): Promise<WithId<T> | null> {
    this.assertConfigured();
    const snap = await getDoc(doc(db, this.colName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as WithId<T>) : null;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    this.assertConfigured();
    await updateDoc(doc(db, this.colName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    } as DocumentData);
  }

  async delete(id: string): Promise<void> {
    this.assertConfigured();
    await deleteDoc(doc(db, this.colName, id));
  }

  // Helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  by(field: string, op: any, value: unknown): QueryConstraint {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return where(field as any, op, value as any);
  }
  sortBy(field: string, dir: 'asc' | 'desc' = 'asc'): QueryConstraint {
    return orderBy(field, dir);
  }
  take(n: number): QueryConstraint {
    return limit(n);
  }
}
