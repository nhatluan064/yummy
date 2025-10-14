'use client';

import { useState, useEffect } from 'react';
import MenuItem from "@/app/components/MenuItem";
import { getAvailableMenuItemsByCategory } from '@/lib/menuData';

interface DrinkItemData {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function DrinksMenuPage() {
  const [drinksData, setDrinksData] = useState<DrinkItemData[]>([]);

  useEffect(() => {
    // Load only drinks (nuoc-uong category) from shared data
    const items = getAvailableMenuItemsByCategory('nuoc-uong');
    // Transform to match MenuItem component props
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image,
    }));
    setDrinksData(transformedItems);
  }, []);
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
            🍹 Thực Đơn Đồ Uống
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Khám phá bộ sưu tập đồ uống đa dạng, từ truyền thống đến hiện đại
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4 justify-center bg-white border border-neutral-200 rounded-full px-4 py-3 shadow-card">
            <button className="btn-primary">
              Tất Cả
            </button>
            <button className="btn-secondary">
              ☕ Cà Phê
            </button>
            <button className="btn-secondary">
              🧊 Nước Giải Khát
            </button>
            <button className="btn-secondary">
              🥤 Sinh Tố
            </button>
            <button className="btn-secondary">
              🧋 Trà Sữa
            </button>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drinksData.map((item, index) => {
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
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
              🎉 Ưu Đãi Đặc Biệt
            </h2>
            <p className="text-lg text-neutral-600 animate-fade-in-up-delay-1">
              Những deal hot không thể bỏ lỡ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow-primary animate-fade-in-up">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Combo Cà Phê + Bánh</h3>
                <p className="mb-6 opacity-90">Mua 1 cà phê bất kỳ + 1 bánh ngọt chỉ với</p>
                <div className="text-4xl font-bold mb-4">45,000₫</div>
                <p className="text-sm opacity-75">Tiết kiệm 15,000₫</p>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary-600 to-secondary-500 text-white shadow-glow-secondary animate-fade-in-up-delay-1">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Happy Hour</h3>
                <p className="mb-6 opacity-90">Giảm 20% tất cả đồ uống từ 14:00 - 16:00</p>
                <div className="text-4xl font-bold mb-4">-20%</div>
                <p className="text-sm opacity-75">Áp dụng từ thứ 2 đến thứ 6</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-neutral-100">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
            Không Tìm Thấy Món Yêu Thích?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 animate-fade-in-up-delay-1">
            Hãy liên hệ với chúng tôi để biết thêm về các loại đồ uống khác
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <a href="tel:+84123456789" className="btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Gọi Ngay
            </a>
            <a href="/lien-he" className="btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Nhắn Tin
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
