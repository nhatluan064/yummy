"use client";

import Header from "./components/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header mode="public" />
      <main>{children}</main>
    </>
  );
}