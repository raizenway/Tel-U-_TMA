// app/layout.tsx
"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { ReactNode } from "react";

// ✅ Impor komponen dropdown dari shadcn/ui
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ✅ Impor ikon dari lucide-react
import { User, ChevronDown, LogOut } from "lucide-react";

// ✅ Impor komponen: UserIconWithBadge
import UserIconWithBadge from "@/components/UserIconWithBadge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Halaman yang TIDAK menampilkan sidebar DAN komponen akun (dropdown & badge)
const HIDE_USER_COMPONENTS_PATHS = ["/login"]; // Tambahkan path lain jika perlu

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showSidebar = !["/login", "/"].includes(pathname);
  const showUserComponents = !HIDE_USER_COMPONENTS_PATHS.includes(pathname);

  const handleItemClick = (item: { name: string; path?: string }) => {
    if (item.path) {
      router.push(`/${item.path}`);
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen bg-white relative">
          {/* Sidebar */}
          {showSidebar && <Sidebar onItemClick={handleItemClick} />}

          {/* Main Content */}
          <main
            className={`${
              showSidebar ? "" : "ml-0"
            } flex-1 min-h-screen bg-gray-50 transition-all duration-300 ease-in-out relative overflow-visible`}
          >
            {/* 🔔 Tampilkan UserIconWithBadge dan Dropdown hanya jika bukan di halaman login */}
            {showUserComponents && (
              <div className="absolute top-3 right-6 z-50 flex items-center gap-3">
                {/* Ikon Notifikasi (User + Badge) */}
                <UserIconWithBadge count={3} />

                {/* Dropdown Akun */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      aria-label="Akun pengguna"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">Akun</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="z-50 min-w-[160px] p-1 text-sm bg-white border rounded-md shadow-lg"
                  >
                    <DropdownMenuItem onClick={() => alert("Profil Saya")}>
                      Profil Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Pengaturan")}>
                      Pengaturan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/login")}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Konten Utama */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}