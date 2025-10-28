import { redirect } from "next/navigation";

export default function RootPage() {
  // Mặc định redirect về trang user
  redirect("/user/trang-chu");
}
