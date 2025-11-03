"use client";

import { useState, useEffect } from "react";
import { ToastContainer, useToastSystem } from "@/app/components/ToastSystem";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/sdk";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [advancedMenuOpen, setAdvancedMenuOpen] = useState(false);
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

  // Quick access navigation (2 chức năng chính)
  const quickAccessNavigation = [
    {
      name: "Quản lý Orders",
      href: "/admin/manage-orders",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý Bill gửi Bếp",
      href: "/admin/kitchen",
      icon: (
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
  ];

  const mainNavigation = [
    {
      name: "Tổng quan",
      href: "/admin/dashboard",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý đơn hàng",
      href: "/admin/orders",
      icon: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
  ];

  // Advanced navigation items (grouped under dropdown)
  const advancedNavigation = [
    {
      name: "Cấu hình Website",
      href: "/admin/site-config",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Quản lý Tạo bàn",
      href: "/admin/quan-ly-ban",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Quản lý thực đơn",
      href: "/admin/menu",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: "Quản lý Feedback",
      href: "/admin/feedback",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      name: "Quản lý Đặt bàn & Liên hệ",
      href: "/admin/reservations",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Cài đặt & Quản lý Ảnh",
      href: "/admin/settings",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
          } flex flex-col`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-secondary-500">
            <Link
              href="/admin/manage-orders"
              className="flex flex-col items-center space-y-1.5"
            >
              <div className="w-12 h-12 aspect-square bg-primary-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-white font-bold text-2xl">🍜</span>
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-base">Mì cay Yummy</h1>
                <p className="text-accent-200 text-[9px] mt-0.5 leading-tight">
                  588/6 Cách Mạng Tháng 8<br />
                  Phường Bà Rịa, TP.HCM<br />
                  Việt Nam
                </p>
              </div>
            </Link>
          </div>

          {/* Clock */}
          <div className="px-4 py-2 border-b border-secondary-500">
            <div className="text-accent-100 text-xs text-center font-medium">
              {clock}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {/* Quick Access - 2 Chức năng chính */}
            <div className="mb-3">
              <p className="text-accent-200 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">
                Chức năng chính
              </p>
              {quickAccessNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50 scale-105"
                      : "bg-secondary-500/50 text-accent-100 hover:bg-primary-500 hover:text-white hover:scale-105"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className={`${
                      isActive(item.href)
                        ? "text-white"
                        : "text-accent-200 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-bold text-xs">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-secondary-500 my-3"></div>

            {/* Main Navigation */}
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/50"
                    : "text-accent-100 hover:bg-secondary-500 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`${
                    isActive(item.href)
                      ? "text-white"
                      : "text-accent-200 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-xs">{item.name}</span>
              </Link>
            ))}

            {/* Advanced Menu Dropdown */}
            <div className="mt-1">
              <button
                onClick={() => setAdvancedMenuOpen(!advancedMenuOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                  advancedNavigation.some(item => isActive(item.href))
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/50"
                    : "text-accent-100 hover:bg-secondary-500 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="font-medium text-xs">Chức năng nâng cao</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${advancedMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Items */}
              {advancedMenuOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-secondary-500 pl-2">
                  {advancedNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
                        isActive(item.href)
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/50"
                          : "text-accent-100 hover:bg-secondary-500 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span
                        className={`${
                          isActive(item.href)
                            ? "text-white"
                            : "text-accent-200 group-hover:text-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="font-medium text-xs">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User Info + Logout */}
          <div className="p-3 border-t border-secondary-500">
            <div className="flex items-center space-x-2 px-2 py-2 mb-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-2 border-primary-300 shadow-lg">
                <span className="text-white font-bold text-sm">
                  {adminUser?.email?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-accent-100 text-xs truncate">
                  {adminUser?.email || "admin@restaurant.com"}
                </p>
              </div>
            </div>
            
            {/* Xem Website Button */}
            <Link
              href="/user/thuc-don"
              className="flex items-center justify-center space-x-2 w-full px-3 py-2 mb-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg"
              onClick={() => setSidebarOpen(false)}
              title="Xem Website"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Xem Website</span>
            </Link>
            
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={`transition-all duration-300 md:ml-64 ${
            sidebarOpen ? "overflow-hidden" : ""
          } min-h-screen bg-neutral-50`}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-primary-400"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-6 h-6"
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
          
          {/* Page Content - Full screen, no header */}
          <main className="p-4 md:p-6">{children}</main>
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
        className="flex items-center justify-center space-x-2 w-full px-3 py-2 bg-primary-600 text-white rounded-lg transition-transform duration-200 font-medium text-sm shadow-lg shadow-primary-500/30 hover:scale-105"
        title="Đăng xuất"
        aria-label="Đăng xuất"
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span className="text-sm">Đăng xuất</span>
      </button>
    );
  }
}
