'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';
import Button from '@/components/button';
import { getPeriodeLabel } from "@/utils/periode";



/* === Chart.js === */
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Assessment {
  id: string;
  name: string;
  submitPeriode: string; 
  email: string;
  studentBody: number;
  jumlahProdi: number;
  jumlahProdiUnggul: number;
  maturityLevel: string;

}

interface VariableReport {
  code: string;
  name: string;
  point: number;
  maturityLevel: string;
  desc: string;
}

interface FilterPayload {
  ids: string[];
  periode: string; 

}

interface FilterUPPSPopoverProps {
  open: boolean;
  onClose: () => void;
  defaultPeriode: string;
  defaultSelectedIds: string[];
  onApply: (payload: FilterPayload) => void;
  onReset: () => void;
  submitPeriode: string; // ← Ini penting!

}

/* =========================
 * Dummy data
 * =======================*/
const assessmentList: Assessment[] = [
  {
    id: 'tel-u-sby',
    name: 'Tel-U Surabaya',
    submitPeriode: 'Ganjil 2025',
    email: 'surabaya@telkomuniversity.ac.id',
    studentBody: 3500,
    jumlahProdi: 11,
    jumlahProdiUnggul: 2,
    maturityLevel: 'Medium Maturity',
  },
  {
    id: 'tel-u-jkt',
    name: 'Tel-U Jakarta',
    submitPeriode: 'Ganjil 2025',
    email: 'jkt.telkomuniversity.ac.id',
    studentBody: 3400,
    jumlahProdi: 13,
    jumlahProdiUnggul: 2,
    maturityLevel: 'Medium Maturity',
  },
  {
    id: 'tel-u-bdg',
    name: 'Tel-U Bandung',
    submitPeriode: 'Ganjil 2025',
    email: 'bandung.telkomuniversity.ac.id',
    studentBody: 3800,
    jumlahProdi: 10,
    jumlahProdiUnggul: 3,
    maturityLevel: 'Medium Maturity',
  },
  {
    id: 'tel-u-pwk',
    name: 'Tel-U Purwokerto',
    submitPeriode: 'Ganjil 2025',
    email: 'purwokerto@telkomuniversity.ac.id',
    studentBody: 3100,
    jumlahProdi: 11,
    jumlahProdiUnggul: 2,
    maturityLevel: 'Medium Maturity',
  },
];

const reportsByUPPS: Record<string, VariableReport[]> = {
  'tel-u-sby': [
    {
      code: 'VI',
      name: 'Akademik',
      point: 20,
      maturityLevel: 'DIFFERENTIATING',
      desc:
        'Institusi memiliki kebijakan yang selaras dalam transformasi digital dengan sistem dasar yang ada.',
    },
  ],
  'tel-u-jkt': [
    {
      code: 'VI',
      name: 'Akademik',
      point: 18,
      maturityLevel: 'EMERGING',
      desc:
        'Institusi memiliki rencana transformasi digital dasar yang sedang dirapikan.',
    },
  ],
  'tel-u-bdg': [
    {
      code: 'VI',
      name: 'Akademik',
      point: 22,
      maturityLevel: 'DIFFERENTIATING',
      desc:
        'Institusi memiliki kebijakan yang selaras dalam transformasi digital dan dikelola dengan baik.',
    },
  ],
  'tel-u-pwk': [
    {
      code: 'VI',
      name: 'Akademik',
      point: 20,
      maturityLevel: 'DIFFERENTIATING',
      desc:
        'Institusi memiliki kebijakan yang selaras dalam transformasi digital dengan sistem dasar yang ada.',
    },
  ],
};

/* ===== Radar Data (dummy) ===== */
const radarLabels = [
  'Mutu',
  'Akademik',
  'SDM',
  'SPI',
  'Kemahasiswaan',
  'PPM, Publikasi, Abdimas',
];

const radarDataByUPPS: Record<string, number[]> = {
  'tel-u-sby': [8, 7, 6, 7, 6, 5],
  'tel-u-jkt': [6, 8, 5, 7, 6, 7],
  'tel-u-bdg': [9, 7, 8, 8, 7, 6],
  'tel-u-pwk': [7, 6, 7, 6, 5, 5],
};

/* =========================
 * Palette per kolom
 * =======================*/
const palette = [
  { header: 'bg-red-50', border: 'border-red-300', legend: 'bg-red-500', hex: '#EF4444' },
  { header: 'bg-blue-50', border: 'border-blue-300', legend: 'bg-blue-500', hex: '#3B82F6' },
  { header: 'bg-emerald-50', border: 'border-emerald-300', legend: 'bg-emerald-500', hex: '#10B981' },
  { header: 'bg-amber-50', border: 'border-amber-300', legend: 'bg-amber-500', hex: '#F59E0B' },
  { header: 'bg-violet-50', border: 'border-violet-300', legend: 'bg-violet-500', hex: '#8B5CF6' },
  { header: 'bg-cyan-50', border: 'border-cyan-300', legend: 'bg-cyan-500', hex: '#06B6D4' },
] as const;
const getPalette = (i: number) => palette[i % palette.length];

/* =========================
 * RadarChart Component
 * =======================*/
function RadarChart({ selectedIds }: { selectedIds: string[] }) {
  const datasets = selectedIds.map((id, i) => {
    const pal = getPalette(i);
    return {
      label: assessmentList.find((x) => x.id === id)?.name || id,
      data: radarDataByUPPS[id] || new Array(radarLabels.length).fill(0),
      backgroundColor: hexWithAlpha(pal.hex, 0.15),
      borderColor: pal.hex,
      borderWidth: 2,
      pointBackgroundColor: pal.hex,
      pointBorderColor: '#fff',
    };
  });

  return (
    <Radar
      data={{ labels: radarLabels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' as const },
          tooltip: { enabled: true },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: { stepSize: 2 },
            grid: { circular: true },
          },
        },
      }}
      height={380}
    />
  );
}

function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

/* =========================
 * Popover Filter
 * =======================*/
function FilterUPPSPopover({
  open,
  onClose,
  defaultPeriode,
  defaultSelectedIds,
  onApply,
  onReset,

}: FilterUPPSPopoverProps) {
  const [periode, setPeriode] = useState<string>(defaultPeriode);
  const [ids, setIds] = useState<string[]>(defaultSelectedIds);
  const isAllSelected = ids.length === assessmentList.length;

  const toggle = (id: string | 'all') => {
    if (id === 'all') {
      setIds(isAllSelected ? [] : assessmentList.map((a) => a.id));
    } else {
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  if (!open) return null;

  return (
    <div className="absolute z-30 mt-2 w-80 bg-white rounded-md shadow-lg border">
      <div className="p-4 space-y-4">
       {/* Pilih Periode */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pilih Periode
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-red-400"
              >
                <option value="Genap 2025">Genap 2025</option>
                <option value="Ganjil 2025">Ganjil 2025</option>
                <option value="Genap 2024">Genap 2024</option>
              </select>
            </div>


        {/* Checkbox UPPS */}
        <div className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-700">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => toggle('all')}
              className="accent-red-600"
            />
            Semua
          </label>

          {assessmentList.map((a) => (
            <label key={a.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ids.includes(a.id)}
                onChange={() => toggle(a.id)}
                className="accent-red-600"
              />
              {a.name}
            </label>
          ))}
        </div>

        {/* Tombol */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              onApply({ periode, ids });
              onClose();
            }}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded font-semibold"
          >
            Terapkan
          </button>
          <button
            onClick={() => {
              onReset();
              setPeriode('');
              setIds([]);
              onClose();
            }}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Main Page
 * =======================*/
export default function WelcomePage() {
  const [tab] = useState<'assessment-result'>('assessment-result');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState(''); 
  const [filterIds, setFilterIds] = useState<string[]>([]); 

  // 🔍 Filter data sesuai pilihan user
  const columns = useMemo<Assessment[]>(() => {
    if (filterIds.length === 0) return [];
    return assessmentList.filter(
      (a) =>
        filterIds.includes(a.id) &&
        (!filterPeriode || a.submitPeriode === filterPeriode)
    );
  }, [filterIds, filterPeriode]);

  // 🏷️ Label tampilan filter di button
  const filterLabel = useMemo(() => {
    const count = filterIds.length;
    const isAll = count === assessmentList.length;
    const periodePart = filterPeriode ? ` • ${getPeriodeLabel(filterPeriode)}` : "";

    if (!count && !filterPeriode) return "Pilih UPPS/KC";
    if (isAll) return `Semua UPPS${periodePart}`;
    return `${count} UPPS${periodePart}`;
  }, [filterIds, filterPeriode]);


   return (
    <div className="flex min-h-screen bg-gray-100">
       <main className="p-6 space-y-6 w-full">
        <div className="space-y-6">
       {/* ASSESSMENT RESULT */}
          {tab === 'assessment-result' && (
            <div className="bg-white p-6 rounded shadow space-y-6 mt-20">
              <div>
                <h2 className="text-lg font-bold text-gray-700">Data Assessment Result</h2>
                <p className="text-sm text-gray-500">
                  Berikut adalah data assessment result berdasarkan UPPS/KC
                </p>
              </div>

              {/* Filter Trigger */}
              <div className="relative inline-block">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="min-w-[16rem] flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <span className={clsx(!filterIds.length && !filterPeriode && 'text-gray-400')}>
                    {filterLabel}
                  </span>
                  <FiChevronDown className="text-gray-500" />
                </button>

                <FilterUPPSPopover
                  open={filterOpen}
                  onClose={() => setFilterOpen(false)}
                  defaultPeriode={filterPeriode}
                  defaultSelectedIds={filterIds}
                  onApply={({ periode, ids }) => {
                    setFilterPeriode(periode);
                    setFilterIds(ids);
                    
                  }}
                  onReset={() => {
                    setFilterPeriode('');
                    setFilterIds([]);
                  }}
                    submitPeriode={filterPeriode}
                />
              </div>

              {/* Tabel Data Utama */}
              {columns.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Belum ada UPPS/KC yang dipilih. Silakan pilih pada filter di atas.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto border rounded mt-6">
                    <table className="w-full table-fixed text-sm">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 w-64 text-left font-semibold bg-[#12263A]/90 text-white">
                            Nama UPPS/KC
                          </th>
                          {columns.map((c, i) => {
                            const pal = getPalette(i);
                            return (
                              <th
                                key={c.id}
                                className={clsx(
                                  'px-4 py-3 text-left font-semibold border-l-2 min-w-[220px]',
                                  pal.header,
                                  pal.border
                                )}
                              >
                                {c.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {[
                          {
                            label: 'Priode Submit Assessment',
                            render: (c: Assessment) =>
                            getPeriodeLabel(c.submitPeriode)
                          },
                          { label: 'Email', render: (c: Assessment) => c.email },
                          { label: 'Student Body', render: (c: Assessment) => c.studentBody },
                          { label: 'Jumlah Prodi', render: (c: Assessment) => c.jumlahProdi },
                          {
                            label: 'Jumlah Prodi Terakreditasi Unggul',
                            render: (c: Assessment) => c.jumlahProdiUnggul,
                          },
                          { label: 'Maturity Level', render: (c: Assessment) => c.maturityLevel },
                        ].map((row, idx) => (
                          <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <th className="px-4 py-2 bg-[#12263A]/90 text-white text-left">
                              {row.label}
                            </th>
                            {columns.map((c, i) => {
                              const pal = getPalette(i);
                              return (
                                <td
                                  key={c.id}
                                  className={clsx(
                                    'px-4 py-2 border-l-2 min-w-[220px]',
                                    pal.border
                                  )}
                                >
                                  {row.render(c)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}

                        {/* Radar chart row (DINAMIS) */}
                        <tr className="border-t">
                          <th className="px-4 py-2 bg-[#12263A]/90 text-white align-top text-left">
                            Transformation Maturity Index
                          </th>
                          <td className="px-4 py-4 border-l-2 border-gray-200" colSpan={columns.length}>
                            <div className="w-full h-[420px]">
                              <RadarChart selectedIds={columns.map((c) => c.id)} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                      </table>
                    </div> 
                            
                          {/* Report-Table */}
                     <div className="overflow-x-auto border rounded mt-6">
                  <table className="w-full table-fixed text-sm">
                    <thead className="bg-[#12263A]/90 text-white">
                      <tr>
                        <th className="p-3 w-64 text-left">Report</th>
                        {columns.map((c, i) => {
                          const pal = getPalette(i);
                          return (
                            <th
                              key={c.id}
                              className={`px-4 py-3 text-left font-semibold min-w-[220px] text-black border-l-2 ${pal.header} ${pal.border}`}
                            >
                              {c.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* Baris: Nama Variabel */}
                      <tr className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 font-semibold bg-gray-100 text-left">Nama Variabel</td>
                        {columns.map((c, i) => {
                          const data = (reportsByUPPS[c.id] || [])[0];
                          const pal = getPalette(i);
                          return (
                            <td
                              key={c.id}
                              className={`p-3 text-center border-l-2 h-full align-top ${pal.border}`}
                            >
                              {data ? `${data.code} (${data.name})` : '-'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris: Point */}
                      <tr className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 font-semibold bg-gray-100 text-left">Point</td>
                        {columns.map((c, i) => {
                          const data = (reportsByUPPS[c.id] || [])[0];
                          const pal = getPalette(i);
                          return (
                            <td
                              key={c.id}
                              className={`p-3 text-center border-l-2 h-full ${pal.border}`}
                            >
                              {data ? data.point : '-'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris: Maturity Level */}
                      <tr className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 font-semibold bg-gray-100 text-left">Maturity Level</td>
                        {columns.map((c, i) => {
                          const data = (reportsByUPPS[c.id] || [])[0];
                          const pal = getPalette(i);
                          return (
                            <td
                              key={c.id}
                              className={`p-3 text-center border-l-2 h-full ${pal.border}`}
                            >
                              {data ? data.maturityLevel : '-'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris: Deskripsi */}
                      <tr className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 font-semibold bg-gray-100 text-left">
                          Deskripsi per Variabel
                        </td>
                        {columns.map((c, i) => {
                          const data = (reportsByUPPS[c.id] || [])[0];
                          const pal = getPalette(i);
                          return (
                            <td
                              key={c.id}
                              className={`p-3 text-justify border-l-2 align-top h-full ${pal.border}`}
                            >
                              {data ? data.desc : '-'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Baris: Action */}
                      <tr className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 font-semibold bg-gray-100 text-left">Action</td>
                        {columns.map((c, i) => {
                          const pal = getPalette(i);
                          return (
                            <td
                              key={c.id}
                              className={`p-3 text-center border-l-2 h-full ${pal.border}`}
                            >
                              <Button variant="primary">Download</Button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          )}
          </div>
        </main>
    </div>
  );
}
 
