// components/StatCard.tsx
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  color: string; // e.g. red, blue, green
}

export default function StatCard({ icon, title, value, color }: StatCardProps) {
  const bgColor = {
    red: "bg-red-700",
    blue: "bg-blue-800",
    navy: "bg-blue-900",
    green: "bg-green-700",
  }[color];

  return (
    <div className={`${bgColor} text-white p-4 rounded-xl shadow-md flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
