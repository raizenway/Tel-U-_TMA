// WelcomeTab.tsx
"use client";

import Image from "next/image";
import Button from "@/components/button";

const WelcomeTab = () => {
  return (
    <div className="space-y-10">
      {/* ===================== */}
      {/* BANNER SAPAAN FINAL */}
      {/* ===================== */}
      <div className="relative rounded-xl overflow-hidden shadow-lg min-h-[220px] flex bg-cover bg-center">
        {/* Gambar Hallo.png sebagai latar belakang */}
        <Image
          src="/Hallo.png"
          alt="Ilustrasi Wanita"
          width={500}
          height={220}
          className="absolute inset-0 object-cover w-full h-full z-0"
        />

        {/* Kontainer untuk elemen-elemen di atas gambar */}
        <div className="relative z-10 p-6 flex items-center justify-between">
          {/* Kolom Kiri: Gambar wanita melambai */}
          <div>
            <Image
              src="/waving woman.png"
              alt="Ilustrasi Wanita"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>

          {/* Kolom Kanan: Logo Telkom + Teks Sapaan */}
          <div className="flex flex-col items-end">
            {/* Logo Telkom */}
            <div className="mb-4">
              <Image
                src="/Frame.png"
                alt="Telkom University"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>

            {/* Teks Sapaan */}
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold">Hallo, Wilson Curtis</h2>
              <p className="text-sm lg:text-base mt-2">
                Selamat datang di aplikasi Transformation Maturity Assessment (TMA)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* 3 KARTU INFORMASI */}
      {/* ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
        {[
          {
            img: "/about tma.png",
            title: "About TMA",
            desc: "Tidak hanya sebatas kuisioner, namun juga menilai kinerja secara kuantitatif.",
          },
          {
            img: "/faq.png",
            title: "FAQ",
            desc: "Pertanyaan yang sering diajukan di TMA.",
          },
          {
            img: "/admin.png",
            title: "Kontak Admin",
            desc: "Jika anda memerlukan bantuan, jangan ragu untuk menghubungi kami.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center space-y-4"
          >
            <Image src={card.img} alt={card.title} width={80} height={80} />
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.desc}</p>
            <Button className="px-4 py-2 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700 transition">
              Selengkapnya &rarr;
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeTab;