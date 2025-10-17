import React from "react";
import { ToastContainer } from "@/app/components/ToastSystem";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastContainer>{children}</ToastContainer>;
}
