// src/app/admin/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Already logged in, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate login (replace with actual API call)
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        // Save authentication token
        localStorage.setItem('adminToken', 'demo-admin-token-' + Date.now());
        localStorage.setItem('adminUser', JSON.stringify({
          username: 'admin',
          email: 'admin@restaurant.com',
          name: 'Admin User'
        }));
        
        // Show success message
        alert('✅ Đăng nhập thành công!');
        
        // Redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-600 via-primary-600 to-secondary-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-float" />
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-float-delay" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-secondary-600 to-primary-600 text-white p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">🔐 Admin Login</h1>
              <p className="text-white/90">Đăng nhập để quản lý hệ thống</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in-up">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-neutral-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Tên đăng nhập</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500 transition-all"
                  placeholder="Nhập tên đăng nhập"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-neutral-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Mật khẩu</span>
                  </div>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500 transition-all"
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng Nhập</span>
                  </div>
                )}
              </button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-secondary-700 font-medium mb-2">🔑 Demo Credentials:</p>
              <div className="text-xs text-secondary-600 space-y-1">
                <p>Username: <span className="font-mono bg-primary-100 px-2 py-1 rounded">admin</span></p>
                <p>Password: <span className="font-mono bg-primary-100 px-2 py-1 rounded">admin123</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-white hover:text-white/90 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
