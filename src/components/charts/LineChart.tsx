"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { year: "2020", Bandung: 90, Purwokerto: 85, Surabaya: 70 },
  { year: "2021", Bandung: 100, Purwokerto: 95, Surabaya: 80 },
  { year: "2022", Bandung: 110, Purwokerto: 100, Surabaya: 90 },
];

export default function CustomLineChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Bandung" stroke="#8884d8" />
        <Line type="monotone" dataKey="Purwokerto" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Surabaya" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
}
