import React, { useState, useRef, useEffect } from "react";
import { reservationService } from "@/lib/reservation.service";
import { orderService } from "@/lib/order.service";
import { contactService } from "@/lib/contact.service";
import { feedbackService } from "@/lib/feedback.service";
import { useRouter } from "next/navigation";
import type { TableReservation, Order, Contact, Feedback } from "@/lib/types";

interface NotificationItem {
  type: "reservation" | "order" | "contact" | "feedback";
  id: string;
  title: string;
  time: Date | null;
  status: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      reservationService.getAll(),
      orderService.getAll(),
      contactService.getAll(),
      feedbackService.getAll(),
    ])
      .then(([reservations, orders, contacts, feedbacks]) => {
        const notiList: NotificationItem[] = [
          ...(reservations as TableReservation[]).map((r) => ({
            type: "reservation" as const,
            id: r.id!,
            title: `Đặt bàn: ${r.customerName}`,
            time: r.createdAt?.toDate?.() ? r.createdAt.toDate() : null,
            status: r.status,
          })),
          ...(orders as Order[]).map((o) => ({
            type: "order" as const,
            id: o.id!,
            title: `Đơn hàng: ${o.customerName}`,
            time: o.createdAt?.toDate?.() ? o.createdAt.toDate() : null,
            status: o.status,
          })),
          ...(contacts as Contact[]).map((c) => ({
            type: "contact" as const,
            id: c.id!,
            title: `Liên hệ: ${c.name}`,
            time: c.createdAt?.toDate?.() ? c.createdAt.toDate() : null,
            status: c.status,
          })),
          ...(feedbacks as Feedback[]).map((f) => ({
            type: "feedback" as const,
            id: f.id!,
            title: `Feedback: ${f.customerName}`,
            time: f.createdAt?.toDate?.() ? f.createdAt.toDate() : null,
            status: f.hidden ? "Ẩn" : "Hiện",
          })),
        ];
        notiList.sort(
          (a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0)
        );
        setNotifications(notiList);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      });
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 md:p-3 rounded-lg hover:bg-neutral-100 transition-colors"
        title="Thông báo"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-neutral-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 max-w-[95vw] bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 animate-fade-in-up">
          <div className="p-3 md:p-4 border-b font-bold text-neutral-800 flex items-center justify-between">
            <span className="text-sm md:text-base">Thông báo mới</span>
            {loading && (
              <span className="text-xs text-neutral-400">Đang tải...</span>
            )}
          </div>
          <ul className="max-h-80 md:max-h-96 overflow-y-auto divide-y divide-neutral-100">
            {notifications.slice(0, 10).map((n) => (
              <li
                key={n.type + n.id}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 hover:bg-neutral-50 transition-colors"
              >
                <span className="text-lg md:text-xl">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs md:text-sm text-neutral-800 truncate">
                    {n.title}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {n.time ? n.time.toLocaleString("vi-VN") : ""}
                  </div>
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap">
                  {n.status}
                </span>
              </li>
            ))}
            {notifications.length === 0 && !loading && (
              <li className="px-3 md:px-4 py-6 md:py-8 text-center text-neutral-400 text-sm">
                Không có thông báo mới
              </li>
            )}
          </ul>
          {notifications.length > 10 && (
            <button
              className="w-full py-2 md:py-3 text-primary-600 font-semibold hover:underline border-t border-neutral-100 bg-neutral-50 rounded-b-xl text-sm md:text-base"
              onClick={() => {
                setOpen(false);
                router.push("/admin/data-management");
              }}
            >
              Xem thêm
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "reservation":
      return <span className="text-blue-500">📅</span>;
    case "order":
      return <span className="text-green-500">🧾</span>;
    case "contact":
      return <span className="text-purple-500">📞</span>;
    case "feedback":
      return <span className="text-yellow-500">⭐</span>;
    default:
      return <span>🔔</span>;
  }
}
