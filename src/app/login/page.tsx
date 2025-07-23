"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password) {
      router.push("/welcome");
    } else {
      alert("Silakan masukkan email dan password.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Kiri: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo Tel-U */}
          <div className="flex justify-center mb-6">
            <img
              src="/Logo.png"
              alt="Telkom University Logo"
              className="h-20"
            />
          </div>

          {/* Judul */}
          <h2 className="text-xl font-semibold text-center text-[#c8102e] mb-2">
            Sistem Akademik Mahasiswa
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Silakan login menggunakan akun iGracias Anda
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIM / Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#c8102e] focus:border-[#c8102e]"
                placeholder="example@student.telkomuniversity.ac.id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-black-300 rounded-md shadow-sm focus:ring-[#c8102e] focus:border-[#c8102e]"
                placeholder="••••••••"
              />
            </div>

           {/* Tombol Login */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-500 transition font-semibold"
            >
              Log In atau Log In Dengan Akun SSO
            </button>

          </form>
              {/* Lupa akun SSO */}
              <div className="flex items-center justify-center mt-4 text-sm text-red-500 gap-2">
                <span>🔐</span>
                <a href="#" className="hover:underline">
                  Forgot Password SSO
                </a>
              </div>

              {/* Lupa akun UPPS / Kampus */}
              <div className="flex items-center justify-center mt-2 text-sm text-green-600 gap-2">
               <a
  href="https://wa.me/"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 text-green-600 text-sm mt-2"
>
  <FaWhatsapp className="w-5 h-5" />
  AS admin TMA
</a>
              </div>

          
        </div>
      </div>

      {/* Kanan: Gambar */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="/Konten.png"
          alt="Tel-U Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0  opacity-20" />
      </div>
    </div>
  );
}
