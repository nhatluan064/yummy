"use client";

import { useEffect, useState } from "react";

export default function UserLocationPage() {
  const [showMap, setShowMap] = useState(false);

  // Prevent body scroll when this page is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-73px)] -mb-px">
      {/* Full Screen Google Maps - Pushed right to accommodate sidebar */}
      <div className={`absolute inset-0 w-full h-full md:pl-[300px] transition-all duration-300 ${!showMap ? 'hidden md:block' : 'block'}`}>
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

      {/* Fixed Info Sidebar - Left Side, Below Header */}
      <div className={`absolute left-0 top-0 z-10 bg-white shadow-2xl h-full w-full md:w-[300px] overflow-y-auto p-4 transition-all duration-300 ${showMap ? 'hidden md:block' : 'block'}`}>
        {/* Restaurant Image Section */}
        <div className="mb-4 -mx-4 -mt-4">
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src="https://streetviewpixels-pa.googleapis.com/v1/thumbnail?cb_client=maps_sv.tactile&w=900&h=600&pitch=-7.871751026549973&panoid=ao32Cv9dRatBAY_NlGHFuA&yaw=307.1888799378881"
              alt="Tiệm may Lệ Xuân - Mì cay yummy"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <h3 className="text-white font-bold text-lg">Mì cay yummy</h3>
            </div>
            
            {/* Floating Map Button - Mobile Only */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="md:hidden absolute bottom-3 right-3 py-2.5 px-4 rounded-full font-semibold text-white shadow-xl transition-all duration-200 hover:shadow-2xl active:scale-95 flex items-center gap-2 z-10"
              style={{ backgroundColor: '#8B7CF6' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              <span className="text-sm">Xem Bản Đồ</span>
            </button>
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B7CF6' }}>
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Địa Chỉ</h2>
          </div>
          <p className="text-neutral-700 leading-relaxed text-sm pl-15">
            588/6 Cách Mạng Tháng 8<br />
            Phường Bà Rịa, TP.Hồ Chí Minh<br />
            Việt Nam
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 mb-4"></div>

        {/* Opening Hours Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B7CF6' }}>
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Giờ Mở Cửa</h2>
          </div>
          <div className="space-y-2 pl-15">
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium text-sm">Thứ 2 - Chủ Nhật:</span>
              <span className="font-bold text-sm" style={{ color: '#8B7CF6' }}>7:30 - 20:30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 font-medium text-sm">Các ngày lễ:</span>
              <span className="font-bold text-sm" style={{ color: '#8B7CF6' }}>7:30 - 20:30</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 my-4"></div>

        {/* Contact Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B7CF6' }}>
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Hotline & Zalo</h2>
          </div>
          <div className="pl-15 space-y-2">
            <div>
              <p className="text-neutral-700 font-medium mb-1 text-sm">Số điện thoại (Di động) - (Zalo):</p>
              <a
                href="tel:0988994799"
                className="text-base font-bold hover:underline transition-colors"
                style={{ color: '#8B7CF6' }}
              >
                0988 994 799
              </a>
            </div>
            <div>
              <p className="text-neutral-700 font-medium mb-1 text-sm">Facebook:</p>
              <a href="https://www.facebook.com/dieu.hien.169" target="_blank" rel="noopener noreferrer" className="text-base font-bold hover:underline" style={{ color: '#1877F2' }}>Diệu Hiền</a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back Button - Mobile Only - When viewing map */}
      {showMap && (
        <button
          onClick={() => setShowMap(false)}
          className="md:hidden absolute top-4 left-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8B7CF6' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
