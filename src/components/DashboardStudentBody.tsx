'use client';

import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

    const yearList = [] as any
    const branchList = [] as any

    // const openStudentModal = () => {
    //     setModalMode('student');
    //     setShowModal(true);
    // };

    // const [showModal, setShowModal] = useState(false);
    // const [modalMode, setModalMode] = useState<'student' | 'prodi'>('student');
    const [localAccreditationYears, setLocalAccreditationYears] = useState<string[]>();
    const [localBranchList, setLocalBranchList] = useState<string[]>();
    // const [localAccreditationData, setLocalAccreditationData] = useState<{
    //     "Tel-U Jakarta": number[];
    //     "Tel-U Surabaya": number[];
    //     "Tel-U Purwokerto": number[];
    //     "Tel-U Bandung": number[];
    //     // "Tel-U Sumatra": number[];
    //   }>({
    //     "Tel-U Jakarta": Array(7).fill(0),
    //     "Tel-U Surabaya": Array(7).fill(0),
    //     "Tel-U Purwokerto": Array(7).fill(0),
    //     "Tel-U Bandung": Array(7).fill(0),
    //     // "Tel-U Sumatra": Array(7).fill(0),
    // });
  
    // type StudentBodyRow = {
    //     year: string;
    //     "Tel-U Jakarta": number;
    //     "Tel-U Surabaya": number;
    //     "Tel-U Purwokerto": number;
    //     "Tel-U Bandung": number;
    //     // "Tel-U Sumatra": number; // ✅ Tambahkan
    // };

    // type AccreditationRow = {
    //     year: string;
    //     "Tel-U Jakarta": number;
    //     "Tel-U Surabaya": number;
    //     "Tel-U Purwokerto": number;
    //     "Tel-U Bandung": number;
    //     // "Tel-U Sumatra": number; // ✅ Tambahkan
    //   };

    const [studentBodyData, setStudentBodyData] = useState<any[]>([]);
    const [localStudentDataByCampus, setLocalStudentDataByCampus] = useState([]);

    const { saveToApi: saveStudentBody, isSaving: isSavingStudent, error: studentSaveError } = useStudentBodyData();
    const { saveToApi: saveAccreditation, isSaving: isSavingAccreditation, error: accreditationSaveError } = useAccreditationData();
  
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
        const data: { [key: string]: string | number } = { kampus: campus };
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
        console.log('yearList', yearList)
        console.log('branchList', branchList)

        setLocalAccreditationYears(yearList)
        setLocalBranchList(branchList)

        const studentBodyFormatted = yearList.map(yearStr => {
            const yearNum = Number(yearStr);
            const row: any = {
            year: yearStr,
            // "Tel-U Jakarta": 0,
            // "Tel-U Surabaya": 0,
            // "Tel-U Purwokerto": 0,
            // "Tel-U Bandung": 0,
            // "Tel-U Sumatra": 0,
            };
            for (const branch of filteredBranches) {
                const campusName = branch.name;
                const cleanedData = cleanYearlyData(branch.yearlyStudentBody);
                const dataForYear = cleanedData.find(item => item.year === yearNum);
                if (dataForYear) {
                    row[campusName] = dataForYear.total
                };
            }
            return row;
        });

        setStudentBodyData(studentBodyFormatted);

        const studentDataByCampus = CAMPUS_LIST.map((campus) => {
            const data: { [key: string]: string | number } = { kampus: campus };
            studentYears.forEach((year) => {
            const item = studentBodyData.find(d => d.year === year);
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

    // const handleGenerate = async () => {
    //     if (modalMode === 'prodi') {
    //       const accreditationRows: AccreditationRow[] = localAccreditationYears.map((year, idx) => ({
    //         year,
    //         "Tel-U Jakarta": localAccreditationData["Tel-U Jakarta"][idx] ?? 0,
    //         "Tel-U Surabaya": localAccreditationData["Tel-U Surabaya"][idx] ?? 0,
    //         "Tel-U Purwokerto": localAccreditationData["Tel-U Purwokerto"][idx] ?? 0,
    //         "Tel-U Bandung": localAccreditationData["Tel-U Bandung"][idx] ?? 0,
    //         // "Tel-U Sumatra": localAccreditationData["Tel-U Sumatra"][idx] ?? 0,
    //       }));
    
    //       const success = await saveAccreditation(accreditationRows);
    //       if (success) {
    //         await fetchData();
    //         setShowModal(false);
    //         alert('✅ Data akreditasi berhasil disimpan!');
    //       }
    //       return;
    //     }
    
    //     if (modalMode === 'student') {
    //       const success = await saveStudentBody(studentBodyData);
    //       if (success) {
    //         setShowModal(false);
    //         alert('✅ Data mahasiswa berhasil disimpan!');
    //       }
    //       return;
    //     }
    
    //     setShowModal(false);
    // };

    // --- HANDLERS (sama seperti sebelumnya) ---
    // const handleAddYear = () => {
    //     const lastYearStr = studentBodyData.length > 0 ? studentBodyData[studentBodyData.length - 1].year : "2027";
    //     const nextYear = String(Number(lastYearStr) + 1);
    //     setStudentBodyData(prev => [...prev, {
    //     year: nextYear,
    //     "Tel-U Jakarta": 0,
    //     "Tel-U Surabaya": 0,
    //     "Tel-U Purwokerto": 0,
    //     "Tel-U Bandung": 0,
    //     // "Tel-U Sumatra": 0,
    //     }]);
    // };

    // const handleInputChange = (campus: string, yearIndex: number, value: string) => {
    //     const num = value === '' ? 0 : Number(value);
    //     if (isNaN(num)) return;
    //     const newData = [...studentBodyData];
    //     if (newData[yearIndex]) {
    //       newData[yearIndex] = { ...newData[yearIndex], [campus]: num };
    //       setStudentBodyData(newData);
    //     }
    //   };
    
    // const handleAddAccreditationYear = () => {
    //     const lastYear = localAccreditationYears[localAccreditationYears.length - 1];
    //     const nextYear = String(Number(lastYear) + 1);
    //     setLocalAccreditationYears(prev => [...prev, nextYear]);
    //     setLocalAccreditationData(prev => ({
    //       ...prev,
    //       "Tel-U Jakarta": [...prev["Tel-U Jakarta"], 0],
    //       "Tel-U Surabaya": [...prev["Tel-U Surabaya"], 0],
    //       "Tel-U Purwokerto": [...prev["Tel-U Purwokerto"], 0],
    //       "Tel-U Bandung": [...prev["Tel-U Bandung"], 0],
    //       // "Tel-U Sumatra": [...prev["Tel-U Sumatra"], 0],
    //     }));
    // };
    
    // const handleAccreditationChange = (campus: string, yearIndex: number, value: string) => {
    //     const num = value === '' ? 0 : Math.max(0, Math.min(100, Number(value)));
    //     if (isNaN(num)) return;
    //     setLocalAccreditationData(prev => ({
    //       ...prev,
    //       [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    //     }));
    // };

    return (
        <div>
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
                    <div className="flex space-x-3">
                    {/* {userRoleId === 1 && (
                    <button onClick={openStudentModal} className="text-gray-500 hover:text-gray-700" title="Edit Data Mahasiswa">
                        <Pencil size={18} />
                    </button>
                    )} */}
                    <button className="text-gray-500 hover:text-gray-700" title="Unduh Data">
                        <Download size={18} />
                    </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentDataByCampus}  key={studentDataByCampus.length}>
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

            {/* Modal - sama */}
            {/* <ModalConfirm
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
                        {localBranchList.map((campus) => (
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
            </ModalConfirm> */}
        </div>
    );
}