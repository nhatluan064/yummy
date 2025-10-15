"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthClient } from "@/lib/sdk";
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const auth = await getAuthClient();
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      if (formData.name) {
        await updateProfile(cred.user, { displayName: formData.name });
      }
      // Auto sign-in (some SDKs already signed in)
      try { await signInWithEmailAndPassword(auth, formData.email, formData.password); } catch {}
      localStorage.setItem("adminToken", `firebase-${cred.user.uid}`);
      localStorage.setItem("adminUser", JSON.stringify({ username: formData.email, email: formData.email, name: formData.name || "Admin User", uid: cred.user.uid }));
      alert("✅ Tạo tài khoản thành công!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error(err);
      const msg = formatAuthError(err as FirebaseError);
      setError(msg);
      setIsLoading(false);
    }
  };

  function formatAuthError(error: FirebaseError): string {
    if (!error || !error.code) return "Không thể tạo tài khoản. Vui lòng thử lại.";
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Email đã được sử dụng. Hãy thử đăng nhập hoặc dùng email khác.";
      case "auth/invalid-email":
        return "Email không hợp lệ. Vui lòng kiểm tra lại.";
      case "auth/operation-not-allowed":
        return "Nhà cung cấp Email/Password đang bị tắt. Hãy bật trong Firebase Console > Authentication > Sign-in method.";
      case "auth/weak-password":
        return "Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự.";
      case "auth/invalid-api-key":
        return "API key không hợp lệ. Hãy kiểm tra biến môi trường NEXT_PUBLIC_FIREBASE_* trỏ đúng project.";
      case "auth/app-not-authorized":
        return "Domain hiện tại chưa được ủy quyền. Vào Firebase Console > Authentication > Settings > Authorized domains và thêm domain (ví dụ: localhost).";
      case "auth/network-request-failed":
        return "Lỗi mạng. Vui lòng kiểm tra kết nối Internet và thử lại.";
      case "auth/too-many-requests":
        return "Thao tác bị tạm khóa do quá nhiều yêu cầu. Vui lòng thử lại sau.";
      default:
        return `Lỗi đăng ký: ${error.message || error.code}`;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-600 via-primary-600 to-secondary-700 relative overflow-hidden">
      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-secondary-600 to-primary-600 text-white p-8 text-center relative">
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">📝 Tạo Tài Khoản Admin</h1>
              <p className="text-white/90">Đăng ký để quản trị hệ thống</p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-neutral-700 font-medium mb-2">Họ tên</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500" placeholder="VD: Nguyễn Admin" />
              </div>
              <div>
                <label htmlFor="email" className="block text-neutral-700 font-medium mb-2">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-neutral-700 font-medium mb-2">Mật khẩu</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-emerald-500" placeholder="Tối thiểu 6 ký tự" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full btn-primary text-lg py-4 disabled:opacity-50">{isLoading ? "Đang xử lý..." : "Đăng ký"}</button>
            </form>

            <div className="text-center mt-6">
              <Link href="/admin/login" className="text-primary-600 hover:text-primary-700 font-medium">Đã có tài khoản? Đăng nhập</Link>
            </div>

            <div className="text-xs text-neutral-500 mt-4 leading-5">
              Gợi ý nhanh nếu đăng ký thất bại:
              <ul className="list-disc pl-5 mt-1">
                <li>Bật Email/Password trong Firebase Console → Authentication → Sign-in method.</li>
                <li>Thêm domain đang chạy (vd: localhost) vào Authentication → Settings → Authorized domains.</li>
                <li>Kiểm tra biến môi trường NEXT_PUBLIC_FIREBASE_* trỏ đúng Project (apiKey, authDomain, projectId, ...).</li>
                <li>Mật khẩu tối thiểu 6 ký tự.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
