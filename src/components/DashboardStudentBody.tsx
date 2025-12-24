'use client';

import { Download, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface YearlyData { year: number; total: number; }
interface Branch {
    id: number;
    name: string;
    email: string;
    yearlyStudentBody: YearlyData[];
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

export default function DashboardStudentBody() {
    const currentUser = getCurrentUser();
    const userRoleId = currentUser?.roleId;
    const userBranchId = currentUser?.branchId;

    const yearList = [] as any
    const branchList = [] as any

    const [studentBodyData, setStudentBodyData] = useState<any[]>([]);
    const [localStudentDataByCampus, setLocalStudentDataByCampus] = useState([]);

    const studentColors = ["#FF6384", "#36A2EB", "#4BC0C0", "#FF9F40", "#9966FF"];  
    const studentYears = studentBodyData.map(row => row.year);
    const apiDataRef = useRef<DashboardApiResponse | null>(null);

    // --- FETCH DATA ---
    const fetchData = async () => {
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!baseUrl) {
                throw new Error('NEXT_PUBLIC_API_URL is not defined');
            }

            const response = await fetch(`${baseUrl}/assessment/dashboard`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const result = await response.json();
            const apiData = result.data as DashboardApiResponse;
            apiDataRef.current = apiData;

            // Filter branches hanya untuk kampus user (jika bukan Super User)
            let filteredBranches = apiData.branches;
            if (userRoleId !== 1 && userBranchId) {
                filteredBranches = apiData.branches.filter(b => b.id === userBranchId);
            }

            for(const branch of apiData.branches){
                for(const item of branch.yearlyStudentBody){
                    const yearStr = item.year.toString()
                    if(!yearList.includes(yearStr)){
                        yearList.push(yearStr)
                    }
                }

                if(!branchList.includes(branch.name)){
                    branchList.push(branch.name)
                }
            }

            const studentBodyFormatted = yearList.map(yearStr => {
                const yearNum = Number(yearStr);
                const row: any = {
                    year: yearStr,
                }

                for (const branch of filteredBranches) {
                    const campusName = branch.name;
                    const cleanedData = cleanYearlyData(branch.yearlyStudentBody);
                    const dataForYear = cleanedData.find(item => item.year === yearNum);
                    if (dataForYear) {
                        row[campusName] = dataForYear.total
                    }
                }
                return row;
            });

            setStudentBodyData(studentBodyFormatted);

            const studentYears = studentBodyFormatted.map(row => row.year);

            const studentDataByCampus = branchList.map((campus) => {
                const data: { [key: string]: string | number } = { kampus: campus };
                studentYears.forEach((year) => {
                    const item = studentBodyFormatted.find(d => d.year === year);
                    data[year] = item ? (item[campus] ?? 0) : 0;
                });
                return data;
            });

            setLocalStudentDataByCampus(studentDataByCampus)
        
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
                    <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
                    <div className="flex space-x-3">
                        <button className="text-gray-500 hover:text-gray-700" title="Unduh Data">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={localStudentDataByCampus}  key={localStudentDataByCampus.length}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="kampus" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {studentYears.map((year, index) => (
                            <Bar key={year} dataKey={year} fill={studentColors[index % studentColors.length]} radius={[10, 10, 0, 0]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}