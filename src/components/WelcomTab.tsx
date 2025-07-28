"use client";

import Image from "next/image";
import Button from "@/components/button";

const WelcomeTab = () => {
  return (
    <div className="space-y-10">
      {/* ===================== */}
      {/* BANNER SAPAAN FINAL */}
      {/* ===================== */}
      <div className="relative rounded-xl overflow-hidden shadow-lg min-h-[220px] flex">
        {/* Bagian kiri: biru dengan ilustrasi */}
        <div className="w-1/2 bg-[#2b4d91] flex items-center justify-center p-6">
          <Image
            src="/waving woman.png"
            alt="Ilustrasi Wanita"
            width={180}
            height={180}
            className="object-contain"
          />
        </div>

        {/* Bagian kanan: merah */}
        <div className="w-1/2 relative bg-[#ec1c24] text-white flex flex-col justify-center p-6 lg:p-10">
          {/* Lekukan biru di atas kanan */}
          <svg
            viewBox="0 0 500 220"
            className="absolute top-0 right-0 h-[80px] w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 Q400,100 500,0 L500,0 L500,80 L0,80 Z"
              fill="#6a87c1"
            />
          </svg>

          {/* Logo Telkom */}
          <div className="absolute top-4 right-6 z-10 w-[120px]">
            <Image
              src="/Frame.png"
              alt="Telkom University"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          {/* Teks Sapaan */}
          <div className="relative z-10">
            <h2 className="text-xl lg:text-2xl font-semibold">Hallo, Wilson Curtis</h2>
            <p className="text-sm lg:text-base mt-2">
              Selamat datang di aplikasi Transformation Maturity Assessment (TMA)
            </p>
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
