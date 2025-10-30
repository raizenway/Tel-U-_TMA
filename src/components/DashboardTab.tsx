'use client';
import { useState, useEffect, useRef } from 'react';
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
import { useStudentBodyData } from '@/hooks/useStudentBody';
import { useAccreditationData } from '@/hooks/useAccreditation';

// --- Konstanta & Tipe ---
const FIXED_YEARS = Array.from({ length: 7 }, (_, i) => String(2021 + i));
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

interface YearlyData { year: number; total: number; }
interface Branch {
  id: number;
  name: CampusKey;
  email: string;
  yearlyStudentBody: YearlyData[];
  yearlyAccreditationGrowth: YearlyData[];
}
interface TransformationMaturityItem { name: string; value: number; }
interface GrowthDataPoint { periodName: string; score: number; }
interface VariableGrowth { variable: { id: number; name: string }; data: GrowthDataPoint[]; }
interface BranchGrowth { branch: { id: number; name: CampusKey }; growth: VariableGrowth[]; }
interface TmiEntry { branch: { id: number; name: CampusKey }; tmi: TransformationMaturityItem[]; }
interface DashboardApiResponse {
  totalBranches: number;
  totalVariable: number;
  totalAssessments: number;
  approvedAssessments: number;
  onprogressAssessments: number;
  submittedAssessments: number;
  assessmentProgress: { onprogress: number; submitted: number; approved: number; rejected: number; };
  transformationMaturityIndex: TmiEntry[];
  transformationVariableBranchGrowth: BranchGrowth[];
  branches: Branch[];
}

// --- Helper Functions ---
const cleanYearlyData = (rawData: YearlyData[]): YearlyData[] => {
  if (!Array.isArray(rawData)) return [];
  return rawData
    .map(item => {
      let year = item.year;
      if (typeof year === 'number') {
        const parsed = Number(year);
        if (isNaN(parsed)) return null;
        year = parsed;
      }
      if (typeof year !== 'number' || typeof item.total !== 'number') {
        return null;
      }
      return { ...item, year };
    })
    .filter((item): item is YearlyData => item !== null);
};

const formatPeriodName = (period: string): string => period.replace(/^:\s*/, '');
const getPeriodColor = (period: string, allPeriods: string[]): string => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#d946ef', '#f97316', '#84cc16'];
  const idx = allPeriods.indexOf(period);
  return colors[idx >= 0 ? idx % colors.length : 0];
};

// ✅ Warna disesuaikan dengan gambar referensi: Bandung, Jakarta, Surabaya, Purwokerto
const studentColors = ["#FF6384", "#36A2EB", "#4BC0C0", "#FF9F40"]; // Bandung, Jakarta, Surabaya, Purwokerto

type StudentBodyRow = {
  year: string;
  "Tel-U Jakarta": number;
  "Tel-U Surabaya": number;
  "Tel-U Purwokerto": number;
  "Tel-U Bandung": number;
};

type AccreditationRow = {
  year: string;
  "Tel-U Jakarta": number;
  "Tel-U Surabaya": number;
  "Tel-U Purwokerto": number;
  "Tel-U Bandung": number;
};

interface CustomRadarTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomRadarTooltip = ({ active, payload, label }: CustomRadarTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white p-3 border rounded shadow-md text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <ul className="mt-1 space-y-1">
        {payload.map((entry, index) => (
          <li key={index} style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}</span>: {Number(entry.value).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface TmiRadarRow {
  subject: string;
  [key: string]: number | string;
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

  const [studentBodyData, setStudentBodyData] = useState<StudentBodyRow[]>([]);
  const [accreditationInputData, setAccreditationInputData] = useState<{
    "Tel-U Jakarta": number[];
    "Tel-U Surabaya": number[];
    "Tel-U Purwokerto": number[];
    "Tel-U Bandung": number[];
  }>({
    "Tel-U Jakarta": Array(7).fill(0),
    "Tel-U Surabaya": Array(7).fill(0),
    "Tel-U Purwokerto": Array(7).fill(0),
    "Tel-U Bandung": Array(7).fill(0),
  });

  const [tmiRadarData, setTmiRadarData] = useState<TmiRadarRow[]>([]);
  const [apiVariables, setApiVariables] = useState<string[]>([]);
  const [variableGrowthData, setVariableGrowthData] = useState<
    { branch: CampusKey; variable: string; period: string; score: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<CampusKey>("Tel-U Bandung");
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const [localAccreditationYears, setLocalAccreditationYears] = useState<string[]>(FIXED_YEARS);
  const [localAccreditationData, setLocalAccreditationData] = useState<{
    "Tel-U Jakarta": number[];
    "Tel-U Surabaya": number[];
    "Tel-U Purwokerto": number[];
    "Tel-U Bandung": number[];
  }>({
    "Tel-U Jakarta": Array(7).fill(0),
    "Tel-U Surabaya": Array(7).fill(0),
    "Tel-U Purwokerto": Array(7).fill(0),
    "Tel-U Bandung": Array(7).fill(0),
  });

  const { saveToApi: saveStudentBody, isSaving: isSavingStudent, error: studentSaveError } = useStudentBodyData();
  const { saveToApi: saveAccreditation, isSaving: isSavingAccreditation, error: accreditationSaveError } = useAccreditationData();
  const apiDataRef = useRef<DashboardApiResponse | null>(null);

  // --- FETCH DATA FUNCTION (reusable) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URL is not defined');
      const response = await fetch(`${baseUrl}/assessment/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      const apiData = result.data as DashboardApiResponse;
      apiDataRef.current = apiData;

      setDashboardData({
        totalBranches: apiData.totalBranches || 0,
        totalVariable: apiData.totalVariable || 0,
        submittedAssessments: apiData.submittedAssessments || 0,
        approvedAssessments: apiData.approvedAssessments || 0,
        assessmentProgress: apiData.assessmentProgress || { onprogress: 0, submitted: 0, approved: 0, rejected: 0 },
      });

      const studentBodyFormatted = FIXED_YEARS.map(yearStr => {
        const yearNum = Number(yearStr);
        const row: StudentBodyRow = {
          year: yearStr,
          "Tel-U Jakarta": 0,
          "Tel-U Surabaya": 0,
          "Tel-U Purwokerto": 0,
          "Tel-U Bandung": 0,
        };
        for (const branch of apiData.branches) {
          const campusName = branch.name;
          if (campusName in row) {
            const cleanedData = cleanYearlyData(branch.yearlyStudentBody);
            const dataForYear = cleanedData.find(item => item.year === yearNum);
            if (dataForYear) row[campusName] = dataForYear.total;
          }
        }
        return row;
      });
      setStudentBodyData(studentBodyFormatted);

      const accreditationFormatted = FIXED_YEARS.map(yearStr => {
        const yearNum = Number(yearStr);
        const row = {
          "Tel-U Jakarta": 0,
          "Tel-U Surabaya": 0,
          "Tel-U Purwokerto": 0,
          "Tel-U Bandung": 0,
        } as Record<CampusKey, number>;
        for (const branch of apiData.branches) {
          const campusName = branch.name;
          const cleanedData = cleanYearlyData(branch.yearlyAccreditationGrowth);
          const dataForYear = cleanedData.find(item => item.year === yearNum);
          if (dataForYear) row[campusName] = dataForYear.total;
        }
        return row;
      });

      const accInput = {
        "Tel-U Jakarta": accreditationFormatted.map(r => r["Tel-U Jakarta"]),
        "Tel-U Surabaya": accreditationFormatted.map(r => r["Tel-U Surabaya"]),
        "Tel-U Purwokerto": accreditationFormatted.map(r => r["Tel-U Purwokerto"]),
        "Tel-U Bandung": accreditationFormatted.map(r => r["Tel-U Bandung"]),
      };
      setAccreditationInputData(accInput);
      setLocalAccreditationData({
        'Tel-U Jakarta': [...accInput['Tel-U Jakarta']],
        'Tel-U Surabaya': [...accInput['Tel-U Surabaya']],
        'Tel-U Purwokerto': [...accInput['Tel-U Purwokerto']],
        'Tel-U Bandung': [...accInput['Tel-U Bandung']],
      });

      const { transformationMaturityIndex } = apiData;
      const firstTmi = transformationMaturityIndex[0]?.tmi || [];
      const rawNames = firstTmi.map(i => i.name.trim());
      const uniqueNames = Array.from(new Set(rawNames)).filter(name => name !== '');
      const radarRows = uniqueNames.map(subject => {
        const row: TmiRadarRow = { subject };
        transformationMaturityIndex.forEach(entry => {
          const campus = entry.branch.name;
          const found = entry.tmi.find(item => item.name.trim() === subject);
          if (found) {
            row[campus] = Number(found.value.toFixed(2));
          }
        });
        CAMPUS_LIST.forEach(campus => {
          if (!(campus in row)) {
            row[campus] = 0;
          }
        });
        return row;
      });
      setTmiRadarData(radarRows);

      const allVariablesSet = new Set<string>();
      const growthData: { branch: CampusKey; variable: string; period: string; score: number }[] = [];
      for (const branch of apiData.branches) {
        const branchName = branch.name;
        const growth = apiData.transformationVariableBranchGrowth.find(b => b.branch.name === branchName)?.growth || [];
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

  // --- EFFECTS ---
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

  useEffect(() => {
    if (apiVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables(apiVariables);
    }
  }, [apiVariables, selectedVariables]);

  useEffect(() => {
    fetchData(); // ✅ initial load
  }, []);

  // --- HANDLERS ---
  const handleAddYear = () => {
    const lastYearStr = studentBodyData.length > 0 ? studentBodyData[studentBodyData.length - 1].year : "2027";
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
    const lastYear = localAccreditationYears[localAccreditationYears.length - 1];
    const nextYear = String(Number(lastYear) + 1);
    setLocalAccreditationYears(prev => [...prev, nextYear]);
    setLocalAccreditationData(prev => ({
      ...prev,
      "Tel-U Jakarta": [...prev["Tel-U Jakarta"], 0],
      "Tel-U Surabaya": [...prev["Tel-U Surabaya"], 0],
      "Tel-U Purwokerto": [...prev["Tel-U Purwokerto"], 0],
      "Tel-U Bandung": [...prev["Tel-U Bandung"], 0],
    }));
  };

  const handleAccreditationChange = (campus: CampusKey, yearIndex: number, value: string) => {
    const num = value === '' ? 0 : Math.max(0, Math.min(100, Number(value)));
    if (isNaN(num)) return;
    setLocalAccreditationData(prev => ({
      ...prev,
      [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    }));
  };

  const handleGenerate = async () => {
    if (modalMode === 'prodi') {
      const accreditationRows: AccreditationRow[] = localAccreditationYears.map((year, idx) => ({
        year,
        "Tel-U Jakarta": localAccreditationData["Tel-U Jakarta"][idx] ?? 0,
        "Tel-U Surabaya": localAccreditationData["Tel-U Surabaya"][idx] ?? 0,
        "Tel-U Purwokerto": localAccreditationData["Tel-U Purwokerto"][idx] ?? 0,
        "Tel-U Bandung": localAccreditationData["Tel-U Bandung"][idx] ?? 0,
      }));

      const success = await saveAccreditation(accreditationRows);
      if (success) {
        await fetchData();
        setShowModal(false);
        alert('✅ Data akreditasi berhasil disimpan!');
      }
      return;
    }

    if (modalMode === 'student') {
      const success = await saveStudentBody(studentBodyData);
      if (success) {
        setShowModal(false);
        alert('✅ Data mahasiswa berhasil disimpan!');
      }
      return;
    }

    setShowModal(false);
  };

  const handleDownload = () => {
    const dataToDownload = FIXED_YEARS.map((year, idx) => ({
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
    setLocalAccreditationData({
      'Tel-U Jakarta': [...accreditationInputData['Tel-U Jakarta']],
      'Tel-U Surabaya': [...accreditationInputData['Tel-U Surabaya']],
      'Tel-U Purwokerto': [...accreditationInputData['Tel-U Purwokerto']],
      'Tel-U Bandung': [...accreditationInputData['Tel-U Bandung']],
    });
    setLocalAccreditationYears(FIXED_YEARS);
    setShowModal(true);
  };

  const studentYears = studentBodyData.map(row => row.year);
  const studentDataByCampus = CAMPUS_LIST.map((campus) => {
    const data: { [key: string]: string | number } = { kampus: campus.replace("Tel-U ", "") };
    studentYears.forEach((year) => {
      const item = studentBodyData.find(d => d.year === year);
      data[year] = item ? (item[campus] ?? 0) : 0;
    });
    return data;
  });

  // --- RENDER ---
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
            <span className="text-sm font-semibold text-center leading-tight">Jumlah Variabel</span>
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
          <div className="flex flex-col items-center">
            {/* ✅ LEGENDA SESUAI GAMBAR REFERENSI */}
            <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#FF6384] rounded-sm"></span>
                <span>Tel-U Bandung</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#36A2EB] rounded-sm"></span>
                <span>Tel-U Jakarta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#4BC0C0] rounded-sm"></span>
                <span>Tel-U Surabaya</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#FF9F40] rounded-sm"></span>
                <span>Tel-U Purwokerto</span>
              </div>
            </div>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={tmiRadarData} outerRadius="80%" innerRadius="10%">
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tickCount={6}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  />
                  {/* ✅ URUTAN RADAR SESUAI LEGENDA */}
                  <Radar name="Tel-U Bandung" dataKey="Tel-U Bandung" stroke="#FF6384" fill="#FF6384" fillOpacity={0.4} />
                  <Radar name="Tel-U Jakarta" dataKey="Tel-U Jakarta" stroke="#36A2EB" fill="#36A2EB" fillOpacity={0.4} />
                  <Radar name="Tel-U Surabaya" dataKey="Tel-U Surabaya" stroke="#4BC0C0" fill="#4BC0C0" fillOpacity={0.4} />
                  <Radar name="Tel-U Purwokerto" dataKey="Tel-U Purwokerto" stroke="#FF9F40" fill="#FF9F40" fillOpacity={0.4} />
                  <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
              {/* ✅ WARNA BAR MENGIKUTI URUTAN KAMPUS DI LEGENDA */}
              {studentYears.map((year, index) => (
                <Bar key={year} dataKey={year} fill={studentColors[index % studentColors.length]} radius={[10, 10, 0, 0]} />
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
            <LineChart data={FIXED_YEARS.map((year, idx) => ({
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
              {/* ✅ WARNA LINE SESUAI NAMA KAMPUS (Bukan Urutan Di Legend) */}
              <Line type="monotone" dataKey="Jakarta" stroke="#36A2EB" />
              <Line type="monotone" dataKey="Bandung" stroke="#FF6384" />
              <Line type="monotone" dataKey="Purwokerto" stroke="#FF9F40" />
              <Line type="monotone" dataKey="Surabaya" stroke="#4BC0C0" />
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
                    : selectedVariables.length === apiVariables.length
                      ? "Semua variabel dipilih"
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={(() => {
              if (selectedVariables.length === 0) return [];
              const rawPeriods = Array.from(new Set(variableGrowthData.map(d => d.period)));
              const formattedPeriods = rawPeriods.map(p => formatPeriodName(p)).sort();
              return selectedVariables.map(variable => {
                const row: { [key: string]: any } = { variabel: variable };
                formattedPeriods.forEach(periodLabel => {
                  const matching = variableGrowthData.find(d => 
                    d.branch === selectedCampus &&
                    d.variable === variable &&
                    formatPeriodName(d.period) === periodLabel
                  );
                  row[periodLabel] = matching ? matching.score : 0;
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
              labelStyle={{ color: '#fff' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 20, fontSize: '12px', color: '#4b5563' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const periods = payload.map(p => p.value as string).sort();
                return (
                  <ul className="flex flex-wrap gap-4 justify-center">
                    {periods.map((period, idx) => (
                      <li key={idx} style={{ color: getPeriodColor(period, periods), display: 'flex', alignItems: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getPeriodColor(period, periods),
                            marginRight: 6,
                          }}
                        />
                        {period}
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
            {(() => {
              const rawPeriods = Array.from(new Set(variableGrowthData.map(d => d.period)));
              const formattedPeriods = rawPeriods.map(p => formatPeriodName(p)).sort();
              return formattedPeriods;
            })().map(periodLabel => (
              <Bar
                key={periodLabel}
                dataKey={periodLabel}
                fill={getPeriodColor(periodLabel, (() => {
                  const rawPeriods = Array.from(new Set(variableGrowthData.map(d => d.period)));
                  return rawPeriods.map(p => formatPeriodName(p)).sort();
                })())}
                name={periodLabel}
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
        footer={null}
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
            {studentSaveError && (
              <div className="text-red-500 text-sm mt-2">{studentSaveError}</div>
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleGenerate}
                disabled={isSavingStudent}
                className={`px-6 py-2 rounded-md font-medium ${
                  isSavingStudent
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                {isSavingStudent ? 'Menyimpan...' : 'Simpan'}
              </button>
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
                    {localAccreditationYears.map((year, i) => (
                      <th key={i} className="px-2 py-1">{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAMPUS_LIST.map((campus) => (
                    <tr key={campus} className="border-b border-gray-200">
                      <td className="text-left pl-2 py-2 font-medium">{campus}</td>
                      {localAccreditationData[campus].map((value, j) => (
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
            {accreditationSaveError && (
              <div className="text-red-500 text-sm mt-2">{accreditationSaveError}</div>
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleGenerate}
                disabled={isSavingAccreditation}
                className={`px-6 py-2 rounded-md font-medium ${
                  isSavingAccreditation
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                {isSavingAccreditation ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </>
        )}
      </ModalConfirm>
    </div>
  );
}