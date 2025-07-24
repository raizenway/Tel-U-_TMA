"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "2020", Bandung: 240, Purwokerto: 139, Surabaya: 300 },
  { name: "2021", Bandung: 300, Purwokerto: 170, Surabaya: 250 },
  { name: "2022", Bandung: 280, Purwokerto: 180, Surabaya: 200 },
];

export default function CustomBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Bandung" fill="#8884d8" />
        <Bar dataKey="Purwokerto" fill="#82ca9d" />
        <Bar dataKey="Surabaya" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
}
