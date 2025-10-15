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

type CampusKey = 
  | "Tel-U Jakarta"
  | "Tel-U Surabaya"
  | "Tel-U Purwokerto"
  | "Tel-U Bandung";

interface YearlyData {
  year: number;
  total: number;
}

interface Branch {
  id: number;
  name: CampusKey;
  email: string;
  branchDetails: unknown[];
  yearlyStudentBody: YearlyData[];
  yearlyAccreditationGrowth: YearlyData[];
}

interface TransformationMaturityItem {
  name: string;
  value: number;
}

interface GrowthDataPoint {
  periodName: string;
  score: number;
}

interface VariableGrowth {
  variable: { id: number; name: string };
  data: GrowthDataPoint[];
}

interface BranchGrowth {
  branch: { id: number; name: CampusKey };
  growth: VariableGrowth[];
}

interface DashboardApiResponse {
  totalBranches: number;
  totalVariable: number;
  totalAssessments: number;
  approvedAssessments: number;
  onprogressAssessments: number;
  submittedAssessments: number;
  assessmentProgress: {
    onprogress: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  transformationMaturityIndex: TransformationMaturityItem[];
  transformationVariableBranchGrowth: BranchGrowth[];
  branches: Branch[];
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
    "Tel-U Jakarta": number;
    "Tel-U Surabaya": number;
    "Tel-U Purwokerto": number;
    "Tel-U Bandung": number;
  }[]>([]);

  const [accreditationInputData, setAccreditationInputData] = useState<{
    "Tel-U Jakarta": number[];
    "Tel-U Surabaya": number[];
    "Tel-U Purwokerto": number[];
    "Tel-U Bandung": number[];
  }>({
    "Tel-U Jakarta": [],
    "Tel-U Surabaya": [],
    "Tel-U Purwokerto": [],
    "Tel-U Bandung": [],
  });
  const [accreditationYears, setAccreditationYears] = useState<string[]>([]);

  const [radarData, setRadarData] = useState<{ subject: string; A: number }[]>([]);
  const [apiVariables, setApiVariables] = useState<string[]>([]);
  const [variableGrowthData, setVariableGrowthData] = useState<
    { branch: CampusKey; variable: string; period: string; score: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ✅ HANYA SATU KAMPUS — DEFAULT BANDUNG
  const [selectedCampus, setSelectedCampus] = useState<CampusKey>("Tel-U Bandung");
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);

  // Close dropdown on outside click
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

  // Auto-select first variable
  useEffect(() => {
    if (apiVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables([apiVariables[0]]);
    }
  }, [apiVariables, selectedVariables]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/assessment/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const result = await response.json();
        const apiData = result.data as DashboardApiResponse;

        setDashboardData({
          totalBranches: apiData.totalBranches || 0,
          totalVariable: apiData.totalVariable || 0,
          submittedAssessments: apiData.submittedAssessments || 0,
          approvedAssessments: apiData.approvedAssessments || 0,
          assessmentProgress: apiData.assessmentProgress || { onprogress: 0, submitted: 0, approved: 0, rejected: 0 },
        });

        const yearStrings = ['2021', '2022', '2023', '2024', '2025'];
       // Definisikan tipe helper
type StudentBodyRow = {
  year: string;
  "Tel-U Jakarta": number;
  "Tel-U Surabaya": number;
  "Tel-U Purwokerto": number;
  "Tel-U Bandung": number;
};

const studentBodyFormatted: StudentBodyRow[] = yearStrings.map(yearStr => {
  const yearNum = Number(yearStr);
  
                // Inisialisasi dengan nilai default 0
                const row: StudentBodyRow = {
                  year: yearStr,
                  "Tel-U Jakarta": 0,
                  "Tel-U Surabaya": 0,
                  "Tel-U Purwokerto": 0,
                  "Tel-U Bandung": 0,
                };

                // Isi data dari API jika tersedia
                for (const branch of apiData.branches) {
                  const campusName = branch.name;
                  if (campusName in row) {
                    const dataForYear = branch.yearlyStudentBody?.find((item: any) => item.year === yearNum);
                    if (dataForYear && typeof dataForYear.total === 'number') {
                      row[campusName] = dataForYear.total;
                    }
                  }
                }

                return row;
              });

              setStudentBodyData(studentBodyFormatted); // ✅ Sekarang valid

        const accreditationFormatted = yearStrings.map(yearStr => {
          const yearNum = Number(yearStr);
          const row = {
            "Tel-U Jakarta": 0,
            "Tel-U Surabaya": 0,
            "Tel-U Purwokerto": 0,
            "Tel-U Bandung": 0,
          } as Record<CampusKey, number>;
          for (const branch of apiData.branches) {
            const campusName = branch.name;
            const dataForYear = branch.yearlyAccreditationGrowth.find(item => item.year === yearNum);
            if (dataForYear) {
              row[campusName] = dataForYear.total;
            }
          }
          return row;
        });

        setAccreditationYears(yearStrings);
        setAccreditationInputData({
          "Tel-U Jakarta": accreditationFormatted.map(r => r["Tel-U Jakarta"]),
          "Tel-U Surabaya": accreditationFormatted.map(r => r["Tel-U Surabaya"]),
          "Tel-U Purwokerto": accreditationFormatted.map(r => r["Tel-U Purwokerto"]),
          "Tel-U Bandung": accreditationFormatted.map(r => r["Tel-U Bandung"]),
        });

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

        const uniqueRadar = Array.from(
          new Map(validTmi.map(item => [item.subject, item])).values()
        );
        setRadarData(uniqueRadar.length > 0 ? uniqueRadar : [
          { subject: "Mutu", A: 80 },
          { subject: "Akademik", A: 60 },
        ]);

        // Ekstrak variabel & growth data
        const allVariablesSet = new Set<string>();
        const growthData: { branch: CampusKey; variable: string; period: string; score: number }[] = [];

        for (const branch of apiData.branches) {
          const branchName = branch.name;
          const growth = apiData.transformationVariableBranchGrowth.find(
            (b) => b.branch.name === branchName
          )?.growth || [];

          for (const variableEntry of growth) {
            const varName = variableEntry.variable.name.trim();
            if (varName === '') continue;
            allVariablesSet.add(varName);

            for (const dataPoint of variableEntry.data) {
              if (typeof dataPoint.score === 'number') {
                growthData.push({
                  branch: branchName,
                  variable: varName,
                  period: dataPoint.periodName,
                  score: dataPoint.score,
                });
              }
            }
          }
        }

        setApiVariables(Array.from(allVariablesSet));
        setVariableGrowthData(growthData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Student chart data
  const studentYears = Array.from(new Set(studentBodyData.map(d => d.year))).sort((a, b) => Number(a) - Number(b));
  const studentDataByCampus = CAMPUS_LIST.map((campus) => {
    const data: { [key: string]: string | number } = { kampus: campus.replace("Tel-U ", "") };
    studentYears.forEach((year) => {
      const item = studentBodyData.find(d => d.year === year);
      data[year] = item ? (item[campus] ?? 0) : 0;
    });
    return data;
  });

  // Modal handlers
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

  const handleInputChange = (campus: CampusKey, yearIndex: number, value: string) => {
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
    (Object.keys(accreditationInputData) as CampusKey[]).forEach((campus) => {
      setAccreditationInputData(prev => ({
        ...prev,
        [campus]: [...prev[campus], 0],
      }));
    });
  };

  const handleAccreditationChange = (campus: CampusKey, yearIndex: number, value: string) => {
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

  const getPeriodColor = (period: string) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#06b6d4', '#ef4444', '#d946ef', '#f97316', '#84cc16'
    ];
    const uniquePeriods = Array.from(
      new Set(variableGrowthData.map(d => d.period))
    ).sort();
    const idx = uniquePeriods.indexOf(period);
    return colors[idx >= 0 ? idx % colors.length : 0];
  };

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampus</label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value as CampusKey)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                {/* ✅ HANYA 4 KAMPUS — TANPA "SEMUA KAMPUS" */}
                {CAMPUS_LIST.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus.replace("Tel-U ", "")}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px] variable-dropdown-wrapper">
              <label className="block text-sm font-medium text-gray-700 mb-1">Variabel</label>
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
                    {apiVariables.map((variable) => (
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

        {/* ✅ GRAFIK TANPA RATA-RATA — HANYA NILAI ASLI PER KAMPUS */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={(() => {
              if (selectedVariables.length === 0) return [];

              const periods = Array.from(new Set(variableGrowthData.map(d => d.period))).sort();

              return selectedVariables.map(variable => {
                const row: { [key: string]: any } = { variabel: variable };

                periods.forEach(period => {
                  const matching = variableGrowthData.find(d => 
                    d.branch === selectedCampus &&
                    d.variable === variable &&
                    d.period === period
                  );
                  row[period] = matching ? matching.score : 0;
                });

                return row;
              });
            })()}
            margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
          >
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
            <XAxis dataKey="variabel" tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} label={{ value: 'Skor', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: 12 }} />
            <Tooltip
  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
  formatter={(value: number) => [value.toFixed(0), 'Skor']}
  labelStyle={{ color: '#fff' }}
/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 20, fontSize: '12px', color: '#4b5563' }} />
            {Array.from(new Set(variableGrowthData.map(d => d.period))).sort().map(period => (
              <Bar
                key={period}
                dataKey={period}
                fill={getPeriodColor(period)}
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
                            value={row[campus] === 0 ? "" : row[campus]}
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