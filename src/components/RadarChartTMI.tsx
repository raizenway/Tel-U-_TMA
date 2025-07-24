// components/RadarChartTMI.tsx
"use client";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";

const data = [
  { subject: "Akademik", A: 80 },
  { subject: "SDM", A: 70 },
  { subject: "SPIO", A: 50 },
  { subject: "Kemahasiswaan", A: 40 },
  { subject: "Admisi", A: 60 },
  { subject: "PPN, Publikasi, Abdimas", A: 85 },
  { subject: "Mutu", A: 90 },
];

export default function RadarChartTMI() {
  return (
    <div className="bg-white p-4 rounded-xl shadow w-full">
      <h2 className="text-lg font-bold mb-4">Transformation Maturity Index</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="TMI" dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
