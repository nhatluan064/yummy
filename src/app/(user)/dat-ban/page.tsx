// src/app/dat-ban/page.tsx
"use client";
import { useState } from "react";
import { useToast } from "@/app/components/Toast";
import { reservationService } from "@/lib/reservation.service";
import { Timestamp } from "firebase/firestore";

export default function DatBanPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    guests: "",
    notes: "",
  });
  const [timeData, setTimeData] = useState({
    hour: "",
    minute: "",
    period: "SA",
  });

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reservationService.createReservation({
        customerName: formData.name,
        customerPhone: formData.phone,
        numberOfGuests: Number(formData.guests) || 1,
        reservationDate: Timestamp.fromDate(new Date(formData.date)),
        reservationTime: getReservationTime(),
        notes: formData.notes,
      });
      toast.showToast(
        "Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đặt bàn trong thời gian sớm nhất.",
        2500
      );
    } catch (err) {
      toast.showToast(
        "Đặt bàn thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"),
        3000
      );
    }
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

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeData({ ...timeData, [e.target.name]: e.target.value });
  };

  // Khi submit, ghép lại thành giờ chuẩn 24h
  const getReservationTime = () => {
    let hour = parseInt(timeData.hour || "0", 10);
    if (timeData.period === "CH" && hour < 12) hour += 12;
    if (timeData.period === "SA" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${timeData.minute || "00"}`;
  };

  return (
    <div className="bg-neutral-50">
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
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  Thông Tin Đặt Bàn
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                        placeholder="Nhập họ và tên"
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
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                        placeholder="+84 123 456 789"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                      <label
                        htmlFor="date"
                        className="block text-neutral-700 font-medium mb-2"
                      >
                        Ngày Đặt *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="time"
                        className="block text-neutral-700 font-medium mb-2"
                      >
                        Giờ Đặt *
                      </label>
                      <div className="flex space-x-2">
                        <select
                          id="hour"
                          name="hour"
                          value={timeData.hour}
                          onChange={handleTimeChange}
                          className="w-1/3 px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          required
                        >
                          <option value="">Giờ</option>
                          {Array.from({ length: 12 }, (_, i) => {
                            const h = i + 1;
                            return (
                              <option
                                key={h}
                                value={h.toString().padStart(2, "0")}
                              >
                                {h.toString().padStart(2, "0")}
                              </option>
                            );
                          })}
                        </select>
                        <select
                          id="minute"
                          name="minute"
                          value={timeData.minute}
                          onChange={handleTimeChange}
                          className="w-1/3 px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          required
                        >
                          <option value="">Phút</option>
                          {[
                            "00",
                            "05",
                            "10",
                            "15",
                            "20",
                            "25",
                            "30",
                            "35",
                            "40",
                            "45",
                            "50",
                            "55",
                          ].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          id="period"
                          name="period"
                          value={timeData.period}
                          onChange={handleTimeChange}
                          className="w-1/3 px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          required
                        >
                          <option value="SA">SA</option>
                          <option value="CH">CH</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="guests"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                    <label
                      htmlFor="notes"
                      className="block text-neutral-700 font-medium mb-2"
                    >
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
                    Gửi Yêu Cầu Đặt Bàn
                  </button>
                </form>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="animate-fade-in-right space-y-8">
              {/* Contact Info - giống trang Liên hệ */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  Thông Tin Liên Hệ
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* icon địa chỉ */}
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
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">
                        Địa Chỉ
                      </h3>
                      <p className="text-neutral-600">
                        588/6 Hà Huy Tập, Phường Bà Rịa, HCM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* icon điện thoại */}
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">
                        Hotline
                      </h3>
                      <a
                        href="tel:0988994799"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        0988 994 799
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* icon Facebook */}
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">
                        Facebook
                      </h3>
                      <a
                        href="https://facebook.com/dieu.hien"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Diệu Hiền
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* icon Zalo */}
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="12" />
                        <text
                          x="12"
                          y="16"
                          textAnchor="middle"
                          fontSize="10"
                          fill="#fff"
                          fontFamily="Arial"
                        >
                          Zalo
                        </text>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Zalo</h3>
                      <a
                        href="https://zalo.me/0988994799"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        0988 994 799
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {/* icon giờ hoạt động */}
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
                      <p className="text-neutral-600">
                        Từ Thứ 2 tới Chủ nhật: 7h30 Sáng - 20h00 Tối
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes giữ nguyên */}
              <div className="card p-6 bg-accent-50 border-accent-300">
                <h3 className="text-lg font-bold text-secondary-700 mb-3">
                  Lưu Ý Quan Trọng
                </h3>
                <ul className="space-y-2 text-sm text-secondary-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Vui lòng đặt bàn trước ít nhất 2 tiếng</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>
                      Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút
                    </span>
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
