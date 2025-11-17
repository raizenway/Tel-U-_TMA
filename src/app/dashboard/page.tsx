// app/welcome/page.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

import Button from "@/components/button";
import AssessmentForm from "@/components/AssetmentFrom";
import WelcomeTab from "@/components/WelcomTab";
import DashboardTab from "@/components/DashboardTab";
import UserManualTab from "@/components/UserManualTab";
import PurwokertoTab from "@/app/assessment/AssessmentFormTab";

export default function WelcomePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState("welcome");
  const [isNotNonSSO, setIsNotNonSSO] = useState(true); // Default: tampilkan tombol

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");

    // Ambil data user dari localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Deteksi apakah user punya role 'Non-SSO'
        const userRole = user.role || user.roles?.[0]?.name; // Sesuaikan dengan struktur data Anda

        // Jika role === 'Non-SSO', maka sembunyikan tombol
        setIsNotNonSSO(userRole !== "Non-SSO");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsNotNonSSO(true); // Default: tampilkan tombol jika error
      }
    }
  }, [pathname]);

  const [, setIsFormDirty] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content - Sekarang mengisi seluruh layar */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex justify-between items-center px-8 pt-6 border-b">
          {["welcome", "dashboard", "user-manual"].includes(tab) && (
            <div className="flex gap-6">
              {[
                { name: "Welcome", path: "welcome" },
                { name: "Dashboard", path: "dashboard" },
                { name: "User Manual", path: "user-manual" },
              ].map(({ name, path }) => (
                <Button
                  key={name}
                  variant="ghost"
                  onClick={() => router.push(`/${path}`)}
                  className={clsx(
                    "pb-3 font-semibold rounded-none",
                    tab === path
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-red-600"
                  )}
                >
                  {name}
                </Button>
              ))}
            </div>
          )}

          {/* Tombol Start Assessment - muncul untuk semua role, KECUALI Non-SSO */}
          {isNotNonSSO && (
            <div className="absolute top-3 right-50 z-40">
              <Button
                variant="primary"
                onClick={() => router.push("/assessment")}
                className="text-sm"
              >
                Start Assessment
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 px-8 py-6 space-y-6 overflow-auto">
          {tab === "welcome" && <WelcomeTab />}
          {tab === "dashboard" && <DashboardTab />}
          {tab === "user-manual" && <UserManualTab />}
          {tab === "purwokerto" && (
            <PurwokertoTab />
          )}
        </main>
      </div>
    </div>
  );
}