import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/components/Toast";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // This layout intentionally does NOT provide OrderProvider or OrderDrawer
  // and uses "public" mode in Header so the Order button and Admin login
  // are not visible to remote/public viewers.
  return (
    <ToastProvider>
      <Header mode="public" />
      <main>{children}</main>
      <Footer />
    </ToastProvider>
  );
}
