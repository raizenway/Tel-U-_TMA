"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// 🔑 Mapping roleId ke halaman yg bisa diakses — pindahkan ke LUAR komponen
const roleAccess: Record<number, string[]> = {
  1: [ // Super User
    "/login",
    "/dashboard",
    "/welcome",
    "/assessment",        
    "/assessment-result",
    "/approval",
    "/transformation-variable", 
    "/daftar-assessment",
    "/user-management",
    "/maturity-level",
  ],
  2: [ // UPPS/KC
    "/login",
    "/dashboard",
    "/welcome",
    "/assessment",        
    "/assessment-result",
    "/transformation-variable", 
    "/daftar-assessment",
    "/maturity-level",
  ],
  3: [ // SSO
    "/login",
    "/dashboard",
    "/welcome",
    "/transformation-variable", 
    "/daftar-assessment",
    "/maturity-level",
  ],
  4: [ // Non-SSO
    "/login",
    "/dashboard",
    "/welcome",
    "/assessment-result",
    "/transformation-variable", 
    "/daftar-assessment",
    "/maturity-level",
  ],
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 💡 Jangan proteksi halaman login — biarkan bebas
    if (pathname === "/login") {
      return;
    }

    const user = localStorage.getItem("user");

    // Jika belum login → arahkan ke login
    if (!user) {
      console.warn("⛔ No user found. Redirecting to /login");
      router.replace("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(user);
    } catch (error) {
      console.error("⛔ Corrupt user data in localStorage:", error);
      localStorage.removeItem("user"); // bersihkan
      router.replace("/login");
      return;
    }

    // Pastikan roleId ada dan convert ke number
    const roleId = Number(parsedUser.roleId);
    if (isNaN(roleId) || !roleAccess[roleId]) {
      console.warn("⛔ Invalid roleId:", parsedUser.roleId, ". Redirecting to /dashboard");
      router.replace("/dashboard");
      return;
    }

    const allowedPaths = roleAccess[roleId];

    // 🧭 Normalisasi path: buang trailing slash
    const normalizedPathname = pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

    // ✅ Cek akses — cocokkan path
    const hasAccess = allowedPaths.includes(normalizedPathname);

    if (!hasAccess) {
      console.warn(`⛔ Access denied: "${normalizedPathname}" for role ${roleId}. Allowed:`, allowedPaths);
      router.replace("/dashboard");
      return;
    }

    // ✅ Akses diizinkan
    console.log(`✅ Access granted to "${normalizedPathname}" for role ${roleId}`);
  }, [pathname, router]); // ✅ roleAccess TIDAK PERLU dimasukkan — karena static & di luar komponen

  return <>{children}</>;
}