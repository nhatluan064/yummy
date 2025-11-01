// src/app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { feedbackService } from "@/lib/feedback.service";
import { getCategoriesFromFirestore, getMenuItemsFromFirestore } from "@/lib/firestoreMenu";
import type { WithId } from "@/lib/firestore.service";
import type { Feedback } from "@/lib/types";
import type { MenuItem, Category } from "@/lib/menuData";

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<WithId<Feedback>[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [currentFeedbackSlide, setCurrentFeedbackSlide] = useState(0);
  const [feedbackItemsPerSlide, setFeedbackItemsPerSlide] = useState(3);

  // Load data from Firestore
  useEffect(() => {
    Promise.all([
      getCategoriesFromFirestore(),
      getMenuItemsFromFirestore(),
      feedbackService.getAll()
    ]).then(([, items, fbs]) => {
      setMenuItems(items as unknown as MenuItem[]);
      setFeedbacks(fbs);
      setLoading(false);
    });
  }, []);

  // Detect screen size and adjust items per slide (for menu items)
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      if (newItemsPerSlide !== itemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide);
        setCurrentSlide(0); // Reset to first slide when changing layout
      }
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerSlide]);

  // Detect screen size and adjust items per slide (for feedbacks)
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerSlide = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      if (newItemsPerSlide !== feedbackItemsPerSlide) {
        setFeedbackItemsPerSlide(newItemsPerSlide);
        setCurrentFeedbackSlide(0); // Reset to first slide when changing layout
      }
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [feedbackItemsPerSlide]);

  // Get available items and featured items
  const availableItems = menuItems.filter((item) => item.available);
  let featured: MenuItem[] = [];
  if (availableItems.length > 0) {
    featured = availableItems.filter((i) => i.bestSeller);
    if (featured.length === 0) featured = availableItems.slice(0, 9); // Show up to 9 items (3 pages of 3)
  }
  
  // Calculate total slides based on screen size
  const totalSlides = Math.ceil(featured.length / itemsPerSlide);

  // Get non-hidden feedbacks with 4-5 stars, limit to 9
  const displayFeedbacks = feedbacks
    .filter(f => !f.hidden && f.rating >= 4)
    .slice(0, 9); // Show up to 9 feedbacks (3 pages of 3)
  
  // Calculate total feedback slides
  const totalFeedbackSlides = Math.ceil(displayFeedbacks.length / feedbackItemsPerSlide);

  // Auto-play carousel
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  // Auto-play feedback carousel
  useEffect(() => {
    if (totalFeedbackSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentFeedbackSlide((prev) => (prev + 1) % totalFeedbackSlides);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [totalFeedbackSlides]);

  // Carousel navigation (menu items)
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Carousel navigation (feedback)
  const nextFeedbackSlide = () => {
    setCurrentFeedbackSlide((prev) => (prev + 1) % totalFeedbackSlides);
  };

  const prevFeedbackSlide = () => {
    setCurrentFeedbackSlide((prev) => (prev - 1 + totalFeedbackSlides) % totalFeedbackSlides);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/95 via-primary-600/90 to-secondary-600/95 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3')] bg-cover bg-center"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Mì cay yummy
            <br />
            <span className="text-accent-200">Kính Chào Quý Khách</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
            Nơi tận hưởng những món ăn ngon nhất với không gian ấm cúng và dịch
            vụ tận tâm
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/user/thuc-don" className="btn-secondary">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Xem Thực Đơn
            </Link>
            <Link
              href="/user/dat-ban"
              className="btn-secondary">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Đặt Bàn & Liên Hệ
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-pulse">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến cho bạn trải nghiệm ẩm thực tuyệt vời
              nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up-delay-1">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                Nguyên Liệu Tươi Ngon
              </h3>
              <p className="text-neutral-600">
                Được chọn lọc kỹ càng từ những nguồn cung cấp uy tín, đảm bảo
                chất lượng cao nhất
              </p>
            </div>

            <div className="text-center group animate-fade-in-up-delay-2">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
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
                Phục Vụ Nhanh Chóng
              </h3>
              <p className="text-neutral-600">
                Đội ngũ chuyên nghiệp, phục vụ tận tâm với thời gian chờ đợi tối
                thiểu
              </p>
            </div>

            <div className="text-center group animate-fade-in-up-delay-3">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                Không Gian Ấm Cúng
              </h3>
              <p className="text-neutral-600">
                Thiết kế hiện đại, không gian thoáng mát, lý tưởng cho mọi dịp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              Món Ăn Đặc Biệt
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Những món ăn được yêu thích nhất tại nhà hàng chúng tôi
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {loading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl overflow-hidden bg-white shadow-md p-0 animate-pulse">
                    <div className="h-44 bg-neutral-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-20 bg-neutral-200 rounded"></div>
                        <div className="h-10 w-24 bg-neutral-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featured.length === 0 ? (
              // No items state
              <div className="text-center py-12">
                <p className="text-neutral-500">Chưa có món ăn nào</p>
              </div>
            ) : (
              <>
                {/* Carousel Track */}
                <div className="overflow-hidden mx-auto max-w-7xl">
                  <div 
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ 
                      transform: `translateX(-${currentSlide * 100}%)`
                    }}
                  >
                    {/* Group items by slides */}
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div 
                        key={slideIndex}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {featured
                            .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                            .map((item) => (
                              <article
                                key={item.id}
                                className="rounded-xl overflow-hidden bg-white shadow-md flex flex-col relative"
                              >
                        <div className="h-44 bg-neutral-200 relative flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={400}
                              height={176}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-100" />
                          )}
                          {/* Best Seller Badge */}
                          {item.bestSeller && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Best Seller
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-neutral-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                            {item.name}
                          </h3>
                          <p className="text-neutral-600 mb-4 line-clamp-2 flex-grow">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="text-primary-600 font-bold text-lg">
                              {item.price.toLocaleString()}đ
                            </div>
                            <Link
                              href="/user/thuc-don"
                              className="btn-primary"
                            >
                              Xem Chi Tiết
                            </Link>
                          </div>
                        </div>
                      </article>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {totalSlides > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 group"
                      aria-label="Previous slide"
                    >
                      <svg className="w-6 h-6 text-neutral-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 group"
                      aria-label="Next slide"
                    >
                      <svg className="w-6 h-6 text-neutral-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {totalSlides > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'w-8 bg-primary-600'
                            : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/user/thuc-don" className="btn-primary text-lg px-8 py-4">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Xem Thực Đơn Đầy Đủ
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              Đánh Giá Từ Khách Hàng
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Những phản hồi chân thực từ khách hàng đã trải nghiệm dịch vụ của chúng tôi
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {displayFeedbacks.length > 0 ? (
              <>
                {/* Carousel Track */}
                <div className="overflow-hidden mx-auto max-w-7xl">
                  <div 
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ 
                      transform: `translateX(-${currentFeedbackSlide * 100}%)`
                    }}
                  >
                    {/* Group feedbacks by slides */}
                    {Array.from({ length: totalFeedbackSlides }).map((_, slideIndex) => (
                      <div 
                        key={slideIndex}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {displayFeedbacks
                            .slice(slideIndex * feedbackItemsPerSlide, (slideIndex + 1) * feedbackItemsPerSlide)
                            .map((feedback) => (
                              <div
                                key={feedback.id}
                                className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full flex flex-col"
                              >
                    {/* Dish Image */}
                    {feedback.dishImage && (
                      <div className="w-full h-32 bg-neutral-200 flex-shrink-0">
                        <Image
                          src={feedback.dishImage}
                          alt={feedback.dishName || 'Món ăn'}
                          width={400}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Dish Name (if available) */}
                      {feedback.dishName && (
                        <h4 className="text-sm font-semibold text-primary-600 mb-2">
                          {feedback.dishName}
                        </h4>
                      )}
                      
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-3 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < feedback.rating
                              ? 'text-amber-400 fill-current'
                              : 'text-neutral-300'
                          }`}
                          fill={i < feedback.rating ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-neutral-700">
                        {feedback.rating}/5
                      </span>
                    </div>

                      {/* Comment */}
                      <p className="text-neutral-700 mb-4 line-clamp-4 leading-relaxed flex-grow min-h-[6rem]">
                        &ldquo;{feedback.comment}&rdquo;
                      </p>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 flex-shrink-0 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                          {feedback.customerName?.charAt(0).toUpperCase() || 'K'}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-800">
                            {feedback.customerName || 'Khách hàng'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {feedback.createdAt && typeof feedback.createdAt === 'object' && 'toDate' in feedback.createdAt
                            ? new Date((feedback.createdAt as { toDate: () => Date }).toDate()).toLocaleDateString('vi-VN') 
                            : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {totalFeedbackSlides > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevFeedbackSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 group"
                      aria-label="Previous feedback slide"
                    >
                      <svg className="w-6 h-6 text-neutral-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextFeedbackSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 group"
                      aria-label="Next feedback slide"
                    >
                      <svg className="w-6 h-6 text-neutral-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {totalFeedbackSlides > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalFeedbackSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeedbackSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentFeedbackSlide
                            ? 'w-8 bg-primary-600'
                            : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                        }`}
                        aria-label={`Go to feedback slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-neutral-500">Chưa có đánh giá nào</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-secondary-600 via-secondary-500 to-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            Sẵn Sàng Thưởng Thức?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up-delay-1">
            Đặt bàn ngay hôm nay để có trải nghiệm ẩm thực tuyệt vời
          </p>
          <div className="flex justify-center animate-fade-in-up-delay-2">
            <Link
              href="/user/dat-ban"
              className="btn-secondary">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Đặt Bàn & Liên Hệ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
