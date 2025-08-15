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
import { Pencil, Download } from "lucide-react";
import AssessmentTable from "./AssessmentTable";
import ModalConfirm from "./StarAssessment/ModalConfirm";
import Button from "./button";
import { Building2, ClipboardList, ClipboardCheck, BookOpenCheckIcon } from 'lucide-react';

// Data Chart
const radarData = [
  { subject: "Akademik", A: 90 },
  { subject: "SDM", A: 85 },
  { subject: "Keuangan", A: 70 },
  { subject: "Kemahasiswaan", A: 75 },
  { subject: "SHO", A: 80 },
  { subject: "Publikasi", A: 95 },
];

// ✅ Daftar kampus
const CAMPUS_LIST = [
  "Tel-U Jakarta",
  "Tel-U Surabaya",
  "Tel-U Purwokerto",
  "Tel-U Bandung",
] as const;

// ✅ Tipe data
interface CampusData {
  "Tel-U Jakarta": number[];
  "Tel-U Surabaya": number[];
  "Tel-U Purwokerto": number[];
  "Tel-U Bandung": number[];
}

interface StudentRow {
  tahun: string;
  Jakarta: number;
  Bandung: number;
  Purwokerto: number;
  Surabaya: number;
}

export default function DashboardTab() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'student' | 'prodi'>('student'); // Mode modal

  // ✅ Student Body Data
  const [studentYears, setStudentYears] = useState(["2021", "2022", "2023", "2024"]);
  const [studentInputData, setStudentInputData] = useState<CampusData>({
    "Tel-U Jakarta": [100, 120, 125, 135],
    "Tel-U Surabaya": [130, 150, 170, 180],
    "Tel-U Purwokerto": [110, 115, 130, 140],
    "Tel-U Bandung": [140, 135, 160, 170],
  });

  const [studentData, setStudentData] = useState<StudentRow[]>(() =>
    studentYears.map((year, idx) => ({
      tahun: year,
      Jakarta: studentInputData["Tel-U Jakarta"][idx] || 0,
      Surabaya: studentInputData["Tel-U Surabaya"][idx] || 0,
      Purwokerto: studentInputData["Tel-U Purwokerto"][idx] || 0,
      Bandung: studentInputData["Tel-U Bandung"][idx] || 0,
    }))
  );

  // ✅ Akreditasi Prodi: KOSONG dulu, TIDAK ambil dari data mahasiswa
  const [accreditationData, setAccreditationData] = useState<{ tahun: string; Jakarta: number; Bandung: number; Purwokerto: number; Surabaya: number }[]>([]);

  // ✅ Tambah Tahun (hanya untuk Student)
  const handleAddYear = () => {
    const nextYear = String(Number(studentYears[studentYears.length - 1]) + 1);
    setStudentYears((prev) => [...prev, nextYear]);
    (Object.keys(studentInputData) as Array<keyof CampusData>).forEach((campus) => {
      setStudentInputData((prev) => ({
        ...prev,
        [campus]: [...prev[campus], 0],
      }));
    });
  };

  // ✅ Ubah Nilai Mahasiswa
  const handleInputChange = (campus: keyof CampusData, yearIndex: number, value: string) => {
    const num = value === "" ? 0 : Number(value);
    if (isNaN(num)) return;
    setStudentInputData((prev) => ({
      ...prev,
      [campus]: prev[campus].map((val, i) => (i === yearIndex ? num : val)),
    }));
  };

  // ✅ Simpan & Update Data
  const handleGenerate = () => {
    if (modalMode === 'student') {
      // Update studentData
      const newStudentData = studentYears.map((year, idx) => ({
        tahun: year,
        Jakarta: studentInputData["Tel-U Jakarta"][idx] || 0,
        Surabaya: studentInputData["Tel-U Surabaya"][idx] || 0,
        Purwokerto: studentInputData["Tel-U Purwokerto"][idx] || 0,
        Bandung: studentInputData["Tel-U Bandung"][idx] || 0,
      }));
      setStudentData(newStudentData);
    } else if (modalMode === 'prodi') {
      // Di sini nanti bisa update accreditationData dari input modal
      // Untuk sekarang: kosong
      console.log("Data prodi disimpan (belum ada input)");
    }

    setShowModal(false);
  };

  // ✅ Download CSV Akreditasi (kosong jika data tidak ada)
  const handleDownload = () => {
    if (accreditationData.length === 0) {
      alert("Belum ada data akreditasi prodi untuk diunduh.");
      return;
    }

    const csv = [
      ["Tahun", "Jakarta", "Bandung", "Purwokerto", "Surabaya"],
      ...accreditationData.map((row) => [
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

  // Buka modal dengan mode
  const openStudentModal = () => {
    setModalMode('student');
    setShowModal(true);
  };

  const openProdiModal = () => {
    setModalMode('prodi');
    setShowModal(true);
  };

  return (
    <div className="space-y-8 px-4 py-6">
      {/* 4 Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {/* 1. UPPS/Kampus Cabang */}
        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/KC.png')" }}
        >
          <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
          <div className="relative flex items-center space-x-2 text-white p-4 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">UPPS/Kampus Cabang</span>
            <div className="absolute top-0 right-0 w-6 h-6 text-white text-sm font-bold rounded-full flex items-center justify-center" style={{ marginTop: '45px', marginRight: '90px' }}>
              8
            </div>
          </div>
        </div>

        {/* 2. Jumlah Variabel & Pertanyaan */}
        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Jumlah Variabel.png')" }}
        >
          <div className="absolute inset-0  bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <BookOpenCheckIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Jumlah Variabel & Pertanyaan</span>
          </div>
        </div>

        {/* 3. Assessment Submitted */}
        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Assessment Submitted.png')" }}
        >
          <div className="absolute inset-0  bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardList className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Assessment Submitted</span>
          </div>
        </div>

        {/* 4. Assessment Approved */}
        <div
          className="relative h-32 bg-cover bg-center rounded-xl shadow flex items-center justify-center text-white text-center"
          style={{ backgroundImage: "url('/Assessment Approve.png')" }}
        >
          <div className="absolute inset-0  bg-opacity-50 rounded-xl"></div>
          <div className="relative flex flex-col items-center space-y-2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-opacity-20 backdrop-blur-sm rounded-full border-2 border-white shadow-md">
              <ClipboardCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-sm font-semibold">Assessment Approved</span>
          </div>
        </div>
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
        {/* Student Body */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">📊 Student Body</h3>
            <div className="flex space-x-3">
              <button
                onClick={openStudentModal}
                className="text-gray-500 hover:text-gray-700"
                title="Edit Data Mahasiswa"
              >
                <Pencil size={18} />
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                title="Unduh Data"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentData}>
              <CartesianGrid strokeDasharray="3 3" />
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

        {/* Pertumbuhan Akreditasi Prodi */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">📈 Pertumbuhan Akreditasi Prodi</h3>
            <div className="flex space-x-3">
              <button
                onClick={openProdiModal}
                className="text-gray-500 hover:text-gray-700"
                title="Edit Data Prodi"
              >
                <Pencil size={18} />
              </button>
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
            <LineChart data={accreditationData}> {/* ✅ Data kosong */}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tahun" />
              <YAxis domain={[0, 100]} />
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
        <AssessmentTable hideStartButton={true} />
      </div>

      {/* ✅ Modal Dinamis: Judul berdasarkan mode */}
      <ModalConfirm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleGenerate}
        header={modalMode === 'student' ? 'Ubah Data Mahasiswa' : 'Ubah Data Prodi'}
        title=""
        confirmLabel="Simpan"
        cancelLabel="Batal"
        hideDefaultButtons
      >
        {modalMode === 'student' ? (
          <>
            {/* Tombol Tambah Tahun */}
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleAddYear}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm font-medium"
              >
                + Tambah Tahun
              </Button>
            </div>

            {/* Tabel Input Mahasiswa */}
            <table className="w-full border-collapse text-center mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left pl-2">Kampus</th>
                  {studentYears.map((year, i) => (
                    <th key={i}>{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPUS_LIST.map((campus) => (
                  <tr key={campus} className="border-b border-gray-200">
                    <td className="text-left pl-2 py-2 font-medium">{campus}</td>
                    {studentInputData[campus].map((value, j) => (
                      <td key={j}>
                        <input
                          type="number"
                          value={value === 0 ? "" : value}
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
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-700 font-medium">Form input data prodi akan segera tersedia.</p>
            <p className="text-sm text-gray-500 mt-2">Silakan siapkan data prodi Anda.</p>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex justify-center gap-4 mt-6">
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
      </ModalConfirm>
    </div>
  );
}