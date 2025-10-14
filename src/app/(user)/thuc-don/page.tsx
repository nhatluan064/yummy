'use client';

import { useState, useEffect } from 'react';
import MenuItem from "@/app/components/MenuItem";
import Image from "next/image";
import { getAvailableMenuItemsByCategory, getMenuItems, getCategories, type Category } from '@/lib/menuData';

interface MenuItemData {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuData, setMenuData] = useState<MenuItemData[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenuData, setFilteredMenuData] = useState<MenuItemData[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('default');

  // Load categories on mount
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    // Load menu items from shared data (only available items)
    const items = getAvailableMenuItemsByCategory(selectedCategory);
    // Transform to match MenuItem component props
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
    }));
    setMenuData(transformedItems);

    // Load popular items (only available and marked as popular)
    const allItems = getMenuItems();
    const popularAvailable = allItems.filter(item => item.popular && item.available);
    const transformedPopular = popularAvailable.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
    }));
    setPopularItems(transformedPopular);
  }, [selectedCategory]);

  // Filter and sort menu data
  useEffect(() => {
    let filtered = menuData;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredMenuData(sorted);
  }, [searchQuery, menuData, sortBy]);
  return (
    <div className="min-h-screen bg-neutral-50">
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
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}
              >
                Tất Cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Sort Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-neutral-600">Sắp xếp:</span>
            <button
              onClick={() => setSortBy('default')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'default'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Mặc định
            </button>
            <button
              onClick={() => setSortBy('price-asc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price-asc'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Giá: Thấp → Cao
            </button>
            <button
              onClick={() => setSortBy('price-desc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price-desc'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Giá: Cao → Thấp
            </button>
            <button
              onClick={() => setSortBy('name-asc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'name-asc'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Tên: A → Z
            </button>
            <button
              onClick={() => setSortBy('name-desc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'name-desc'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Tên: Z → A
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
                const delayClass = index % 3 === 0 ? 'animate-fade-in-up' : 
                                 index % 3 === 1 ? 'animate-fade-in-up-delay-1' : 
                                 'animate-fade-in-up-delay-2';
                return (
                  <div key={item.id} className={delayClass}>
                    <MenuItem item={item} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Không tìm thấy món ăn</h3>
              <p className="text-neutral-600">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Suggestions */}
      {popularItems.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
                ⭐ Gợi Ý Món Ăn Hôm Nay
              </h2>
              <p className="text-lg text-neutral-600 animate-fade-in-up-delay-1">
                Những món ăn được yêu thích nhất, được chọn bởi bếp trưởng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularItems.map((item, index) => {
                const delayClass = index % 3 === 0 ? 'animate-fade-in-up' : 
                                 index % 3 === 1 ? 'animate-fade-in-up-delay-1' : 
                                 'animate-fade-in-up-delay-2';
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
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>Phổ biến</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-600">
                            {item.price.toLocaleString()}₫
                          </span>
                          <button className="btn-primary text-sm">
                            Đặt món
                          </button>
                        </div>
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
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">100% Tự Nhiên</h3>
                <p className="text-neutral-600">Không chất bảo quản, không phẩm màu tổng hợp</p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-1">
              <div className="p-6">
                <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Tươi Mỗi Ngày</h3>
                <p className="text-neutral-600">Nguyên liệu được nhập về và chế biến hàng ngày</p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-2">
              <div className="p-6">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Phục Vụ Nhanh</h3>
                <p className="text-neutral-600">Cam kết phục vụ trong vòng 15-20 phút</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
