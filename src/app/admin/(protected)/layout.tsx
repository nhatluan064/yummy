﻿"use client";

import { useState, useEffect } from "react";
import { ToastContainer, useToastSystem } from "@/app/components/ToastSystem";
import { NotificationBell } from "@/app/components/NotificationBell";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/sdk";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await getAuthClient();
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (!user) {
            // Không có user authenticated, redirect to login
            router.replace("/admin/login");
          } else {
            // Có user authenticated, lưu thông tin
            localStorage.setItem("adminToken", `firebase-${user.uid}`);
            localStorage.setItem(
              "adminUser",
              JSON.stringify({
                name: user.displayName || user.email?.split("@")[0] || "Admin",
                email: user.email || "admin@restaurant.com",
                uid: user.uid,
              })
            );
            setAdminUser({
              name: user.displayName || user.email?.split("@")[0] || "Admin",
              email: user.email || "admin@restaurant.com",
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/admin/login");
      }
    };

    const unsubscribe = checkAuth();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe.then((fn) => fn?.());
      }
    };
  }, [router]);

  useEffect(() => {
    // Khi mount, nếu đã có adminUser trong localStorage thì lấy ra luôn
    const raw = localStorage.getItem("adminUser");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setAdminUser({ name: user.name, email: user.email });
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Real-time clock
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) +
          " - " +
          now.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Đơn Hàng",
      href: "/admin/orders",
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      name: "Thực Đơn",
      href: "/admin/menu",
      icon: (
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: (
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      name: "Liên Hệ",
      href: "/admin/contacts",
      icon: (
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
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Đặt Bàn",
      href: "/admin/reservations",
      icon: (
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
      ),
    },
    {
      name: "Nhà Bếp",
      href: "/admin/kitchen",
      icon: (
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
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
      ),
    },
    {
      name: "Quản Lý Dữ Liệu",
      href: "/admin/data-management",
      icon: (
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
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <ToastContainer>
      <div className="min-h-screen bg-neutral-100 overflow-x-hidden">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
          />
        )}
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen transition-transform w-64 bg-gradient-to-b from-secondary-600 to-secondary-700 shadow-2xl md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-500">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 aspect-square bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-xl">🍜</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-accent-200 text-xs">Quản lý nhà hàng</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/50"
                    : "text-accent-100 hover:bg-secondary-500 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`$${
                    isActive(item.href)
                      ? "text-white"
                      : "text-accent-200 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info + Clock */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-500">
            <div className="flex flex-col items-center space-y-2 px-4 py-3">
              <div className="w-10 h-10 aspect-square bg-primary-400 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow mb-1">
                <span className="text-white font-bold text-lg">
                  {adminUser?.name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <p className="text-white font-medium text-sm text-center">
                {adminUser?.name || "Admin User"}
              </p>
              <p className="text-accent-200 text-xs text-center">
                {adminUser?.email || "admin@restaurant.com"}
              </p>
              <LogoutButton />
            </div>
            <div className="text-accent-200 text-xs text-center px-4 pt-2">
              {clock}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={`transition-all duration-300 md:ml-64 ${
            sidebarOpen ? "overflow-hidden" : ""
          } h-screen overflow-y-auto`}
        >
          {/* Top Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-3 rounded-lg hover:bg-neutral-100 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-primary-400"
                  title="Toggle Sidebar"
                  aria-label="Toggle Sidebar"
                >
                  <svg
                    className="w-6 h-6 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-neutral-800">
                    {navigation.find((item) => isActive(item.href))?.name ||
                      "Dashboard"}
                  </h2>
                  <p className="text-sm text-neutral-500 hidden md:block">
                    Chào mừng trở lại, Admin!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Notifications */}
                <NotificationBell />

                {/* Quick Actions */}
                <Link
                  href="/"
                  className="btn-secondary text-xs md:text-sm px-3 py-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="hidden md:inline">Xem Website</span>
                  <span className="md:hidden">Website</span>
                </Link>
              </div>
            </div>
          </header>{" "}
          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastContainer>
  );

  function LogoutButton() {
    const { addToast } = useToastSystem();
    return (
      <button
        onClick={async () => {
          if (confirm("Bạn có chắc muốn đăng xuất?")) {
            const auth = await getAuthClient();
            await (await import("firebase/auth")).signOut(auth);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            addToast(
              "logout",
              "Đăng xuất thành công!",
              "Hẹn gặp lại bạn lần sau.",
              1800
            );
            setTimeout(() => {
              router.push("/admin/login");
            }, 1800);
          }
        }}
        className="text-accent-200 hover:text-white transition-colors mt-2"
        title="Đăng xuất"
        aria-label="Đăng xuất"
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    );
  }
}
