"use client";

import React, { useState, useMemo } from "react";
import { Pencil, X, Check, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column {
  header: string;
  key: string;
  width?: string;
  className?: string;
  sortable?: boolean; // tambahkan flag sortable
}

interface TableUpdateProps {
  columns: Column[];
  data: any[];
  currentPage: number;
  rowsPerPage: number;
  onEdit?: (id: number) => void;
  onDeactivate?: (index: number) => void;
  onReactivate?: (index: number) => void;
}

export default function TableUpdate({
  columns,
  data,
  currentPage,
  rowsPerPage,
  onEdit,
  onDeactivate,
  onReactivate,
}: TableUpdateProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // fungsi sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // handle klik kolom untuk sorting
  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  return (
    <div className="w-full max-h-[400px] overflow-x-auto border rounded-lg">
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <table className="min-w-[1000px] w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left border border-gray-300 ${col.className || ""}`}
                  style={{ width: col.width || "auto" }}
                >
                  <div
                    className={`flex items-center gap-1 ${col.sortable ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && (
                      sortConfig?.key === col.key ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-500" />
                        )
                      ) : (
                        <ChevronsUpDown size={14} className="text-gray-400" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm border border-gray-200 ${
                        col.key === "action"
                          ? "bg-white shadow-lg shadow-black/15 z-20"
                          : ""
                      } ${col.className || ""}`}
                    >
                      {col.key === "nomor"
                        ? (currentPage - 1) * rowsPerPage + index + 1
                        : col.key === "action" ? (
                          <div className="flex justify-center gap-3">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item.nomor)}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                <Pencil size={14} className="mr-1" /> Edit
                              </button>
                            )}
                            {item.status === "Active" ? (
                              onDeactivate && (
                                <button
                                  onClick={() => onDeactivate(index)}
                                  className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  <X size={14} className="mr-1" /> Deactive
                                </button>
                              )
                            ) : (
                              onReactivate && (
                                <button
                                  onClick={() => onReactivate(index)}
                                  className="flex items-center text-green-600 hover:text-green-800 text-xs font-medium"
                                >
                                  <Check size={14} className="mr-1" /> Reactive
                                </button>
                              )
                            )}
                          </div>
                        ) : (
                          item[col.key]
                        )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500 border-t border-gray-200"
                >
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

