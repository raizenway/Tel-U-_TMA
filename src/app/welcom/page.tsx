"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [tab, setTab] = useState("dashboard");
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r flex flex-col">
        <div className="px-6 py-8">
          <Image src="/Logo.png" alt="Logo Telkom University" width={190} height={80} />
        </div>

        <div className="px-6 py-8 border-y flex items-center space-x-4">
          <Image
            src="/user-icon.png"
            alt="User"
            width={70}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-600">Wilson Curtis</p>
            <p className="text-sm text-gray-500">012345678</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2 text-sm font-medium">
          <div className="flex flex-col w-full pt-10 gap-6">
            <button className="w-full flex items-center space-x-4 text-gray-500 rounded px-3 py-2 transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-500">
              <span>🏠</span>
              <span>Home</span>
            </button>
            <button
              onClick={() => router.push("/assessment")}
              className="w-full flex items-center space-x-4 text-gray-500 rounded px-3 py-2 transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-500"
            >
              <span>📊</span>
              <span>Star Assessment</span>
            </button>
            <button className="w-full flex items-center space-x-4 text-gray-500 rounded px-3 py-2 transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-500">
              <span>📈</span>
              <span>Star Result</span>
            </button>
            <button className="w-full flex items-center space-x-4 text-gray-500 rounded px-3 py-2 transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-500">
              <span>ℹ️</span>
              <span>About IMA</span>
            </button>
          </div>
        </nav>

        <div className="px-6 py-4 border-t">
          <button className="flex items-center gap-2 text-sm text-red-600 font-semibold">
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-4 px-8 pb-4">
        {/* Header */}
        <header className="bg-white flex justify-between items-center px-6 py-4 border-b rounded-lg">
          <h1 className="text-black font-semibold text-lg">
            TRANSFORMATION MATURITY ASSESSMENT DASHBOARD
          </h1>
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 rounded text-sm text-gray-700">🌐 IND</button>
            <button className="bg-gray-50 p-2 rounded-full">👤</button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-300 px-6 pt-6">
          {[
            { name: "Welcome", id: "welcome" },
            { name: "Dashboard", id: "dashboard" },
            { name: "User Manual", id: "user-manual" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={clsx(
                "pb-2 font-semibold transition",
                tab === item.id
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-700 hover:text-red-600"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Tombol Simpan di Atas */}
        {tab === "dashboard" && (
          <div className="flex justify-end px-6 mt-4">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm rounded-lg shadow font-semibold"
              onClick={() => alert("Assessment baru dibuat")}
            >
              Buat Assessment
            </Button>
          </div>
        )}

        {/* Main Area */}
        <main className="p-6 space-y-6 flex-1">
          {tab === "welcome" && (
            <div className="rounded-xl shadow bg-gradient-to-tr from-red-500 to-blue-500 text-white p-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Hallo, Wilson Curtis</h2>
                <p className="mt-2 max-w-lg">
                  Selamat datang di dashboard admin. Mari kita kelola sistem ini bersama-sama dan senang bisa bekerja sama dengan Anda.
                </p>
              </div>
              <Image
                src="/Logo.png"
                alt="Welcome Illustration"
                width={180}
                height={180}
                className="hidden md:block"
              />
            </div>
          )}

          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Statistik */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-9">
                <div className="bg-red-700 text-white p-5 shadow rounded">📋 UPPS/kampus Cabang</div>
                <div className="bg-amber-500 text-white p-5 shadow rounded">📄 Jumlah Variable & Pertanyaan</div>
                <div className="bg-blue-700 text-white p-5 shadow rounded">ℹ️ Assessment Submitted</div>
                <div className="bg-emerald-600 text-white p-5 shadow rounded">✅ Assessment Approved</div>
              </div>
            </div>
          )}

          {tab === "user-manual" && (
            <div className="bg-white p-6 shadow rounded">
              <h3 className="text-gray-700 font-bold mb-2">📖 User Manual</h3>
              <p className="text-sm text-gray-500">
                Panduan lengkap tentang cara menggunakan dashboard ini...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
