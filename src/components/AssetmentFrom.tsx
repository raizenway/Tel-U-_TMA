import Image from "next/image";
import Button from "@/components/button";

export default function AssessmentForm({ onSelectCampus }: { onSelectCampus: (campus: string) => void }) {
  const campuses = [
    { name: "Tel-U Jakarta", image: "/image 2.png" },
    { name: "Tel-U Surabaya", image: "/image 2.png" },
    { name: "Tel-U Purwokerto", image: "/image 2.png" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray min-h-screen">
      <div className="mt-6 mb-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          {campuses.slice(0, 2).map((campus) => (
            <div
              key={campus.name}
              className="w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="w- h-auto">
                <Image src={campus.image} alt={campus.name} width={243} height={107} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{campus.name}</h3>
              <Button
                className="bg-[#1d2c4c] hover:bg-[#16223b] text-white px-30 py-2 text-base rounded-lg transition-all duration-200"
                onClick={() => onSelectCampus(campus.name)}
              >
                Pilih <span className="text-base ml-2">➔</span>
              </Button>
            </div>
          ))}
        </div>

        <div className="flex">
          <div
            className="w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
          >
            <div className="w- h-auto">
              <Image src="/image 2.png" alt="Tel-U Purwokerto" width={243} height={107} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Tel-U Purwokerto</h3>
            <Button
              className="bg-[#1d2c4c] hover:bg-[#16223b] text-white px-30 py-2 text-base rounded-lg transition-all duration-200"
              onClick={() => onSelectCampus("Tel-U Purwokerto")}
            >
              Pilih <span className="text-base ml-2">➔</span>
            </Button>
          </div>
        </div>  
      </div>
    </div>
  );
}
