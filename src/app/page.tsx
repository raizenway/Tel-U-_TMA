import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies(); // ✅ tambahkan await
  const user = cookieStore.get("user");

  if (!user) {
    redirect("/login");   // kalau belum login
  }

  redirect("/welcome");   // kalau sudah login
}
