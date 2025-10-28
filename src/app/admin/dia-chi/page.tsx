"use client";

export default function AdminLocationPage() {
  return (
    <div className="relative w-full h-screen">
      {/* Full Screen Google Maps */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1961.5665524607439!2d107.18502083281068!3d10.490171921049502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175735a9fca1ce1%3A0xd20f7248807643ad!2zNTg4IEjDoCBIdXkgVOG6rXAsIFBoxrDhu5tjIFRydW5nLCBCw6AgUuG7i2EsIELDoCBS4buLYSAtIFbFqW5nIFTDoHUsIFZpZXRuYW0!5e0!3m2!1sen!2sus!4v1760583213893!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Restaurant Location"
        ></iframe>
      </div>

      {/* Overlay Info Box - Top Left */}
      <div className="absolute top-8 left-8 z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md animate-fade-in-up">
        {/* Location Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">📍 Địa Chỉ</h2>
          </div>
          <p className="text-neutral-700 leading-relaxed text-base pl-15">
            588/6 Hà Huy Tập<br />
            Phường Bà Rịa, TP. Bà Rịa<br />
            Bà Rịa - Vũng Tàu, Việt Nam
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 mb-8"></div>

        {/* Opening Hours Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">🕐 Giờ Mở Cửa</h2>
          </div>
          <div className="space-y-3 pl-15">
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium">Thứ 2 - Thứ 6:</span>
              <span className="text-primary-600 font-bold">9:00 - 22:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium">Thứ 7 - Chủ Nhật:</span>
              <span className="text-primary-600 font-bold">8:00 - 23:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium">Lễ, Tết:</span>
              <span className="text-primary-600 font-bold">8:00 - 00:00</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-8"></div>

        {/* Contact Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">📞 Hotline & Zalo</h2>
          </div>
          <a
            href="tel:0988994799"
            className="text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors pl-15 block"
          >
            0988 994 799
          </a>
          <div>
              <h3 className="font-bold text-neutral-800 mb-1">Facebook</h3>
              <a href="https://www.facebook.com/dieu.hien.169" target="_blank" rel="noopener noreferrer" className="text-primary-600 text-lg font-bold hover:text-primary-700">Diệu Hiền</a>
            </div>
        </div>
      </div>
    </div>
  );
}
