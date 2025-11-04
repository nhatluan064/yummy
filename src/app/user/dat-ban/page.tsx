// src/app/dat-ban/page.tsx
"use client";
import { useState } from "react";
import { useToast } from "@/app/components/Toast";
import { reservationService } from "@/lib/reservation.service";
import { Timestamp } from "firebase/firestore";
import ContactInfo from "@/app/components/ContactInfo";

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
      
      // Reset form về trạng thái ban đầu
      setFormData({
        name: "",
        phone: "",
        email: "",
        date: "",
        guests: "",
        notes: "",
      });
      setTimeData({
        hour: "",
        minute: "",
        period: "SA",
      });
      
      toast.showToast(
        "Cảm ơn bạn! Chúng tôi sẽ liên hệ xác nhận đặt bàn trong thời gian sớm nhất.",
        3000,
        "success"
      );
    } catch (err) {
      toast.showToast(
        "Đặt bàn thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"),
        3500,
        "error"
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
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-2 animate-fade-in-up">
            📅 Đặt Bàn & Liên Hệ
          </h1>
          <p className="text-sm opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Đặt bàn trước hoặc liên hệ với chúng tôi ngay hôm nay
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
              {/* Contact Info - use shared component */}
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
