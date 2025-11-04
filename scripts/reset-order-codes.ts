/**
 * Script to reset and renumber all order codes sequentially
 * This will reassign order codes starting from 001 for each order type
 * based on creation time (oldest first)
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbUNjBPEaZOtI_cNCcCJ1DBXUUdrP_6oE",
  authDomain: "order-yummy.firebaseapp.com",
  projectId: "order-yummy",
  storageBucket: "order-yummy.firebasestorage.app",
  messagingSenderId: "142798840175",
  appId: "1:142798840175:web:1091d97784312c1fe4089a",
  measurementId: "G-GQ7MEPZSSJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Order {
  id: string;
  orderType?: "dine-in" | "takeaway" | "delivery";
  orderCode?: string;
  createdAt?: any;
}

async function resetOrderCodes() {
  console.log("🔄 Starting order code reset process...\n");

  try {
    // Fetch all orders, sorted by creation time
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("❌ No orders found in database");
      return;
    }

    console.log(`📊 Found ${snapshot.size} orders total\n`);

    // Group orders by type
    const ordersByType: Record<string, Order[]> = {
      "dine-in": [],
      "takeaway": [],
      "delivery": [],
    };

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const order: Order = {
        id: docSnap.id,
        orderType: data.orderType || "dine-in",
        orderCode: data.orderCode,
        createdAt: data.createdAt,
      };
      
      const type = order.orderType || "dine-in";
      ordersByType[type].push(order);
    });

    // Process each order type
    let totalUpdated = 0;
    
    for (const [orderType, orders] of Object.entries(ordersByType)) {
      if (orders.length === 0) continue;

      console.log(`\n📋 Processing ${orderType} orders (${orders.length} orders)...`);

      // Determine prefix
      let typePrefix = "ORDER";
      if (orderType === "dine-in") {
        typePrefix = "ODER-TAIBAN";
      } else if (orderType === "takeaway") {
        typePrefix = "ODER-MANGDI";
      } else if (orderType === "delivery") {
        typePrefix = "ODER-SHIP";
      }

      // Renumber orders sequentially
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const newNumber = i + 1;
        const newOrderCode = `#DONHANG-${typePrefix}-${String(newNumber).padStart(3, "0")}`;

        // Only update if orderCode changed
        if (order.orderCode !== newOrderCode) {
          const orderRef = doc(db, "orders", order.id);
          await updateDoc(orderRef, {
            orderCode: newOrderCode
          });

          console.log(`  ✅ ${order.orderCode || "NO-CODE"} → ${newOrderCode}`);
          totalUpdated++;
        } else {
          console.log(`  ⏭️  ${newOrderCode} (no change)`);
        }
      }
    }

    console.log(`\n✅ Reset complete! Updated ${totalUpdated} orders`);
    console.log("\nSummary:");
    console.log(`  - Dine-in orders: ${ordersByType["dine-in"].length}`);
    console.log(`  - Takeaway orders: ${ordersByType["takeaway"].length}`);
    console.log(`  - Delivery orders: ${ordersByType["delivery"].length}`);

  } catch (error) {
    console.error("❌ Error resetting order codes:", error);
    throw error;
  }
}

// Run the script
resetOrderCodes()
  .then(() => {
    console.log("\n🎉 All done! You can now continue creating new orders.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
