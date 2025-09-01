'use client';

import React, { useState } from 'react';
import { Copy, Printer, ChevronDown } from 'lucide-react';
import Button from '@/components/button';
import * as XLSX from 'xlsx';

// 🔹 Data bisa berupa objek dengan key apa saja
interface TableButtonProps {
  data: Record<string, any>[];
  columns?: string[]; // Opsional: tentukan kolom yang ingin diekspor
}

const TableButton: React.FC<TableButtonProps> = ({ data, columns }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Jika tidak ada data
  if (!data || data.length === 0) {
    return null; // Atau tampilkan pesan
  }

  // Tentukan kolom dari data jika tidak diberikan
  const keys = columns || Object.keys(data[0]);

  // 🔹 Copy as TSV (Tab-Separated)
  const handleCopy = () => {
    const header = keys.join('\t');
    const rows = data.map((row) =>
      keys.map((key) => String(row[key] ?? '')).join('\t')
    );
    const content = [header, ...rows].join('\n');

    navigator.clipboard.writeText(content)
      .then(() => alert('Data berhasil disalin!'))
      .catch(() => alert('Gagal menyalin.'));
  };

  // 🔹 Print
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return alert('Pop-up diblokir.');

    const tableHeaders = keys.map(k => `<th>${k}</th>`).join('');
    const tableRows = data.map(row => {
      const cells = keys.map(k => `<td>${String(row[k] ?? '')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Data</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            body { margin: 20px; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <h2>Data Tabel</h2>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // 🔹 Download CSV
  const handleDownloadCSV = () => {
    const createCell = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csvHeaders = keys.map(createCell).join(',');
    const csvRows = data.map(row => keys.map(k => createCell(row[k])).join(',')).join('\n');
    const csv = [csvHeaders, csvRows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 🔹 Download Excel
  const handleDownloadExcel = () => {
    const exportData = data.map(row => {
      const cleanedRow: Record<string, any> = {};
      keys.forEach(key => {
        cleanedRow[key] = row[key] ?? '';
      });
      return cleanedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    XLSX.writeFile(workbook, `data-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Copy */}
      <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy}>
        Copy
      </Button>

      {/* Print */}
      <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint}>
        Print
      </Button>

      {/* Download Dropdown */}
      <div className="relative inline-block">
        <Button
          variant="outline"
          icon={ChevronDown}
          iconPosition="right"
          onClick={() => setIsDropdownOpen(prev => !prev)}
        >
          Download
        </Button>

        {isDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-1">
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                  onClick={() => {
                    handleDownloadCSV();
                    setIsDropdownOpen(false);
                  }}
                >
                  Download CSV
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                  onClick={() => {
                    handleDownloadExcel();
                    setIsDropdownOpen(false);
                  }}
                >
                  Download Excel
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableButton; 