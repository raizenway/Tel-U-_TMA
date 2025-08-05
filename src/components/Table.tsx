"use client";

import React from "react";

interface Column {
  header: string;
  key: string;
  width?: string; // opsional: bisa atur width per kolom
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
  currentPage: number;
  rowsPerPage: number;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  currentPage,
  rowsPerPage,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] inline-block align-middle">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="text-left px-4 py-2 border whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-2 py-2 border align-top text-xs ${
                      ["indikator", "pertanyaan"].includes(col.key)
                        ? "max-w-xs break-words"
                        : "whitespace-nowrap"
                    }`}
                    style={{ width: col.width }}
                  >
                    {col.key === "nomor"
                      ? (rowIndex + 1) + (currentPage - 1) * rowsPerPage
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;