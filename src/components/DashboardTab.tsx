"use client";

import { useState } from "react";
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
} from "recharts";
import ProgressAssessment from "@/components/ProgressAssessment";
import { Pencil, Download, X } from "lucide-react";
import AssessmentTable from "./AssessmentTable";
import Button from "@/components/button";

// Data Chart
const radarData = [
  { subject: "Akademik", A: 90 },
  { subject: "SDM", A: 85 },
  { subject: "Keuangan", A: 70 },
  { subject: "Kemahasiswaan", A: 75 },
  { subject: "SHO", A: 80 },
  { subject: "Publikasi", A: 95 },
];

// ✅ Data awal akreditasi
const initialAccreditationData = [
  { tahun: "2021", Jakarta: 80, Bandung: 70, Purwokerto: 60, Surabaya: 90 },
  { tahun: "2022", Jakarta: 90, Bandung: 75, Purwokerto: 65, Surabaya: 95 },
  { tahun: "2023", Jakarta: 95, Bandung: 85, Purwokerto: 75, Surabaya: 98 },
  { tahun: "2024", Jakarta: 98, Bandung: 90, Purwokerto: 80, Surabaya: 99 },
];

// ✅ Daftar kampus
const CAMPUS_LIST = [
  "Tel-U Jakarta",
  "Tel-U Surabaya",
  "Tel-U Purwokerto",
  "Tel-U Bandung",
] as const;

// ✅ Mapping kampus ke nama kolom
const campusToKey: Record<string, string> = {
  "Tel-U Jakarta": "Jakarta",
  "Tel-U Surabaya": "Surabaya",
  "Tel-U Purwokerto": "Purwokerto",
  "Tel-U Bandung": "Bandung",
};

// ✅ Tipe data
interface CampusData {
  "Tel-U Jakarta": number[];
  "Tel-U Surabaya": number[];
  "Tel-U Purwokerto": number[];
  "Tel-U Bandung": number[];
}

interface AccreditationRow {
  tahun: string;
  Jakarta: number;
  Bandung: number;
  Purwokerto: number;
  Surabaya: number;
}

export default function DashboardTab() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"student" | "accreditation">("student");

  // ✅ Student Body Data
  const [studentYears, setStudentYears] = useState(["2021", "2022", "2023", "2024"]);
  const [studentInputData, setStudentInputData] = useState<CampusData>({
    "Tel-U Jakarta": [100, 120, 125, 135],
    "Tel-U Surabaya": [130, 150, 170, 180],
    "Tel-U Purwokerto": [110, 115, 130, 140],
    "Tel-U Bandung": [140, 135, 160, 170],
  });
  const [studentData, setStudentData] = useState(() =>
    studentYears.map((year, idx) => ({
      tahun: year,
      Jakarta: studentInputData["Tel-U Jakarta"][idx] || 0,
      Surabaya: studentInputData["Tel-U Surabaya"][idx] || 0,
      Purwokerto: studentInputData["Tel-U Purwokerto"][idx] || 0,
      Bandung: studentInputData["Tel-U Bandung"][idx] || 0,
    }))
  );

  // ✅ Akreditasi Data
  const [accreditationYears, setAccreditationYears] = useState(["2021", "2022", "2023", "2024"]);
  const [accreditationInputData, setAccreditationInputData] = useState<CampusData>({
    "Tel-U Jakarta": [80, 90, 95, 98],
    "Tel-U Surabaya": [90, 95, 98, 99],
    "Tel-U Purwokerto": [60, 65, 75, 80],
    "Tel-U Bandung": [70, 75, 85, 90],
  });
  const [accreditationData, setAccreditationData] = useState<AccreditationRow[]>(initialAccreditationData);

  // 📥 Download CSV
  const handleDownload = () => {
    const csv = [
      ["Tahun", "Jakarta", "Bandung", "Purwokerto", "Surabaya"],
      ...accreditationData.map((row) => [row.tahun, row.Jakarta, row.Bandung, row.Purwokerto, row.Surabaya]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pertumbuhan_akreditasi.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ Handle Add Year - Student
  const handleAddStudentYear = () => {
    const last = studentYears[studentYears.length - 1];
    const next = String(Number(last) + 1);
    setStudentYears([...studentYears, next]);
    CAMPUS_LIST.forEach((kampus) => {
      setStudentInputData((prev) => ({
        ...prev,
        [kampus]: [...prev[kampus], 0],
      }));
    });
  };

  // ✅ Handle Add Year - Accreditation
  const handleAddAccreditationYear = () => {
    const last = accreditationYears[accreditationYears.length - 1];
    const next = String(Number(last) + 1);
    setAccreditationYears([...accreditationYears, next]);
    CAMPUS_LIST.forEach((kampus) => {
      setAccreditationInputData((prev) => ({
        ...prev,
        [kampus]: [...prev[kampus], 0],
      }));
    });
  };

  // ✅ Handle Change - Student
  const handleStudentChange = (kampus: keyof CampusData, yearIndex: number, value: string) => {
    setStudentInputData((prev) => ({
      ...prev,
      [kampus]: prev[kampus].map((v, i) => (i === yearIndex ? Number(value) || 0 : v)),
    }));
  };

  // ✅ Handle Change - Accreditation
  const handleAccreditationChange = (kampus: keyof CampusData, yearIndex: number, value: string) => {
    setAccreditationInputData((prev) => ({
      ...prev,
      [kampus]: prev[kampus].map((v, i) => (i === yearIndex ? Number(value) || 0 : v)),
    }));
  };

  // ✅ Generate - Student
  const handleGenerateStudent = () => {
    const newData = studentYears.map((year, idx) => ({
      tahun: year,
      Jakarta: studentInputData["Tel-U Jakarta"][idx] || 0,
      Surabaya: studentInputData["Tel-U Surabaya"][idx] || 0,
      Purwokerto: studentInputData["Tel-U Purwokerto"][idx] || 0,
      Bandung: studentInputData["Tel-U Bandung"][idx] || 0,
    }));
    setStudentData(newData);
    setShowModal(false);
  };

  // ✅ Generate - Accreditation
  const handleGenerateAccreditation = () => {
    const newData = accreditationYears.map((year, idx) => ({
      tahun: year,
      Jakarta: accreditationInputData["Tel-U Jakarta"][idx] || 0,
      Bandung: accreditationInputData["Tel-U Bandung"][idx] || 0,
      Purwokerto: accreditationInputData["Tel-U Purwokerto"][idx] || 0,
      Surabaya: accreditationInputData["Tel-U Surabaya"][idx] || 0,
    }));
    setAccreditationData(newData);
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-red-700 text-white p-5 rounded-xl shadow text-center">📋 UPPS/Kampus Cabang</div>
        <div className="bg-amber-500 text-white p-5 rounded-xl shadow text-center">📄 Jumlah Variabel & Pertanyaan</div>
        <div className="bg-[#263859] text-white p-5 rounded-xl shadow text-center">ℹ️ Assessment Submitted</div>
        <div className="bg-emerald-600 text-white p-5 rounded-xl shadow text-center">✅ Assessment Approved</div>
      </div>

      {/* Progress + Radar */}
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
        {/* ✅ Student Body */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalType("student");
                  setShowModal(true);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Edit Data"
              >
                <Pencil size={18} />
              </button>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Unduh Data"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tahun" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Jakarta" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bandung" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Purwokerto" fill="#facc15" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Surabaya" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Pertumbuhan Akreditasi */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">📈 Pertumbuhan Akreditasi Prodi</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalType("accreditation");
                  setShowModal(true);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Edit Data"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={handleDownload}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Unduh Data"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accreditationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Jakarta" stroke="#8884d8" />
              <Line type="monotone" dataKey="Bandung" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Purwokerto" stroke="#ffc658" />
              <Line type="monotone" dataKey="Surabaya" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Assessment */}
      <div className="mt-6">
        <AssessmentTable />
      </div>

      {/* ✅ Modal Dinamis */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-none bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold">
                {modalType === "student" ? "Ubah Data Student Body" : "Ubah Data Akreditasi"}
              </h2>
             
            </div>

            <div className="flex justify-end my-3">
              <Button
                variant="primary"
                onClick={
                  modalType === "student"
                    ? handleAddStudentYear
                    : handleAddAccreditationYear
                }
              >
                Tambah Tahun
              </Button>
            </div>

            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th></th>
                  {(modalType === "student" ? studentYears : accreditationYears).map((year, i) => (
                    <th key={i}>{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPUS_LIST.map((kampus) => (
                  <tr key={kampus}>
                    <td className="text-left p-2">{kampus}</td>
                    {(modalType === "student"
                      ? studentInputData[kampus]
                      : accreditationInputData[kampus]
                    ).map((val, j) => (
                      <td key={j}>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) =>
                            modalType === "student"
                              ? handleStudentChange(kampus, j, e.target.value)
                              : handleAccreditationChange(kampus, j, e.target.value)
                          }
                          className="w-16 h-8 border rounded p-1 text-center focus:ring-2 focus:ring-blue-300 outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium"
              >
                Batal
              </button>
              <Button
                variant="primary"
                className="px-6 py-2 font-medium"
                onClick={
                  modalType === "student"
                    ? handleGenerateStudent
                    : handleGenerateAccreditation
                }
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}