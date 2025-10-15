"use client";
import Link from "next/link";

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-600 via-primary-600 to-secondary-700 relative overflow-hidden">
      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-secondary-600 to-primary-600 text-white p-8 text-center relative">
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">
                📝 Tạo Tài Khoản Admin
              </h1>
              <p className="text-white/90">Đăng ký để quản trị hệ thống</p>
            </div>
          </div>

          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              Đăng ký Admin đã bị vô hiệu hóa
            </h1>
            <p className="text-gray-600 mb-4">
              Chức năng này đã bị tắt. Vui lòng liên hệ chủ hệ thống để được cấp
              quyền.
            </p>
            <Link
              href="/admin/login"
              className="text-primary-600 hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
