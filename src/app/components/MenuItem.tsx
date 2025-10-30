// src/components/MenuItem.tsx
"use client";
import { useState } from "react";
import { useOrder } from "./OrderContext";
import Image from "next/image";

// Dữ liệu mẫu cho một món ăn
interface MenuItemProps {
  item: {
    id?: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    popular?: boolean;
    bestSeller?: boolean;
    isNew?: boolean;
    available?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  onReviewClick?: () => void;
  showAddToCart?: boolean; // Kiểm soát hiển thị nút thêm vào giỏ
}

export default function MenuItem({ item, onReviewClick, showAddToCart = true }: MenuItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  let order: ReturnType<typeof useOrder> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    order = useOrder();
  } catch {
    order = null;
  }

  const handleAddToCart = () => {
    if (!order) return;
    order.addItem({ name: item.name, price: item.price, quantity });
    // Không mở drawer ở đây, để user có thể tiếp tục thêm món khác
  };

  return (
    <div className="card group overflow-hidden animate-fade-in-up h-auto flex flex-col">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {!imageLoaded && <div className="skeleton w-full h-40"></div>}
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={160}
          className={`w-full h-40 object-cover transition-transform duration-400 group-hover:scale-105 rounded-t-md ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />

        {/* Soft Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/6 to-transparent opacity-100 transition-opacity duration-300"></div>

        {/* Price Ribbon (top-left) */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-3 py-1 rounded-full text-xs shadow-lg">
          {item.price.toLocaleString("vi-VN")}₫
        </div>

        {/* Badge Labels (top-right) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.isNew && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px] shadow-lg flex items-center gap-1">
              <span>✨</span>
              <span>Mới</span>
            </div>
          )}
          {item.bestSeller && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px] shadow-lg flex items-center gap-1">
              <span>⭐</span>
              <span>Best Seller</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 bg-white flex-1 flex flex-col">
        <div className="min-h-[50px] mb-2">
          <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 leading-snug">
            {item.name}
          </h3>
        </div>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2 leading-snug">
          {item.description}
        </p>

        {/* Rating & Reviews */}
        {item.rating !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(item.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {item.rating?.toFixed(1)} ({item.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="my-2 border-t border-neutral-100" />

        {/* Quantity Selector & Add to Cart - Chỉ hiển thị khi showAddToCart = true */}
        {showAddToCart && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md text-neutral-700 hover:bg-neutral-200 transition text-sm"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <div className="min-w-[2rem] text-center font-medium text-neutral-900 text-sm">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md text-neutral-700 hover:bg-neutral-200 transition text-sm"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="flex-1">
              <button
                onClick={handleAddToCart}
                className="btn-accent w-full py-1.5 rounded-md flex items-center justify-center gap-1 animate-order-btn text-xs"
                aria-label={`Thêm ${item.name} vào giỏ hàng`}
                style={{
                  transition: "transform 0.15s cubic-bezier(.4,2,.6,1)",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.96)")
                }
                onMouseUp={(e) => (e.currentTarget.style.transform = "")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
              >
                <svg
                  className="w-3 h-3 transform transition-transform duration-300 group-hover:animate-wiggle"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L12 21m0 0l2.5-3M12 21l2.5-3"
                  />
                </svg>
                Thêm vào giỏ
              </button>
            </div>
          </div>
        )}

        {/* Review Button */}
        {onReviewClick && (
          <button
            onClick={onReviewClick}
            className="w-full py-2 mt-3 px-3 bg-white border-2 border-primary-500 text-primary-600 rounded-md font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-xs"
            aria-label={`Viết đánh giá cho ${item.name}`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
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
            Viết đánh giá
          </button>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
