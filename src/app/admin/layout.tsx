"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "@/app/components/ToastSystem";
import { ToastProvider } from "@/app/components/Toast";
import { usePathname, useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/sdk";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication for ALL /admin routes except /admin/login and /admin root
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  const isAdminRoot = pathname === "/admin" || pathname === "/admin/";
  const requiresAuth = pathname?.startsWith("/admin") && !isLoginPage && !isAdminRoot;

  useEffect(() => {
    if (!requiresAuth) {
      setIsAuthenticated(true);
      return;
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const auth = await getAuthClient();
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setIsAuthenticated(true);
          } else {
            // Not authenticated -> redirect to login
            const redirectUrl = `/admin/login/?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`;
            router.push(redirectUrl);
            setIsAuthenticated(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, redirect to login
        router.push("/admin/login/");
        setIsAuthenticated(false);
      }
    };

    const unsubscribe = checkAuth();
    return () => {
      if (unsubscribe instanceof Promise) {
        unsubscribe.then(unsub => unsub?.());
      }
    };
  }, [pathname, requiresAuth, router]);

  // Show loading while checking auth
  if (requiresAuth && isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (requiresAuth && !isAuthenticated) {
    return null;
  }

  return (
    <ToastContainer>
      <ToastProvider>
        <main>{children}</main>
      </ToastProvider>
    </ToastContainer>
  );
}
