"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // opsional
  itemsPerPage?: number;
  totalItems?: number;
  onItemsPerPageChange?: (value: number) => void;
  showItemsPerPage?: boolean; // default true
  showTotalItems?: boolean; // default true
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showTotalItems = true,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4 px-4">
      {/* Dropdown pilih jumlah data */}
      {showItemsPerPage && onItemsPerPageChange && itemsPerPage !== undefined && (
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 rounded-full px-2 py-1 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5 Data</option>
            <option value={10}>10 Data</option>
            <option value={20}>20 Data</option>
            <option value={50}>50 Data</option>
          </select>
        </div>
      )}

      {/* Tombol navigasi */}
      <div className="flex items-center gap-2 mx-auto">
        {/* Tombol Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
        >
          {"<"}
        </button>

        {/* Nomor Halaman */}
        <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-500">
          {currentPage}
        </span>

        {/* Tombol Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-200 transition"
        >
          {">"}
        </button>
      </div>

      {/* Total data */}
      {showTotalItems && totalItems !== undefined && (
        <div>Total {totalItems}</div>
      )}
    </div>
  );
}
