// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 pt-12 text-white">
      <div className="container-custom pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-gradient mb-4">
              🍜 Mì cay yummy
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Thưởng thức tô mì cay chuẩn vị Hàn Quốc, sợi mì dai ngon, nước dùng đậm đà, topping đa dạng. Không gian quán ấm cúng, phục vụ tận tâm, là điểm đến lý tưởng cho những ai yêu thích vị cay nồng và trải nghiệm ẩm thực đặc sắc.
            </p>
          </div>

          {/* Quick Links (the same as Navbar) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Liên Kết Nhanh</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-neutral-300 hover:text-white transition-colors">Trang Chủ</Link>
              <Link href="/dat-ban" className="block text-neutral-300 hover:text-white transition-colors">Đặt Bàn</Link>
              <Link href="/thuc-don" className="block text-neutral-300 hover:text-white transition-colors">Thực Đơn</Link>
              <Link href="/lien-he" className="block text-neutral-300 hover:text-white transition-colors">Liên Hệ</Link>
            </nav>
          </div>

          {/* Contact Info mới với icon màu nền */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Thông Tin Liên Hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#8B7CF6]">
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                    </svg>
                  </span>
                <div>
                  <div className="font-semibold text-white">Địa Chỉ</div>
                  <div className="text-neutral-300 text-sm">588/6 Hà Huy Tập, Phường Bà Rịa, HCM</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#8B7CF6]">
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"/></svg>
                </span>
                <div>
                  <div className="font-semibold text-white">Hotline</div>
                  <a href="tel:0988994799" className="text-[#8B7CF6] text-sm">0988 994 799</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1877F2]">
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#1877F2"/><path d="M21.5 16H18V26H14V16H11V12H14V10.5C14 8.57 15.57 7 17.5 7H21V11H18.5C18.22 11 18 11.22 18 11.5V12H21.5L21 16Z" fill="white"/></svg>
                </span>
                <div>
                  <div className="font-semibold text-white">Facebook</div>
                  <a href="https://www.facebook.com/dieu.hien.169" className="text-[#1877F2] text-sm" target="_blank" rel="noopener noreferrer">Diệu Hiền</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[#19B447]">
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#19B447"/><text x="16" y="22" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="Arial" dominantBaseline="middle">Zalo</text></svg>
                </span>
                <div>
                  <div className="font-semibold text-white">Zalo</div>
                  <a href="https://zalo.me/0988994799" className="text-[#19B447] text-sm" target="_blank" rel="noopener noreferrer">0988 994 799</a>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Giờ Hoạt Động</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-300">Thứ 2 - Thứ 6:</span>
                <span className="text-white font-medium">8:00 - 20:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Thứ 7 - Chủ Nhật:</span>
                <span className="text-white font-medium">7:30 - 20:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Ngày lễ:</span>
                <span className="text-white font-medium">7:30 - 21:00</span>
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
              &copy; 2024 Mì cay yummy. Tất cả quyền được bảo lưu.
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
