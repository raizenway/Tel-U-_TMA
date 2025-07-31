"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  LogOut,
  User,
  ChevronDown
} from "lucide-react";

import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import AssessmentForm from "@/components/AssetmentFrom";
import WelcomeTab from "@/components/WelcomTab";
import DashboardTab from "@/components/DashboardTab";
import UserManualTab from "@/components/UserManualTab";
import PurwokertoTab from "@/components/PurwokertoTab";
import SurabayaTab from "@/components/SurabayaTab";
import TopbarHeader from "@/components/TopbarHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function WelcomePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [tab, setTab] = useState("welcome");

  useEffect(() => {
    const path = pathname?.split("/")[1];
    setTab(path || "welcome");
  }, [pathname]);

  
  const handleNavClick = (item: any) => {
    if (item.path) {
      router.push(`/${item.path}`);
    }
  };

  const [isFormDirty, setIsFormDirty] = useState(false); // ← Tambahkan ini

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onItemClick={handleNavClick} />

      <div className="flex-1 flex flex-col">
        <div className="px-6 pt-6">
          <TopbarHeader />
        </div>

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

          <div className="flex items-center gap-4">
            {tab === "dashboard" && (
              <Button
                variant="primary"
                onClick={() => router.push("/assessment")}
                className="text-sm"
              >
                Buat Assessment
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white text-red-700">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Akun</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-white border p-2">
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Pengaturan</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/login")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className="flex-1 px-8 py-6 space-y-6 overflow-auto">
          {tab === "welcome" && <WelcomeTab />}
          {tab === "dashboard" && <DashboardTab />}
          {tab === "user-manual" && <UserManualTab />}
          {tab === "assessment-form" && (
                     <PurwokertoTab setIsFormDirty={setIsFormDirty} />
                   )}
          {tab === "surabaya" && <SurabayaTab />}
          {tab === "assessment-form" && (
            <AssessmentForm
              onSelectCampus={(campus) => {
                if (campus === "Tel-U Purwokerto") {
                  router.push("/purwokerto");
                } else {
                  alert(`Pilihannya: ${campus}`);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
