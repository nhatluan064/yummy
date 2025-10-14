// src/components/Header.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
            >
              Trang Chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link
              href="/dat-ban"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
            >
              Đặt Bàn
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Dropdown Menu */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 flex items-center gap-1 relative group">
                Thực Đơn
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              <div className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'}`}>
                <Link
                  href="/thuc-don"
                  className="flex items-center px-6 py-4 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 group"
                >
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                    🍜
                  </span>
                  <div>
                    <div className="font-medium">Món Ăn</div>
                    <div className="text-sm text-neutral-500">Khám phá thực đơn</div>
                  </div>
                </Link>
                <Link
                  href="/thuc-uong"
                  className="flex items-center px-6 py-4 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 group"
                >
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                    🥤
                  </span>
                  <div>
                    <div className="font-medium">Nước Uống</div>
                    <div className="text-sm text-neutral-500">Đồ uống thơm ngon</div>
                  </div>
                </Link>
              </div>
            </div>

            <Link
              href="/lien-he"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-all duration-300 relative group"
            >
              Liên Hệ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
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
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 Trang Chủ
            </Link>
            <Link
              href="/dat-ban"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              📅 Đặt Bàn
            </Link>
            <Link
              href="/thuc-don"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              🍜 Món Ăn
            </Link>
            <Link
              href="/thuc-uong"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              🥤 Nước Uống
            </Link>
            <Link
              href="/lien-he"
              className="text-neutral-700 hover:text-primary-600 font-medium transition-colors py-2"
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
