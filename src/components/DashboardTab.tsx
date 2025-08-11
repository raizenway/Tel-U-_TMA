"use client";

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
import AssessmentTable from "./AssessmentTable";

const radarData = [
  { subject: "Akademik", A: 90 },
  { subject: "SDM", A: 85 },
  { subject: "Keuangan", A: 70 },
  { subject: "Kemahasiswaan", A: 75 },
  { subject: "SHO", A: 80 },
  { subject: "Publikasi", A: 95 },
];

const studentData = [
  { tahun: "2021", Jakarta: 100, Bandung: 140, Purwokerto: 110, Surabaya: 130 },
  { tahun: "2022", Jakarta: 120, Bandung: 135, Purwokerto: 115, Surabaya: 150 },
  { tahun: "2023", Jakarta: 125, Bandung: 160, Purwokerto: 130, Surabaya: 170 },
  { tahun: "2024", Jakarta: 135, Bandung: 170, Purwokerto: 140, Surabaya: 180 },
];

const akreditasiData = [
  { tahun: "2021", Jakarta: 80, Bandung: 70, Purwokerto: 60, Surabaya: 90 },
  { tahun: "2022", Jakarta: 90, Bandung: 75, Purwokerto: 65, Surabaya: 95 },
  { tahun: "2023", Jakarta: 95, Bandung: 85, Purwokerto: 75, Surabaya: 98 },
  { tahun: "2024", Jakarta: 98, Bandung: 90, Purwokerto: 80, Surabaya: 99 },
];

export default function DashboardTab() {
  return (
    <div className="space-y-8">
      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-red-700 text-white p-5 rounded-xl shadow">📋 UPPS/Kampus Cabang</div>
        <div className="bg-amber-500 text-white p-5 rounded-xl shadow">📄 Jumlah Variabel & Pertanyaan</div>
        <div className="bg-[#263859] text-white p-5 rounded-xl shadow">ℹ️ Assessment Submitted</div>
        <div className="bg-emerald-600 text-white p-5 rounded-xl shadow">✅ Assessment Approved</div>
      </div>

      {/* Progress Assessment + Radar Chart */}
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
              <Radar
                name="Score"
                dataKey="A"
                stroke="#8884d8"
                fill="#f8170fff"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-base font-bold text-gray-700 mb-4">📊 Student Body</h3>
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

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pertumbuhan Akreditasi Prodi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={akreditasiData}>
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
        {/* 🔽 TAMBAHKAN AssessmentTable DI SINI (di bawah Student Body) */}
      <div className="top-8">
        <AssessmentTable />
      </div>
      {/* 🔚 SELESAI TAMBAHAN */} 
    </div>
  );
}