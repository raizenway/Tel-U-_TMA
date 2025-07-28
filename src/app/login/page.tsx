"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

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
      {/* =================== */}
      {/* KIRI: FORM LOGIN */}
      {/* =================== */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Judul */}
          <h2 className="text-xl font-semibold text-center text-black mb-4">
            Log In An Account
          </h2>
          <p className="text-sm text-center text-gray-500 mb-11">
            Enter your Username and Password to log in to our 
            dashboard
          </p>

        <form onSubmit={handleLogin} className="space-y-4">
  {/* NIM / Email */}
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

  {/* Password */}
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Password
    </label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#c8102e] focus:border-[#c8102e]"
      placeholder="••••••••"
    />
  </div>

  {/* Tombol Login */}
  <button
    type="submit"
    className="w-full bg-[#3c5bff] text-white py-2 rounded-md font-semibold"
  >
    Log In SSO
  </button>

  {/* Forgot Password dan Ask Admin */}
  <div className="flex justify-center items-center gap-6 mt-3 text-sm">
   
   
  </div>
</form>


          {/* Lupa akun SSO */}
          <div className="flex items-center justify-center mt-4 text-sm text-red-500 gap-2">
            <span>🔐</span>
            <a href="#" className="hover:underline">
              Forgot Password SSO ?
            </a>
          </div>

          {/* Kontak Admin */}
          <div className="flex items-center justify-center mt-2 text-sm text-green-600 gap-2">
            <a
              href="https://wa.me/youradminnumber"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
            >
              <FaWhatsapp className="w-5 h-5" />
              Ask Admin TMA
            </a>
          </div>
        </div>
      </div>

      {/* =================== */}
      {/* KANAN: BACKGROUND */}
      {/* =================== */}
      <div className="hidden md:flex w- relative">
        {/* Background Image */}
        <img
          src="/konten (1).png"
          alt="Tel-U Background"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
