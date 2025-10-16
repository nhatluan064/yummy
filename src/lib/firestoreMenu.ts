import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { type Category, type MenuItem } from "@/lib/menuData";

const db = getFirestore(app);

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
  return await addDoc(collection(db, "categories"), category);
}

// Thêm món mới (Admin)
export async function addMenuItemToFirestore(menuItem: MenuItem) {
  return await addDoc(collection(db, "menu"), menuItem);
}

// Sửa danh mục
export async function updateCategoryInFirestore(id: string, data: Partial<Category>) {
  return await updateDoc(doc(db, "categories", id), data);
}

// Sửa món
export async function updateMenuItemInFirestore(id: string, data: Partial<MenuItem>) {
  return await updateDoc(doc(db, "menu", id), data);
}

// Xóa danh mục
export async function deleteCategoryFromFirestore(id: string) {
  return await deleteDoc(doc(db, "categories", id));
}

// Xóa món
export async function deleteMenuItemFromFirestore(id: string) {
  return await deleteDoc(doc(db, "menu", id));
}
