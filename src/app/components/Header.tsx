// src/components/Header.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { useOrder } from "./OrderContext";
import { usePathname } from "next/navigation";
import { User2, Menu as MenuIcon, ShoppingBag } from "lucide-react";

type HeaderMode = "user" | "admin";

interface HeaderProps {
  mode?: HeaderMode;
}

export default function Header({ mode = "user" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Only try to use OrderContext in admin mode
  let order: ReturnType<typeof useOrder> | null = null;
  if (mode === "admin") {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      order = useOrder();
    } catch {
      order = null;
    }
  }

  // Determine visibility and routes based on mode
  const showOrderButton = mode === "admin"; // Only show Cart in admin
  const showAdminButton = mode === "admin"; // Show Login button in admin
  
  // Routes based on mode
  const baseHref = mode === "user" ? "/user" : "/admin";
  const menuHref = `${baseHref}/thuc-don`;
  const homeHref = `${baseHref}/trang-chu`;
  const contactHref = `${baseHref}/lien-he`;
  const reservationHref = `${baseHref}/dat-ban`;

  const isActive = (path: string) => {
    // Home should be exact match only (avoid making home active for child pages like /public/dat-ban)
    if (path === "/" || path === homeHref) return pathname === path;
    // For other routes, consider as active when pathname starts with that path
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-neutral-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href={homeHref}
            className="text-3xl font-bold text-gradient hover:scale-105 transition-transform duration-300"
          >
            🍜 Mì cay yummy
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Home - visible in all modes */}
            <Link
              href={homeHref}
              className={`font-medium transition-all duration-300 relative group ${
                isActive(homeHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
            >
              Trang Chủ
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                  isActive(homeHref)
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            {/* Contact - visible in all modes */}
            <Link
              href={contactHref}
              className={`font-medium transition-all duration-300 relative group ${
                isActive(contactHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
            >
              Liên Hệ
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                  isActive(contactHref) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            {/* Reservation - visible in all modes */}
            <Link
              href={reservationHref}
              className={`font-medium transition-all duration-300 relative group ${
                isActive(reservationHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
            >
              Đặt Bàn
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                  isActive(reservationHref) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            {/* Menu - always visible but links to different routes based on mode */}
            <Link
              href={menuHref}
              className={`font-medium transition-all duration-300 relative group ${
                isActive(menuHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
            >
              Thực Đơn
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                  isActive(menuHref) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          </nav>
          {/* Admin Login & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Order Drawer trigger */}
            {showOrderButton && (
              <button
                onClick={() => order?.open()}
                className="btn-primary hidden sm:inline-flex p-2 rounded-full relative"
                aria-label="Xem giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {order && order.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {order.items.length}
                  </span>
                )}
              </button>
            )}
            {/* Admin login */}
            {showAdminButton && (
              <Link
                href="/admin/login"
                className="btn-secondary hidden sm:inline-flex p-2 rounded-full"
                aria-label="Admin login"
              >
                <User2 className="w-5 h-5" />
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <MenuIcon
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMenuOpen ? "rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 pt-4 border-t border-neutral-200">
            <Link
              href={homeHref}
              className={`font-medium transition-colors py-2 ${
                isActive(homeHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Trang Chủ
            </Link>
            <Link
              href={contactHref}
              className={`font-medium transition-colors py-2 ${
                isActive(contactHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              📞 Liên Hệ
            </Link>
            <Link
              href={reservationHref}
              className={`font-medium transition-colors py-2 ${
                isActive(reservationHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              📅 Đặt Bàn
            </Link>
            <Link
              href={menuHref}
              className={`font-medium transition-colors py-2 ${
                isActive(menuHref)
                  ? "text-primary-600"
                  : "text-neutral-700 hover:text-primary-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🍜 Thực Đơn
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}