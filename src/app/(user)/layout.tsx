// src/app/(user)/layout.tsx
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
