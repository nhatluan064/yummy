"use client";

import { useState, useEffect, useRef } from "react";
import MenuItem from "@/app/components/MenuItem";
import Image from "next/image";
import {
  getAvailableMenuItemsByCategory,
  getMenuItems,
  getCategories,
  type Category,
  type Review,
} from "@/lib/menuData";

interface MenuItemData {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  popular?: boolean;
  bestSeller?: boolean;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuData, setMenuData] = useState<MenuItemData[]>([]);
  const [bestSellerItems, setBestSellerItems] = useState<MenuItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenuData, setFilteredMenuData] = useState<MenuItemData[]>([]);
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
  >("default");
  const [filterType, setFilterType] = useState<
    "all" | "popular" | "bestSeller"
  >("all");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 5,
    comment: "",
  });
  // Track backdrop interactions to avoid accidental close during text selection
  const mouseDownOnBackdropRef = useRef(false);

  // Save review to localStorage and update state
  const saveReview = () => {
    if (!selectedDish || !newReview.userName || !newReview.comment) {
      alert("Vui lòng điền đầy đủ tên và nhận xét!");
      return;
    }

    // Get existing reviews from localStorage
    const storedReviews = localStorage.getItem("customerReviews");
    const allReviews = storedReviews ? JSON.parse(storedReviews) : {};

    // Create new review
    const review: Review = {
      id: Date.now(),
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
    };

    // Add review to dish
    if (!allReviews[selectedDish.id]) {
      allReviews[selectedDish.id] = [];
    }
    allReviews[selectedDish.id].unshift(review); // Add to beginning

    // Save to localStorage
    localStorage.setItem("customerReviews", JSON.stringify(allReviews));

    // Update UI - reload menu data
    alert("✅ Cảm ơn bạn đã đánh giá! Feedback của bạn đã được lưu.");
    setNewReview({ userName: "", rating: 5, comment: "" });
    setShowReviewModal(false);

    // Reload page to show new review
    window.location.reload();
  };

  // Load categories on mount
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    // Load customer reviews from localStorage
    const storedReviews = localStorage.getItem("customerReviews");
    const customerReviews = storedReviews ? JSON.parse(storedReviews) : {};

    // Load menu items from shared data (only available items)
    const items = getAvailableMenuItemsByCategory(selectedCategory);

    // Transform and merge with customer reviews (filter out hidden reviews)
    const transformedItems = items.map((item) => {
      const baseReviews = item.reviews || [];
      const newReviews = (customerReviews[item.id] || []).filter(
        (r: Review) => !r.hidden
      );
      const allReviews = [...newReviews, ...baseReviews];

      // Calculate new average rating (only from visible reviews)
      let avgRating = item.rating || 0;
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        avgRating = totalRating / allReviews.length;
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        rating: avgRating,
        reviewCount: allReviews.length,
        reviews: allReviews,
        popular: item.popular,
        bestSeller: item.bestSeller,
      };
    });
    setMenuData(transformedItems);

    // Load top-rated items (only available items with ratings, sorted by rating)
    const allItems = getMenuItems();
    const topRatedAvailable = allItems
      .filter((item) => item.available && item.rating)
      .map((item) => {
        const baseReviews = item.reviews || [];
        const newReviews = (customerReviews[item.id] || []).filter(
          (r: Review) => !r.hidden
        );
        const allReviews = [...newReviews, ...baseReviews];

        let avgRating = item.rating || 0;
        if (allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
          avgRating = totalRating / allReviews.length;
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image,
          rating: avgRating,
          reviewCount: allReviews.length,
          reviews: allReviews,
          popular: item.popular,
          bestSeller: item.bestSeller,
        };
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6); // Top 6 highest rated items

    setBestSellerItems(topRatedAvailable);
  }, [selectedCategory]);

  // Filter and sort menu data
  useEffect(() => {
    let filtered = menuData;

    // Apply filter type (popular or bestSeller)
    if (filterType === "popular") {
      const allItems = getMenuItems();
      const popularAvailable = allItems.filter(
        (item) =>
          item.popular &&
          item.available &&
          (selectedCategory === "all" || item.category === selectedCategory)
      );
      filtered = popularAvailable.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        popular: item.popular,
        bestSeller: item.bestSeller,
      }));
    } else if (filterType === "bestSeller") {
      const allItems = getMenuItems();
      const bestSellerAvailable = allItems.filter(
        (item) =>
          item.bestSeller &&
          item.available &&
          (selectedCategory === "all" || item.category === selectedCategory)
      );
      filtered = bestSellerAvailable.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        popular: item.popular,
        bestSeller: item.bestSeller,
      }));
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
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
        // Keep original order
        break;
    }

    setFilteredMenuData(sorted);
  }, [searchQuery, menuData, sortBy, filterType, selectedCategory]);
  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
            🍜 Thực Đơn Món Ăn
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Khám phá hương vị đặc trưng của ẩm thực Việt Nam
          </p>
        </div>
      </section>

      {/* Categories Filter & Search */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container-custom space-y-4">
          {/* Row 1: Category Buttons + Search */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-neutral-200 rounded-full px-4 py-3 shadow-card">
            {/* Category Buttons */}
            <div className="flex flex-wrap gap-4 justify-center flex-shrink-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={
                  selectedCategory === "all" ? "btn-primary" : "btn-secondary"
                }
              >
                Tất Cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={
                    selectedCategory === cat.id
                      ? "btn-primary"
                      : "btn-secondary"
                  }
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="w-full lg:flex-1 lg:max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, thức uống..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                />
                <svg
                  className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
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
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Clear search"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Sort Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-neutral-600">
              Sắp xếp:
            </span>
            <button
              onClick={() => setSortBy("default")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "default"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Mặc định
            </button>
            <button
              onClick={() => setSortBy("price-asc")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "price-asc"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Giá: Thấp → Cao
            </button>
            <button
              onClick={() => setSortBy("price-desc")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "price-desc"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Giá: Cao → Thấp
            </button>
            <button
              onClick={() => setSortBy("name-asc")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "name-asc"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Tên: A → Z
            </button>
            <button
              onClick={() => setSortBy("name-desc")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "name-desc"
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Tên: Z → A
            </button>
          </div>

          {/* Row 3: Filter Type Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-neutral-200">
            <span className="text-sm font-medium text-neutral-600">
              Lọc theo:
            </span>
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === "all"
                  ? "bg-secondary-600 text-white shadow-lg shadow-secondary-600/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilterType("popular")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === "popular"
                  ? "bg-secondary-600 text-white shadow-lg shadow-secondary-600/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              ⭐ Phổ Biến
            </button>
            <button
              onClick={() => setFilterType("bestSeller")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === "bestSeller"
                  ? "bg-secondary-600 text-white shadow-lg shadow-secondary-600/30"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              🏆 Best Seller
            </button>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredMenuData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMenuData.map((item, index) => {
                const delayClass =
                  index % 3 === 0
                    ? "animate-fade-in-up"
                    : index % 3 === 1
                    ? "animate-fade-in-up-delay-1"
                    : "animate-fade-in-up-delay-2";
                return (
                  <div key={item.id} className={delayClass}>
                    <MenuItem
                      item={item}
                      onReviewClick={() => {
                        setSelectedDish(item);
                        setShowReviewModal(true);
                      }}
                    />
                  </div>
                );
              })}
            </div>
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

      {/* Best Seller Suggestions */}
      {bestSellerItems.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
                ⭐ Món Ngon Được Feedback Từ Khách Hàng
              </h2>
              <p className="text-lg text-neutral-600 animate-fade-in-up-delay-1">
                Những món ăn được khách hàng đánh giá và yêu thích nhất
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestSellerItems.map((item, index) => {
                const delayClass =
                  index % 3 === 0
                    ? "animate-fade-in-up"
                    : index % 3 === 1
                    ? "animate-fade-in-up-delay-1"
                    : "animate-fade-in-up-delay-2";
                return (
                  <div key={item.id} className={delayClass}>
                    <div className="card overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
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
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Rating Section */}
                        {item.rating && (
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.round(item.rating!)
                                        ? "text-yellow-400 fill-current"
                                        : "text-neutral-300 fill-current"
                                    }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">
                                {item.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-neutral-500">
                                ({item.reviewCount})
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedDish(item);
                                setShowReviewModal(true);
                              }}
                              className="text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
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
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              <span>Feedback</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary-600">
                            {item.price.toLocaleString()}₫
                          </span>
                          <button className="btn-primary text-sm">
                            Đặt món
                          </button>
                        </div>

                        {/* Latest Feedback Preview */}
                        {item.reviews && item.reviews.length > 0 && (
                          <div className="pt-4 border-t border-neutral-100">
                            <h4 className="text-xs font-semibold text-neutral-600 mb-2">
                              💬 Feedback gần đây:
                            </h4>
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary-600 font-bold text-xs">
                                    {item.reviews[0].userName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-xs font-semibold text-neutral-800">
                                      {item.reviews[0].userName}
                                    </p>
                                    <div className="flex items-center">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                          key={star}
                                          className={`w-3 h-3 ${
                                            star <= item.reviews![0].rating
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
                                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                                    &ldquo;{item.reviews[0].comment}&rdquo;
                                  </p>
                                  {item.reviewCount && item.reviewCount > 1 && (
                                    <button
                                      onClick={() => {
                                        setSelectedDish(item);
                                        setShowReviewModal(true);
                                      }}
                                      className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
                                    >
                                      Xem thêm {item.reviewCount - 1} feedback
                                      khác →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Nutritional Info */}
      <section className="section-padding bg-neutral-100">
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
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-secondary-600"
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

              {selectedDish.reviews && selectedDish.reviews.length > 0 ? (
                <div className="space-y-4">
                  {selectedDish.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-neutral-50 rounded-xl p-5 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-sm">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">
                              {review.userName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {review.date}
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
