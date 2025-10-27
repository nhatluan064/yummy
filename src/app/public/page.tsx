"use client";
import Link from "next/link";
import Image from "next/image";
import { getCategories, getAvailableMenuItems, MenuItem } from "@/lib/menuData";

export default function PublicHomePage() {
  const categories = getCategories();
  const availableItems = getAvailableMenuItems();

  let featured: MenuItem[] = [];
  if (categories.length > 0) {
    featured = availableItems.filter((i) => i.bestSeller).slice(0, 3);
    if (featured.length === 0) featured = availableItems.slice(0, 3);
  }

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
            <Link href="/public/thuc-don" className="btn-primary text-lg px-8 py-4">
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
              href="/public/dat-ban"
              className="btn-secondary bg-white text-red-600 border-white hover:bg-red-600 hover:text-white text-lg px-8 py-4"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Đặt Bàn Ngay
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
              <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-300 transition-colors">
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
                Phục Vụ Nhanh Chóng
              </h3>
              <p className="text-neutral-600">
                Đội ngũ chuyên nghiệp, phục vụ tận tâm với thời gian chờ đợi tối
                thiểu
              </p>
            </div>

            <div className="text-center group animate-fade-in-up-delay-3">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.length === 0
              ? null
              : featured.map((item, index) => {
                  const delayClass =
                    index === 0
                      ? "animate-fade-in-up"
                      : index === 1
                      ? "animate-fade-in-up-delay-1"
                      : "animate-fade-in-up-delay-2";
                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl overflow-hidden bg-white shadow-md p-0 ${delayClass}`}
                    >
                      <div className="h-44 bg-neutral-200">
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
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-neutral-600 mb-4">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-primary-600 font-bold">
                            {item.price.toLocaleString()}đ
                          </div>
                          <Link
                            href={`/public/thuc-don/${item.id}`}
                            className="btn-primary"
                          >
                            Xem Chi Tiết
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>

          <div className="text-center mt-12">
            <Link href="/public/thuc-don" className="btn-secondary">
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

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-secondary-600 via-secondary-500 to-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            Sẵn Sàng Thưởng Thức?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up-delay-1">
            Đặt bàn ngay hôm nay để có trải nghiệm ẩm thực tuyệt vời
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up-delay-2">
            <Link
              href="/public/dat-ban"
              className="btn-secondary bg-white text-primary-600 border-white hover:bg-accent-50"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Đặt Bàn Ngay
            </Link>
            <Link
              href="/public/lien-he"
              className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Liên Hệ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
