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

  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log("User data from localStorage:", user);

      let userRoleId = null;

      // Coba ambil dari user.role.id
      if (user.role && typeof user.role === 'object' && user.role.id !== undefined) {
        userRoleId = user.role.id;
        console.log(`Detected role ID via user.role.id → ${userRoleId}`);
      }

      // Jika tidak ketemu, coba user.roleId
      else if (user.roleId !== undefined) {
        userRoleId = user.roleId;
        console.log(`Detected role ID via user.roleId → ${userRoleId}`);
      }

      // Jika tidak ketemu, coba user.role (jika string atau number)
      else if (user.role !== undefined) {
        userRoleId = Number(user.role); // Konversi ke number jika perlu
        console.log(`Detected role ID via user.role → ${userRoleId}`);
      }

      // Jika masih tidak ketemu, coba user.roles[0].id
      else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        userRoleId = user.roles[0].id || user.roles[0].role_id;
        console.log(`Detected role ID via user.roles[0].id → ${userRoleId}`);
      }

      // Jika tetap tidak ketemu, log warning
      if (userRoleId === null) {
        console.warn("No role ID found in user data. Check structure of localStorage.user.");
      }

      // Tombol muncul hanya jika role_id = 1 atau 2
      setIsNotNonSSO([1, 2].includes(Number(userRoleId)));

    } catch (error) {
      console.error("Error parsing user data:", error);
      setIsNotNonSSO(false);
    }
  } else {
    console.warn("No user data found in localStorage");
    setIsNotNonSSO(false);
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
                { name: "Welcome", path: "welcome", isExternal: false },
                { name: "Dashboard", path: "dashboard", isExternal: false },
                { name: "User Manual", path: "https://transformasi.telkomuniversity.ac.id/user-manual-tma/", isExternal: true },
              ].map(({ name, path, isExternal }) => (
                <Button
                  key={name}
                  variant="ghost"
                  onClick={() => (isExternal ? window.open(path, "_blank") : router.push(`/${path}`))}
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