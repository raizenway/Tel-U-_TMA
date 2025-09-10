'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';
import { UsersRound, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/button';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (result.status === 'success') {
  // 💡 SEMENTARA — tambahkan roleId secara manual
  const userWithRole = {
    ...result.data,
    roleId: 3, // ← ganti angka ini sesuai kebutuhan testing: 1,2,3,4
  };
  localStorage.setItem('user', JSON.stringify(userWithRole));
  router.push('/welcome');
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-screen">
      {/* KIRI: FORM LOGIN */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-white px-6 py-12 rounded-tr-lg rounded-br-lg">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center items-center gap-6 mb-10">
            <Image src="/image 2.png" alt="Logo Telkom University" width={150} height={100} />
            <Image src="/tr.png" alt="Logo Program Studi" width={190} height={100} />
          </div>

          {/* Judul */}
          <h2 className="text-xl font-semibold text-black mb-4">Log In An Account</h2>
          <p className="text-sm text-gray-500 mb-11">
            Enter your Username and Password to log in to our dashboard
          </p>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#c8102e] focus:border-[#c8102e]"
                placeholder="Username"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-[#c8102e] focus:border-[#c8102e]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 mt-5"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Tombol Login */}
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                variant="blue"
                className="w-2/3"
                isLoading={loading}
              >
                Login SSO
              </Button>
            </div>
          </form>

          {/* Lupa Password */}
          <div className="flex items-center justify-center mt-4 text-sm text-red-500 gap-2">
            <UsersRound />
            <a href="#" className="hover:underline">
              Forgot Password SSO
            </a>
          </div>

          {/* Kontak Admin */}
          <div className="flex items-center justify-center mt-2 text-sm text-green-600 gap-2">
            <a
              href="https://wa.me/6281234567890"
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

      {/* KANAN: BACKGROUND */}
<div className="hidden md:flex w-1/2 relative">
  <Image
    src="/Konten.png"  // ← sesuaikan dengan nama file
    alt="Tel-U Background"
    fill
    className="object-cover"
    priority
    unoptimized
  />
</div>
    </div>
  );
}
