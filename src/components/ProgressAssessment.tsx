"use client";

export default function ProgressAssessment({
  submitted = 0,
  approved = 0,
  onprogress = 0,
}: {
  submitted?: number;
  approved?: number;
  onprogress?: number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Progress Assessment</h2>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Submit</span>
          <span className="font-semibold text-blue-700">{submitted}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${submitted}%` }}></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Approve</span>
          <span className="font-semibold text-green-700">{approved}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${approved}%` }}></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Belum Selesai</span>
          <span className="font-semibold text-gray-700">{onprogress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-gray-500 rounded-full" style={{ width: `${onprogress}%` }}></div>
        </div>
      </div>
    </div>
  );
}