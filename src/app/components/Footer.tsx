// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 pt-12 text-white">
      <div className="container-custom pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gradient mb-4">
              🍽️ Quán Ăn Ngon
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Nơi quy tụ tinh hoa ẩm thực Việt Nam với không gian ấm cúng và
              dịch vụ tận tâm.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.291C3.85 14.437 3.446 12.767 3.446 11c0-1.767.404-3.437 1.68-4.697C5.951 5.512 7.102 5.022 8.449 5.022s2.498.49 3.374 1.281c1.276 1.26 1.68 2.93 1.68 4.697 0 1.767-.404 3.437-1.68 4.697C10.947 16.498 9.796 16.988 8.449 16.988z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-neutral-300 hover:text-white transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                href="/thuc-don"
                className="block text-neutral-300 hover:text-white transition-colors"
              >
                Thực Đơn
              </Link>
              <Link
                href="/thuc-uong"
                className="block text-neutral-300 hover:text-white transition-colors"
              >
                Nước Uống
              </Link>
              <Link
                href="/dat-ban"
                className="block text-neutral-300 hover:text-white transition-colors"
              >
                Đặt Bàn
              </Link>
              <Link
                href="/lien-he"
                className="block text-neutral-300 hover:text-white transition-colors"
              >
                Liên Hệ
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Thông Tin Liên Hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
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
                <p className="text-neutral-300 text-sm">
                  123 Đường ABC, Phường XYZ
                  <br />
                  Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0"
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
                <a
                  href="tel:+84123456789"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  +84 123 456 789
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@quananngon.com"
                  className="text-neutral-300 hover:text-white transition-colors text-sm"
                >
                  info@quananngon.com
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Giờ Mở Cửa</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-300">Thứ 2 - Thứ 6:</span>
                <span className="text-white font-medium">7:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Thứ 7 - Chủ Nhật:</span>
                <span className="text-white font-medium">6:30 - 23:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Ngày lễ:</span>
                <span className="text-white font-medium">8:00 - 22:00</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6 pt-6 border-t border-neutral-700">
              <h5 className="font-medium mb-3">Đăng Ký Nhận Tin</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-l-md text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 text-sm"
                />
                <button
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-md transition-colors"
                  aria-label="Subscribe to newsletter"
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-700 mt-12 p-6">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400 gap-4">
            <p className="text-center md:text-left">
              &copy; 2024 Quán Ăn Ngon. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Chính Sách Bảo Mật
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Điều Khoản Sử Dụng
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-white transition-colors"
              >
                Sơ Đồ Trang Web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
