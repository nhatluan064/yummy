// src/app/user/layout.tsx
import Header from "@/app/components/Header";
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
    </ToastProvider>
  );
}
