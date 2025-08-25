'use client';

import { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ProgressAssessment from '@/components/ProgressAssessment';
import { Pencil, Download } from 'lucide-react';
import AssessmentTable from './AssessmentTable';
import ModalConfirm from './StarAssessment/ModalConfirm';
import Button from './button';
import { Building2, ClipboardList, ClipboardCheck, BookOpenCheckIcon } from 'lucide-react';

const radarData = [
  { subject: "Akademik", A: 90 },
  { subject: "SDM", A: 85 },
  { subject: "Keuangan", A: 70 },
  { subject: "Kemahasiswaan", A: 75 },
  { subject: "SHO", A: 80 },
  { subject: "Publikasi", A: 95 },
];

const CAMPUS_LIST = [
  "Tel-U Jakarta",
  "Tel-U Surabaya",
  "Tel-U Purwokerto",
  "Tel-U Bandung",
] as const;

type CampusKey = typeof CAMPUS_LIST[number];

interface CampusData {
  "Tel-U Jakarta": number[];
  "Tel-U Surabaya": number[];
  "Tel-U Purwokerto": number[];
  "Tel-U Bandung": number[];
}

interface StudentRow {
  tahun: string;
  Jakarta: number;
  Bandung: number;
  Purwokerto: number;
  Surabaya: number;
}

export default function DashboardTab() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'student' | 'prodi'>('student');

  const [studentYears, setStudentYears] = useState<string[]>(["2021", "2022", "2023", "2024"]);
  const [studentInputData, setStudentInputData] = useState<CampusData>({
    "Tel-U Jakarta": [100, 120, 125, 135],
    "Tel-U Surabaya": [130, 150, 170, 180],
    "Tel-U Purwokerto": [110, 115, 130, 140],
    "Tel-U Bandung": [140, 135, 160, 170],
  });

  const [accreditationYears, setAccreditationYears] = useState<string[]>(["2021", "2022", "2023", "2024"]);
  const [accreditationInputData, setAccreditationInputData] = useState<CampusData>({
    "Tel-U Jakarta": [85, 87, 89, 90],
    "Tel-U Surabaya": [80, 82, 85, 88],
    "Tel-U Purwokerto": [78, 80, 83, 85],
    "Tel-U Bandung": [90, 91, 92, 93],
  });

  const [accreditationData, setAccreditationData] = useState<{ tahun: string; Jakarta: number; Bandung: number; Purwokerto: number; Surabaya: number }[]>([]);

  useEffect(() => {
    const initialData = accreditationYears.map((year, idx) => ({
      tahun: year,
      Jakarta: accreditationInputData["Tel-U Jakarta"][idx],
      Bandung: accreditationInputData["Tel-U Bandung"][idx],
      Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx],
      Surabaya: accreditationInputData["Tel-U Surabaya"][idx],
    }));
    setAccreditationData(initialData);
  }, [accreditationInputData, accreditationYears]);

  const handleAddYear = () => {
    const lastYearStr = studentYears.at(-1);
    const lastYearNum = lastYearStr ? parseInt(lastYearStr, 10) : 2024;
    const nextYear = String(lastYearNum + 1);
    setStudentYears((prev) => [...prev, nextYear]);
    (Object.keys(studentInputData) as Array<keyof CampusData>).forEach((campus) => {
      setStudentInputData((prev) => ({
        ...prev,
        [campus]: [...prev[campus], 0],
      }));
    });
  };

  const handleInputChange = (campus: keyof CampusData, yearIndex: number, value: string) => {
    const num = value === "" ? 0 : Number(value);
    if (isNaN(num)) return;
    setStudentInputData((prev) => ({
      ...prev,
      [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    }));
  };

  const handleAddAccreditationYear = () => {
    const lastYearStr = accreditationYears.at(-1);
    const lastYearNum = lastYearStr ? parseInt(lastYearStr, 10) : 2024;
    const nextYear = String(lastYearNum + 1);
    setAccreditationYears((prev) => [...prev, nextYear]);
    (Object.keys(accreditationInputData) as Array<keyof CampusData>).forEach((campus) => {
      setAccreditationInputData((prev) => ({
        ...prev,
        [campus]: [...prev[campus], 0],
      }));
    });
  };

  const handleAccreditationChange = (campus: keyof CampusData, yearIndex: number, value: string) => {
    const num = value === "" ? 0 : Math.max(0, Math.min(100, Number(value)));
    if (isNaN(num)) return;
    setAccreditationInputData((prev) => ({
      ...prev,
      [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    }));
  };

  const handleGenerate = () => {
    if (modalMode === 'student') {
      // Tidak perlu update studentData karena langsung pakai studentInputData
    } else if (modalMode === 'prodi') {
      const newData = accreditationYears.map((year, idx) => ({
        tahun: year,
        Jakarta: accreditationInputData["Tel-U Jakarta"][idx] || 0,
        Surabaya: accreditationInputData["Tel-U Surabaya"][idx] || 0,
        Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] || 0,
        Bandung: accreditationInputData["Tel-U Bandung"][idx] || 0,
      }));
      setAccreditationData(newData);
    }
    setShowModal(false);
  };

  const handleDownload = () => {
    if (accreditationData.length === 0) {
      alert("Belum ada data akreditasi prodi untuk diunduh.");
      return;
    }

    const csv = [
      ["Tahun", "Jakarta", "Bandung", "Purwokerto", "Surabaya"],
      ...accreditationData.map((row) => [
        row.tahun,
        row.Jakarta.toFixed(1),
        row.Bandung.toFixed(1),
        row.Purwokerto.toFixed(1),
        row.Surabaya.toFixed(1),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "akreditasi_prodi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openStudentModal = () => {
    setModalMode('student');
    setShowModal(true);
  };

  const openProdiModal = () => {
    setModalMode('prodi');
    setShowModal(true);
  };

  // Data perkembangan variabel
  const variableData = [
    { tahun: "2021", variable: "Akademik", "Tel-U Jakarta": 88, "Tel-U Bandung": 92, "Tel-U Surabaya": 85, "Tel-U Purwokerto": 80 },
    { tahun: "2021", variable: "SDM", "Tel-U Jakarta": 82, "Tel-U Bandung": 87, "Tel-U Surabaya": 80, "Tel-U Purwokerto": 78 },
    { tahun: "2022", variable: "Akademik", "Tel-U Jakarta": 89, "Tel-U Bandung": 93, "Tel-U Surabaya": 87, "Tel-U Purwokerto": 82 },
    { tahun: "2022", variable: "SDM", "Tel-U Jakarta": 84, "Tel-U Bandung": 88, "Tel-U Surabaya": 83, "Tel-U Purwokerto": 80 },
    { tahun: "2023", variable: "Akademik", "Tel-U Jakarta": 90, "Tel-U Bandung": 94, "Tel-U Surabaya": 89, "Tel-U Purwokerto": 85 },
    { tahun: "2023", variable: "SDM", "Tel-U Jakarta": 86, "Tel-U Bandung": 90, "Tel-U Surabaya": 85, "Tel-U Purwokerto": 83 },
    { tahun: "2024", variable: "Akademik", "Tel-U Jakarta": 91, "Tel-U Bandung": 95, "Tel-U Surabaya": 91, "Tel-U Purwokerto": 87 },
    { tahun: "2024", variable: "SDM", "Tel-U Jakarta": 88, "Tel-U Bandung": 92, "Tel-U Surabaya": 87, "Tel-U Purwokerto": 85 },
  ];

  const [selectedCampus, setSelectedCampus] = useState<"All" | CampusKey>("All");
  const [selectedVariable, setSelectedVariable] = useState<string>("Akademik");

  // Transform data untuk Student Body: X-axis = Kampus, Bar = Tahun
  const studentDataByCampus = CAMPUS_LIST.map((campus) => {
    const data: any = { kampus: campus.replace("Tel-U ", "") };
    studentYears.forEach((year, idx) => {
      data[year] = studentInputData[campus][idx] || 0;
    });
    return data;
  });

  // Siapkan data untuk grafik variabel
  const filteredVariableData = variableData.filter(d => d.variable === selectedVariable);

  const chartData = filteredVariableData.map(d => {
    const row: any = { tahun: d.tahun };
    if (selectedCampus === "All") {
      CAMPUS_LIST.forEach(campus => {
        row[campus] = d[campus];
      });
    } else {
      row[selectedCampus] = d[selectedCampus];
    }
    return row;
  });

  // Warna untuk tiap kampus
  const campusColors: Record<string, string> = {
    "Tel-U Jakarta": "#8884d8",
    "Tel-U Bandung": "#82ca9d",
    "Tel-U Surabaya": "#ffc658",
    "Tel-U Purwokerto": "#ff7300",
  };

  return (
    <div className="space-y-8 px-4 py-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/KC.png')" }}
        >
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex items-center space-x-2 text-white p-4 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">UPPS/Kampus Cabang</span>
            <div
              className="absolute top-0 right-0 w-6 h-6 text-white text-sm font-bold rounded-full flex items-center justify-center"
              style={{ marginTop: '45px', marginRight: '90px' }}
            >
              8
            </div>
          </div>
        </div>

        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Jumlah Variabel.png')" }}
        >
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <BookOpenCheckIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Jumlah Variabel & Pertanyaan</span>
          </div>
        </div>

        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Assessment Submitted.png')" }}
        >
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardList className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Assessment Submitted</span>
          </div>
        </div>

        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Assessment Approve.png')" }}
        >
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Assessment Approved</span>
          </div>
        </div>
      </div>

      {/* Progress & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress Assessment</h3>
          <ProgressAssessment />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Transformation Maturity Index</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#f8170fff" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Body - X-axis: Kampus, Color: Tahun */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
            <div className="flex space-x-3">
              <button onClick={openStudentModal} className="text-gray-500 hover:text-gray-700" title="Edit Data Mahasiswa">
                <Pencil size={18} />
              </button>
              <button className="text-gray-500 hover:text-gray-700" title="Unduh Data">
                <Download size={18} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentDataByCampus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kampus" />
              <YAxis />
              <Tooltip />
              <Legend />
              {studentYears.map((year) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={`hsl(${(parseInt(year) - 2021) * 30}, 70%, 50%)`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accreditation Line Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">📈 Pertumbuhan Akreditasi Prodi</h3>
            <div className="flex space-x-3">
              <button onClick={openProdiModal} className="text-gray-500 hover:text-gray-700" title="Edit Data Prodi">
                <Pencil size={18} />
              </button>
              <button onClick={handleDownload} className="text-gray-500 hover:text-gray-700" title="Unduh Data Akreditasi">
                <Download size={18} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accreditationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => Number(value).toFixed(2)} />
              <Legend />
              <Line type="monotone" dataKey="Jakarta" stroke="#8884d8" />
              <Line type="monotone" dataKey="Bandung" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Purwokerto" stroke="#ffc658" />
              <Line type="monotone" dataKey="Surabaya" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Variable Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-bold text-gray-700">📈 Perkembangan Variabel per Kampus</h3>
          <div className="flex flex-wrap gap-4 ml-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by UPPS/KC</label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as "All" | CampusKey)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm min-w-[160px]"
              >
                <option value="All">Semua Kampus</option>
                {CAMPUS_LIST.map(campus => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Variabel</label>
              <select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm min-w-[140px]"
              >
                <option value="Akademik">Akademik</option>
                <option value="SDM">SDM</option>
              </select>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tahun" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => Number(value).toFixed(2)} />
            <Legend />
            {selectedCampus === "All"
              ? CAMPUS_LIST.map(campus => (
                  <Line
                    key={campus}
                    type="monotone"
                    dataKey={campus}
                    stroke={campusColors[campus]}
                    name={campus.replace("Tel-U ", "")}
                  />
                ))
              : (
                  <Line
                    type="monotone"
                    dataKey={selectedCampus}
                    stroke={campusColors[selectedCampus]}
                    name={selectedCampus.replace("Tel-U ", "")}
                  />
                )
            }
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="mt-6">
        <AssessmentTable hideStartButton={true} />
      </div>

      {/* Modal */}
      <ModalConfirm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleGenerate}
        header={modalMode === 'student' ? 'Ubah Data Mahasiswa' : 'Ubah Data Prodi'}
        title=""
        footer={
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 font-medium"
            >
              Simpan
            </button>
          </div>
        }
      >
        {modalMode === 'student' ? (
          <>
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleAddYear}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm font-medium"
              >
                + Tambah Tahun
              </Button>
            </div>
            <div className="overflow-x-auto max-w-full">
              <table className="w-full border-collapse text-center min-w-max">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left pl-2">Kampus</th>
                    {studentYears.map((year, i) => (
                      <th key={i} className="px-2 py-1">{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAMPUS_LIST.map((campus) => (
                    <tr key={campus} className="border-b border-gray-200">
                      <td className="text-left pl-2 py-2 font-medium">{campus}</td>
                      {studentInputData[campus].map((value, j) => (
                        <td key={j} className="px-2 py-1">
                          <input
                            type="number"
                            value={value === 0 ? "" : value}
                            onChange={(e) => handleInputChange(campus, j, e.target.value)}
                            className="w-16 h-8 border rounded p-1 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                            placeholder="0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleAddAccreditationYear}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm font-medium"
              >
                + Tambah Tahun
              </Button>
            </div>
            <div className="overflow-x-auto max-w-full">
              <table className="w-full border-collapse text-center min-w-max">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left pl-2">Kampus</th>
                    {accreditationYears.map((year, i) => (
                      <th key={i} className="px-2 py-1">{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAMPUS_LIST.map((campus) => (
                    <tr key={campus} className="border-b border-gray-200">
                      <td className="text-left pl-2 py-2 font-medium">{campus}</td>
                      {accreditationInputData[campus].map((value, j) => (
                        <td key={j} className="px-2 py-1">
                          <input
                            type="number"
                            value={value === 0 ? "" : value}
                            onChange={(e) => handleAccreditationChange(campus, j, e.target.value)}
                            className="w-16 h-8 border rounded p-1 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ModalConfirm>
    </div>
  );
}