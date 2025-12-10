'use client';

import { Download, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface YearlyData { year: number; total: number; }
interface Branch {
    id: number;
    name: string;
    email: string;
    yearlyAccreditationGrowth: YearlyData[];
}

interface DashboardApiResponse {
    totalBranches: number;
    totalVariable: number;
    totalAssessments: number;
    approvedAssessments: number;
    onprogressAssessments: number;
    submittedAssessments: number;
    assessmentProgress: { onprogress: number; submitted: number; approved: number; rejected: number; };
    branches: Branch[];
}

// ✅ Ambil user dari localStorage
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

export default function DashboardAccreditationGrowth() {
    const currentUser = getCurrentUser();
    const userRoleId = currentUser?.roleId;
    const userBranchId = currentUser?.branchId;

    const FIXED_YEARS = Array.from({ length: 7 }, (_, i) => String(2021 + i));
    const yearList = [] as any
    const branchList = [] as any

    const [localAccreditationYears, setLocalAccreditationYears] = useState<string[]>(FIXED_YEARS);
  
    const [accreditationInputData, setAccreditationInputData] = useState<{
        "Tel-U Jakarta": number[];
        "Tel-U Surabaya": number[];
        "Tel-U Purwokerto": number[];
        "Tel-U Bandung": number[];
        // "Tel-U Sumatra": number[];
      }>({
        "Tel-U Jakarta": Array(7).fill(0),
        "Tel-U Surabaya": Array(7).fill(0),
        "Tel-U Purwokerto": Array(7).fill(0),
        "Tel-U Bandung": Array(7).fill(0),
        // "Tel-U Sumatra": Array(7).fill(0),
    });

    const [localAccreditationData, setLocalAccreditationData] = useState<{
        "Tel-U Jakarta": number[];
        "Tel-U Surabaya": number[];
        "Tel-U Purwokerto": number[];
        "Tel-U Bandung": number[];
        // "Tel-U Sumatra": number[];
      }>({
        "Tel-U Jakarta": Array(7).fill(0),
        "Tel-U Surabaya": Array(7).fill(0),
        "Tel-U Purwokerto": Array(7).fill(0),
        "Tel-U Bandung": Array(7).fill(0),
        // "Tel-U Sumatra": Array(7).fill(0),
    });

    const openProdiModal = () => {
        setModalMode('prodi');
        setLocalAccreditationData({
          'Tel-U Jakarta': [...accreditationInputData['Tel-U Jakarta']],
          'Tel-U Surabaya': [...accreditationInputData['Tel-U Surabaya']],
          'Tel-U Purwokerto': [...accreditationInputData['Tel-U Purwokerto']],
          'Tel-U Bandung': [...accreditationInputData['Tel-U Bandung']],
          // 'Tel-U Sumatra': [...accreditationInputData['Tel-U Sumatra']],
        });
        setLocalAccreditationYears(FIXED_YEARS);
        setShowModal(true);
    };

    const handleDownload = () => {
        const dataToDownload = FIXED_YEARS.map((year, idx) => ({
          tahun: year,
          Jakarta: accreditationInputData["Tel-U Jakarta"][idx] ?? 0,
          Bandung: accreditationInputData["Tel-U Bandung"][idx] ?? 0,
          Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] ?? 0,
          Surabaya: accreditationInputData["Tel-U Surabaya"][idx] ?? 0,
          // Sumatra: accreditationInputData["Tel-U Sumatra"][idx] ?? 0,
        }));
        if (dataToDownload.length === 0) {
          alert("Belum ada data akreditasi prodi untuk diunduh.");
          return;
        }
        const csv = [
          ["Tahun", "Jakarta", "Bandung", "Purwokerto", "Surabaya", "Sumatra"],
          ...dataToDownload.map((row) => [
            row.tahun,
            row.Jakarta.toFixed(1),
            row.Bandung.toFixed(1),
            row.Purwokerto.toFixed(1),
            row.Surabaya.toFixed(1),
            // row.Sumatra.toFixed(1),
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

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'student' | 'prodi'>('student');
  
    type StudentBodyRow = {
        year: string;
        "Tel-U Jakarta": number;
        "Tel-U Surabaya": number;
        "Tel-U Purwokerto": number;
        "Tel-U Bandung": number;
        // "Tel-U Sumatra": number; // ✅ Tambahkan
    };

    const [studentBodyData, setStudentBodyData] = useState<StudentBodyRow[]>([]);
    console.log('currentUser', currentUser)
    console.log(studentBodyData)

    
    const studentColors = ["#FF6384", "#36A2EB", "#4BC0C0", "#FF9F40", "#9966FF"]; // Tambahkan warna untuk Sumatra
    const CAMPUS_LIST = [
        "Tel-U Jakarta",
        "Tel-U Surabaya",
        "Tel-U Purwokerto",
        "Tel-U Bandung",
        // "Tel-U Sumatra", // ✅ Tambahkan Tel-U Sumatra
    ] as const;
      
    const studentYears = studentBodyData.map(row => row.year);
    const studentDataByCampus = CAMPUS_LIST.map((campus) => {
        const data: { [key: string]: string | number } = { kampus: campus.replace("Tel-U ", "") };
        studentYears.forEach((year) => {
        const item = studentBodyData.find(d => d.year === year);
        data[year] = item ? (item[campus] ?? 0) : 0;
        });
        return data;
    });

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

        // Filter branches hanya untuk kampus user (jika bukan Super User)
        let filteredBranches = apiData.branches;
        if (userRoleId !== 1 && userBranchId) {
            filteredBranches = apiData.branches.filter(b => b.id === userBranchId);
        }

        for(const branch of apiData.branches){
            for(const item of branch.yearlyAccreditationGrowth){
                const yearStr = item.year.toString()
                if(!yearList.includes(yearStr)){
                    yearList.push(yearStr)
                }
            }

            if(!branchList.includes(branch.name)){
                branchList.push(branch.name)
            }
        }
        console.log('yearList', yearList)
        console.log('branchList', branchList)

        setLocalAccreditationYears(yearList)

        const accreditationFormatted = yearList.map(yearStr => {
            const yearNum = Number(yearStr);
            const row = {
              "Tel-U Jakarta": 0,
              "Tel-U Surabaya": 0,
              "Tel-U Purwokerto": 0,
              "Tel-U Bandung": 0,
              // "Tel-U Sumatra": 0,
            } as Record<string, number>;
            for (const branch of filteredBranches) {
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
            // "Tel-U Sumatra": accreditationFormatted.map(r => r["Tel-U Sumatra"]),
          };
          setAccreditationInputData(accInput);
          setLocalAccreditationData({
            'Tel-U Jakarta': [...accInput['Tel-U Jakarta']],
            'Tel-U Surabaya': [...accInput['Tel-U Surabaya']],
            'Tel-U Purwokerto': [...accInput['Tel-U Purwokerto']],
            'Tel-U Bandung': [...accInput['Tel-U Bandung']],
            // 'Tel-U Sumatra': [...accInput['Tel-U Sumatra']],
          });
        
        } catch (error) {
            console.error('Error fetching dashboard', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">📈 Pertumbuhan Akreditasi Prodi</h3>
                    <div className="flex space-x-3">
                    {/* {userRoleId === 1 && (
                    <button onClick={openProdiModal} className="text-gray-500 hover:text-gray-700" title="Edit Data Prodi">
                        <Pencil size={18} />
                    </button>
                    )} */}
                    <button onClick={handleDownload} className="text-gray-500 hover:text-gray-700" title="Unduh Data Akreditasi">
                        <Download size={18} />
                    </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={localAccreditationYears.map((year, idx) => ({
                    tahun: year,
                    Jakarta: accreditationInputData["Tel-U Jakarta"][idx] ?? 0,
                    Bandung: accreditationInputData["Tel-U Bandung"][idx] ?? 0,
                    Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] ?? 0,
                    Surabaya: accreditationInputData["Tel-U Surabaya"][idx] ?? 0,
                    // Sumatra: accreditationInputData["Tel-U Sumatra"][idx] ?? 0,
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tahun" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                    <Legend />
                    <Line type="monotone" dataKey="Jakarta" stroke="#36A2EB" />
                    <Line type="monotone" dataKey="Bandung" stroke="#FF6384" />
                    <Line type="monotone" dataKey="Purwokerto" stroke="#FF9F40" />
                    <Line type="monotone" dataKey="Surabaya" stroke="#4BC0C0" />
                    {/* <Line type="monotone" dataKey="Sumatra" stroke="#9966FF" /> */}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}