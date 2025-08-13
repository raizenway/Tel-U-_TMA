"use client";

import React from "react";

interface Column {
  header: string;
  key: string;
  width?: string; // wajib diisi untuk sticky supaya perhitungan akurat
  sticky?: boolean;
  stickyPosition?: "left" | "right"; // posisi sticky
  render?: (row: Record<string, any>, rowIndex: number) => React.ReactNode;
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
  // Hitung posisi sticky kiri
  const getStickyLeft = (colIndex: number) => {
    let left = 0;
    for (let i = 0; i < colIndex; i++) {
      left += parseInt(columns[i].width || "0", 10) || 0;
    }
    return left;
  };

  // Hitung posisi sticky kanan
  const getStickyRight = (colIndex: number) => {
    let right = 0;
    for (let i = columns.length - 1; i > colIndex; i--) {
      right += parseInt(columns[i].width || "0", 10) || 0;
    }
    return right;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[1000px] border border-gray-300 text-sm bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`text-left px-4 py-2 border whitespace-nowrap ${
                  col.sticky ? "bg-white" : ""
                }`}
                style={{
                  width: col.width,
                  position: col.sticky ? "sticky" : undefined,
                  left:
                    col.sticky && col.stickyPosition === "left"
                      ? getStickyLeft(index)
                      : undefined,
                  right:
                    col.sticky && col.stickyPosition === "right"
                      ? getStickyRight(index)
                      : undefined,
                  zIndex: col.sticky ? 5 : undefined,
                }}
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
                    col.sticky ? "bg-white" : ""
                  }`}
                  style={{
                    width: col.width,
                    position: col.sticky ? "sticky" : undefined,
                    left:
                      col.sticky && col.stickyPosition === "left"
                        ? getStickyLeft(colIndex)
                        : undefined,
                    right:
                      col.sticky && col.stickyPosition === "right"
                        ? getStickyRight(colIndex)
                        : undefined,
                    zIndex: col.sticky ? 4 : undefined,
                  }}
                >
                  {col.key === "nomor"
                    ? rowIndex + 1 + (currentPage - 1) * rowsPerPage
                    : col.render
                    ? col.render(row, rowIndex)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
