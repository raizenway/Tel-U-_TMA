import Image from "next/image";
import Button from "@/components/button";
import { ArrowRight } from "lucide-react";

export default function AssessmentForm({ onSelectCampus }: { onSelectCampus: (campus: string) => void }) {
  const campuses = [
    { name: "Tel-U Jakarta", image: "/image 2.png" },
    { name: "Tel-U Surabaya", image: "/image 2.png" },
    // Tel-U Purwokerto tidak dipakai dari array, jadi tidak masalah
  ];

  return (
    <div className="p-6 space-y-6 bg-gray min-h-screen">
      <div className="mt-6 mb-4 space-y-6">
        {/* Jakarta & Surabaya dari map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          {campuses.map((campus) => (
            <div
              key={campus.name}
              className="w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-full h-auto flex justify-center">
                <Image src={campus.image} alt={campus.name} width={243} height={107} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{campus.name}</h3>
              <Button
                className="bg-[#1d2c4c] hover:bg-[#16223b] text-white px-8 py-2 text-base rounded-lg transition-all duration-200"
                onClick={() => onSelectCampus(campus.name)}
              >
                Pilih <span className="text-base ml-2">➔</span>
              </Button>
            </div>
          ))}
        </div>

        {/* Purwokerto — tetap manual, TIDAK DIUBAH */}
        <div className="flex justify-start">
          <div
            className="w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
          >
            <div className="w-full h-auto flex justify-center">
              <Image src="/image 2.png" alt="Tel-U Purwokerto" width={243} height={107} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Tel-U Purwokerto</h3>
            <Button
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onSelectCampus("Tel-U Purwokerto")}
            >
             pilih
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}