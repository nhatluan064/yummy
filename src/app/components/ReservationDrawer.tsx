"use client";
import { useState } from "react";
import { useToast } from "@/app/components/Toast";

export default function ReservationDrawer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    notes: "",
  });

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
        notes: "",
      });
      toast.showToast(
        "Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        3000,
        "success"
      );
    } catch (err) {
      toast.showToast(
        "Đặt bàn thất bại: " +
          (err instanceof Error ? err.message : "Lỗi không xác định"),
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-neutral-700 font-medium mb-2">
          Họ và Tên *
        </label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nguyễn Văn A"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
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
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
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
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+84 123 456 789"
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="date"
            className="block text-neutral-700 font-medium mb-2"
          >
            Ngày *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
          />
        </div>
        <div>
          <label
            htmlFor="time"
            className="block text-neutral-700 font-medium mb-2"
          >
            Giờ *
          </label>
          <input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="guests"
          className="block text-neutral-700 font-medium mb-2"
        >
          Số Khách *
        </label>
        <select
          id="guests"
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} người
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-neutral-700 font-medium mb-2"
        >
          Ghi Chú
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Yêu cầu đặc biệt (nếu có)..."
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white"
        />
      </div>

      <button type="submit" className="btn-accent w-full text-lg py-4">
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
        Đặt Bàn Ngay
      </button>
    </form>
  );
}
