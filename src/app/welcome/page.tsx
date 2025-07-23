    "use client";

    import { useState } from "react";
    import Image from "next/image";
    import clsx from "clsx";
    import { Button } from "@/components/ui/button";
    import {
      LogOut,
      ClipboardList,
      GraduationCap,
      Wallet,
      BadgeCheck,
      Handshake,
      ListChecks,
      LayoutDashboard,
      Globe,
    } from "lucide-react";
    import ProgressAssessment from "@/components/ProgressAssessment";
    import { useRouter } from "next/navigation";

    export default function WelcomePage() {
      const [tab, setTab] = useState("welcome");
      const [selectedCampus, setSelectedCampus] = useState("");
      const router = useRouter();

      const assessmentItems = [
        { title: "Admis", icon: ClipboardList },
        { title: "Alumni", icon: GraduationCap },
        { title: "Keuangan", icon: Wallet },
        { title: "Mutu", icon: BadgeCheck },
        { title: "Kerjasama", icon: Handshake },
        { title: "Akademik", icon: ListChecks },
        { title: "Kemahasiswaan", icon: LayoutDashboard },
        { title: "Mahasiswa Asing", icon: Globe },
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
              <div className="flex flex-col gap-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                  onClick={() => setTab("welcome")}
                >
                  🏠 Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                  onClick={() => setTab("assessment-form")}
                >
                  📝 Start Assessment
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                  onClick={() => alert("Coming soon")}
                >
                  
                  📈 Start Result
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                  onClick={() => setTab("user-manual")}
                  
                >
                  📘 About IMA
                </Button>
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
            {/* Header */}
            <header className="bg-white flex justify-between items-center px-6 py-4 border-b shadow rounded-xl w-[92%] max-w-6xl mt-4 ml-9">
              <h1 className="text-black font-semibold">
                TRANSFORMATION MATURITY ASSESSMENT DASHBOARD
              </h1>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-sm text-gray-700">
                  🌐 IND
                </Button>
                <Button variant="secondary" size="icon" className="bg-gray-200 rounded-full p-2">
                  👤
                </Button>
              </div>
            </header>

            {/* Tab Navigation */}
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
                <Button
                  onClick={() => setTab("assessment-form")}
                  className="bg-blue-900 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow font-semibold"
                >
                  Buat Assessment
                </Button>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 px-8 py-6 space-y-6">
              {tab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-red-700 text-white p-5 shadow rounded-xl">📋 UPPS/Kampus Cabang</div>
                    <div className="bg-amber-500 text-white p-5 shadow rounded-xl">📄 Jumlah Variabel & Pertanyaan</div>
                    <div className="bg-blue-700 text-white p-5 shadow rounded-xl">ℹ️ Assessment Submitted</div>
                    <div className="bg-emerald-600 text-white p-5 shadow rounded-xl">✅ Assessment Approved</div>
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
                    <select
                      value={selectedCampus}
                      onChange={(e) => setSelectedCampus(e.target.value)}
                      className="w-full sm:w-96 border border-white rounded-md px-4 py-2 text-gray-600 shadow-sm focus:outline-none focus:ring-2 cursor-pointer"
                    >
                      <option value="" disabled>Pilih UPPS/Kantor Cabang</option>
                      <option value="jakarta">Tel-U Jakarta</option>
                      <option value="bandung">Tel-U Bandung</option>
                      <option value="purwokerto">Tel-U Purwokerto</option>
                      <option value="surabaya">Tel-U Surabaya</option>
                    </select>
                    <Button
                      variant="link"
                      className="text-red-600 hover:underline text-sm font-semibold gap-1"
                      onClick={() => setTab("welcom")}
                    >
                      Lihat tabel hasil pengisian <span className="text-lg">➔</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assessmentItems.map(({ title, icon: Icon }) => (
                      <div
                        key={title}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition"
                      >
                        <Icon className="w-12 h-12 text-gray-800" />
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        <Button className="bg-[#1d2c4c] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#16223b]">
                          Buat Assessment
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setTab("dashboard")} className="bg-blue-900 text-white font-semibold px-6 py-2 rounded hover:bg-blue-900">
                      Contoh Button Universal
                    </Button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      );
    }
