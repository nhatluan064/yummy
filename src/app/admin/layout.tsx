import React from "react";
import { ToastContainer } from "@/app/components/ToastSystem";
import Header from "@/app/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastContainer>
      <Header mode="admin" />
      {children}
    </ToastContainer>
  );
}
