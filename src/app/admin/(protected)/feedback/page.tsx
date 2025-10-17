'use client';

import { useState, useEffect } from 'react';
import { getMenuItems, type Review } from '@/lib/menuData';

interface ReviewWithDish extends Review {
  dishId: number;
  dishName: string;
  hidden?: boolean;
  customerName?: string;
}

export default function FeedbackManagementPage() {
  const [allReviews, setAllReviews] = useState<ReviewWithDish[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');


  // Load all reviews from Firestore
  useEffect(() => {
    async function fetchFeedbacks() {
      const { feedbackService } = await import('@/lib/feedback.service');
      const feedbacks = await feedbackService.getAll();
      // Map feedbacks to ReviewWithDish
      const allItems = getMenuItems();
      const reviewsList: ReviewWithDish[] = feedbacks.map((fb: any) => {
        let dish = allItems.find(item => item.name === fb.dishName || item.id === fb.dishId);
        return {
          ...fb,
          dishId: dish?.id ?? '',
          dishName: dish?.name ?? (fb.dishName || ''),
          hidden: fb.hidden || false,
          customerName: fb.customerName ?? fb.userName ?? '',
        };
      });
      // Sort by date (newest first)
      reviewsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllReviews(reviewsList);
    }
    fetchFeedbacks();
  }, []);


  // Toggle hide feedback (Firestore)
  const toggleHideReview = async (reviewId: number) => {
    const { feedbackService } = await import('@/lib/feedback.service');
    // Tìm feedback theo id
    const feedbacks = await feedbackService.getAll();
    const fb = feedbacks.find((f: any) => f.id === reviewId);
    if (fb) {
      await feedbackService.update(fb.id, { ...fb, hidden: !fb.hidden });
      // Reload
      const updated = await feedbackService.getAll();
      const allItems = getMenuItems();
      const reviewsList: ReviewWithDish[] = updated.map((fb: any) => {
        let dish = allItems.find(item => item.name === fb.dishName || item.id === fb.dishId);
        return {
          ...fb,
          dishId: dish?.id ?? '',
          dishName: dish?.name ?? (fb.dishName || ''),
          hidden: fb.hidden || false,
        };
      });
      reviewsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllReviews(reviewsList);
    }
  };


  const deleteReview = async (reviewId: number | string, dishId: number) => {
    if (!confirm('Bạn có chắc muốn xóa feedback này?')) return;
    const { feedbackService } = await import('@/lib/feedback.service');
    await feedbackService.delete(String(reviewId));
    // Reload
    const updated = await feedbackService.getAll();
    const allItems = getMenuItems();
    const reviewsList: ReviewWithDish[] = updated.map((fb: any) => {
      let dish = allItems.find(item => item.name === fb.dishName || item.id === fb.dishId);
      return {
        ...fb,
        dishId: dish?.id ?? '',
        dishName: dish?.name ?? (fb.dishName || ''),
        hidden: fb.hidden || false,
      };
    });
    reviewsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAllReviews(reviewsList);
  };

  // Filter reviews
  const filteredReviews = allReviews.filter(review => {
    // Filter by status
    if (filterStatus === 'visible' && review.hidden) return false;
    if (filterStatus === 'hidden' && !review.hidden) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        review.dishName.toLowerCase().includes(query) ||
        review.userName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">💬 Quản Lý Feedback</h1>
          <p className="text-neutral-600 mt-2">
            Xem và quản lý đánh giá từ khách hàng
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-neutral-200">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-2xl font-bold text-primary-600">{allReviews.length}</span>
          <span className="text-sm text-neutral-600">Tổng feedback</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Hiển thị</p>
              <p className="text-3xl font-bold text-green-600">
                {allReviews.filter(r => !r.hidden).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Đã ẩn</p>
              <p className="text-3xl font-bold text-yellow-600">
                {allReviews.filter(r => r.hidden).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Rating trung bình</p>
              <p className="text-3xl font-bold text-blue-600">
                {allReviews.length > 0 
                  ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo món ăn, tên khách, nội dung..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('visible')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'visible'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Hiển thị
            </button>
            <button
              onClick={() => setFilterStatus('hidden')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'hidden'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Đã ẩn
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-neutral-500 text-lg">Chưa có feedback nào</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`card p-6 ${review.hidden ? 'bg-neutral-50 opacity-75' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-lg">
                      {review.customerName ? review.customerName.charAt(0) : "?"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-neutral-800">{review.customerName}</h3>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-neutral-300 fill-current'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-neutral-500">{review.date}</span>
                      {review.hidden && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 font-medium mb-2">
                      🍽️ {review.dishName}
                    </p>
                    <p className="text-neutral-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleHideReview(review.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.hidden
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                    title={review.hidden ? 'Hiện feedback' : 'Ẩn feedback'}
                  >
                    {review.hidden ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id, review.dishId)}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                    title="Xóa feedback"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
