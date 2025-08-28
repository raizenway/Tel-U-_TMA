interface ReportProps {
  name: string;
  point: number;
  maturity: string;
  description: string;
}

export default function TableReportComponent({  }: { data: any }) {
  const reports: ReportProps[] = [
    {
      name: 'V1 (Akademik)',
      point: 20,
      maturity: 'DIFFERENTIATING',
      description: 'Institusi memiliki kekuatan yang jelas dalam transformasi digital dan elemen dasar yang ada',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-100 text-xs">
          <tr>
            <th className="px-4 py-2">Nama Variabel</th>
            <th className="px-4 py-2">Point</th>
            <th className="px-4 py-2">Maturity Level</th>
            <th className="px-4 py-2">Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.point}</td>
              <td className="px-4 py-2">{r.maturity}</td>
              <td className="px-4 py-2">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-2 bg-slate-700 text-white px-4 py-1 rounded-md">Download</button>
    </div>
  );
}
