"use client";

export default function ContactInfo() {
  return (
    <div>
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Thông Tin Liên Hệ</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8B7CF6' }}>
              {/* icon địa chỉ */}
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Địa Chỉ</h3>
              <p className="text-neutral-600">588/6 Hà Huy Tập, Phường Bà Rịa, HCM</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8B7CF6' }}>
              {/* icon điện thoại */}
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Hotline</h3>
              <a href="tel:0988994799" className="hover:underline" style={{ color: '#8B7CF6' }}>0988 994 799</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1877F2' }}>
              {/* icon Facebook */}
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Facebook</h3>
              <a href="https://www.facebook.com/dieu.hien.169" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#1877F2' }}>Diệu Hiền</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0068FF' }}>
              {/* icon Zalo */}
              <span className="text-white text-2xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>Z</span>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-1">Zalo</h3>
              <a href="https://zalo.me/0988994799" className="hover:underline" style={{ color: '#0068FF' }}>0988 994 799</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8B7CF6' }}>
              {/* icon giờ hoạt động */}
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
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
