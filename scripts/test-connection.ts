/**
 * Test Firebase connection before running the main script
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbUNjBPEaZOtI_cNCcCJ1DBXUUdrP_6oE",
  authDomain: "order-yummy.firebaseapp.com",
  projectId: "order-yummy",
  storageBucket: "order-yummy.firebasestorage.app",
  messagingSenderId: "142798840175",
  appId: "1:142798840175:web:1091d97784312c1fe4089a",
  measurementId: "G-GQ7MEPZSSJ",
};

async function testConnection() {
  console.log("🔌 Testing Firebase connection...\n");

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log("✅ Firebase initialized successfully");
    console.log(`📦 Project ID: ${firebaseConfig.projectId}\n`);

    // Try to fetch a few orders
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, limit(3));
    const snapshot = await getDocs(q);

    console.log(`📊 Sample orders fetched: ${snapshot.size} orders`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.orderCode || doc.id} (${data.orderType || 'unknown'})`);
    });

    console.log("\n✅ Connection test successful!");
    console.log("👉 You can now run: npm run reset-orders");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed:", error);
    console.log("\n🔍 Troubleshooting:");
    console.log("  1. Check internet connection");
    console.log("  2. Verify Firebase config in firebase.ts");
    console.log("  3. Check Firestore rules allow read access");
    process.exit(1);
  }
}

testConnection();
