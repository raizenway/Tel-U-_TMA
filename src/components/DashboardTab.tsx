'use client';

import { useState, useEffect, useRef } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ProgressAssessment from '@/components/ProgressAssessment';
import AssessmentTable from './AssessmentTable';
import Button from './button';
import { Building2, ClipboardList, ClipboardCheck, BookOpenCheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardStudentBody from './DashboardStudentBody';
import DashboardAccreditationGrowth from './DashboardAccreditationGrowth';

// --- Tipe Data (SESUAI API) ---
interface YearlyData { year: number; total: number; }
interface Branch {
  id: number;
  name: string;
  email: string;
  yearlyStudentBody: YearlyData[];
  yearlyAccreditationGrowth: YearlyData[];
}
interface TransformationMaturityItem { name: string; value: number; }
interface GrowthDataPoint { periodName: string; score: number; }
interface VariableGrowth {
  variable: { id: number; name: string };
   data:GrowthDataPoint[]; // ✅ 'data' untuk GrowthDataPoint
}
interface BranchGrowth {
  branch: { id: number; name: string };
  growth: VariableGrowth[]; // ✅ 'growth' untuk array VariableGrowth
}
interface TmiEntry { branch: { id: number; name: string }; tmi: TransformationMaturityItem[]; }
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

const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const formatPeriodName = (period: string): string => period.replace(/^:\s*/, '');
const getPeriodColor = (period: string, allPeriods: string[]): string => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#d946ef', '#f97316', '#84cc16'];
  const idx = allPeriods.indexOf(period);
  return colors[idx >= 0 ? idx % colors.length : 0];
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

const CAMPUS_LIST = [
  "Tel-U Jakarta",
  "Tel-U Surabaya",
  "Tel-U Purwokerto",
  "Tel-U Bandung",
] as const;

const branchIdToName: Record<number, string> = {
  1: "Tel-U Bandung",
  2: "Tel-U Jakarta",
  3: "Tel-U Surabaya",
  4: "Tel-U Purwokerto",
};

export default function DashboardTab() {
  const currentUser = getCurrentUser();
  const userRoleId = currentUser?.roleId;
  const userBranchId = currentUser?.branchId;

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

  const [tmiRadarData, setTmiRadarData] = useState<TmiRadarRow[]>([]);
  const [apiVariables, setApiVariables] = useState<string[]>([]);
  const [variableGrowthData, setVariableGrowthData] = useState<
    { branch: string; variable: string; period: string; score: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  
  const apiDataRef = useRef<DashboardApiResponse | null>(null);

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

      let filteredBranches = apiData.branches;
      if (userRoleId !== 1 && userBranchId) {
        filteredBranches = apiData.branches.filter(b => b.id === userBranchId);
      }

      setDashboardData({
        totalBranches: filteredBranches.length,
        totalVariable: apiData.totalVariable || 0,
        submittedAssessments: apiData.submittedAssessments || 0,
        approvedAssessments: apiData.approvedAssessments || 0,
        assessmentProgress: apiData.assessmentProgress || { onprogress: 0, submitted: 0, approved: 0, rejected: 0 },
      });

      let filteredTmi = apiData.transformationMaturityIndex;
      if (userRoleId !== 1 && userBranchId) {
        filteredTmi = apiData.transformationMaturityIndex.filter(t => t.branch.id === userBranchId);
      }

      const firstTmi = filteredTmi[0]?.tmi || [];
      const rawNames = firstTmi.map(i => i.name.trim());
      const uniqueNames = Array.from(new Set(rawNames)).filter(name => name !== '');
      const radarRows = uniqueNames.map(subject => {
        const row: TmiRadarRow = { subject };
        filteredTmi.forEach(entry => {
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
      const growthData: { branch: string; variable: string; period: string; score: number }[] = [];
      for (const branch of filteredBranches) {
        const branchName = branch.name;
        // ✅ Akses dengan .growth (sesuai API)
        const growth = apiData.transformationVariableBranchGrowth.find(b => b.branch.name === branchName)?.growth || [];
        for (const variableEntry of growth) {
          const varName = variableEntry.variable.name.trim();
          if (varName === '') continue;
          allVariablesSet.add(varName);
          // ✅ Akses data point dengan .data
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

      const yearsSet = new Set<string>();
      growthData.forEach(item => {
        const match = item.period.match(/(\d{4})/);
        if (match) yearsSet.add(match[1]);
      });
      setAvailableYears(Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a)));

      const defaultCampus = filteredBranches.length > 0 ? filteredBranches[0].name : '';
      setSelectedCampus(defaultCampus);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard', error);
      setLoading(false);
    }
  };

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
    fetchData();
  }, []);

  const router = useRouter();

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Transformation Maturity Index</h3>
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => router.push('/assessment-result')}
                className="h-8 px-4 py-1 text-sm font-semibold rounded flex items-center gap-2"
              >
                Lihat Detail
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center">
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
        <DashboardStudentBody />
        <DashboardAccreditationGrowth />
      </div>

      {/* ✅ Perkembangan Variabel per Kampus — Final */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">📊 Perkembangan Variabel per Kampus</h3>
            <p className="text-sm text-gray-500 mt-1">
              Skor perkembangan per semester akademik (Ganjil/Genap)
            </p>
          </div>
          <div className="flex flex-wrap gap-4 ml-auto">
            {userRoleId === 1 && (
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampus</label>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {apiDataRef.current?.branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Semua Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {selectedVariables.length === 0
                    ? "Pilih Variabel"
                    : selectedVariables.length === apiVariables.length
                    ? "Semua variabel"
                    : `${selectedVariables.length} dipilih`}
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
              if (selectedVariables.length === 0 || !selectedCampus) return [];
              const rawPeriods = Array.from(new Set(variableGrowthData.map(d => d.period)));
              const filteredPeriods = rawPeriods.filter(period => {
                const clean = formatPeriodName(period);
                const isSemMatch = selectedSemester === 'all' || 
                  (selectedSemester === 'Ganjil' && clean.startsWith('Ganjil')) ||
                  (selectedSemester === 'Genap' && clean.startsWith('Genap'));
                const isYearMatch = selectedYear === 'all' || (clean.match(/(\d{4})/)?.[1] === selectedYear);
                return isSemMatch && isYearMatch;
              });
              const formattedPeriods = filteredPeriods.map(p => formatPeriodName(p)).sort();
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
              const filteredPeriods = rawPeriods.filter(period => {
                const clean = formatPeriodName(period);
                const isSemMatch = selectedSemester === 'all' || 
                  (selectedSemester === 'Ganjil' && clean.startsWith('Ganjil')) ||
                  (selectedSemester === 'Genap' && clean.startsWith('Genap'));
                const isYearMatch = selectedYear === 'all' || (clean.match(/(\d{4})/)?.[1] === selectedYear);
                return isSemMatch && isYearMatch;
              });
              const formattedPeriods = filteredPeriods.map(p => formatPeriodName(p)).sort();
              return formattedPeriods;
            })().map(periodLabel => (
              <Bar
                key={periodLabel}
                dataKey={periodLabel}
                fill={getPeriodColor(periodLabel, (() => {
                  const raw = Array.from(new Set(variableGrowthData.map(d => d.period)));
                  const filtered = raw.filter(p => {
                    const clean = formatPeriodName(p);
                    const sm = selectedSemester === 'all' || 
                      (selectedSemester === 'Ganjil' && clean.startsWith('Ganjil')) ||
                      (selectedSemester === 'Genap' && clean.startsWith('Genap'));
                    const ym = selectedYear === 'all' || (clean.match(/(\d{4})/)?.[1] === selectedYear);
                    return sm && ym;
                  });
                  return filtered.map(p => formatPeriodName(p)).sort();
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

      <div className="mt-6">
        <AssessmentTable hideStartButton={true} />
      </div>
    </div>
  );
}