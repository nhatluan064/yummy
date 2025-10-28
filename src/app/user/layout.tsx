// src/app/user/layout.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/components/Toast";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Header mode="user" />
      <main>{children}</main>
      <Footer />
    </ToastProvider>
  );
}
