"use client";

export default function ContactInfo() {
  return (
    <div>
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Thông Tin Liên Hệ</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              {/* icon địa chỉ */}
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Địa Chỉ</h3>
              <p className="text-neutral-600">588/6 Hà Huy Tập, Phường Bà Rịa, HCM</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent-200 rounded-full flex items-center justify-center flex-shrink-0">
              {/* icon điện thoại */}
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Hotline</h3>
              <a href="tel:0988994799" className="text-primary-600 hover:text-primary-700">0988 994 799</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              {/* icon Facebook */}
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Facebook</h3>
              <a href="https://www.facebook.com/dieu.hien.169" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Diệu Hiền</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              {/* icon Zalo */}
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="Arial">Zalo</text>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Zalo</h3>
              <a href="https://zalo.me/0988994799" className="text-primary-600 hover:text-primary-700">0988 994 799</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              {/* icon giờ hoạt động */}
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Giờ Hoạt Động</h3>
              <p className="text-neutral-600">Từ Thứ 2 tới Chủ nhật: 7h30 Sáng - 20h00 Tối</p>
            </div>
          </div>
        </div>
      </div>

      {/* Special Notes */}
      <div className="card p-6 bg-accent-50 border-accent-300">
        <h3 className="text-lg font-bold text-secondary-700 mb-3">Lưu Ý Quan Trọng</h3>
        <ul className="space-y-2 text-sm text-secondary-600">
          <li className="flex items-start space-x-2"><span className="text-primary-500 mt-1">•</span><span>Vui lòng đặt bàn trước ít nhất 2 tiếng</span></li>
          <li className="flex items-start space-x-2"><span className="text-primary-500 mt-1">•</span><span>Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút</span></li>
          <li className="flex items-start space-x-2"><span className="text-primary-500 mt-1">•</span><span>Bàn sẽ được giữ trong 15 phút kể từ giờ đặt</span></li>
          <li className="flex items-start space-x-2"><span className="text-primary-500 mt-1">•</span><span>Nhóm trên 8 người vui lòng gọi trực tiếp</span></li>
        </ul>
      </div>
    </div>
  );
}
