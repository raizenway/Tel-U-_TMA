// components/ProgressAssessment.tsx
export default function ProgressAssessment() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4">Progres Assessment</h2>
      <div className="space-y-3">
        <div>
          <p>Submit <span className="float-right">59%</span></p>
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-blue-600 rounded w-[59%]"></div>
          </div>
        </div>
        <div>
          <p>Approve <span className="float-right">27%</span></p>
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-green-500 rounded w-[27%]"></div>
          </div>
        </div>
        <div>
          <p>Belum Selesai <span className="float-right">11%</span></p>
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-gray-500 rounded w-[11%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
