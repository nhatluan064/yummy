/**
 * YUMMY Restaurant - Firebase Service Module
 * Quản lý tất cả Firebase operations: Firestore, Authentication, Storage
 * NOTE: Header was previously corrupted/duplicated; cleaned up.
 */

// Firebase SDK imports
import {
  initializeApp,
  getApp,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Firebase Configuration - từ Firebase Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyCbUNjBPEaZOtI_cNCcCJ1DBXUUdrP_6oE",
  authDomain: "order-yummy.firebaseapp.com",
  projectId: "order-yummy",
  storageBucket: "order-yummy.firebasestorage.app",
  messagingSenderId: "142798840175",
  appId: "1:142798840175:web:1091d977784312c1fe4089a",
  measurementId: "G-GQ7MEPZSSJ",
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error.code === "app/duplicate-app") {
    // App already initialized, get existing instance
    app = getApp();
  } else {
    console.error("Firebase initialization error:", error);
    throw error;
  }
}

const db = getFirestore(app);
const auth = getAuth(app);

/**
 * YUMMY Firebase Service Class
 * Centralized service để quản lý tất cả Firebase operations
 */
class YummyFirebaseService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.currentUser = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    try {
      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.handleAuthStateChange(user);
      });

      this.isInitialized = true;
      console.log("✅ YummyFirebaseService initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize YummyFirebaseService:", error);
    }
  }

  handleAuthStateChange(user) {
    console.log(
      "🔐 Auth state changed:",
      user ? user.email || "Anonymous" : "Not logged in"
    );

    // Dispatch custom event for auth state change
    window.dispatchEvent(
      new CustomEvent("yummy-auth-changed", {
        detail: { user, isLoggedIn: !!user },
      })
    );
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Đăng nhập với email/password
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log("✅ User signed in:", userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("❌ Sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  async signUp(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Tạo user profile trong Firestore
      await this.createUserProfile(user.uid, {
        email: user.email,
        role: userData.role || "customer",
        displayName: userData.displayName || email.split("@")[0],
        createdAt: serverTimestamp(),
        ...userData,
      });

      // Nếu là admin -> tạo document trong collection admins để pass security rules
      if ((userData.role || "customer") === "admin") {
        try {
          await this.ensureAdminDocument(user.uid, {
            email: user.email,
            createdAt: serverTimestamp(),
            displayName: userData.displayName || "Administrator",
          });
        } catch (adminDocErr) {
          console.warn("⚠️ Cannot create admin doc yet:", adminDocErr.message);
        }
      }

      console.log("✅ User created:", user.email);
      return { success: true, user };
    } catch (error) {
      console.error("❌ Sign up error:", error);
      return { success: false, error: error.message, code: error.code };
    }
  }

  /**
   * Đăng nhập anonymous cho customer
   */
  async signInAnonymously() {
    try {
      const userCredential = await signInAnonymously(this.auth);
      console.log("✅ Anonymous user signed in");
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("❌ Anonymous sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Đăng xuất
   */
  async signOut() {
    try {
      await signOut(this.auth);
      console.log("✅ User signed out");
      return { success: true };
    } catch (error) {
      console.error("❌ Sign out error:", error);
      return { success: false, error: error.message };
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Tạo user profile trong Firestore
   */
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(this.db, "users", userId);
      // setDoc với merge true sẽ tạo mới nếu chưa có hoặc cập nhật các field đưa vào
      await setDoc(userRef, userData, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("❌ Create user profile error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Đảm bảo có document admin để rules cho phép các thao tác admin.
   */
  async ensureAdminDocument(userId, data = {}) {
    try {
      const adminRef = doc(this.db, "admins", userId);
      await setDoc(adminRef, { role: "admin", ...data }, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy user profile
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(this.db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() };
      } else {
        return { success: false, error: "User profile not found" };
      }
    } catch (error) {
      console.error("❌ Get user profile error:", error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MENU MANAGEMENT ====================

  /**
   * Lấy tất cả menu items
   */
  async getMenuItems() {
    try {
      const menuRef = collection(this.db, "menu");
      const querySnapshot = await getDocs(
        query(menuRef, orderBy("category"), orderBy("name"))
      );

      const menuItems = [];
      querySnapshot.forEach((doc) => {
        menuItems.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Retrieved ${menuItems.length} menu items`);
      return { success: true, data: menuItems };
    } catch (error) {
      console.error("❌ Get menu items error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Thêm menu item mới (Admin only)
   */
  async addMenuItem(menuData) {
    try {
      // Check if user is admin
      if (!(await this.isAdmin())) {
        return { success: false, error: "Unauthorized: Admin access required" };
      }

      const menuRef = collection(this.db, "menu");
      const docRef = await addDoc(menuRef, {
        ...menuData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });

      console.log("✅ Menu item added with ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("❌ Add menu item error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cập nhật menu item (Admin only)
   */
  async updateMenuItem(itemId, updateData) {
    try {
      if (!(await this.isAdmin())) {
        return { success: false, error: "Unauthorized: Admin access required" };
      }

      const menuRef = doc(this.db, "menu", itemId);
      await updateDoc(menuRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Menu item updated:", itemId);
      return { success: true };
    } catch (error) {
      console.error("❌ Update menu item error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Xóa menu item (Admin only)
   */
  async deleteMenuItem(itemId) {
    try {
      if (!(await this.isAdmin())) {
        return { success: false, error: "Unauthorized: Admin access required" };
      }

      const menuRef = doc(this.db, "menu", itemId);
      await deleteDoc(menuRef);

      console.log("✅ Menu item deleted:", itemId);
      return { success: true };
    } catch (error) {
      console.error("❌ Delete menu item error:", error);
      return { success: false, error: error.message };
    }
  }

  // ==================== TABLE MANAGEMENT ====================

  /**
   * Lấy tất cả bàn
   */
  async getTables() {
    try {
      const tablesRef = collection(this.db, "tables");
      const querySnapshot = await getDocs(
        query(tablesRef, orderBy("tableNumber"))
      );

      const tables = [];
      querySnapshot.forEach((doc) => {
        tables.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return { success: true, data: tables };
    } catch (error) {
      console.error("❌ Get tables error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tạo bàn mới (Admin only)
   */
  async createTable(tableData) {
    try {
      if (!(await this.isAdmin())) {
        return { success: false, error: "Unauthorized: Admin access required" };
      }

      const tablesRef = collection(this.db, "tables");
      const docRef = await addDoc(tablesRef, {
        tableNumber: tableData.tableNumber,
        capacity: tableData.capacity || 4,
        status: "available", // available, occupied, reserved, cleaning
        location: tableData.location || "",
        notes: tableData.notes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Table created with ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("❌ Create table error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cập nhật trạng thái bàn
   */
  async updateTableStatus(tableId, status, additionalData = {}) {
    try {
      const tableRef = doc(this.db, "tables", tableId);
      await updateDoc(tableRef, {
        status,
        ...additionalData,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Table status updated:", tableId, status);
      return { success: true };
    } catch (error) {
      console.error("❌ Update table status error:", error);
      return { success: false, error: error.message };
    }
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * Tạo order mới
   */
  async createOrder(orderData) {
    try {
      const ordersRef = collection(this.db, "orders");
      const docRef = await addDoc(ordersRef, {
        customerId: this.currentUser?.uid || "anonymous",
        customerInfo: orderData.customerInfo || {},
        tableId: orderData.tableId || null,
        tableNumber: orderData.tableNumber || null,
        items: orderData.items || [],
        totalAmount: orderData.totalAmount || 0,
        status: "pending", // pending, confirmed, preparing, ready, served, cancelled
        orderType: orderData.orderType || "dine-in", // dine-in, takeaway, delivery
        notes: orderData.notes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Order created with ID:", docRef.id);

      // Update table status if dine-in
      if (orderData.tableId && orderData.orderType === "dine-in") {
        await this.updateTableStatus(orderData.tableId, "occupied", {
          currentOrderId: docRef.id,
        });
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("❌ Create order error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy tất cả orders
   */
  async getOrders(filters = {}) {
    try {
      let ordersQuery = collection(this.db, "orders");

      // Apply filters
      if (filters.status) {
        ordersQuery = query(ordersQuery, where("status", "==", filters.status));
      }
      if (filters.tableId) {
        ordersQuery = query(
          ordersQuery,
          where("tableId", "==", filters.tableId)
        );
      }
      if (filters.limit) {
        ordersQuery = query(ordersQuery, limit(filters.limit));
      }

      ordersQuery = query(ordersQuery, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(ordersQuery);
      const orders = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return { success: true, data: orders };
    } catch (error) {
      console.error("❌ Get orders error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cập nhật trạng thái order
   */
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const orderRef = doc(this.db, "orders", orderId);
      await updateDoc(orderRef, {
        status,
        ...additionalData,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Order status updated:", orderId, status);
      return { success: true };
    } catch (error) {
      console.error("❌ Update order status error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Listen to real-time order updates
   */
  subscribeToOrders(callback, filters = {}) {
    try {
      let ordersQuery = collection(this.db, "orders");

      if (filters.status) {
        ordersQuery = query(ordersQuery, where("status", "==", filters.status));
      }

      ordersQuery = query(ordersQuery, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        callback(orders);
      });

      return unsubscribe;
    } catch (error) {
      console.error("❌ Subscribe to orders error:", error);
      return null;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Kiểm tra xem user hiện tại có phải admin không
   */
  async isAdmin() {
    if (!this.currentUser) return false;

    try {
      const userProfile = await this.getUserProfile(this.currentUser.uid);
      return userProfile.success && userProfile.data.role === "admin";
    } catch (error) {
      return false;
    }
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Initialize sample data (development only)
   */
  async initializeSampleData() {
    try {
      console.log("🔄 Initializing sample data...");

      // Sample menu items
      const sampleMenuItems = [
        {
          name: "Phở Bò Tái",
          category: "Món chính",
          price: 85000,
          description: "Phở bò tái với nước dùng thơm ngon, thịt bò tái tươi",
          image: "https://placehold.co/400x300/e9a28a/FFFFFF?text=Phở+Bò",
          isActive: true,
        },
        {
          name: "Bánh Mì Thịt Nướng",
          category: "Món nhẹ",
          price: 35000,
          description:
            "Bánh mì giòn với thịt nướng đậm đà, rau cải và sauce đặc biệt",
          image: "https://placehold.co/400x300/a3cbe0/FFFFFF?text=Bánh+Mì",
          isActive: true,
        },
        {
          name: "Cà Phê Đen",
          category: "Đồ uống",
          price: 25000,
          description: "Cà phê đen đậm đà rang xay tại chỗ",
          image: "https://placehold.co/400x300/8B4513/FFFFFF?text=Cà+Phê",
          isActive: true,
        },
      ];

      // Add sample menu items
      for (const item of sampleMenuItems) {
        await addDoc(collection(this.db, "menu"), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Sample tables
      const sampleTables = [
        { tableNumber: 1, capacity: 2, location: "Tầng 1" },
        { tableNumber: 2, capacity: 4, location: "Tầng 1" },
        { tableNumber: 3, capacity: 6, location: "Tầng 1" },
        { tableNumber: 4, capacity: 4, location: "Tầng 2" },
      ];

      // Add sample tables
      for (const table of sampleTables) {
        await addDoc(collection(this.db, "tables"), {
          ...table,
          status: "available",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      console.log("✅ Sample data initialized successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Initialize sample data error:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize and export service
const yummyFirebaseService = new YummyFirebaseService();

// Make service available globally
window.yummyFirebaseService = yummyFirebaseService;

// Export both default and named
export { YummyFirebaseService };
export default yummyFirebaseService;
