// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/app/components/ToastSystem";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Mì cay yummy - Nhà Hàng ABC",
  description:
    "Mì cay yummy - Tận hưởng những tô mì cay thơm ngon trong không gian ấm cúng và phục vụ tận tâm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${poppins.variable} ${poppins.className}`}>
        <ToastContainer>{children}</ToastContainer>
      </body>
    </html>
  );
}
