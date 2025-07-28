"use client";

import Image from "next/image";
import Button from "@/components/button";

const WelcomeTab = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-xl shadow overflow-hidden">
        <Image
          src="/Hallo.png"
          alt="Banner"
          width={1080}
          height={318}
          className="w-full h-auto"
          priority
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
