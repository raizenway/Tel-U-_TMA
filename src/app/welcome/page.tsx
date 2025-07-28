"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import Button from "@/components/button";
import ProgressAssessment from "@/components/ProgressAssessment";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function WelcomePage() {
  const [tab, setTab] = useState("welcome");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [showSubmenu, setShowSubmenu] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: "🏠 Home", value: "welcome" },
    { name: "📝 Start Assessment", value: "assessment-form" },
    {
      name: "📊 Assessment Result",
      toggle: () => setShowSubmenu((prev) => !prev),
      submenu: [
        { name: " Approval Assessment", value: "approval-assessment" },
      ],
    },
    { name: "📘 About IMA", value: "user-manual" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r flex flex-col shadow-md">
        <div className="px-6 py-8">
          <Image src="/Logo.png" alt="Logo Telkom University" width={190} height={80} />
        </div>

        <div className="px-6 py-6 border-y flex items-center gap-4">
          <Image src="/user-icon.png" alt="User" width={50} height={50} className="rounded-full" />
          <div>
            <p className="font-semibold text-gray-600">Wilson Curtis</p>
            <p className="text-sm text-gray-500">012345678</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2 text-sm font-medium">
          <div className="flex flex-col gap-2">
            {navItems.map(({ name, value, action, toggle, submenu }) => (
              <div key={name}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                  onClick={() => {
                    if (action) return action();
                    if (toggle) return toggle();
                    setTab(value || "");
                  }}
                >
                  {name}
                </Button>

                {submenu && showSubmenu && (
                  <div className="pl-4 space-y-1">
                    {submenu.map((sub) => (
                      <Button
                        key={sub.name}
                        variant="ghost"
                        className="w-full justify-start text-gray-500 hover:text-white hover:bg-gradient-to-r from-red-400 to-gray-500 text-sm"
                        onClick={() => setTab(sub.value)}
                      >
                        {sub.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="px-6 py-4 border-t">
          <Button
            variant="ghost"
            className="text-red-600 font-semibold gap-2 w-full justify-start"
            onClick={() => router.push("/login")}
          >
            <LogOut size={16} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white flex justify-between items-center px-6 py-4 border-b shadow rounded-xl w-[92%] max-w-6xl mt-4 ml-9">
          <h1 className="text-black font-semibold">
            TRANSFORMATION MATURITY ASSESSMENT DASHBOARD
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sm text-gray-700">
              🌐 IND
            </Button>
            <Button variant="secondary" size="sm" className="bg-gray-200 rounded-full p-2">
              👤
            </Button>
          </div>
        </header>

        {tab !== "assessment-form" && (
          <div className="flex justify-between items-center px-8 pt-6 border-b">
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
            <Button variant="primary" onClick={() => setTab("assessment-form")}>Buat Assessment</Button>
          </div>
        )}

        <main className="flex-1 px-8 py-6 space-y-6">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-red-700 text-white p-5 shadow rounded-xl">📋 UPPS/Kampus Cabang</div>
                <div className="bg-amber-500 text-white p-5 shadow rounded-xl">📄 Jumlah Variabel & Pertanyaan</div>
                <div className="bg-[#263859] text-white p-5 shadow rounded-xl">ℹ️ Assessment Submitted</div>
              </div>
              <ProgressAssessment />
            </div>
          )}

          {tab === "welcome" && (
            <div className="rounded-xl shadow bg-gradient-to-tr from-red-500 to-blue-500 text-white p-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Hallo, Wilson Curtis</h2>
                <p className="mt-2 max-w-lg">
                  Selamat datang di dashboard admin. Mari kita kelola sistem ini bersama-sama dan senang bisa bekerja sama dengan Anda.
                </p>
              </div>
              <Image src="/Logo.png" alt="Welcome Illustration" width={160} height={160} className="hidden md:block" />
            </div>
          )}

          {tab === "user-manual" && (
            <div className="bg-white p-6 shadow rounded-xl">
              <h3 className="text-gray-700 font-bold mb-2">📖 User Manual</h3>
              <p className="text-sm text-gray-500">
                Panduan lengkap tentang cara menggunakan dashboard ini...
              </p>
            </div>
          )}

          {tab === "assessment-form" && (
            <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
              <div className="flex justify-between items-center flex-wrap gap-4 cursor-pointer">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm font-semibold gap-1"
                  onClick={() => setTab("welcome")}
                >
                  Lihat tabel hasil pengisian <span className="text-sm">➔</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {["Jakarta", "Surabaya", "Purwokerto", "Bandung"].map((city) => (
                  <div
                    key={city}
                    className="bg-white border rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition"
                  >
                    <Image src="/Logo.png" alt={`Telkom University ${city}`} width={120} height={40} />
                    <h3 className="text-base font-semibold text-gray-800">
                      Telkom University {city}
                    </h3>
                    <Button
                      variant="primary"
                      className="flex items-center justify-center gap-1 bg-[#1d2c4c] hover:bg-[#16223b] text-white px-6 py-2 rounded-md text-sm"
                      onClick={() => alert(`Pilih Telkom University ${city}`)}
                    >
                      Pilih <span className="text-sm">➔</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

         
        </main>
      </div>
    </div>
  );
}
