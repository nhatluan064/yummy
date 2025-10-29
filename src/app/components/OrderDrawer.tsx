"use client";
import { useState, useEffect } from "react";
import { useOrder } from "./OrderContext";
import { orderService } from "@/lib/order.service";
import { tableService, Table } from "@/lib/table.service";
import { billService } from "@/lib/bill.service";
import type { Order } from "@/lib/types";
import { useToast } from "@/app/components/Toast";
import type { CurrentOrderItem } from "./OrderContext";

export default function OrderDrawer() {
  const {
    items,
    removeItem,
    setQuantity,
    total,
    isOpen,
    close,
    tableNumber,
    setTableNumber,
    tableId,
    setTableId,
    customerName,
    clear,
  } = useOrder();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [tableOrders, setTableOrders] = useState<Record<string, CurrentOrderItem[]>>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tableOrders');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [currentTableItems, setCurrentTableItems] = useState<CurrentOrderItem[]>([]);

  // Load tables and sync with Firebase when drawer opens
  useEffect(() => {
    if (isOpen) {
      const loadAndSync = async () => {
        try {
          setLoadingTables(true);
          
          // Load tables
          const tablesData = await tableService.getAllTables();
          setTables(tablesData);
          
          // Get all pending orders from Firebase
          const allOrders = await orderService.getAll([
            orderService.by('status', '==', 'pending')
          ]);
          
          // Build tableOrders from Firebase
          const syncedTableOrders: Record<string, CurrentOrderItem[]> = {};
          
          allOrders.forEach(order => {
            if (order.tableNumber) {
              // Find table ID from tableNumber
              const table = tablesData.find(t => t.tableNumber === order.tableNumber);
              const tableId = table?.id;
              if (tableId) {
                if (!syncedTableOrders[tableId]) {
                  syncedTableOrders[tableId] = [];
                }
                
                order.items.forEach((item: CurrentOrderItem) => {
                  const existing = syncedTableOrders[tableId].find((i: CurrentOrderItem) => i.name === item.name);
                  if (existing) {
                    existing.quantity += item.quantity;
                  } else {
                    syncedTableOrders[tableId].push({
                      menuItemId: item.menuItemId || item.name,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity
                    });
                  }
                });
              }
            }
          });
          
          // Update state and localStorage
          setTableOrders(syncedTableOrders);
          
        } catch (error) {
          console.error('Error loading tables and syncing:', error);
        } finally {
          setLoadingTables(false);
        }
      };
      
      loadAndSync();
      
      // Subscribe to orders changes for real-time sync
      const unsubscribe = orderService.subscribeToOrders(async (updatedOrders) => {
        // Only sync pending orders
        const pendingOrders = updatedOrders.filter(o => o.status === 'pending');
        
        const tablesData = await tableService.getAllTables();
        const syncedTableOrders: Record<string, CurrentOrderItem[]> = {};
        
        pendingOrders.forEach(order => {
          if (order.tableNumber) {
            const table = tablesData.find(t => t.tableNumber === order.tableNumber);
            const tableId = table?.id;
            if (tableId) {
              if (!syncedTableOrders[tableId]) {
                syncedTableOrders[tableId] = [];
              }
              
              order.items.forEach((item: CurrentOrderItem) => {
                const existing = syncedTableOrders[tableId].find((i: CurrentOrderItem) => i.name === item.name);
                if (existing) {
                  existing.quantity += item.quantity;
                } else {
                  syncedTableOrders[tableId].push({
                    menuItemId: item.menuItemId || item.name,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                  });
                }
              });
            }
          }
        });
        
        setTableOrders(syncedTableOrders);
        setTables(tablesData);
      });
      
      return () => unsubscribe();
    }
  }, [isOpen]);

  // Reload tables and sync after order/payment changes
  const reloadTablesAndSync = async () => {
    try {
      setLoadingTables(true);
      
      // Load tables
      const tablesData = await tableService.getAllTables();
      setTables(tablesData);
      
      // Get all pending orders from Firebase
      const allOrders = await orderService.getAll([
        orderService.by('status', '==', 'pending')
      ]);
      
      // Build tableOrders from Firebase
      const syncedTableOrders: Record<string, CurrentOrderItem[]> = {};
      
      allOrders.forEach(order => {
        if (order.tableNumber) {
          const table = tablesData.find(t => t.tableNumber === order.tableNumber);
          const tableId = table?.id;
          if (tableId) {
            if (!syncedTableOrders[tableId]) {
              syncedTableOrders[tableId] = [];
            }
            
            order.items.forEach((item: CurrentOrderItem) => {
              const existing = syncedTableOrders[tableId].find((i: CurrentOrderItem) => i.name === item.name);
              if (existing) {
                existing.quantity += item.quantity;
              } else {
                syncedTableOrders[tableId].push({
                  menuItemId: item.menuItemId || item.name,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity
                });
              }
            });
          }
        }
      });
      
      setTableOrders(syncedTableOrders);
      
    } catch (error) {
      console.error("Error reloading tables:", error);
    } finally {
      setLoadingTables(false);
    }
  };

  // Save to localStorage whenever tableOrders changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tableOrders', JSON.stringify(tableOrders));
    }
  }, [tableOrders]);

  // Load table items when selecting a table
  useEffect(() => {
    if (selectedTableId) {
      const savedItems = tableOrders[selectedTableId] || [];
      setCurrentTableItems([...savedItems]);
    } else {
      setCurrentTableItems([]);
    }
  }, [selectedTableId, tableOrders]);

  // Chọn bàn
  const selectTable = async (table: Table) => {
    if (!table.id) return;
    
    // Nếu click vào bàn đang được chọn và bàn đó chưa có món -> Bỏ chọn (toggle)
    if (selectedTableId === table.id && table.status === "empty" && !tableOrders[table.id]?.length) {
      setSelectedTableId("");
      setTableId("");
      setTableNumber("");
      return;
    }
    
    setSelectedTableId(table.id);
    setTableId(table.id);
    setTableNumber(table.tableNumber);
    
    // Load orders từ Firebase nếu bàn đang occupied và chưa có trong state
    if ((table.status === "occupied" || tableOrders[table.id]?.length > 0) &&
        (!tableOrders[table.id] || tableOrders[table.id].length === 0)) {
      await loadTableOrders(table.id, table.tableNumber);
    }
  };
  
  // Load orders from Firebase for occupied table
  const loadTableOrders = async (tId: string, tNumber: string) => {
    try {
      const orders = await orderService.getAll([
        orderService.by('tableNumber', '==', tNumber),
        orderService.by('status', '==', 'pending')
      ]);
      
      if (orders.length > 0) {
        // Merge all pending orders for this table
        const allItems: CurrentOrderItem[] = [];
        orders.forEach(order => {
          order.items.forEach(item => {
            const existing = allItems.find(i => i.name === item.name);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              allItems.push({
                menuItemId: item.menuItemId || item.name,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              });
            }
          });
        });
        
        setTableOrders(prev => ({
          ...prev,
          [tId]: allItems
        }));
      }
    } catch (error) {
      console.error('Error loading table orders:', error);
    }
  };

  const submitOrder = async () => {
    setError(null);
    if (items.length === 0) {
      setError("Bạn chưa chọn món nào");
      return;
    }
    if (!tableNumber || !tableId) {
      setError("Vui lòng chọn bàn");
      return;
    }
    setSubmitting(true);
    try {
      // Merge with existing items if table is occupied
      const existingItems = tableOrders[tableId] || [];
      const mergedItems = [...existingItems];
      
      // Add new items or update quantities
      items.forEach((newItem) => {
        const existingIndex = mergedItems.findIndex(i => i.name === newItem.name);
        if (existingIndex >= 0) {
          mergedItems[existingIndex].quantity += newItem.quantity;
        } else {
          mergedItems.push(newItem);
        }
      });
      
      const orderItems = mergedItems.map((i) => ({
        menuItemId: i.menuItemId || i.name,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      
      const totalAmount = mergedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      
      // Tạo order
      const { orderCode } = await orderService.createOrder({
        items: orderItems,
        customerName,
        totalAmount,
        orderType: "dine-in",
        tableNumber,
        notes: "",
        paymentMethod: "unpaid",
      } as Omit<Order, "id" | "createdAt" | "updatedAt" | "status">);
      
      // Cập nhật trạng thái bàn thành "occupied"
      await tableService.updateTableStatus(tableId, "occupied");
      
      // Save items for this table
      setTableOrders(prev => ({
        ...prev,
        [tableId]: mergedItems
      }));
      
      showToast(
        `Order đã được gửi cho Bếp!\nBàn: ${tableNumber}\nMã đơn: ${orderCode}`
      );
      
      // Clear the cart items but keep table items
      clear();
      setSelectedTableId("");
      setTableId("");
      setTableNumber("");
      await reloadTablesAndSync();
      close();
    } catch (e) {
      const err = e as Error;
      setError(err?.message || "Không thể tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle payment for occupied table
  const handlePayment = async () => {
    if (!tableId || !tableNumber) return;
    
    const tableItems = tableOrders[tableId];
    if (!tableItems || tableItems.length === 0) {
      setError("Bàn này không có món nào");
      return;
    }
    
    if (!confirm(`Xác nhận thanh toán cho ${tableNumber}?`)) return;
    
    setSubmitting(true);
    try {
      const totalAmount = tableItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      
      // Create bill
      const billId = await billService.createFromOrder({
        id: `table-${tableId}-${Date.now()}`,
        orderCode: `#TABLE-${tableNumber}`,
        customerName: customerName || `Khách ${tableNumber}`,
        tableNumber,
        items: tableItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount
      });
      
      // Clear table status and items
      await tableService.updateTableStatus(tableId, "empty");
      setTableOrders(prev => {
        const copy = { ...prev };
        delete copy[tableId];
        return copy;
      });
      
      showToast(`Thanh toán thành công!\n${tableNumber}\nTổng: ${totalAmount.toLocaleString()}₫`);
      
      setSelectedTableId("");
      setTableId("");
      setTableNumber("");
      await reloadTablesAndSync();
      close();
    } catch (e) {
      const err = e as Error;
      setError(err?.message || "Không thể thanh toán");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update item in table
  const updateTableItem = (itemName: string, quantity: number) => {
    if (!selectedTableId) return;
    
    setTableOrders(prev => {
      const items = prev[selectedTableId] || [];
      const updated = items.map(i => 
        i.name === itemName ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      return { ...prev, [selectedTableId]: updated };
    });
  };
  
  // Remove item from table
  const removeTableItem = (itemName: string) => {
    if (!selectedTableId) return;
    
    setTableOrders(prev => {
      const items = prev[selectedTableId] || [];
      const filtered = items.filter(i => i.name !== itemName);
      return { ...prev, [selectedTableId]: filtered };
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay: click to close */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer"
        onClick={close}
        aria-label="Đóng Drawer"
      />
      {/* Drawer */}
      <div
        className="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl transition-transform duration-300"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Đơn gọi món</h2>
            <button
              onClick={close}
              aria-label="Đóng"
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Chọn Bàn - 50% */}
            <div className="flex-1 border-b overflow-y-auto">
              <div className="p-4">
                <label className="text-sm font-semibold text-neutral-700 mb-3 block">
                  Chọn Bàn {tableNumber && `(${tableNumber})`}
                </label>
                {loadingTables ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent"></div>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-sm text-neutral-500 py-4 text-center">
                    Chưa có bàn nào. Vui lòng tạo bàn trong Quản Lý Bàn.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => selectTable(table)}
                        className={`p-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                          selectedTableId === table.id
                            ? "bg-primary-600 text-white border-primary-600"
                            : table.status === "occupied" || (table.id && tableOrders[table.id]?.length > 0)
                            ? "bg-primary-100 border-primary-400 text-primary-700 hover:bg-primary-200"
                            : "bg-white border-primary-500 text-primary-600 hover:bg-primary-50"
                        }`}
                      >
                        <div className="text-lg font-bold">{table.tableNumber}</div>
                        <div className="text-xs mt-1">
                          {selectedTableId === table.id || table.status === "occupied" || (table.id && tableOrders[table.id]?.length > 0)
                            ? "Đang dùng" 
                            : "Trống"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items - 50% */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                
                {/* Món đã gọi (nếu bàn đang dùng) */}
                {selectedTableId && currentTableItems.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                      ✅ Món đã gọi - {tableNumber}
                    </h3>
                    {currentTableItems.map((it) => (
                      <div
                        key={it.name}
                        className="flex items-center justify-between border border-green-200 rounded p-2 bg-green-50"
                      >
                        <div>
                          <p className="font-medium text-sm">{it.name}</p>
                          <p className="text-xs text-neutral-500">
                            {it.price.toLocaleString()}₫
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 bg-white border rounded hover:bg-neutral-50 text-xs"
                            onClick={() => updateTableItem(it.name, it.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="min-w-[2ch] text-center font-medium text-sm">
                            {it.quantity}
                          </span>
                          <button
                            className="px-2 py-1 bg-white border rounded hover:bg-neutral-50 text-xs"
                            onClick={() => updateTableItem(it.name, it.quantity + 1)}
                          >
                            +
                          </button>
                          <button
                            className="text-red-600 ml-2 hover:text-red-700 text-xs"
                            onClick={() => removeTableItem(it.name)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Món mới (từ Cart) */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded">
                    🛒 Món mới (Cart)
                  </h3>
                  {items.length === 0 ? (
                    <p className="text-sm text-neutral-500 italic">Chưa có món nào.</p>
                  ) : (
                    items.map((it) => (
                      <div
                        key={it.name}
                        className="flex items-center justify-between border border-primary-200 rounded p-2 bg-white"
                      >
                        <div>
                          <p className="font-medium text-sm">{it.name}</p>
                          <p className="text-xs text-neutral-500">
                            {it.price.toLocaleString()}₫
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2 py-1 bg-neutral-100 rounded text-xs"
                            onClick={() => setQuantity(it.name, it.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="min-w-[2ch] text-center text-sm">
                            {it.quantity}
                          </span>
                          <button
                            className="px-2 py-1 bg-neutral-100 rounded text-xs"
                            onClick={() => setQuantity(it.name, it.quantity + 1)}
                          >
                            +
                          </button>
                          <button
                            className="text-red-600 ml-2 text-xs"
                            onClick={() => removeItem(it.name)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-neutral-50 space-y-3">
            {/* Tổng tiền Cart (món mới) */}
            {items.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Món mới:</span>
                <span className="font-bold text-primary-600">
                  {total.toLocaleString()}₫
                </span>
              </div>
            )}
            
            {/* Tổng tiền bàn (món đã gọi) */}
            {currentTableItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Món đã gọi:</span>
                <span className="font-bold text-green-600">
                  {currentTableItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toLocaleString()}₫
                </span>
              </div>
            )}
            
            {/* Tổng cộng */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-neutral-700 font-semibold">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary-600">
                {(total + currentTableItems.reduce((sum, i) => sum + i.price * i.quantity, 0)).toLocaleString()}₫
              </span>
            </div>
            
            {/* Nút hành động */}
            <div className="space-y-2">
              {/* Nút gửi order / thêm món */}
              {items.length > 0 && (
                <button
                  onClick={submitOrder}
                  disabled={submitting || !selectedTableId}
                  className="btn-primary w-full py-3"
                >
                  {submitting 
                    ? "Đang gửi..." 
                    : currentTableItems.length > 0 
                    ? "➕ Thêm món vào " + tableNumber
                    : "🍳 Gửi Order đến Bếp"}
                </button>
              )}
              
              {/* Nút thanh toán */}
              {currentTableItems.length > 0 && (
                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="btn-primary w-full py-3 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Đang xử lý..." : "💳 Thanh Toán " + tableNumber}
                </button>
              )}
              
              {/* Thông báo nếu chưa có gì */}
              {items.length === 0 && currentTableItems.length === 0 && (
                <div className="text-center text-neutral-500 text-sm py-2">
                  {selectedTableId 
                    ? "Chọn món từ menu để bắt đầu order"
                    : "Chọn bàn và thêm món để order"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
