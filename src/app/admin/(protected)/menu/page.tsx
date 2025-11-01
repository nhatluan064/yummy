"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { menuService } from "@/lib/menu.service";
import { categoryService } from "@/lib/category.service";
import { MenuItem, Category } from "@/lib/types";
import { getAuthClient } from "@/lib/firebase";

export default function MenuManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("menu");

  // Firestore-backed menu and category state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const auth = await getAuthClient();

        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            window.location.href = "/admin/login";
            return;
          }

          // User is authenticated, fetch data
          try {
            const [menu, cats] = await Promise.all([
              menuService.getAll(),
              categoryService.getAll(),
            ]);
            setMenuItems(menu);
            setCategories(cats);
          } catch (error) {
            console.error("Error fetching data:", error);
            alert("Lỗi khi tải dữ liệu: " + String(error));
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth initialization error:", error);
        alert("Lỗi khởi tạo xác thực. Vui lòng đăng nhập lại!");
        window.location.href = "/admin/login";
      }
    };

    const unsubscribe = checkAuthAndFetchData();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe.then((fn) => fn?.());
      }
    };
  }, []);

  const menuModalRef = useRef<HTMLDivElement | null>(null);
  const categoryModalRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryEdit, setSelectedCategoryEdit] =
    useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    bestSeller: false,
    isNew: false,
    available: true,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    id: "",
    name: "",
    icon: "🍽️",
  });

  // Build display categories with counts
  const displayCategories = [
    {
      id: "all",
      name: "Tất cả",
      icon: "🍽️",
      count: menuItems.length,
      order: 0,
    },
    ...categories.map((cat) => ({
      ...cat,
      count: menuItems.filter((item) => item.category === cat.id).length,
    })),
  ];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      name: "",
      category: categories.length > 0 ? categories[0].id || "" : "",
      price: "",
      description: "",
      image: "",
      bestSeller: false,
      isNew: false,
      available: true,
    });
    setSelectedDish(null);
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (dish: MenuItem) => {
    setFormData({
      name: dish.name,
      category: dish.category,
      price: dish.price.toString(),
      description: dish.description || "",
      image: dish.image || "",
      bestSeller: dish.bestSeller || false,
      isNew: dish.isNew || false,
      available: dish.available,
    });
    setSelectedDish(dish);
    setShowAddModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedDish(null);
  };

  // Save dish (Add or Update)
  const saveDish = async () => {
    if (!formData.name) {
      alert("Vui lòng điền tên món!");
      return;
    }
    if (categories.length === 0) {
      alert("Vui lòng tạo danh mục trước khi thêm món!");
      return;
    }
    const selectedCat = categories.find((cat) => cat.id === formData.category);
    const categoryName = selectedCat?.name || formData.category;
    try {
      if (selectedDish) {
        // Update Firestore - chỉ truyền các trường cần update, không spread selectedDish để tránh ghi đè field cũ
        await menuService.update(selectedDish.id!, {
          name: formData.name,
          category: formData.category,
          categoryName,
          price: formData.price ? parseInt(formData.price) : 0,
          description: formData.description,
          image: formData.image || selectedDish.image,
          bestSeller: formData.bestSeller,
          isNew: formData.isNew,
          available: formData.available,
        });
        alert(`✅ Đã cập nhật món "${formData.name}"!`);
        closeModal();
      } else {
        // Add new dish to Firestore
        await menuService.createMenuItem({
          name: formData.name,
          category: formData.category,
          categoryName,
          price: formData.price ? parseInt(formData.price) : 0,
          description: formData.description,
          image:
            formData.image ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          bestSeller: formData.bestSeller,
          isNew: formData.isNew,
          available: formData.available,
          rating: 0,
          reviewCount: 0,
          reviews: [],
        });
        alert(`✅ Đã thêm món "${formData.name}"!`);
        // KHÔNG gọi closeModal() để giữ lại popup và giá trị form
      }
      // Refresh menu items
      setMenuItems(await menuService.getAll());
      // closeModal();
    } catch (err) {
      alert("Lỗi khi lưu món ăn: " + String(err));
    }
  };

  // Toggle availability
  const toggleAvailability = async (itemId: string | undefined) => {
    if (!itemId) return;
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    try {
      await menuService.update(itemId, { available: !item.available });
      setMenuItems(await menuService.getAll());
      alert(
        `✅ Đã ${!item.available ? "bật" : "tắt"} trạng thái món "${
          item.name
        }"!`
      );
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + String(err));
    }
  };

  // Delete dish
  const deleteDish = async (itemId: string | undefined) => {
    if (!itemId) return;
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    if (confirm(`Bạn có chắc muốn xóa món "${item.name}"?`)) {
      try {
        await menuService.delete(itemId);
        setMenuItems(await menuService.getAll());
        alert(`✅ Đã xóa món "${item.name}"!`);
      } catch (err) {
        alert("Lỗi khi xóa món ăn: " + String(err));
      }
    }
  };

  // Category management functions
  const openAddCategoryModal = () => {
    setCategoryFormData({
      id: "",
      name: "",
      icon: "🍽️",
    });
    setSelectedCategoryEdit(null);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setCategoryFormData({
      id: category.id || "",
      name: category.name,
      icon: category.icon,
    });
    setSelectedCategoryEdit(category);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategoryEdit(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      try {
        await categoryService.delete(categoryId);
        setCategories(await categoryService.getAll());
        alert(`✅ Đã xóa danh mục "${category.name}"!`);
      } catch (err) {
        alert("Lỗi khi xóa danh mục: " + String(err));
      }
    }
  };

  const saveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.id) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    // Check if ID already exists (for new category)
    if (
      !selectedCategoryEdit &&
      categories.some((cat) => cat.id === categoryFormData.id)
    ) {
      alert("Mã danh mục đã tồn tại! Vui lòng chọn mã khác.");
      return;
    }
    try {
      console.log("Creating category with ID:", categoryFormData.id);
      console.log("Category data:", {
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        order: categories.length + 1,
      });

      if (selectedCategoryEdit) {
        // Update Firestore
        await categoryService.update(selectedCategoryEdit!.id!, {
          name: categoryFormData.name,
          icon: categoryFormData.icon,
        });
        alert(`✅ Đã cập nhật danh mục "${categoryFormData.name}"!`);
      } else {
        // Add new category to Firestore
        await categoryService.createWithId(categoryFormData.id, {
          name: categoryFormData.name,
          icon: categoryFormData.icon,
          order: categories.length + 1,
        });
        alert(`✅ Đã thêm danh mục "${categoryFormData.name}"!`);
      }
      setCategories(await categoryService.getAll());
      closeCategoryModal();
    } catch (err) {
      console.error("Error creating category:", err);
      if (String(err).includes("permission-denied")) {
        alert(
          "❌ Không có quyền chỉnh sửa! Chỉ tài khoản Admin mới có thể thực hiện thao tác này."
        );
      } else {
        alert("Lỗi khi lưu danh mục: " + String(err));
      }
    }
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-800">Quản lý thực đơn</h1>
        <button
          onClick={activeTab === "menu" ? openAddModal : openAddCategoryModal}
          className="btn-primary px-3 py-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === "menu"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          🍽️ Món Ăn
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === "category"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          📂 Danh Mục
        </button>
      </div>

      {/* Menu Tab Content */}
      {activeTab === "menu" && (
        <>
          {/* Categories & Search */}
          <div className="card p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {displayCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id || "all")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedCategory === cat.id
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                    <span
                      className={`ml-2 ${
                        selectedCategory === cat.id
                          ? "text-white/80"
                          : "text-neutral-500"
                      }`}
                    >
                      ({cat.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <svg
                  className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden bg-neutral-200">
                  <Image
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                    }
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  {item.bestSeller && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-0.5">
                      <span>⭐</span>
                    </div>
                  )}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.available
                        ? "bg-green-500 text-white"
                        : "bg-neutral-500 text-white"
                    }`}
                  >
                    {item.available ? "Còn món" : "Hết món"}
                  </div>
                  {item.isNew && (
                    <div className="absolute top-8 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-0.5">
                      <span>✨</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-2.5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-neutral-800 mb-1 line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {item.categoryName || item.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 mb-1.5 line-clamp-1">
                    {item.description || ""}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200">
                    <span className="text-base font-bold text-primary-600">
                      {item.price.toLocaleString()}₫
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.available
                            ? "hover:bg-red-50 text-red-600"
                            : "hover:bg-green-50 text-green-600"
                        }`}
                        title={
                          item.available
                            ? "Đánh dấu hết món"
                            : "Đánh dấu còn món"
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {item.available ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteDish(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="card p-12 text-center">
              <svg
                className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Không tìm thấy món ăn
              </h3>
              <p className="text-neutral-600">
                Thử thay đổi bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          )}
        </>
      )}

      {/* Category Tab Content */}
      {activeTab === "category" && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-800">
                        {category.name}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Mã:{" "}
                        <code className="bg-neutral-200 px-2 py-0.5 rounded">
                          {category.id}
                        </code>
                        {" • "}
                        {
                          menuItems.filter(
                            (item) => item.category === category.id
                          ).length
                        }{" "}
                        món
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditCategoryModal(category)}
                      className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        category.id && handleDeleteCategory(category.id)
                      }
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                    Chưa có danh mục nào
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Tạo danh mục đầu tiên để bắt đầu
                  </p>
                  <button
                    onClick={openAddCategoryModal}
                    className="btn-primary"
                  >
                    Thêm Danh Mục
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeCategoryModal}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
            ref={categoryModalRef}
          >
            <div className="bg-white border-b border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  {selectedCategoryEdit
                    ? "Chỉnh Sửa Danh Mục"
                    : "Thêm Danh Mục Mới"}
                </h2>
                <button
                  onClick={closeCategoryModal}
                  className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Mã danh mục */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mã danh mục (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={categoryFormData.id}
                  onChange={handleCategoryFormChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="VD: an-vat, trang-mieng..."
                  disabled={!!selectedCategoryEdit}
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Chỉ dùng chữ thường, số và dấu gạch ngang. Không thể thay đổi
                  sau khi tạo.
                </p>
              </div>

              {/* Tên danh mục */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="VD: Ăn Vặt, Tráng Miệng..."
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Icon (Emoji) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="icon"
                  value={categoryFormData.icon}
                  onChange={handleCategoryFormChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="🍽️"
                  maxLength={2}
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Một emoji để hiển thị
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={closeCategoryModal}
                  className="flex-1 btn-secondary"
                >
                  Hủy
                </button>
                <button onClick={saveCategory} className="flex-1 btn-primary">
                  {selectedCategoryEdit ? "Cập nhật" : "Thêm danh mục"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            ref={menuModalRef}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">
                  {selectedDish ? "Chỉnh Sửa Món" : "Thêm Món Mới"}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Tên món */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tên món <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="VD: Phở Bò, Cà Phê Sữa..."
                  required
                />
              </div>

              {/* Danh mục & Giá */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category-select"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category-select"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    title="Chọn danh mục món ăn"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Chưa có danh mục nào. Vui lòng tạo danh mục trước.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Giá (₫)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="VD: 85000"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mô tả ngắn gọn về món ăn..."
                />
              </div>

              {/* URL ảnh */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  URL Hình ảnh
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://..."
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="bestSeller"
                    checked={formData.bestSeller}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    🏆 Best Seller
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">🆕 Món mới</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">✅ Còn món</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-neutral-200">
                <button onClick={closeModal} className="flex-1 btn-secondary">
                  Hủy
                </button>
                <button onClick={saveDish} className="flex-1 btn-primary">
                  {selectedDish ? "Cập nhật" : "Thêm món"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
