// src/app/dat-ban/page.tsx
"use client";
import { useState } from "react";

export default function DatBanPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Booking data:', formData);
    alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đặt bàn trong thời gian sớm nhất.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
            📅 Đặt Bàn Trước
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Đảm bảo chỗ ngồi thoải mái cho bữa ăn tuyệt vời của bạn
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Booking Form */}
            <div className="animate-fade-in-left">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Thông Tin Đặt Bàn</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-neutral-700 font-medium mb-2">
                        Họ và Tên *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-neutral-700 font-medium mb-2">
                        Số Điện Thoại *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                        placeholder="+84 123 456 789"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-neutral-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-neutral-700 font-medium mb-2">
                        Ngày Đặt *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-neutral-700 font-medium mb-2">
                        Giờ Đặt *
                      </label>
                      <select
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                      >
                        <option value="">Chọn giờ</option>
                        <option value="11:00">11:00</option>
                        <option value="11:30">11:30</option>
                        <option value="12:00">12:00</option>
                        <option value="12:30">12:30</option>
                        <option value="13:00">13:00</option>
                        <option value="17:30">17:30</option>
                        <option value="18:00">18:00</option>
                        <option value="18:30">18:30</option>
                        <option value="19:00">19:00</option>
                        <option value="19:30">19:30</option>
                        <option value="20:00">20:00</option>
                        <option value="20:30">20:30</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guests" className="block text-neutral-700 font-medium mb-2">
                      Số Lượng Khách *
                    </label>
                      <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      required
                    >
                      <option value="">Chọn số lượng</option>
                      <option value="1">1 người</option>
                      <option value="2">2 người</option>
                      <option value="3">3 người</option>
                      <option value="4">4 người</option>
                      <option value="5">5 người</option>
                      <option value="6">6 người</option>
                      <option value="7">7 người</option>
                      <option value="8">8 người</option>
                      <option value="8+">Trên 8 người</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-neutral-700 font-medium mb-2">
                      Ghi Chú Đặc Biệt
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                      placeholder="Yêu cầu đặc biệt, sinh nhật, kỷ niệm..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full text-lg py-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Gửi Yêu Cầu Đặt Bàn
                  </button>
                </form>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="animate-fade-in-right space-y-8">
              {/* Contact Info */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Thông Tin Liên Hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Địa Chỉ</p>
                      <p className="text-neutral-600 text-sm">123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Hotline</p>
                      <a href="tel:+84123456789" className="text-primary-600 hover:text-primary-700 text-sm">+84 123 456 789</a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Giờ Hoạt Động</p>
                      <p className="text-neutral-600 text-sm">7:00 - 22:00 (Thứ 2 - Thứ 6)</p>
                      <p className="text-neutral-600 text-sm">6:30 - 23:00 (Cuối tuần)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="card p-6 bg-accent-50 border-accent-300">
                <h3 className="text-lg font-bold text-secondary-700 mb-3">Lưu Ý Quan Trọng</h3>
                <ul className="space-y-2 text-sm text-secondary-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Vui lòng đặt bàn trước ít nhất 2 tiếng</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Bàn sẽ được giữ trong 15 phút kể từ giờ đặt</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Nhóm trên 8 người vui lòng gọi trực tiếp</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
