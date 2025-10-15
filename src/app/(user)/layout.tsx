// src/app/(user)/layout.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { OrderProvider } from "@/app/components/OrderContext";
import OrderDrawer from "@/app/components/OrderDrawer";
import { ToastProvider } from "@/app/components/Toast";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderProvider>
      <ToastProvider>
        <Header />
        <main>{children}</main>
        <OrderDrawer />
        <Footer />
      </ToastProvider>
    </OrderProvider>
  );
}
