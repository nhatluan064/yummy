"use client";

import { useState, useEffect } from "react";
import { tableService, Table } from "@/lib/table.service";
import { menuService } from "@/lib/menu.service";
import { orderService } from "@/lib/order.service";
import { Order, OrderItem, MenuItem } from "@/lib/types";
import type { WithId } from "@/lib/firestore.service";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/Toast";

type OrderType = "dine-in" | "takeaway" | "delivery" | null;
type DraftOrder = { tableNumber: string; items: OrderItem[]; totalOrders: number };

export default function ManageOrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<OrderType>(null);
  const [showModal, setShowModal] = useState(false);
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draftOrders");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  
  // Data
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<WithId<MenuItem>[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dine-in specific
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [tableOrders, setTableOrders] = useState<WithId<Order>[]>([]);
  
  // Cart
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Mobile tabs
  const [mobileTab, setMobileTab] = useState<"cart" | "menu">("cart");
  
  // Delivery form
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: "",
    customerPhone: "",
    address: ""
  });

  // Load menu and subscribe to tables
  useEffect(() => {
    loadMenu();
    
    // Subscribe to real-time table updates
    const unsubscribe = tableService.subscribeToTables((updatedTables) => {
      setTables(updatedTables);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Persist draftOrders to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("draftOrders", JSON.stringify(draftOrders));
    }
  }, [draftOrders]);
  
  const loadMenu = async () => {
    try {
      const menuData = await menuService.getAll();
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error loading menu:", error);
    }
  };
  
  const openModal = async (type: OrderType) => {
    setSelectedType(type);
    setShowModal(true);
    // Reload draftOrders from localStorage to sync with kitchen changes
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draftOrders");
      if (saved) {
        try {
          const drafts = JSON.parse(saved);
          
          // Auto-cleanup: Validate drafts against actual orders
          if (type === "dine-in") {
            const validDrafts = [];
            for (const draft of drafts) {
              const orders = await orderService.getAll([
                orderService.by("tableNumber", "==", draft.tableNumber),
                orderService.by("status", "in", ["pending", "preparing", "ready"])
              ]);
              // Keep draft only if it has pending items OR actual orders
              if (draft.items?.length > 0 || orders.length > 0) {
                // Update totalOrders to match reality
                draft.totalOrders = orders.length;
                validDrafts.push(draft);
              }
            }
            setDraftOrders(validDrafts);
            localStorage.setItem("draftOrders", JSON.stringify(validDrafts));
          } else {
            setDraftOrders(drafts);
          }
        } catch (e) {
          console.error("Error reloading draft orders:", e);
        }
      }
    }
    setCart([]);
    setSelectedTable(null);
    setExistingOrder(null);
    setDeliveryForm({ customerName: "", customerPhone: "", address: "" });
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedType(null);
    setCart([]);
    setSelectedTable(null);
    setExistingOrder(null);
    setTableOrders([]);
    // Reload draftOrders on close to sync
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draftOrders");
      if (saved) {
        try {
          setDraftOrders(JSON.parse(saved));
        } catch (e) {
          console.error("Error reloading draft orders:", e);
        }
      }
    }
  };
  
  // Handle table selection for dine-in
  const handleSelectTable = async (table: Table) => {
    setSelectedTable(table);
    // Load draft order if exists
    const existingDraft = draftOrders.find(d => d.tableNumber === table.tableNumber);
    if (existingDraft) {
      setCart(existingDraft.items);
    } else {
      setCart([]);
    }
    // Load active orders for this table
    try {
      const orders = await orderService.getAll([
        orderService.by("tableNumber", "==", table.tableNumber),
        orderService.by("status", "in", ["pending", "preparing", "ready"])
      ]);
      setTableOrders(orders);
      
      // Auto-cleanup: If draft has totalOrders but no actual orders, reset it
      if (existingDraft && existingDraft.totalOrders > 0 && orders.length === 0) {
        console.log("Auto-cleanup: Resetting table due to inconsistent state");
        const newDrafts = draftOrders.filter(d => d.tableNumber !== table.tableNumber);
        setDraftOrders(newDrafts);
        setCart([]);
        showToast("⚠ Bàn đã được tự động reset do không nhất quán", 3000, "success");
      }
    } catch (error) {
      console.error("Error loading table orders:", error);
      setTableOrders([]);
    }
    // Auto switch to menu tab on mobile
    if (window.innerWidth < 768) {
      setMobileTab("menu");
    }
  };
  
  // Check if table has active orders
  const tableHasOrders = (tableNumber: string) => {
    const draft = draftOrders.find(d => d.tableNumber === tableNumber);
    return draft ? draft.totalOrders > 0 : false;
  };
  
  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.price.toString().includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = ["all", ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  // Map category code to Vietnamese name
  const getCategoryName = (cat: string) => {
    const categoryMap: Record<string, string> = {
      "all": "Tất cả",
      "an-vat": "Ăn vặt",
      "coffee": "Coffee",
      "hu-tieu": "Hủ tiếu",
      "mi-cay": "Mì cay",
      "milk-tea": "Trà - Trà sữa",
      "nuoc-giai-khat": "Nước giải khát",
      "rau-an-kem": "Rau ăn kèm"
    };
    return categoryMap[cat] || cat;
  };
  
  // Add item to cart
  const addToCart = (menuItem: WithId<MenuItem>) => {
    const existing = cart.find(item => item.menuItemId === menuItem.id);
    if (existing) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id!,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };
  
  // Update quantity
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(cart.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      ));
    }
  };
  
  // Calculate total
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Update draft with new items and order count
  const updateDraft = (tableNumber: string, items: OrderItem[], incrementOrders: boolean = false) => {
    const newDrafts = draftOrders.filter(d => d.tableNumber !== tableNumber);
    const existing = draftOrders.find(d => d.tableNumber === tableNumber);
    const totalOrders = incrementOrders ? (existing?.totalOrders || 0) + 1 : (existing?.totalOrders || 0);
    newDrafts.push({ tableNumber, items, totalOrders });
    setDraftOrders(newDrafts);
  };
  
  // Cleanup all tables - validate and remove stuck drafts
  const cleanupAllTables = async () => {
    setLoading(true);
    try {
      const validDrafts = [];
      let cleanedCount = 0;
      
      for (const draft of draftOrders) {
        const orders = await orderService.getAll([
          orderService.by("tableNumber", "==", draft.tableNumber),
          orderService.by("status", "in", ["pending", "preparing", "ready"])
        ]);
        
        // Keep draft only if it has pending items OR actual orders
        if (draft.items?.length > 0 || orders.length > 0) {
          // Update totalOrders to match reality
          draft.totalOrders = orders.length;
          validDrafts.push(draft);
        } else {
          cleanedCount++;
        }
      }
      
      setDraftOrders(validDrafts);
      localStorage.setItem("draftOrders", JSON.stringify(validDrafts));
      
      // Refetch tableOrders nếu đang có bàn được chọn
      if (selectedTable) {
        const orders = await orderService.getAll([
          orderService.by("tableNumber", "==", selectedTable.tableNumber),
          orderService.by("status", "in", ["pending", "preparing", "ready"])
        ]);
        setTableOrders(orders);
        
        // Update cart từ draft sau khi cleanup
        const updatedDraft = validDrafts.find(d => d.tableNumber === selectedTable.tableNumber);
        if (updatedDraft) {
          setCart(updatedDraft.items || []);
        }
      }
      
      if (cleanedCount > 0) {
        showToast(`✓ Đã làm mới! Xóa ${cleanedCount} bàn bị tréo.`, 3000, "success");
      } else {
        showToast("✓ Tất cả bàn đã đồng bộ!", 3000, "success");
      }
    } catch (error) {
      console.error("Error cleaning up tables:", error);
      showToast("Có lỗi khi làm mới!", 3000, "error");
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel order from history
  const cancelOrderFromHistory = async (orderId: string, orderCode: string) => {
    const confirmed = confirm(
      `Hủy đơn ${orderCode}?\n\nTất cả dữ liệu sẽ bị xóa vĩnh viễn. Không thể khôi phục!`
    );
    if (!confirmed) return;
    
    try {
      await orderService.delete(orderId);
      
      // Sync with draftOrders
      if (selectedTable) {
        const draft = draftOrders.find(d => d.tableNumber === selectedTable.tableNumber);
        if (draft) {
          draft.totalOrders = Math.max(0, draft.totalOrders - 1);
          if (draft.totalOrders === 0 && (!draft.items || draft.items.length === 0)) {
            setDraftOrders(draftOrders.filter(d => d.tableNumber !== selectedTable.tableNumber));
          } else {
            setDraftOrders([...draftOrders]);
          }
        }
        // Reload orders for this table
        const orders = await orderService.getAll([
          orderService.by("tableNumber", "==", selectedTable.tableNumber),
          orderService.by("status", "in", ["pending", "preparing", "ready"])
        ]);
        setTableOrders(orders);
      }
      
      showToast("✓ Đã hủy đơn thành công!", 3000, "success");
    } catch (error) {
      console.error("Error canceling order:", error);
      showToast("Có lỗi xảy ra!", 3000, "error");
    }
  };
  
  // Payment - thanh toán tất cả orders của bàn
  const handlePayment = async () => {
    if (!selectedTable) return;
    
    const confirmed = confirm(
      `Thanh toán tất cả món của ${selectedTable.tableNumber}?\n\nSẽ tạo bill và đóng bàn.`
    );
    if (!confirmed) return;
    
    setLoading(true);
    try {
      // 1. Lấy tất cả orders của bàn
      const tableOrdersList = await orderService.getAll([
        orderService.by("tableNumber", "==", selectedTable.tableNumber),
        orderService.by("status", "in", ["pending", "preparing", "ready"])
      ]);
      
      if (tableOrdersList.length === 0) {
        showToast("Không có đơn nào để thanh toán!", 3000, "error");
        setLoading(false);
        return;
      }
      
      // 2. Chuyển tất cả orders sang "completed" và tạo bills
      const { billService } = await import("@/lib/sdk");
      for (const order of tableOrdersList) {
        // Update status
        await orderService.updateStatus(order.id!, "completed");
        
        // Create bill
        await billService.ensureForOrder({
          id: order.id!,
          orderCode: order.orderCode!,
          customerName: order.customerName || "",
          tableNumber: order.tableNumber,
          items: order.items,
          totalAmount: order.totalAmount,
        });
      }
      
      // 3. Xóa draft và đóng bàn
      const newDrafts = draftOrders.filter(d => d.tableNumber !== selectedTable.tableNumber);
      setDraftOrders(newDrafts);
      localStorage.setItem("draftOrders", JSON.stringify(newDrafts));
      
      showToast(`✓ Đã thanh toán ${tableOrdersList.length} đơn! Bàn đóng.`, 3000, "success");
      closeModal();
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error during payment:", error);
      showToast("Có lỗi khi thanh toán!", 3000, "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0) {
      showToast("Vui lòng chọn món!", 3000, "error");
      return;
    }
    
    setLoading(true);
    try {
      const orderData: Partial<Order> = {
        items: cart,
        totalAmount: getTotal(),
        status: "pending"
      };
      
      if (selectedType === "dine-in") {
        if (!selectedTable) {
          showToast("Vui lòng chọn bàn!", 3000, "error");
          setLoading(false);
          return;
        }
        orderData.orderType = "dine-in";
        orderData.tableNumber = selectedTable.tableNumber;
        orderData.customerName = `Bàn ${selectedTable.tableNumber}`;
        // Keep table active, just clear current cart
        updateDraft(selectedTable.tableNumber, [], true);
        setCart([]);
      } else if (selectedType === "takeaway") {
        orderData.orderType = "takeaway";
        orderData.customerName = "Khách mang đi";
      } else if (selectedType === "delivery") {
        if (!deliveryForm.customerName || !deliveryForm.customerPhone || !deliveryForm.address) {
          showToast("Vui lòng nhập đầy đủ thông tin (Họ tên, SDT, Địa chỉ)!", 3000, "error");
          setLoading(false);
          return;
        }
        orderData.orderType = "delivery";
        orderData.customerName = deliveryForm.customerName;
        orderData.customerPhone = deliveryForm.customerPhone;
        orderData.notes = `Địa chỉ: ${deliveryForm.address}`;
      }
      
      await orderService.createOrder(orderData as Omit<Order, "id" | "createdAt" | "updatedAt" | "status" | "orderCode">);
      
      if (selectedType === "dine-in") {
        showToast("✓ Đã gửi món cho bếp! Bàn vẫn mở.", 3000, "success");
        // Don't close modal for dine-in
      } else {
        showToast("✓ Đã tạo đơn hàng thành công!", 3000, "success");
        closeModal();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showToast("Có lỗi xảy ra!", 3000, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Quản lý Orders
        </h1>
        <p className="text-neutral-600 mt-1">
          Chọn loại đơn hàng để bắt đầu
        </p>
      </div>

      {/* Order Type Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Dine-in Orders */}
        <button
          onClick={() => openModal("dine-in")}
          className={`p-8 rounded-2xl border-2 transition-all duration-200 ${
            selectedType === "dine-in"
              ? "border-purple-500 bg-purple-50 shadow-xl scale-105"
              : "border-neutral-200 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-102"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              selectedType === "dine-in" ? "bg-purple-500" : "bg-purple-100"
            }`}>
              <svg
                className={`w-10 h-10 ${selectedType === "dine-in" ? "text-white" : "text-purple-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="4" width="16" height="16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2"/>
                <line x1="12" y1="4" x2="12" y2="20" strokeWidth="2"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-xl ${
                selectedType === "dine-in" ? "text-purple-700" : "text-neutral-800"
              }`}>
                Orders tại bàn
              </h3>
              <p className="text-sm text-neutral-600 mt-2">Đơn ăn tại chỗ</p>
            </div>
          </div>
        </button>

        {/* Takeaway Orders */}
        <button
          onClick={() => openModal("takeaway")}
          className={`p-8 rounded-2xl border-2 transition-all duration-200 ${
            selectedType === "takeaway"
              ? "border-orange-500 bg-orange-50 shadow-xl scale-105"
              : "border-neutral-200 bg-white hover:border-orange-300 hover:shadow-lg hover:scale-102"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              selectedType === "takeaway" ? "bg-orange-500" : "bg-orange-100"
            }`}>
              <svg
                className={`w-10 h-10 ${selectedType === "takeaway" ? "text-white" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-xl ${
                selectedType === "takeaway" ? "text-orange-700" : "text-neutral-800"
              }`}>
                Orders mang đi
              </h3>
              <p className="text-sm text-neutral-600 mt-2">Đơn take away</p>
            </div>
          </div>
        </button>

        {/* Delivery Orders */}
        <button
          onClick={() => openModal("delivery")}
          className={`p-8 rounded-2xl border-2 transition-all duration-200 ${
            selectedType === "delivery"
              ? "border-pink-500 bg-pink-50 shadow-xl scale-105"
              : "border-neutral-200 bg-white hover:border-pink-300 hover:shadow-lg hover:scale-102"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              selectedType === "delivery" ? "bg-pink-500" : "bg-pink-100"
            }`}>
              <svg
                className={`w-10 h-10 ${selectedType === "delivery" ? "text-white" : "text-pink-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-xl ${
                selectedType === "delivery" ? "text-pink-700" : "text-neutral-800"
              }`}>
                Orders Ship
              </h3>
              <p className="text-sm text-neutral-600 mt-2">Đơn giao hàng</p>
            </div>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed left-0 right-0 top-0 bottom-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
          style={{ margin: 0, width: '100vw', height: '100vh' }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                {selectedType === "dine-in" && "🪑 Orders tại bàn"}
                {selectedType === "takeaway" && "🛒 Orders mang đi"}
                {selectedType === "delivery" && "🏍️ Orders Ship"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden border-b flex">
              <button
                onClick={() => setMobileTab("cart")}
                className={`flex-1 py-3 font-medium ${mobileTab === "cart" ? "border-b-2 border-primary-500 text-primary-600" : "text-neutral-500"}`}
              >
                Bàn & Orders
              </button>
              <button
                onClick={() => setMobileTab("menu")}
                className={`flex-1 py-3 font-medium ${mobileTab === "menu" ? "border-b-2 border-primary-500 text-primary-600" : "text-neutral-500"}`}
              >
                Chọn món
              </button>
            </div>

            {/* 2 Column Layout (Desktop) / Tabbed (Mobile) */}
            <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] md:h-[calc(100vh-180px)]">
              {/* LEFT COLUMN: Tables + Cart + Buttons */}
              <div className={`${mobileTab === "cart" ? "flex" : "hidden"} md:flex w-full md:w-2/5 flex-col md:border-r`}>
                {/* Table Selection or Customer Info */}
                <div className="p-4 border-b overflow-y-auto flex-shrink-0 max-h-[35%]">
                  {selectedType === "dine-in" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm">Chọn bàn</h3>
                        <button
                          onClick={cleanupAllTables}
                          disabled={loading}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          title="Kiểm tra và xóa các bàn bị tréo"
                        >
                          <span>🔄</span>
                          <span>Làm mới dữ liệu</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
                        {tables.map((table) => {
                          const isSelected = selectedTable?.id === table.id;
                          const draft = draftOrders.find(d => d.tableNumber === table.tableNumber);
                          const hasActiveOrders = draft && draft.totalOrders > 0;
                          const hasPendingItems = draft && draft.items.length > 0;
                          return (
                            <button
                              key={table.id}
                              onClick={() => handleSelectTable(table)}
                              className={`relative p-3 md:p-2 rounded border-2 font-bold text-base md:text-sm ${
                                isSelected 
                                  ? "border-purple-500 bg-purple-100" 
                                  : hasActiveOrders 
                                  ? "border-orange-400 bg-orange-50 hover:border-orange-500" 
                                  : "border-green-300 bg-green-50 hover:border-green-500"
                              }`}
                            >
                              {table.tableNumber}
                              {hasPendingItems && <span className="absolute -top-1 -right-1 w-5 h-5 md:w-4 md:h-4 bg-blue-500 text-white rounded-full text-xs md:text-[10px] flex items-center justify-center">{draft.items.length}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedType === "delivery" && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm mb-2">Thông tin khách</h3>
                      <input type="text" placeholder="Họ tên *" value={deliveryForm.customerName} onChange={(e) => setDeliveryForm({...deliveryForm, customerName: e.target.value})} className="input w-full text-sm" />
                      <input type="text" placeholder="Số điện thoại *" value={deliveryForm.customerPhone} onChange={(e) => setDeliveryForm({...deliveryForm, customerPhone: e.target.value})} className="input w-full text-sm" />
                      <input type="text" placeholder="Địa chỉ *" value={deliveryForm.address} onChange={(e) => setDeliveryForm({...deliveryForm, address: e.target.value})} className="input w-full text-sm" />
                    </div>
                  )}
                </div>

                {/* Cart */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* Orders đã gửi */}
                  {selectedType === "dine-in" && tableOrders.length > 0 && (
                    <div className="mb-4 pb-4 border-b">
                      <h3 className="font-bold text-xs text-neutral-500 mb-2">Món đã gửi bếp ({tableOrders.length} đơn)</h3>
                      {tableOrders.map((order) => (
                        <div key={order.id} className={`mb-2 p-2 border rounded text-xs relative ${
                          order.status === "ready" ? "bg-green-50 border-green-300" :
                          order.status === "preparing" ? "bg-blue-50 border-blue-300" :
                          "bg-yellow-50 border-yellow-300"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-700">{order.orderCode}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                order.status === "preparing" ? "bg-blue-100 text-blue-700" :
                                order.status === "ready" ? "bg-green-100 text-green-700" :
                                "bg-neutral-100"
                              }`}>
                                {order.status === "pending" ? "⏳ Chờ" :
                                 order.status === "preparing" ? "👨‍🍳 Đang làm" :
                                 order.status === "ready" ? "✅ Xong" :
                                 order.status}
                              </span>
                            </div>
                            <button
                              onClick={() => cancelOrderFromHistory(order.id!, order.orderCode!)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors"
                              title="Hủy đơn"
                            >
                              Hủy
                            </button>
                          </div>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-neutral-600">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <h3 className="font-bold text-sm mb-3">Đang chọn món</h3>
                  {cart.length > 0 ? (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex items-center gap-2 text-xs bg-neutral-50 p-2 rounded">
                          <span className="flex-1 truncate font-medium">{item.name}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-5 h-5 rounded bg-neutral-200 hover:bg-neutral-300">-</button>
                            <span className="w-6 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-5 h-5 rounded bg-neutral-200 hover:bg-neutral-300">+</button>
                            <span className="w-16 text-right font-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                            <button onClick={() => updateQuantity(item.menuItemId, 0)} className="w-5 h-5 rounded bg-red-100 text-red-600">×</button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between font-bold">
                        <span>Tổng:</span>
                        <span className="text-primary-600">{getTotal().toLocaleString()}₫</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-400 text-sm text-center py-8">Chưa có món nào</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="p-4 border-t bg-neutral-50 space-y-2">
                  <div className="flex gap-2">
                    <button onClick={closeModal} className="btn-secondary flex-1">Hủy</button>
                    {selectedType === "dine-in" && selectedTable && tableOrders.length > 0 && (
                      <button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex-1 disabled:opacity-50"
                      >
                        💵 Thanh toán ({tableOrders.length} đơn)
                      </button>
                    )}
                  </div>
                  <button onClick={submitOrder} disabled={loading || cart.length === 0} className="btn-primary w-full disabled:opacity-50">
                    {loading ? "Đang xử lý..." : `Orders (${cart.length})`}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Search + Categories + Menu */}
              <div className={`${mobileTab === "menu" ? "flex" : "hidden"} md:flex w-full md:w-3/5 flex-col`}>
                {(selectedType === "takeaway" || selectedType === "delivery" || selectedTable) && (
                  <>
                    {/* Search */}
                    <div className="p-4 border-b">
                      <input
                        type="text"
                        placeholder="🔍 Tìm tên món, giá, danh mục..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full"
                      />
                    </div>

                    {/* Categories */}
                    <div className="p-4 border-b overflow-x-auto">
                      <div className="flex gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                              selectedCategory === cat ? "bg-purple-600 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {getCategoryName(cat)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredMenuItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="card p-4 md:p-3 hover:shadow-lg transition-all text-left active:scale-95"
                          >
                            <h4 className="font-bold text-sm md:text-sm mb-1 truncate">{item.name}</h4>
                            <p className="text-xs text-neutral-500 mb-1">{item.category}</p>
                            <p className="text-primary-600 font-bold text-base md:text-sm">{item.price.toLocaleString()}₫</p>
                          </button>
                        ))}
                      </div>
                      {filteredMenuItems.length === 0 && (
                        <p className="text-neutral-400 text-center py-8">Không tìm thấy món nào</p>
                      )}
                    </div>
                  </>
                )}
                {!selectedTable && selectedType === "dine-in" && (
                  <div className="flex-1 flex items-center justify-center text-neutral-400">
                    <p>Vui lòng chọn bàn để xem menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
