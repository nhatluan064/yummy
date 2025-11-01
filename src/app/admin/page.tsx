"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/sdk";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuthAndRedirect = async () => {
      try {
        const auth = await getAuthClient();
        
        // Sử dụng onAuthStateChanged để kiểm tra chính xác session
        unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            // Đã đăng nhập (session còn) → redirect đến manage-orders (trang chính)
            router.replace("/admin/manage-orders");
          } else {
            // Chưa đăng nhập → redirect đến login
            router.replace("/admin/login");
          }
        });
      } catch (error) {
        console.error("Auth check error:", error);
        // Có lỗi → redirect đến login
        router.replace("/admin/login");
      }
    };

    checkAuthAndRedirect();

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  // Hiển thị loading trong khi kiểm tra auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-600 font-medium">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    </div>
  );
}
