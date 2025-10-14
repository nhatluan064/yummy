// src/components/Header.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-neutral-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-3xl font-bold text-gradient hover:scale-105 transition-transform duration-300"
          >
            🍽️ Quán Ăn Ngon
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-all duration-300 relative group ${
                isActive('/') && pathname === '/' 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              Trang Chủ
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                isActive('/') && pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            
            <Link
              href="/dat-ban"
              className={`font-medium transition-all duration-300 relative group ${
                isActive('/dat-ban') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              Đặt Bàn
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                isActive('/dat-ban') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            <Link
              href="/thuc-don"
              className={`font-medium transition-all duration-300 relative group ${
                isActive('/thuc-don') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              Thực Đơn
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                isActive('/thuc-don') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            <Link
              href="/lien-he"
              className={`font-medium transition-all duration-300 relative group ${
                isActive('/lien-he') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              Liên Hệ
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${
                isActive('/lien-he') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          </nav>

          {/* Admin Login & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="btn-secondary hidden sm:inline-flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
          <nav className="flex flex-col space-y-4 pt-4 border-t border-neutral-200">
            <Link
              href="/"
              className={`font-medium transition-colors py-2 ${
                isActive('/') && pathname === '/' 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Trang Chủ
            </Link>
            <Link
              href="/dat-ban"
              className={`font-medium transition-colors py-2 ${
                isActive('/dat-ban') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              📅 Đặt Bàn
            </Link>
            <Link
              href="/thuc-don"
              className={`font-medium transition-colors py-2 ${
                isActive('/thuc-don') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              🍜 Thực Đơn
            </Link>
            <Link
              href="/lien-he"
              className={`font-medium transition-colors py-2 ${
                isActive('/lien-he') 
                  ? 'text-primary-600' 
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              📞 Liên Hệ
            </Link>
            <Link
              href="/admin/login"
              className="btn-primary mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
