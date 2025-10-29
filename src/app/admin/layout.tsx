"use client";
import React from "react";
import { ToastContainer } from "@/app/components/ToastSystem";
import { ToastProvider } from "@/app/components/Toast";
import { OrderProvider } from "@/app/components/OrderContext";
import OrderDrawer from "@/app/components/OrderDrawer";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Protected routes are dashboard management pages
  // User-facing routes are trang-chu, thuc-don, dat-ban, dia-chi
  const isProtectedRoute = pathname?.startsWith("/admin/") && 
    !pathname.includes("/trang-chu") && 
    !pathname.includes("/thuc-don") && 
    !pathname.includes("/dat-ban") && 
    !pathname.includes("/dia-chi") &&
    !pathname.includes("/login") &&
    pathname !== "/admin" &&
    pathname !== "/admin/";

  return (
    <ToastContainer>
      <ToastProvider>
        <OrderProvider>
          {!isProtectedRoute && <Header mode="admin" />}
          <main>{children}</main>
          {!isProtectedRoute && <OrderDrawer />}
          {!isProtectedRoute && <Footer />}
        </OrderProvider>
      </ToastProvider>
    </ToastContainer>
  );
}
