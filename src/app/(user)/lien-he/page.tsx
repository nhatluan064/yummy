// src/app/lien-he/page.tsx
"use client";
import { useState } from "react";

export default function LienHePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    alert(
      "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất."
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-neutral-50">
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
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  Gửi Tin Nhắn
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                      <label
                        htmlFor="email"
                        className="block text-neutral-700 font-medium mb-2"
                      >
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
                      <label
                        htmlFor="phone"
                        className="block text-neutral-700 font-medium mb-2"
                      >
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
                    <label
                      htmlFor="subject"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                    <label
                      htmlFor="message"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
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
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  Thông Tin Liên Hệ
                </h2>
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#8B7CF6] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Địa Chỉ</h3>
                      <p className="text-neutral-600">588/6 Hà Huy Tập, Phường Bà Rịa, HCM</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#8B7CF6] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Hotline</h3>
                      <a href="tel:0988994799" className="text-[#8B7CF6] hover:underline">0988 994 799</a>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#1877F2"/><path d="M21.5 16H18V26H14V16H11V12H14V10.5C14 8.57 15.57 7 17.5 7H21V11H18.5C18.22 11 18 11.22 18 11.5V12H21.5L21 16Z" fill="white"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Facebook</h3>
                      <a href="https://facebook.com/dieuhien" target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline">Diệu Hiền</a>
                    </div>
                  </div>

                  {/* Zalo */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#19B447] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#19B447"/><text x="16" y="22" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="Arial" dominantBaseline="middle">Zalo</text></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Zalo</h3>
                      <a href="https://zalo.me/0988994799" target="_blank" rel="noopener noreferrer" className="text-[#19B447] hover:underline">0988 994 799</a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-primary-600"
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
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">
                        Giờ Hoạt Động
                      </h3>
                      <p className="text-neutral-600">Thứ 2 - Thứ 6: 8:00 - 20:30</p>
                      <p className="text-neutral-600">Thứ 7 - Chủ Nhật: 7:30 - 20:30</p>
                      <p className="text-neutral-600">Ngày lễ: 7:30 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">
                  Bản Đồ
                </h3>
                <div className="bg-neutral-200 rounded-lg overflow-hidden h-[300px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1961.5665524607439!2d107.18502083281068!3d10.490171921049502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175735a9fca1ce1%3A0xd20f7248807643ad!2zNTg4IEjDoCBIdXkgVOG6rXAsIFBoxrDhu5tjIFRydW5nLCBCw6AgUuG7i2EsIELDoCBS4buLYSAtIFbFqW5nIFTDoHUsIFZpZXRuYW0!5e0!3m2!1sen!2sus!4v1760583213893!5m2!1sen!2sus"
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
                <h3 className="text-xl font-bold text-neutral-800 mb-4">
                  Kết Nối Với Chúng Tôi
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com/dieuhien"
                    className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>

                  <a
                    href="https://zalo.me/0988994799"
                    className="w-12 h-12 bg-[#19B447] rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                    aria-label="Zalo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="16" fill="#19B447" />
                      <text x="16" y="22" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="Arial" dominantBaseline="middle">Zalo</text>
                    </svg>
                  </a>

                  <a
                    href="tel:0988994799"
                    className="w-12 h-12 bg-[#8B7CF6] rounded-full flex items-center justify-center text-white hover:bg-[#7868e6] transition-colors"
                    aria-label="Phone"
                  >
                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"/></svg>
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
