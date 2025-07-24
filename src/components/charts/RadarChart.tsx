"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const data = [
  { subject: "Akademik", A: 120 },
  { subject: "Infrastruktur", A: 98 },
  { subject: "Keuangan", A: 86 },
  { subject: "Manajemen", A: 99 },
  { subject: "Publikasi", A: 85 },
  { subject: "FKP", A: 65 },
];

export default function CustomRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart outerRadius={90} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar name="Index" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
