"use client";

export default function ProgressAssessment() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Progress Assessment</h2>

      {/* Submit */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Submit</span>
          <span className="font-semibold text-blue-700">59%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full w-[59%]"></div>
        </div>
      </div>

      {/* Approve */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Approve</span>
          <span className="font-semibold text-green-700">27%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-green-500 rounded-full w-[27%]"></div>
        </div>
      </div>

      {/* Belum Selesai */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Belum Selesai</span>
          <span className="font-semibold text-gray-700">11%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-gray-500 rounded-full w-[11%]"></div>
        </div>
      </div>
    </div>
  );
}
