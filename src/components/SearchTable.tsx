"use client";

import { Search } from "lucide-react";

type SearchTableProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchTable({
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}: SearchTableProps) {
  return (
    <div
      className={`flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-64 bg-white ${className}`}
    >
      <Search className="w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
      />
    </div>
  );
}
