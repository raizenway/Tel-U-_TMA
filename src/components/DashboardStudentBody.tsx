'use client';

import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudentBodyData } from '@/hooks/useStudentBody';

interface YearlyData {
  year: number;
  total: number;
}

interface Branch {
  id: number;
  name: string;
  email: string;
  yearlyStudentBody: YearlyData[];
}

interface DashboardApiResponse {
  branches: Branch[];
  // ... other fields (opsional, tidak dipakai di sini)
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

const cleanYearlyData = (rawData: YearlyData[]): YearlyData[] => {
  if (!Array.isArray(rawData)) return [];
  return rawData
    .map((item) => {
      if (typeof item?.year !== 'number' || typeof item?.total !== 'number') return null;
      return { year: item.year, total: item.total };
    })
    .filter((item): item is YearlyData => item !== null);
};

export default function DashboardStudentBody() {
  const currentUser = getCurrentUser();
  const userRoleId = currentUser?.roleId;
  const userBranchId = currentUser?.branchId;

  const [yearList, setYearList] = useState<string[]>([]);
  const [campusList, setCampusList] = useState<string[]>([]);
  const [studentBodyData, setStudentBodyData] = useState<Record<string, any>[]>([]);
  const [filteredCampus, setFilteredCampus] = useState<string>('all');
  const [filteredYear, setFilteredYear] = useState<string>('all');

  const { saveToApi: saveStudentBody } = useStudentBodyData();
  const apiDataRef = useRef<DashboardApiResponse | null>(null);

  // Warna dinamis (opsional, bisa diganti dengan skema warna responsif)
  const generateColor = (index: number) => {
    const colors = ['#FF6384', '#36A2EB', '#4BC0C0', '#FF9F40', '#9966FF', '#FFCD56', '#8E5EA2', '#329965'];
    return colors[index % colors.length];
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URL is not defined');
      const response = await fetch(`${baseUrl}/assessment/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      const apiData = result.data as DashboardApiResponse;
      apiDataRef.current = apiData;

      // Filter cabang berdasarkan peran
      let branches = apiData.branches;
      if (userRoleId !== 1 && userBranchId) {
        branches = apiData.branches.filter((b) => b.id === userBranchId);
      }

      const years = new Set<string>();
      const campuses = new Set<string>();

      // Kumpulkan tahun dan kampus
      for (const branch of branches) {
        campuses.add(branch.name);
        const cleaned = cleanYearlyData(branch.yearlyStudentBody);
        for (const item of cleaned) {
          years.add(item.year.toString());
        }
      }

      const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));
      const sortedCampuses = Array.from(campuses).sort();

      setYearList(sortedYears);
      setCampusList(sortedCampuses);

      // Format data: [ { year: "2023", "Tel-U Bandung": 1200, ... }, ... ]
      const formatted = sortedYears.map((yearStr) => {
        const yearNum = Number(yearStr);
        const row: Record<string, string | number> = { year: yearStr };
        for (const branch of branches) {
          const campus = branch.name;
          const cleaned = cleanYearlyData(branch.yearlyStudentBody);
          const entry = cleaned.find((item) => item.year === yearNum);
          row[campus] = entry ? entry.total : 0;
        }
        return row;
      });

      setStudentBodyData(formatted);
    } catch (error) {
      console.error('Error fetching dashboard', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Siapkan data untuk chart ---
  const chartData = campusList
    .filter(campus => filteredCampus === 'all' || campus === filteredCampus)
    .map(campus => {
      const data: Record<string, string | number> = { kampus: campus };
      const yearsToShow = filteredYear === 'all' ? yearList : [filteredYear];
      yearsToShow.forEach(year => {
        const item = studentBodyData.find(d => d.year === year);
        data[year] = item ? (item[campus] ?? 0) : 0;
      });
      return data;
    });

  const visibleYears = filteredYear === 'all' ? yearList : [filteredYear];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filter Kampus */}
          <select
            value={filteredCampus}
            onChange={(e) => setFilteredCampus(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Campuses</option>
            {campusList.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            value={filteredYear}
            onChange={(e) => setFilteredYear(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Years</option>
            {yearList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Tombol Unduh */}
          <button className="text-gray-500 hover:text-gray-700" title="Unduh Data">
            <Download size={18} />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} key={`${filteredCampus}-${filteredYear}`}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="kampus" />
          <YAxis />
          <Tooltip />
          <Legend />
          {visibleYears.map((year, idx) => (
            <Bar
              key={year}
              dataKey={year}
              fill={generateColor(idx)}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}