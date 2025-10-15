// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/app/components/Toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Quán Ăn Ngon - Nhà Hàng ABC",
  description:
    "Nơi tận hưởng những món ăn ngon nhất với không gian ấm cúng và dịch vụ tận tâm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${poppins.variable} ${poppins.className}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
