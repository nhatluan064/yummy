// src/app/lien-he/page.tsx
"use client";
import { useState } from "react";

export default function LienHePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
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
            📞 Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Chúng tôi luôn sẵn sàng lắng nghe và phục vụ bạn
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in-left">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Gửi Tin Nhắn</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-neutral-700 font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        required
                        placeholder="example@email.com"
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
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        required
                        placeholder="+84 123 456 789"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-neutral-700 font-medium mb-2">
                      Chủ Đề *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="booking">Đặt Bàn</option>
                      <option value="menu">Thực Đơn</option>
                      <option value="event">Tổ Chức Sự Kiện</option>
                      <option value="feedback">Góp Ý / Phản Hồi</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-neutral-700 font-medium mb-2">
                      Nội Dung *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                      required
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-accent w-full text-lg py-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Gửi Tin Nhắn
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="animate-fade-in-right space-y-6">
              {/* Main Contact Card */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Thông Tin Liên Hệ</h2>
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Địa Chỉ</h3>
                      <p className="text-neutral-600">123 Đường ABC, Phường XYZ</p>
                      <p className="text-neutral-600">Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Điện Thoại</h3>
                      <a href="tel:+84123456789" className="text-primary-600 hover:text-primary-700">
                        +84 123 456 789
                      </a>
                      <p className="text-neutral-600 text-sm mt-1">Hotline hỗ trợ 24/7</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Email</h3>
                      <a href="mailto:info@quananngon.com" className="text-secondary-600 hover:text-secondary-700">
                        info@quananngon.com
                      </a>
                      <p className="text-neutral-600 text-sm mt-1">Phản hồi trong 24h</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Giờ Hoạt Động</h3>
                      <p className="text-neutral-600">Thứ 2 - Thứ 6: 7:00 - 22:00</p>
                      <p className="text-neutral-600">Thứ 7 - CN: 6:30 - 23:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Bản Đồ</h3>
                <div className="bg-neutral-200 rounded-lg overflow-hidden h-[300px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325271840539!2d106.69974731533385!3d10.787133392311942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x55bc3c103d1d90!2sBen%20Thanh%20Market!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                    width="100%" 
                    height="100%" 
                    className="border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Restaurant Location"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Kết Nối Với Chúng Tôi</h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                    aria-label="Zalo"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.539c-.153.308-.769.846-1.231 1.077-.462.231-3.154 1.154-6.663-2.231-3.509-3.385-2.231-6.01-2-6.472.231-.462.769-1.154 1.077-1.231.308-.077.615-.077.846.154.231.231 1.385 2 1.539 2.308.154.308.154.692-.154.923-.308.231-.615.462-.846.692-.231.231-.462.462-.231.846.231.385 1.077 1.846 2.385 3 1.308 1.154 2.615 1.846 3 2.077.385.231.615.154.846-.077.231-.231.462-.538.692-.846.231-.308.615-.462.923-.308.308.154 2.077 1.308 2.308 1.539.231.231.308.538.231.846z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
