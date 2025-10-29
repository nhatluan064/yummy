import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, getAuthClient } from "@/lib/firebase";
import { type Category, type MenuItem } from "@/lib/menuData";

// Helper to ensure auth is initialized before write operations
async function ensureAuth() {
  const auth = await getAuthClient();
  if (!auth.currentUser) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");
  }
  return auth.currentUser;
}

// Lấy danh mục từ Firestore
export async function getCategoriesFromFirestore() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Lấy menu từ Firestore
export async function getMenuItemsFromFirestore() {
  const snapshot = await getDocs(collection(db, "menu"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Thêm danh mục mới (Admin)
export async function addCategoryToFirestore(category: Category) {
  await ensureAuth(); // Ensure user is authenticated
  return await addDoc(collection(db, "categories"), category);
}

// Thêm món mới (Admin)
export async function addMenuItemToFirestore(menuItem: MenuItem) {
  await ensureAuth(); // Ensure user is authenticated
  return await addDoc(collection(db, "menu"), menuItem);
}

// Sửa danh mục
export async function updateCategoryInFirestore(id: string, data: Partial<Category>) {
  await ensureAuth();
  return await updateDoc(doc(db, "categories", id), data);
}

// Sửa món
export async function updateMenuItemInFirestore(id: string, data: Partial<MenuItem>) {
  await ensureAuth();
  return await updateDoc(doc(db, "menu", id), data);
}

// Xóa danh mục
export async function deleteCategoryFromFirestore(id: string) {
  await ensureAuth();
  return await deleteDoc(doc(db, "categories", id));
}

// Xóa món
export async function deleteMenuItemFromFirestore(id: string) {
  await ensureAuth();
  return await deleteDoc(doc(db, "menu", id));
}
