// components/TableUpdate.tsx
"use client";

import React from "react";
import { Pencil, X, Check, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column {
  header: string;
  key: string;
  width?: string;
  className?: string;
  sortable?: boolean;
}

interface TableUpdateProps {
  columns: Column[];
  data: any[];
  currentPage: number;
  rowsPerPage: number;
  onEdit?: (id: number) => void;
  onDeactivate?: (index: number) => void;
  onReactivate?: (index: number) => void;
  onSort?: (key: string) => void; // ✅ tambahkan
  sortConfig?: { key: string; direction: "asc" | "desc" } | null; // ✅ tambahkan
}

export default function TableUpdate({
  columns,
  data,
  currentPage,
  rowsPerPage,
  onEdit,
  onDeactivate,
  onReactivate,
  onSort,
  sortConfig,
}: TableUpdateProps) {
  return (
    <div className="bg-white rounded-lg mx-auto w-full max-w-5xl mt-6 shadow-sm">
      {/* Scroll wrapper */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full table-fixed border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width || "auto" }}
                  className={`px-4 py-3 border border-gray-300 text-left uppercase tracking-wide text-xs ${col.className || ""}`}
                >
                  <div
                    className={`flex items-center gap-1 ${col.sortable ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.sortable && onSort?.(col.key)} // ✅ panggil handler dari parent
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
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm border border-gray-300 ${
                        col.key === "action"
                          ? "bg-white shadow-md shadow-black/10 z-10"
                          : ""
                      } ${col.className || ""}`}
                    >
                      {col.key === "nomor"
                        ? (currentPage - 1) * rowsPerPage + index + 1
                        : col.key === "action" ? (
                          <div className="flex justify-center gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item.nomor)}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium transition"
                              >
                                <Pencil size={14} className="mr-1" /> Edit
                              </button>
                            )}
                            {item.status === "Active" ? (
                              onDeactivate && (
                                <button
                                  onClick={() => onDeactivate(index)}
                                  className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium transition"
                                >
                                  <X size={14} className="mr-1" /> Deactive
                                </button>
                              )
                            ) : (
                              onReactivate && (
                                <button
                                  onClick={() => onReactivate(index)}
                                  className="flex items-center text-green-600 hover:text-green-800 text-xs font-medium transition"
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
