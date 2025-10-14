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

export default function DashboardTab() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'student' | 'prodi'>('student');

  const [dashboardData, setDashboardData] = useState({
    totalBranches: 0,
    totalVariable: 0,
    submittedAssessments: 0,
    approvedAssessments: 0,
    assessmentProgress: {
      onprogress: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
    },
  });

  const [studentBodyData, setStudentBodyData] = useState<{
    year: string;
    "Tel-U Jakarta": number | null;
    "Tel-U Surabaya": number | null;
    "Tel-U Purwokerto": number | null;
    "Tel-U Bandung": number | null;
  }[]>([]);

  const [accreditationInputData, setAccreditationInputData] = useState<CampusData>({
    "Tel-U Jakarta": [],
    "Tel-U Surabaya": [],
    "Tel-U Purwokerto": [],
    "Tel-U Bandung": [],
  });
  const [accreditationYears, setAccreditationYears] = useState<string[]>([]);

  const [radarData, setRadarData] = useState<{ subject: string; A: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // === FETCH SEMUA DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/assessment/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const result = await response.json();
        const apiData = result.data;

        // --- Card & Progress ---
        setDashboardData({
          totalBranches: apiData.totalBranches || 0,
          totalVariable: apiData.totalVariable || 0,
          submittedAssessments: apiData.submittedAssessments || 0,
          approvedAssessments: apiData.approvedAssessments || 0,
          assessmentProgress: apiData.assessmentProgress || { onprogress: 0, submitted: 0, approved: 0, rejected: 0 },
        });

        // --- STUDENT BODY ---
        const yearStrings = ['2021', '2022', '2023', '2024', '2025'];
        const studentBodyFormatted: {
  year: string;
  "Tel-U Jakarta": number | null;
  "Tel-U Surabaya": number | null;
  "Tel-U Purwokerto": number | null;
  "Tel-U Bandung": number | null;
}[] = yearStrings.map(yearStr => {
  const yearNum = Number(yearStr);
  const row = {
    year: yearStr,
    "Tel-U Jakarta": null,
    "Tel-U Surabaya": null,
    "Tel-U Purwokerto": null,
    "Tel-U Bandung": null,
  };

  apiData.branches.forEach((branch: any) => {
    const campusName = branch.name as CampusKey;
    const dataForYear = branch.yearlyStudentBody?.find((item: any) => item.year === yearNum);
    if (campusName in row) {
      row[campusName] = dataForYear ? dataForYear.total : null;
    }
  });

  return row;
});

setStudentBodyData(studentBodyFormatted); // ✅ Sekarang aman

        // --- Accreditation Growth ---
        const accreditationFormatted = yearStrings.map(yearStr => {
          const yearNum = Number(yearStr);
          const row: Record<string, number> = {};
          apiData.branches.forEach((branch: any) => {
            const campusName = branch.name as CampusKey;
            const dataForYear = branch.yearlyAccreditationGrowth?.find((item: any) => item.year === yearNum);
            row[campusName] = dataForYear ? dataForYear.total : 0;
          });
          return row;
        });

        setAccreditationYears(yearStrings);
        setAccreditationInputData({
          "Tel-U Jakarta": accreditationFormatted.map(r => r["Tel-U Jakarta"] ?? 0),
          "Tel-U Surabaya": accreditationFormatted.map(r => r["Tel-U Surabaya"] ?? 0),
          "Tel-U Purwokerto": accreditationFormatted.map(r => r["Tel-U Purwokerto"] ?? 0),
          "Tel-U Bandung": accreditationFormatted.map(r => r["Tel-U Bandung"] ?? 0),
        });

        // --- Radar Chart (DIPERBAIKI) ---
        const tmiRaw = apiData.transformationMaturityIndex || [];
        const validTmi = tmiRaw
          .filter((item: any) => 
            typeof item.name === 'string' && 
            typeof item.value === 'number' && 
            item.name.trim() !== ''
          )
          .map((item: any) => ({
            subject: item.name.trim(),
            A: Number(item.value.toFixed(2)),
          }));

        // Hapus duplikat berdasarkan subject
        const uniqueRadar = Array.from(
          new Map(validTmi.map((item: any) => [item.subject, item])).values()
        );

        setRadarData(uniqueRadar.length > 0 ? uniqueRadar : [
          { subject: "Mutu", A: 80 },
          { subject: "Akademik", A: 60 },
          { subject: "SDM", A: 98 },
          { subject: "Spio", A: 90 },
          { subject: "Kemahasiswaan", A: 80 },
          { subject: "Admisi", A: 80 },
          { subject: "PPN,Publikasi,Abdimas", A: 80 },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard ', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === Student Body Derived Data ===
  const studentYears = Array.from(new Set(studentBodyData.map(d => d.year)))
    .sort((a, b) => Number(a) - Number(b));

  const studentDataByCampus = CAMPUS_LIST.map((campus) => {
    const data: { [key: string]: string | number } = { kampus: campus.replace("Tel-U ", "") };
    studentYears.forEach((year) => {
      const item = studentBodyData.find(d => d.year === year);
      data[year] = item ? (item[campus] ?? 0) : 0;
    });
    return data;
  });

  // === Modal & Edit Functions ===
  const handleAddYear = () => {
    const lastYearStr = studentYears[studentYears.length - 1] ?? '2025';
    const nextYear = String(Number(lastYearStr) + 1);
    setStudentBodyData(prev => [...prev, {
      year: nextYear,
      "Tel-U Jakarta": 0,
      "Tel-U Surabaya": 0,
      "Tel-U Purwokerto": 0,
      "Tel-U Bandung": 0,
    }]);
  };

  const handleInputChange = (campus: keyof CampusData, yearIndex: number, value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (isNaN(num)) return;
    const newData = [...studentBodyData];
    if (newData[yearIndex]) {
      newData[yearIndex] = { ...newData[yearIndex], [campus]: num };
      setStudentBodyData(newData);
    }
  };

  const handleAddAccreditationYear = () => {
    const lastYearStr = accreditationYears[accreditationYears.length - 1] ?? '2025';
    const nextYear = String(Number(lastYearStr) + 1);
    setAccreditationYears(prev => [...prev, nextYear]);
    (Object.keys(accreditationInputData) as Array<keyof CampusData>).forEach((campus) => {
      setAccreditationInputData(prev => ({
        ...prev,
        [campus]: [...prev[campus], 0],
      }));
    });
  };

  const handleAccreditationChange = (campus: keyof CampusData, yearIndex: number, value: string) => {
    const num = value === '' ? 0 : Math.max(0, Math.min(100, Number(value)));
    if (isNaN(num)) return;
    setAccreditationInputData(prev => ({
      ...prev,
      [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    }));
  };

  const handleGenerate = () => setShowModal(false);

  const handleDownload = () => {
    const dataToDownload = accreditationYears.map((year, idx) => ({
      tahun: year,
      Jakarta: accreditationInputData["Tel-U Jakarta"][idx] ?? 0,
      Bandung: accreditationInputData["Tel-U Bandung"][idx] ?? 0,
      Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] ?? 0,
      Surabaya: accreditationInputData["Tel-U Surabaya"][idx] ?? 0,
    }));

    if (dataToDownload.length === 0) {
      alert("Belum ada data akreditasi prodi untuk diunduh.");
      return;
    }

    const csv = [
      ["Tahun", "Jakarta", "Bandung", "Purwokerto", "Surabaya"],
      ...dataToDownload.map((row) => [
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

  const studentColors = ["#A966FF", "#FF0000", "#5D77ff", "#FFB930", "#10B981"];

  // === Variabel Data (Statis) ===
  const semesterData = [
    { kampus: "Tel-U Jakarta", periode: "2021 Ganjil", Akademik: 88, SDM: 82, Keuangan: 75, Kemahasiswaan: 70 },
    { kampus: "Tel-U Jakarta", periode: "2021 Genap", Akademik: 89, SDM: 83, Keuangan: 76, Kemahasiswaan: 72 },
    { kampus: "Tel-U Jakarta", periode: "2022 Ganjil", Akademik: 90, SDM: 85, Keuangan: 78, Kemahasiswaan: 75 },
    { kampus: "Tel-U Jakarta", periode: "2022 Genap", Akademik: 91, SDM: 86, Keuangan: 80, Kemahasiswaan: 77 },
    { kampus: "Tel-U Jakarta", periode: "2023 Ganjil", Akademik: 92, SDM: 88, Keuangan: 82, Kemahasiswaan: 80 },
    { kampus: "Tel-U Jakarta", periode: "2023 Genap", Akademik: 93, SDM: 89, Keuangan: 84, Kemahasiswaan: 82 },
    { kampus: "Tel-U Jakarta", periode: "2024 Ganjil", Akademik: 94, SDM: 90, Keuangan: 86, Kemahasiswaan: 85 },

    { kampus: "Tel-U Bandung", periode: "2021 Ganjil", Akademik: 92, SDM: 87, Keuangan: 85, Kemahasiswaan: 80 },
    { kampus: "Tel-U Bandung", periode: "2021 Genap", Akademik: 93, SDM: 88, Keuangan: 86, Kemahasiswaan: 82 },
    { kampus: "Tel-U Bandung", periode: "2022 Ganjil", Akademik: 94, SDM: 90, Keuangan: 88, Kemahasiswaan: 85 },
    { kampus: "Tel-U Bandung", periode: "2022 Genap", Akademik: 95, SDM: 91, Keuangan: 90, Kemahasiswaan: 87 },
    { kampus: "Tel-U Bandung", periode: "2023 Ganjil", Akademik: 96, SDM: 92, Keuangan: 91, Kemahasiswaan: 89 },
    { kampus: "Tel-U Bandung", periode: "2023 Genap", Akademik: 97, SDM: 93, Keuangan: 92, Kemahasiswaan: 90 },
    { kampus: "Tel-U Bandung", periode: "2024 Ganjil", Akademik: 98, SDM: 94, Keuangan: 93, Kemahasiswaan: 91 },

    { kampus: "Tel-U Surabaya", periode: "2021 Ganjil", Akademik: 85, SDM: 80, Keuangan: 70, Kemahasiswaan: 68 },
    { kampus: "Tel-U Surabaya", periode: "2021 Genap", Akademik: 86, SDM: 81, Keuangan: 72, Kemahasiswaan: 70 },
    { kampus: "Tel-U Surabaya", periode: "2022 Ganjil", Akademik: 87, SDM: 83, Keuangan: 75, Kemahasiswaan: 73 },
    { kampus: "Tel-U Surabaya", periode: "2022 Genap", Akademik: 88, SDM: 84, Keuangan: 77, Kemahasiswaan: 75 },
    { kampus: "Tel-U Surabaya", periode: "2023 Ganjil", Akademik: 89, SDM: 85, Keuangan: 79, Kemahasiswaan: 78 },
    { kampus: "Tel-U Surabaya", periode: "2023 Genap", Akademik: 90, SDM: 86, Keuangan: 80, Kemahasiswaan: 80 },
    { kampus: "Tel-U Surabaya", periode: "2024 Ganjil", Akademik: 91, SDM: 87, Keuangan: 82, Kemahasiswaan: 82 },

    { kampus: "Tel-U Purwokerto", periode: "2021 Ganjil", Akademik: 80, SDM: 75, Keuangan: 68, Kemahasiswaan: 65 },
    { kampus: "Tel-U Purwokerto", periode: "2021 Genap", Akademik: 82, SDM: 76, Keuangan: 70, Kemahasiswaan: 67 },
    { kampus: "Tel-U Purwokerto", periode: "2022 Ganjil", Akademik: 84, SDM: 78, Keuangan: 73, Kemahasiswaan: 70 },
    { kampus: "Tel-U Purwokerto", periode: "2022 Genap", Akademik: 85, SDM: 79, Keuangan: 75, Kemahasiswaan: 72 },
    { kampus: "Tel-U Purwokerto", periode: "2023 Ganjil", Akademik: 86, SDM: 81, Keuangan: 77, Kemahasiswaan: 75 },
    { kampus: "Tel-U Purwokerto", periode: "2023 Genap", Akademik: 87, SDM: 82, Keuangan: 79, Kemahasiswaan: 77 },
    { kampus: "Tel-U Purwokerto", periode: "2024 Ganjil", Akademik: 88, SDM: 83, Keuangan: 81, Kemahasiswaan: 79 },
  ];

  const ALL_VARIABLES = ["Akademik", "SDM", "Keuangan", "Kemahasiswaan"] as const;
  type Variable = typeof ALL_VARIABLES[number];
  const [selectedCampus, setSelectedCampus] = useState<CampusKey | "All">("All");
  const [selectedVariables, setSelectedVariables] = useState<Variable[]>(["Akademik"]);
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.variable-dropdown-wrapper')) {
        setShowVariableDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 px-4 py-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <div className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center" style={{ backgroundImage: "url('/KC.png')" }}>
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-1 p-3 z-10">
            <div className="flex items-center justify-center w-10 h-10 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">UPPS/Kampus Cabang</span>
            <div className="text-xl font-bold">{loading ? '...' : dashboardData.totalBranches}</div>
          </div>
        </div>

        <div className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center" style={{ backgroundImage: "url('/Jumlah Variabel.png')" }}>
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-1 p-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <BookOpenCheckIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">Jumlah Variabel & Pertanyaan</span>
            <div className="text-xl font-bold">{loading ? '...' : dashboardData.totalVariable}</div>
          </div>
        </div>

        <div className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center" style={{ backgroundImage: "url('/Assessment Submitted.png')" }}>
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-1 p-3 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardList className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">Assessment Submitted</span>
            <div className="text-xl font-bold">{loading ? '...' : dashboardData.submittedAssessments}</div>
          </div>
        </div>

        <div className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center" style={{ backgroundImage: "url('/Assessment Approve.png')" }}>
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-1 p-3 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">Assessment Approved</span>
            <div className="text-xl font-bold">{loading ? '...' : dashboardData.approvedAssessments}</div>
          </div>
        </div>
      </div>

      {/* Progress & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress Assessment</h3>
          <ProgressAssessment 
            submitted={dashboardData.assessmentProgress?.submitted ?? 0}
            approved={dashboardData.assessmentProgress?.approved ?? 0}
            onprogress={dashboardData.assessmentProgress?.onprogress ?? 0}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Transformation Maturity Index</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Body */}
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
              {studentYears.map((year, index) => (
                <Bar
                  key={year}
                  dataKey={year}
                  fill={studentColors[index % studentColors.length]}
                  radius={[10, 10, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accreditation */}
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
            <LineChart data={accreditationYears.map((year, idx) => ({
              tahun: year,
              Jakarta: accreditationInputData["Tel-U Jakarta"][idx] ?? 0,
              Bandung: accreditationInputData["Tel-U Bandung"][idx] ?? 0,
              Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] ?? 0,
              Surabaya: accreditationInputData["Tel-U Surabaya"][idx] ?? 0,
            }))}>
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

      {/* Perkembangan Variabel per Kampus */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">📊 Perkembangan Variabel per Kampus</h3>
            <p className="text-sm text-gray-500 mt-1">Skor perkembangan per semester akademik (Ganjil/Genap)</p>
          </div>

          <div className="flex flex-wrap gap-4 ml-auto">
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">FilterWhere Kampus</label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as CampusKey | "All")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="All">Semua Kampus</option>
                {CAMPUS_LIST.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus.replace("Tel-U ", "")}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px] variable-dropdown-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">FilterWhere Variabel</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVariableDropdown(!showVariableDropdown)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  {selectedVariables.length === 0
                    ? "Pilih Variabel"
                    : `${selectedVariables.length} variabel dipilih`}
                </button>

                {showVariableDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {ALL_VARIABLES.map((variable) => (
                      <label
                        key={variable}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedVariables.includes(variable)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVariables((prev) => [...prev, variable]);
                            } else {
                              setSelectedVariables((prev) => prev.filter((v) => v !== variable));
                            }
                          }}
                          className="mr-2"
                        />
                        {variable}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={(() => {
              const campuses = selectedCampus === "All" ? CAMPUS_LIST : [selectedCampus];
              const periods = Array.from(new Set(semesterData.map(d => d.periode)));
              return selectedVariables.map(variable => {
                const row: { [key: string]: any } = { variabel: variable };
                periods.forEach(period => {
                  const scores = campuses
                    .map(campus => {
                      const data = semesterData.find(d => d.kampus === campus && d.periode === period);
                      return data ? data[variable as keyof typeof data] : 0;
                    })
                    .filter(score => typeof score === 'number');
                  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                  row[period] = Math.round(avg * 100) / 100;
                });
                return row;
              });
            })()}
            margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
            <XAxis dataKey="variabel" tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} label={{ value: 'Skor (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: number) => [value.toFixed(2) + '%', 'Skor']}
              labelStyle={{ color: '#fff' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 20, fontSize: '12px', color: '#4b5563' }} />
            {Array.from(new Set(semesterData.map(d => d.periode))).map(period => (
              <Bar
                key={period}
                dataKey={period}
                fill={{
                  '2021 Ganjil': '#6366f1',
                  '2021 Genap': '#8b5cf6',
                  '2022 Ganjil': '#ec4899',
                  '2022 Genap': '#f59e0b',
                  '2023 Ganjil': '#10b981',
                  '2023 Genap': '#06b6d4',
                  '2024 Ganjil': '#ef4444',
                }[period]}
                name={period}
                radius={[6, 6, 0, 0]}
                animationDuration={600}
                maxBarSize={60}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabel */}
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
                      {studentBodyData.map((row, j) => (
                        <td key={j} className="px-2 py-1">
                          <input
                            type="number"
                            value={row[campus] === null || row[campus] === 0 ? "" : row[campus]}
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