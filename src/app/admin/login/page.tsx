"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAuthClient } from "@/lib/sdk";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import type { FirebaseUser, AdminUser } from "@/lib/auth.types";
import { useToastSystem } from "@/app/components/ToastSystem";

function AdminLoginContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToastSystem();

  // Check if already logged in by inspecting Firebase auth state
  useEffect(() => {
    let unsub: (() => void) | null = null;
    const checkAuth = async () => {
      try {
        const auth = await getAuthClient();
        // Listen for auth state changes
        unsub = auth.onAuthStateChanged((user) => {
          setCurrentUser(user);
        });
      } catch (err) {
        console.warn("Auth check skipped:", err);
      }
    };

    checkAuth();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const auth = await getAuthClient();
      await auth.signOut();
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      addToast(
        "info",
        "Đã đăng xuất",
        "Bạn đã đăng xuất khỏi hệ thống quản trị.",
        1500
      );
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
      setError("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const auth = await getAuthClient();
      // Set persistence based on rememberMe checkbox
      await setPersistence(auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      
      const email = formData.email.trim();
      const cred = await signInWithEmailAndPassword(
        auth,
        email,
        formData.password
      );
      const user = cred.user;
      
      // Persist local admin token for existing guard
      const adminUser: AdminUser = {
        username: user.email || "",
        email: user.email,
        name: user.displayName || "Admin User",
        uid: user.uid,
      };
      localStorage.setItem("adminToken", `firebase-${user.uid}`);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));

      addToast(
        "login",
        "Đăng nhập thành công!",
        "Chào mừng bạn quay lại hệ thống quản trị.",
        1800
      );
      
      // Redirect to original page or dashboard after login
      const redirectUrl = searchParams?.get('redirect') || '/admin/dashboard/';
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
      
      setCurrentUser(user);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setError(formatSignInError(err as FirebaseError));
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Vui lòng nhập email để đặt lại mật khẩu.");
      return;
    }
    try {
      const auth = await getAuthClient();
      await sendPasswordResetEmail(auth, formData.email);
      addToast(
        "info",
        "Đã gửi email đặt lại mật khẩu",
        "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.",
        3500
      );
    } catch (err) {
      console.error(err);
      setError(
        "Không thể gửi email đặt lại mật khẩu. Hãy kiểm tra email hoặc cấu hình Firebase."
      );
    }
  };

  function formatSignInError(error: FirebaseError): string {
    if (!error || !error.code) return "Không thể đăng nhập. Vui lòng thử lại.";
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Mật khẩu không đúng. Vui lòng kiểm tra lại.";
      case "auth/user-not-found":
        return "Không tìm thấy tài khoản với email này. Hãy kiểm tra email hoặc đăng ký tài khoản mới.";
      case "auth/too-many-requests":
        return "Đăng nhập bị tạm khóa do quá nhiều lần thử. Vui lòng thử lại sau.";
      case "auth/network-request-failed":
        return "Lỗi mạng. Vui lòng kiểm tra kết nối Internet và thử lại.";
      case "auth/invalid-api-key":
        return "API key không hợp lệ. Kiểm tra file .env.local có đúng NEXT_PUBLIC_FIREBASE_* của project hiện tại không.";
      case "auth/app-not-authorized":
        return "Domain chưa được ủy quyền. Vào Firebase Console → Authentication → Settings → Authorized domains và thêm domain (vd: localhost).";
      default:
        return `Lỗi đăng nhập: ${error.message || error.code}`;
    }
  }

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
              {/* Logo Admin: Chữ cái đầu trong vòng tròn */}
              <div className="w-20 aspect-square min-w-min flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-white select-none">
                  {currentUser?.email?.charAt(0)?.toUpperCase() || formData.email?.trim()?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">🔐 Admin Login</h1>
              <p className="text-white/90">Đăng nhập để quản lý hệ thống</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {currentUser ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Đã đăng nhập!</p>
                    <p className="text-sm">Bạn đã đăng nhập với tài khoản {currentUser.email}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/dashboard")}
                    className="flex-1 btn-primary py-4"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Tiếp tục vào Admin</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 btn-secondary py-4"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in-up">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-neutral-700 font-medium mb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12H8m0 0l-3 3m3-3l-3-3m14 3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Email</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500 transition-all"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-neutral-700 font-medium mb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
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
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Đăng Nhập</span>
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Back to Home Link */}
            <div className="text-center mt-6">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 font-medium transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Quay lại trang chủ</span>
              </Link>
            </div>

            {/* Dev-only environment info to verify Firebase project */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mt-4 text-center text-xs text-neutral-500">
                Firebase project:{" "}
                <strong>
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "N/A"}
                </strong>{" "}
                •{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
                  "no authDomain"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang tải...</p>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}