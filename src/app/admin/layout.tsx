import React from "react";
import { ToastContainer } from "@/app/components/ToastSystem";
import { ToastProvider } from "@/app/components/Toast";
import { OrderProvider } from "@/app/components/OrderContext";
import OrderDrawer from "@/app/components/OrderDrawer";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastContainer>
      <ToastProvider>
        <OrderProvider>
          <Header mode="admin" />
          <main>{children}</main>
          <OrderDrawer />
          <Footer />
        </OrderProvider>
      </ToastProvider>
    </ToastContainer>
  );
}
