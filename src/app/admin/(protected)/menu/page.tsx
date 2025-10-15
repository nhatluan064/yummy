"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getMenuItems,
  updateMenuItems,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type MenuItem,
  type Category,
} from "@/lib/menuData";

export default function MenuManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"menu" | "category">("menu");

  // Get menu items and categories from shared data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Load menu items and categories on mount
    setMenuItems(getMenuItems());
    setCategories(getCategories());
  }, []);

  // Update shared data whenever menuItems change
  useEffect(() => {
    if (menuItems.length > 0) {
      updateMenuItems(menuItems);
    }
  }, [menuItems]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryEdit, setSelectedCategoryEdit] =
    useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "mon-an",
    price: "",
    description: "",
    image: "",
    prepTime: "",
    popular: false,
    bestSeller: false,
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
      category: "mon-an",
      price: "",
      description: "",
      image: "",
      prepTime: "",
      popular: false,
      bestSeller: false,
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
      description: dish.description,
      image: dish.image,
      prepTime: dish.prepTime,
      popular: dish.popular,
      bestSeller: dish.bestSeller,
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
  const saveDish = () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (categories.length === 0) {
      alert("Vui lòng tạo danh mục trước khi thêm món!");
      return;
    }

    const selectedCat = categories.find((cat) => cat.id === formData.category);
    const categoryName = selectedCat?.name || formData.category;

    if (selectedDish) {
      // Update existing dish
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === selectedDish.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                categoryName,
                price: parseInt(formData.price),
                description: formData.description,
                image: formData.image || item.image,
                prepTime: formData.prepTime,
                popular: formData.popular,
                bestSeller: formData.bestSeller,
                available: formData.available,
              }
            : item
        )
      );
      alert(`✅ Đã cập nhật món "${formData.name}"!`);
    } else {
      // Add new dish
      const newDish: MenuItem = {
        id:
          menuItems.length > 0
            ? Math.max(...menuItems.map((i) => i.id)) + 1
            : 1,
        name: formData.name,
        category: formData.category,
        categoryName,
        price: parseInt(formData.price),
        description: formData.description,
        image:
          formData.image ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        prepTime: formData.prepTime,
        popular: formData.popular,
        bestSeller: formData.bestSeller,
        available: formData.available,
        rating: 0,
        reviewCount: 0,
        reviews: [],
      };
      setMenuItems((prev) => [...prev, newDish]);
      alert(`✅ Đã thêm món "${formData.name}"!`);
    }

    closeModal();
  };

  // Toggle availability
  const toggleAvailability = (itemId: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );

    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      alert(
        `✅ Đã ${!item.available ? "bật" : "tắt"} trạng thái món "${
          item.name
        }"!`
      );
    }
  };

  // Delete dish
  const deleteDish = (itemId: number) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    if (confirm(`Bạn có chắc muốn xóa món "${item.name}"?`)) {
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      alert(`✅ Đã xóa món "${item.name}"!`);
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
      id: category.id,
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

  const saveCategory = () => {
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

    if (selectedCategoryEdit) {
      // Update existing category
      updateCategory(selectedCategoryEdit.id, {
        name: categoryFormData.name,
        icon: categoryFormData.icon,
      });

      // Update local state
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategoryEdit.id
            ? {
                ...cat,
                name: categoryFormData.name,
                icon: categoryFormData.icon,
              }
            : cat
        )
      );

      // Update menu items with new category name
      setMenuItems((prev) =>
        prev.map((item) =>
          item.category === selectedCategoryEdit.id
            ? { ...item, categoryName: categoryFormData.name }
            : item
        )
      );

      alert(`✅ Đã cập nhật danh mục "${categoryFormData.name}"!`);
    } else {
      // Add new category
      const newCategory: Category = {
        id: categoryFormData.id,
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        order: categories.length + 1,
      };
      addCategory(newCategory);
      setCategories((prev) => [...prev, newCategory]);
      alert(`✅ Đã thêm danh mục "${categoryFormData.name}"!`);
    }

    closeCategoryModal();
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    const itemsInCategory = menuItems.filter(
      (item) => item.category === categoryId
    ).length;

    if (itemsInCategory > 0) {
      if (
        !confirm(
          `Danh mục "${category.name}" có ${itemsInCategory} món ăn. Xóa danh mục sẽ xóa tất cả món ăn trong đó. Bạn có chắc chắn?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
        return;
      }
    }

    deleteCategory(categoryId);
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    setMenuItems((prev) => prev.filter((item) => item.category !== categoryId));

    if (selectedCategory === categoryId) {
      setSelectedCategory("all");
    }

    alert(`✅ Đã xóa danh mục "${category.name}"!`);
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Quản Lý Thực Đơn
          </h1>
          <p className="text-neutral-600 mt-1">
            Tạo và quản lý món ăn, danh mục, giá cả
          </p>
        </div>
        <button
          onClick={activeTab === "menu" ? openAddModal : openAddCategoryModal}
          className="btn-primary"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          {activeTab === "menu" ? "Thêm Món Mới" : "Thêm Danh Mục"}
        </button>
      </div>

      {/* Tabs */}
      <div className="card p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "menu"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                : "bg-transparent text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <span className="mr-2">🍽️</span>
            Quản Lý Món Ăn
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "category"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                : "bg-transparent text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <span className="mr-2">📂</span>
            Quản Lý Danh Mục
          </button>
        </div>
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
                    onClick={() => setSelectedCategory(cat.id)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-neutral-200">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  {item.popular && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Phổ biến</span>
                    </div>
                  )}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                      item.available
                        ? "bg-green-500 text-white"
                        : "bg-neutral-500 text-white"
                    }`}
                  >
                    {item.available ? "Còn món" : "Hết món"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-800 mb-1">
                        {item.name}
                      </h3>
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                        {item.categoryName}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-3 text-sm text-neutral-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {item.prepTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <span className="text-xl font-bold text-primary-600">
                      {item.price.toLocaleString()}₫
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
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
                        onClick={() => toggleAvailability(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
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
                          className="w-5 h-5"
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
                      onClick={() => handleDeleteCategory(category.id)}
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
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
                    Giá (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="VD: 85000"
                    required
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mô tả ngắn gọn về món ăn..."
                  required
                />
              </div>

              {/* Thời gian chuẩn bị & URL ảnh */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Thời gian chuẩn bị
                  </label>
                  <input
                    type="text"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="VD: 15-20 phút"
                  />
                </div>
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
              </div>

              {/* Checkboxes */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    ⭐ Món phổ biến
                  </span>
                </label>
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
