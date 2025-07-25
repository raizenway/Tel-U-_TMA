"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown } from "lucide-react";

import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import AssessmentForm from "@/components/AssetmentFrom";
import WelcomeTab from "@/components/WelcomTab";
import DashboardTab from "@/components/DashboardTab";
import UserManualTab from "@/components/UserManualTab";
import PurwokertoTab from "@/components/PurwokertoTab";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function WelcomePage() {
  const [tab, setTab] = useState("welcome");
  const router = useRouter();

  const navItems = [
    { name: "🏠 Home", value: "welcome" },
    { name: "📊 Dashboard", value: "dashboard" },
    { name: "📝 Start Assessment", value: "assessment-form" },
    { name: "📘 About IMA", value: "user-manual" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar navItems={navItems} setTab={setTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex justify-between items-center px-8 pt-6 border-b">
          {/* Tabs Navigation */}
          {["welcome", "dashboard", "user-manual"].includes(tab) && (
            <div className="flex gap-6">
              {["Welcome", "Dashboard", "User Manual"].map((name) => (
                <Button
                  key={name}
                  variant="ghost"
                  onClick={() => setTab(name.toLowerCase().replace(" ", "-"))}
                  className={clsx(
                    "pb-3 font-semibold rounded-none",
                    tab === name.toLowerCase().replace(" ", "-")
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-red-600"
                  )}
                >
                  {name}
                </Button>
              ))}
            </div>
          )}

          {/* Right: Account Dropdown */}
          <div className="flex items-center gap-4">
            {tab === "dashboard" && (
              <Button
                variant="primary"
                onClick={() => setTab("assessment-form")}
                className="text-sm"
              >
                Buat Assessment
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-end items-center gap-2 border px-3 py-2 rounded-md bg-white text-red-700">
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
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Konten Dinamis */}
        <main className="flex-1 px-8 py-6 space-y-6 overflow-auto">
          {tab === "welcome" && <WelcomeTab />}
          {tab === "dashboard" && <DashboardTab />}
          {tab === "user-manual" && <UserManualTab />}
          {tab === "purwokerto" && <PurwokertoTab />}
          {tab === "assessment-form" && (
            <AssessmentForm
              onSelectCampus={(campus) => {
                if (campus === "Tel-U Purwokerto") {
                  setTab("purwokerto");
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
