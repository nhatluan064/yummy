// src/components/MenuItem.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

// Dữ liệu mẫu cho một món ăn
interface MenuItemProps {
  item: {
    id?: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

export default function MenuItem({ item }: MenuItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Logic thêm vào giỏ hàng sẽ được implement sau
    console.log(`Added ${quantity} ${item.name} to cart`);
  };

  return (
    <div className="card group overflow-hidden animate-fade-in-up">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="skeleton w-full h-64"></div>
        )}
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={256}
          className={`w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-md ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />

        {/* Soft Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/6 to-transparent opacity-100 transition-opacity duration-300"></div>

        {/* Price Ribbon (top-left) */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-4 py-1.5 rounded-full text-sm shadow-lg">
          {item.price.toLocaleString("vi-VN")}₫
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
          {item.name}
        </h3>
        <p className="text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        {/* Divider */}
        <div className="my-4 border-t border-neutral-100" />

        {/* Quantity Selector & Add to Cart */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center bg-neutral-100 rounded-md text-neutral-700 hover:bg-neutral-200 transition"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="min-w-[2.5rem] text-center font-medium text-neutral-900">{quantity}</div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center bg-neutral-100 rounded-md text-neutral-700 hover:bg-neutral-200 transition"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="flex-1">
            <button
              onClick={handleAddToCart}
              className="btn-accent w-full py-3 rounded-md flex items-center justify-center gap-2"
              aria-label={`Thêm ${item.name} vào giỏ`}
            >
              <svg 
                className="w-4 h-4 transform transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L12 21m0 0l2.5-3M12 21l2.5-3" />
              </svg>
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
