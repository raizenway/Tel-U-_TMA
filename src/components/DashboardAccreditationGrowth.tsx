'use client';

import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface YearlyData {
  year: number;
  total: number;
}

interface Branch {
  id: number;
  name: string;
  email: string;
  yearlyAccreditationGrowth: YearlyData[];
}

interface DashboardApiResponse {
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

const cleanYearlyData = (rawData: YearlyData[]): YearlyData[] => {
  if (!Array.isArray(rawData)) return [];
  return rawData
    .map((item) => {
      if (typeof item?.year !== 'number' || typeof item?.total !== 'number') return null;
      return { year: item.year, total: item.total };
    })
    .filter((item): item is YearlyData => item !== null);
};

const generateColor = (index: number) => {
  const colors = [
    '#36A2EB', '#FF6384', '#FF9F40', '#4BC0C0', '#9966FF',
    '#FFCD56', '#8E5EA2', '#329965', '#C9CBCF', '#F66B6B',
  ];
  return colors[index % colors.length];
};

export default function DashboardAccreditationGrowth() {
  const currentUser = getCurrentUser();
  const userRoleId = currentUser?.roleId;
  const userBranchId = currentUser?.branchId;

  const [campusList, setCampusList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [accreditationData, setAccreditationData] = useState<Record<string, number[]>>({});

  const [filteredCampus, setFilteredCampus] = useState<string>('all');
  const [filteredYear, setFilteredYear] = useState<string>('all');

  const apiDataRef = useRef<DashboardApiResponse | null>(null);

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

      let branches = apiData.branches;
      if (userRoleId !== 1 && userBranchId) {
        branches = apiData.branches.filter((b) => b.id === userBranchId);
      }

      const years = new Set<string>();
      const campuses = branches.map((b) => b.name);

      for (const branch of branches) {
        const cleaned = cleanYearlyData(branch.yearlyAccreditationGrowth);
        for (const item of cleaned) {
          years.add(item.year.toString());
        }
      }

      const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));
      setYearList(sortedYears);
      setCampusList(campuses);

      const data: Record<string, number[]> = {};
      for (const campus of campuses) {
        const branch = branches.find((b) => b.name === campus);
        const cleaned = cleanYearlyData(branch?.yearlyAccreditationGrowth || []);
        data[campus] = sortedYears.map((yearStr) => {
          const yearNum = Number(yearStr);
          const item = cleaned.find((d) => d.year === yearNum);
          return item ? item.total : 0;
        });
      }
      setAccreditationData(data);
    } catch (error) {
      console.error('Error fetching accreditation growth data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Data untuk chart (terfilter) ---
  const visibleCampuses = filteredCampus === 'all' ? campusList : [filteredCampus];
  const visibleYears = filteredYear === 'all' ? yearList : [filteredYear];

  const chartData = visibleYears.map((year) => {
    const yearIndex = yearList.indexOf(year);
    const entry: Record<string, string | number> = { tahun: year };
    visibleCampuses.forEach((campus) => {
      entry[campus] = accreditationData[campus]?.[yearIndex] ?? 0;
    });
    return entry;
  });

  // --- Unduh CSV: tetap semua data (bisa diubah jika ingin terfilter) ---
  const handleDownload = () => {
    if (yearList.length === 0 || campusList.length === 0) {
      alert('Belum ada data akreditasi untuk diunduh.');
      return;
    }

    const headers = ['Tahun', ...campusList];
    const rows = yearList.map((year, idx) => {
      const row = [year];
      campusList.forEach((campus) => {
        row.push((accreditationData[campus]?.[idx] ?? 0).toFixed(2));
      });
      return row;
    });

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'akreditasi_prodi.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-semibold text-gray-700">📈 Pertumbuhan Akreditasi Prodi</h3>

        {/* Filter Controls */}
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

          {/* Unduh */}
          <button
            onClick={handleDownload}
            className="text-gray-500 hover:text-gray-700"
            title="Unduh Data Akreditasi"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} key={`${filteredCampus}-${filteredYear}`}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tahun" />
          <YAxis domain={[0, 100]} tickCount={6} />
          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
          <Legend />
          {visibleCampuses.map((campus, idx) => (
            <Line
              key={campus}
              type="monotone"
              dataKey={campus}
              stroke={generateColor(idx)}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}