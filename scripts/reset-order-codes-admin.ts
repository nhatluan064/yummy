/**
 * Script to reset order codes using Firebase Admin SDK
 * Requires service account key file
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Check for service account key
const serviceAccountPath = path.join(__dirname, "service-account-key.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Missing service-account-key.json");
  console.log("\n📥 To get this file:");
  console.log("1. Go to Firebase Console");
  console.log("2. Project Settings → Service Accounts");
  console.log("3. Click 'Generate new private key'");
  console.log("4. Save as 'service-account-key.json' in scripts/ folder");
  console.log("\n⚠️ Or use Cách 1: Temporarily open Firestore rules");
  process.exit(1);
}

const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "order-yummy",
});

const db = admin.firestore();

interface Order {
  id: string;
  orderType?: "dine-in" | "takeaway" | "delivery";
  orderCode?: string;
  createdAt?: any;
}

async function resetOrderCodes() {
  console.log("🔄 Starting order code reset process with Admin SDK...\n");

  try {
    // Fetch all orders, sorted by creation time
    const snapshot = await db.collection("orders").orderBy("createdAt", "asc").get();

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

    snapshot.forEach((doc) => {
      const data = doc.data();
      const order: Order = {
        id: doc.id,
        orderType: data.orderType || "dine-in",
        orderCode: data.orderCode,
        createdAt: data.createdAt,
      };
      
      const type = order.orderType || "dine-in";
      ordersByType[type].push(order);
    });

    // Process each order type
    let totalUpdated = 0;
    const batch = db.batch();
    let batchCount = 0;
    
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
          const orderRef = db.collection("orders").doc(order.id);
          batch.update(orderRef, { orderCode: newOrderCode });
          batchCount++;

          console.log(`  ✅ ${order.orderCode || "NO-CODE"} → ${newOrderCode}`);
          totalUpdated++;

          // Commit batch every 500 operations (Firestore limit)
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        } else {
          console.log(`  ⏭️  ${newOrderCode} (no change)`);
        }
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
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
