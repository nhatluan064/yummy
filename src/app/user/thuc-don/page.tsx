"use client";

import { useState, useEffect, useRef } from "react";
import MenuItem from "@/app/components/MenuItem";
import {
  getCategoriesFromFirestore,
  getMenuItemsFromFirestore,
} from "@/lib/firestoreMenu";
import { type Category } from "@/lib/menuData";
import { type Feedback } from "@/lib/types";

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  category: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Feedback[];
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("mi-cay");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuData, setMenuData] = useState<MenuItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenuData, setFilteredMenuData] = useState<MenuItemData[]>([]);
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest"
  >("newest");
  const [filterType, setFilterType] = useState<
    "all" | "bestSeller" | "new"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(true);
  const qualitySectionRef = useRef<HTMLDivElement>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const [dishReviews, setDishReviews] = useState<Feedback[]>([]); // Feedback từ Firestore
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 5,
    comment: "",
  });
  const mouseDownOnBackdropRef = useRef(false);

  // Load categories from Firestore
  useEffect(() => {
    async function fetchCategories() {
      const cats = await getCategoriesFromFirestore();
      setCategories(cats as Category[]);
    }
    fetchCategories();
  }, []);

  // Load menu và feedback từ Firestore
  useEffect(() => {
    async function fetchMenuAndFeedback() {
      const items = await getMenuItemsFromFirestore();
      const { feedbackService } = await import("@/lib/feedback.service");
      const allFeedback = await feedbackService.getAll();
      // Tính reviewCount và rating cho từng món ăn
      const menuWithReviews = (items as MenuItemData[]).map((item) => {
        const reviews = allFeedback.filter(
          (fb: Feedback) => fb.dishName === item.name
        );
        const reviewCount = reviews.length;
        const rating =
          reviewCount > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            : 0;
        return {
          ...item,
          reviewCount,
          rating,
          reviews,
        };
      });
      setMenuData(menuWithReviews);
    }
    fetchMenuAndFeedback();
  }, []);

  // Track scroll position to hide filter on quality section
  useEffect(() => {
    const handleScroll = () => {
      if (qualitySectionRef.current) {
        const rect = qualitySectionRef.current.getBoundingClientRect();
        // If quality section is in viewport, hide sticky filter
        setIsFilterSticky(rect.top > 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter, search, sort menuData
  useEffect(() => {
    let filtered = menuData; // Show all items including out of stock
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    if (filterType === "bestSeller") {
      filtered = filtered.filter((item) => item.bestSeller);
    } else if (filterType === "new") {
      filtered = filtered.filter((item) => item.isNew);
    }
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        break;
      default:
        break;
    }
    setFilteredMenuData(sorted);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, menuData, sortBy, filterType, selectedCategory]);

  // Save review to localStorage and update state
  const saveReview = async () => {
    if (!selectedDish || !newReview.userName || !newReview.comment) {
      alert("Vui lòng điền đầy đủ tên và nhận xét!");
      return;
    }

    // Lưu vào localStorage như cũ
    const storedReviews = localStorage.getItem("customerReviews");
    const allReviews = storedReviews ? JSON.parse(storedReviews) : {};
    const review = {
      id: Date.now(),
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
    };
    if (!allReviews[selectedDish.id]) {
      allReviews[selectedDish.id] = [];
    }
    allReviews[selectedDish.id].unshift(review);
    localStorage.setItem("customerReviews", JSON.stringify(allReviews));

    // Lưu lên Firestore qua feedbackService
    try {
      const { feedbackService } = await import("@/lib/feedback.service");
      await feedbackService.createFeedback({
        customerName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
        dishName: selectedDish.name,
        // Có thể bổ sung customerEmail nếu muốn
      });
      alert(
        "✅ Cảm ơn bạn đã đánh giá! Feedback của bạn đã được lưu và gửi đến admin."
      );
    } catch (err) {
      alert("❌ Gửi feedback lên hệ thống thất bại. Vui lòng thử lại!");
      console.error("Feedback error:", err);
    }
    setNewReview({ userName: "", rating: 5, comment: "" });
    setShowReviewModal(false);
    window.location.reload();
  };

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">
            🍜 Thực Đơn Món Ăn
          </h1>
          <p className="text-sm opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Khám phá hương vị đặc trưng của ẩm thực Việt Nam
          </p>
        </div>
      </section>

      {/* Search & Filters Bar */}
      <section className={`py-2 md:py-3 bg-white border-b border-neutral-200 ${isFilterSticky ? 'sticky top-[73px]' : 'relative'} z-40 shadow-sm transition-all duration-300`}>
        <div className="container-custom">
          {/* Compact Filter Bar */}
          <div className="flex flex-wrap items-end gap-2 md:gap-3">
            {/* Search Box - Compact */}
            <div className="flex-1 min-w-[140px] md:min-w-[200px] max-w-md">
              <label className="hidden md:block text-xs font-medium text-neutral-600 mb-1.5">
                🔍 Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm món..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 md:pl-9 pr-8 md:pr-9 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="w-auto">
              <label className="hidden md:block text-xs font-medium text-neutral-600 mb-1.5">
                📂 Danh mục
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
              >
              <option value="all">📂 Tất cả danh mục ({menuData.length})</option>
              <optgroup label="🍜 Đồ Ăn">
                {categories
                  .filter((cat) => ["mi-cay", "an-vat", "hu-tieu", "rau-an-kem"].includes(cat.id))
                  .map((cat) => {
                    const count = menuData.filter(i => i.category === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({count})
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="🥤 Đồ Uống">
                {categories
                  .filter((cat) => ["coffee", "milk-tea", "sua-chua", "nuoc-giai-khat"].includes(cat.id))
                  .map((cat) => {
                    const count = menuData.filter(i => i.category === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({count})
                      </option>
                    );
                  })}
              </optgroup>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-auto">
              <label className="hidden md:block text-xs font-medium text-neutral-600 mb-1.5">
                🔄 Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
              >
                <option value="price-asc">💰 Giá: Thấp → Cao</option>
                <option value="price-desc">💎 Giá: Cao → Thấp</option>
                <option value="name-asc">🔤 Tên: A → Z</option>
                <option value="name-desc">🔡 Tên: Z → A</option>
              </select>
            </div>

            {/* Filter Type Dropdown */}
            <div className="w-auto">
              <label className="hidden md:block text-xs font-medium text-neutral-600 mb-1.5">
                🎯 Lọc
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-medium"
              >
                <option value="all">🎯 Tất cả</option>
                <option value="bestSeller">🏆 Best Seller</option>
                <option value="new">✨ Món mới</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSortBy("price-asc");
                setFilterType("all");
              }}
              className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
              title="Đặt lại bộ lọc"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredMenuData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMenuData
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((item, index) => {
                    const delayClass =
                      index % 3 === 0
                        ? "animate-fade-in-up"
                        : index % 3 === 1
                        ? "animate-fade-in-up-delay-1"
                        : "animate-fade-in-up-delay-2";
                    return (
                      <div key={item.id} className={delayClass}>
                        <MenuItem
                          key={item.id}
                          item={{
                            ...item,
                            id: Number(item.id) || undefined, // ép kiểu id về number hoặc undefined nếu không hợp lệ
                            imageUrl: item.image, // Đảm bảo prop imageUrl được truyền vào nếu MenuItem yêu cầu
                          }}
                          showAddToCart={false}
                          onReviewClick={async () => {
                            setSelectedDish(item);
                            // Lấy feedback từ Firestore cho món này
                            const { feedbackService } = await import(
                              "@/lib/feedback.service"
                            );
                            const allFeedback = await feedbackService.getAll();
                            // Lọc feedback theo dishName hoặc dishId
                            const reviews = allFeedback.filter(
                              (fb: Feedback) => fb.dishName === item.name
                            );
                            setDishReviews(reviews);
                            setShowReviewModal(true);
                          }}
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Pagination */}
              {Math.ceil(filteredMenuData.length / itemsPerPage) > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      ‹ Trước
                    </button>

                    {Array.from(
                      {
                        length: Math.ceil(
                          filteredMenuData.length / itemsPerPage
                        ),
                      },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(filteredMenuData.length / itemsPerPage),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(filteredMenuData.length / itemsPerPage)
                      }
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      Sau ›
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
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
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Không tìm thấy món ăn
              </h3>
              <p className="text-neutral-600">
                Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Nutritional Info */}
      <section ref={qualitySectionRef} className="section-padding bg-neutral-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
              🌿 Cam Kết Chất Lượng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center animate-fade-in-up">
              <div className="p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  100% Tự Nhiên
                </h3>
                <p className="text-neutral-600">
                  Không chất bảo quản, không phẩm màu tổng hợp
                </p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-1">
              <div className="p-6">
                <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Tươi Mỗi Ngày
                </h3>
                <p className="text-neutral-600">
                  Nguyên liệu được nhập về và chế biến hàng ngày
                </p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-2">
              <div className="p-6">
                <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary-600"
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
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Phục Vụ Nhanh
                </h3>
                <p className="text-neutral-600">
                  Cam kết phục vụ trong vòng 15-20 phút
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && selectedDish && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            // Only mark as backdrop if the initial mousedown is on the backdrop
            mouseDownOnBackdropRef.current = e.currentTarget === e.target;
          }}
          onMouseUp={(e) => {
            const isBackdrop = e.currentTarget === e.target;
            if (isBackdrop && mouseDownOnBackdropRef.current) {
              setShowReviewModal(false);
            }
            mouseDownOnBackdropRef.current = false;
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                    {selectedDish.name}
                  </h3>
                  {selectedDish.rating && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(selectedDish.rating!)
                                ? "text-yellow-400 fill-current"
                                : "text-neutral-300 fill-current"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-neutral-800">
                        {selectedDish.rating.toFixed(1)}
                      </span>
                      <span className="text-neutral-600">
                        ({selectedDish.reviewCount} đánh giá)
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors ml-4"
                  aria-label="Đóng modal"
                >
                  <svg
                    className="w-6 h-6"
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

            {/* Reviews List */}
            <div className="p-6 space-y-6">
              <h4 className="text-lg font-bold text-neutral-800 mb-4">
                📝 Đánh giá từ khách hàng
              </h4>

              {dishReviews && dishReviews.length > 0 ? (
                <div className="space-y-4">
                  {dishReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-neutral-50 rounded-xl p-5 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-sm">
                              {(review.customerName || "?").charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">
                              {review.customerName || "Ẩn danh"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {review.createdAt?.toDate?.()
                                ? review.createdAt.toDate().toLocaleDateString()
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-neutral-300 fill-current"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">
                  Chưa có đánh giá nào cho món này.
                </p>
              )}

              {/* Add Review Form */}
              <div className="border-t border-neutral-200 pt-6 mt-6">
                <h4 className="text-lg font-bold text-neutral-800 mb-4">
                  ✍️ Viết đánh giá của bạn
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tên của bạn
                    </label>
                    <input
                      type="text"
                      value={newReview.userName}
                      onChange={(e) =>
                        setNewReview({ ...newReview, userName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Đánh giá
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          className="focus:outline-none"
                          aria-label={`Đánh giá ${star} sao`}
                        >
                          <svg
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                              star <= newReview.rating
                                ? "text-yellow-400 fill-current"
                                : "text-neutral-300 fill-current hover:text-yellow-200"
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      <span className="text-sm text-neutral-600 ml-2">
                        ({newReview.rating} sao)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nhận xét
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                    />
                  </div>

                  <button
                    onClick={saveReview}
                    className="btn-primary w-full py-3"
                  >
                    📤 Gửi Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
