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
      <div className="relative rounded-xl overflow-hidden shadow-lg min-h-[220px] bg-cover bg-center">
        {/* Gambar Hallo.png sebagai latar belakang */}
        <Image
          src="/Hallo.png"
          alt="Latar Belakang"
          width={500}
          height={220}
          className="absolute inset-0 object-cover w-full h-full z-0"
        />

        {/* Kontainer utama: Flex untuk kiri-kanan */}
        <div className="relative z-10 p-6 flex items-center justify-between min-h-[220px]">
          
          {/* Kolom Kiri: Gambar wanita melambai */}
          <div className="flex-shrink-0">
            <Image
              src="/waving woman.png"
              alt="Ilustrasi Wanita"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>

        <div className="flex flex-col items-end space-y-4 ml-auto max-w-xs">
  {/* Logo: geser 6px ke atas, 8px ke kiri */}
  <div className="relative -top-8 -right-2 -left-11 z-10">
    <Image src="/Frame.png" alt="Telkom" width={160} height={40} className="object-contain" />
  </div>

  {/* Teks: geser 4px ke bawah */}
   <div className="text-right max-w-xs">
   <h2 className="text-xl lg:text-2xl font-semibold text-white relative -translate-x-150 top-2">
  Hallo, Wilson Curtis
</h2>
    <p className="text-sm lg:text-base text-white relative -translate-x-150 mt-4  ">
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