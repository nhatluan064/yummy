"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { menuService } from "@/lib/menu.service";
import { categoryService } from "@/lib/category.service";
import { tableService, Table } from "@/lib/table.service";
import { orderService } from "@/lib/order.service";
import { billService } from "@/lib/bill.service";
import type { MenuItem, OrderItem, Category } from "@/lib/types";

type Step = "select-table" | "select-menu" | "checkout";

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select-table");
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  useEffect(() => {
    loadTables();
    loadCategories();
  }, []);

  useEffect(() => {
    if (step === "select-menu") {
      loadMenu();
    }
  }, [step]);

  const loadTables = async () => {
    try {
      const data = await tableService.getAllTables();
      setTables(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách bàn");
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadMenu = async () => {
    setLoadingMenu(true);
    try {
      const data = await menuService.listAvailable();
      console.log("Loaded menu items:", data);
      setMenuItems(data);
      if (data.length === 0) {
        alert("⚠️ Chưa có món ăn nào trong thực đơn.\n\nVui lòng thêm món ăn trước khi tạo đơn hàng.");
      }
    } catch (error: unknown) {
      console.error("Error loading menu:", error);
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      alert("Lỗi khi tải thực đơn: " + message);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleTableSelect = (table: Table) => {
    if (table.status === "occupied") {
      alert("Bàn này đang được sử dụng");
      return;
    }
    setSelectedTable(table);
    setStep("select-menu");
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c) => c.menuItemId === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id!,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Get unique categories from menu items
  const categoryIds = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));
  
  // Helper to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  // Filter and sort menu items
  const filteredMenuItems = menuItems
    .filter(item => {
      // Search filter
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
  };

  const handleCheckout = async () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn");
      return;
    }
    if (cart.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    setLoading(true);
    try {
      const { id: orderId, orderCode } = await orderService.createOrder({
        items: cart,
        customerName: customerName || "Khách",
        customerPhone,
        tableNumber: selectedTable.tableNumber,
        totalAmount: getTotalAmount(),
        notes,
        orderType: "dine-in", // Đơn hàng tại bàn
      });

      await tableService.updateTableStatus(selectedTable.id!, "occupied");

      await billService.createFromOrder({
        id: orderId,
        orderCode,
        customerName: customerName || "Khách",
        tableNumber: selectedTable.tableNumber,
        items: cart,
        totalAmount: getTotalAmount(),
      });

      setSuccessMessage(`✅ Đặt món thành công! Mã đơn: ${orderCode}`);
      
      setTimeout(() => {
        router.push("/admin/orders");
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đặt món thất bại";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Tạo Đơn Hàng Mới</h1>
          <p className="text-neutral-600 mt-1">Chọn bàn, gọi món và tạo hóa đơn</p>
        </div>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          ← Quay lại
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-semibold text-center">
            {successMessage}
          </p>
        </div>
      )}

      {/* Step Indicator */}
      <div className="card p-6">
        <div className="flex items-center justify-center gap-4">
          <StepBadge
            number={1}
            label="Chọn Bàn"
            active={step === "select-table"}
            completed={step === "select-menu" || step === "checkout"}
          />
          <div className="h-1 w-20 bg-neutral-300"></div>
          <StepBadge
            number={2}
            label="Chọn Món"
            active={step === "select-menu"}
            completed={step === "checkout"}
          />
          <div className="h-1 w-20 bg-neutral-300"></div>
          <StepBadge
            number={3}
            label="Thanh Toán"
            active={step === "checkout"}
            completed={false}
          />
        </div>
      </div>

      {/* Step 1: Select Table */}
      {step === "select-table" && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 text-neutral-900">
            📍 Chọn Bàn
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                disabled={table.status === "occupied"}
                className={`aspect-square p-6 rounded-xl border-2 transition-all ${
                  table.status === "empty"
                    ? "border-primary-500 hover:bg-primary-50 hover:shadow-lg cursor-pointer"
                    : "border-neutral-300 bg-neutral-100 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="text-center h-full flex flex-col justify-center">
                  <div className="text-4xl mb-2">
                    {table.status === "empty" ? "🪑" : "🔒"}
                  </div>
                  <div className="font-bold text-xl">{table.tableNumber}</div>
                  <div className="text-xs text-neutral-600 mt-2">
                    {table.status === "empty" ? "Trống" : "Đang dùng"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Menu */}
      {step === "select-menu" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">
              🍜 Thực Đơn
            </h2>

            {/* Filter Bar */}
            <div className="mb-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Tìm món ăn..."
                  className="w-full pl-4 pr-10 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filters & Sort */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Category Pills */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === "all"
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  Tất cả
                </button>
                {categoryIds.map((categoryId) => (
                  <button
                    key={categoryId}
                    onClick={() => setSelectedCategory(categoryId)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === categoryId
                        ? "bg-primary-500 text-white shadow-md"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {getCategoryName(categoryId)}
                  </button>
                ))}

                <div className="flex-1"></div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "price-asc" | "price-desc")}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Sắp xếp: A-Z</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                </select>

                {/* Reset Button */}
                {(searchQuery || selectedCategory !== "all" || sortBy !== "name") && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>

              {/* Results count */}
              <div className="text-sm text-neutral-600">
                Hiển thị <span className="font-semibold text-primary-600">{filteredMenuItems.length}</span> món
                {menuItems.length !== filteredMenuItems.length && (
                  <span> / {menuItems.length} món</span>
                )}
              </div>
            </div>

            {loadingMenu ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-neutral-600">Đang tải thực đơn...</p>
                </div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-lg font-semibold mb-2">Chưa có món ăn nào</p>
                <p className="text-sm">Vui lòng thêm món vào thực đơn trước</p>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2">Không tìm thấy món nào</p>
                <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Reset bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base">{item.name}</h3>
                      {item.category && (
                        <span className="text-xs text-neutral-500 mt-1">
                          {getCategoryName(item.category)}
                        </span>
                      )}
                    </div>
                    <span className="text-primary-600 font-bold">
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    + Thêm
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">
              🛒 Giỏ Hàng
            </h2>
            
            {selectedTable && (
              <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="font-semibold text-primary-700">
                  Bàn: {selectedTable.tableNumber}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <div className="text-4xl mb-2">🛒</div>
                  <p>Chưa có món nào</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-neutral-600">
                        {item.price.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="w-7 h-7 bg-neutral-200 hover:bg-neutral-300 rounded-full font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="w-7 h-7 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-bold text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="ml-1 text-red-500 hover:text-red-700 text-sm"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {getTotalAmount().toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("select-table");
                  setCart([]);
                  setSelectedTable(null);
                }}
                className="flex-1 btn-secondary"
              >
                ← Chọn lại
              </button>
              <button
                onClick={() => setStep("checkout")}
                disabled={cart.length === 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thanh toán →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Checkout */}
      {step === "checkout" && (
        <div className="max-w-3xl mx-auto">
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900">
              💳 Xác Nhận & Thanh Toán
            </h2>

            {/* Table Info */}
            {selectedTable && (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="font-semibold text-primary-700 text-lg">
                  📍 Bàn: {selectedTable.tableNumber}
                </p>
              </div>
            )}

            {/* Customer Info */}
            <div className="mb-6 space-y-4">
              <h3 className="font-semibold text-lg">Thông tin khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-sm">
                    Tên khách hàng <span className="text-neutral-400">(tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tên..."
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm">
                    Số điện thoại <span className="text-neutral-400">(tùy chọn)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2 text-sm">
                  Ghi chú <span className="text-neutral-400">(tùy chọn)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Ghi chú đặc biệt cho đơn hàng..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Chi tiết đơn hàng</h3>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-neutral-600">
                        {item.price.toLocaleString("vi-VN")}₫ × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-primary-600">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Tổng cộng:</span>
                <span className="text-3xl font-bold text-primary-600">
                  {getTotalAmount().toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep("select-menu")}
                className="flex-1 btn-secondary"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "✓ Xác nhận đặt món"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBadge({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
          completed
            ? "bg-green-500 text-white"
            : active
            ? "bg-primary-500 text-white shadow-lg"
            : "bg-neutral-300 text-neutral-600"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`text-sm font-semibold ${
          active ? "text-primary-600" : "text-neutral-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
