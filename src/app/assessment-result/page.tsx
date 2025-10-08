'use client';

import React, { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';
import Button from '@/components/button';
import { getPeriodeLabel } from "@/utils/periode";
import { getAssessmentResult } from '@/lib/api-assessment-result';

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

/* Option type untuk daftar kampus/UPPS */
interface Option {
  id: string;
  name: string;
}

interface FilterUPPSPopoverProps {
  open: boolean;
  onClose: () => void;
  defaultPeriode: string;
  defaultSelectedIds: string[];
  onApply: (payload: FilterPayload) => void;
  onReset: () => void;
  options: Option[];          // daftar UPPS (id + name)
  periodeOptions: string[];   // daftar periode string
}

/* ===== Radar Labels ===== */
const radarLabels = [
  'Mutu',
  'Akademik',
  'SDM',
  'SPI',
  'Kemahasiswaan',
  'PPM, Publikasi, Abdimas',
];

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
function RadarChart({
  selectedIds,
  radarDataByUPPS,
  assessments,
}: {
  selectedIds: string[];
  radarDataByUPPS: Record<string, number[]>;
  assessments: Assessment[];
}) {
  const datasets = selectedIds.map((id, i) => {
    const pal = getPalette(i);
    return {
      label: assessments.find((x) => x.id === id)?.name || id,
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
 * Popover Filter (update)
 * - sekarang menerima `options` & `periodeOptions`
 * =======================*/
function FilterUPPSPopover({
  open,
  onClose,
  defaultPeriode,
  defaultSelectedIds,
  onApply,
  onReset,
  options,
  periodeOptions,
}: FilterUPPSPopoverProps) {
  const [periode, setPeriode] = useState<string>(defaultPeriode);
  const [ids, setIds] = useState<string[]>(defaultSelectedIds);

  // sync ketika parent props berubah
  useEffect(() => {
    setPeriode(defaultPeriode);
    setIds(defaultSelectedIds);
  }, [defaultPeriode, defaultSelectedIds]);

  const toggle = (id: string | 'all', allIds: string[]) => {
    if (id === 'all') {
      setIds(ids.length === allIds.length ? [] : allIds);
    } else {
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  if (!open) return null;

  const allIds = options.map((o) => o.id);

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
            <option value="">-- Pilih Periode --</option>
            {periodeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox UPPS dari options */}
        <div className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-700">
            <input
              type="checkbox"
              checked={ids.length === allIds.length && allIds.length > 0}
              onChange={() => toggle('all', allIds)}
              className="accent-red-600"
            />
            Semua
          </label>

          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ids.includes(opt.id)}
                onChange={() => toggle(opt.id, allIds)}
                className="accent-red-600"
              />
              {opt.name}
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
export default function AssessmentResultPage() {
  const [tab] = useState<'assessment-result'>('assessment-result');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterIds, setFilterIds] = useState<string[]>([]);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [reportsByUPPS, setReportsByUPPS] = useState<Record<string, VariableReport[]>>({});
  const [radarDataByUPPS, setRadarDataByUPPS] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAssessmentResult(1, 1); // sementara hardcode

        const branch = res.data.branch;
        const periode = `${res.data.period.semester} ${res.data.period.year}`;

        const mappedAssessment: Assessment = {
          id: `branch-${branch.id}`,
          name: branch.name,
          submitPeriode: periode,
          email: branch.email,
          studentBody: branch.studentBodyCount,
          jumlahProdi: branch.studyProgramCount,
          jumlahProdiUnggul: branch.superiorAccreditedStudyProgramCount,
          maturityLevel: "Medium Maturity",
        };

        setAssessments([mappedAssessment]);

        const reports = branch.variables?.map((v: any) => ({
          code: v.code,
          name: v.name,
          point: v.point,
          maturityLevel: v.maturityLevel,
          desc: v.description,
        })) || [];

        setReportsByUPPS({ [`branch-${branch.id}`]: reports });

        const radarData = branch.variables?.map((v: any) => v.point) || [];
        setRadarDataByUPPS({ [`branch-${branch.id}`]: radarData });
      } catch (err) {
        console.error("Failed to load assessment result:", err);
      }
    }

    fetchData();
  }, []);

  // --- definisi campusOptions & periodeOptions agar tidak undefined saat dipassing
  const campusOptions = useMemo<Option[]>(
    () => assessments.map((a) => ({ id: a.id, name: a.name })),
    [assessments]
  );

  const periodeOptions = useMemo<string[]>(
    () => Array.from(new Set(assessments.map((a) => a.submitPeriode))),
    [assessments]
  );

  // 🔍 Filter data sesuai pilihan user
  const columns = useMemo<Assessment[]>(() => {
    if (filterIds.length === 0) return [];
    return assessments.filter(
      (a) =>
        filterIds.includes(a.id) &&
        (!filterPeriode || a.submitPeriode === filterPeriode)
    );
  }, [filterIds, filterPeriode, assessments]);

  // 🏷️ Label tampilan filter di button
  const filterLabel = useMemo(() => {
    const count = filterIds.length;
    const isAll = count === assessments.length;
    const periodePart = filterPeriode ? ` • ${getPeriodeLabel(filterPeriode)}` : "";

    if (!count && !filterPeriode) return "Pilih UPPS/KC";
    if (isAll) return `Semua UPPS${periodePart}`;
    return `${count} UPPS${periodePart}`;
  }, [filterIds, filterPeriode, assessments]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="p-6 space-y-6 w-full">
        <div className="space-y-6">
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
                  options={campusOptions}
                  periodeOptions={periodeOptions}
                  onApply={({ periode, ids }) => {
                    setFilterPeriode(periode);
                    setFilterIds(ids);
                  }}
                  onReset={() => {
                    setFilterPeriode('');
                    setFilterIds([]);
                  }}
                />

              </div>

              {/* rest of UI unchanged (tables, radar, reports) */}
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
                              getPeriodeLabel(c.submitPeriode),
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

                        {/* Radar chart row */}
                        <tr className="border-t">
                          <th className="px-4 py-2 bg-[#12263A]/90 text-white align-top text-left">
                            Transformation Maturity Index
                          </th>
                          <td
                            className="px-4 py-4 border-l-2 border-gray-200"
                            colSpan={columns.length}
                          >
                            <div className="w-full h-[420px]">
                              <RadarChart
                                selectedIds={columns.map((c) => c.id)}
                                radarDataByUPPS={radarDataByUPPS}
                                assessments={assessments}
                              />
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
                        {/* Nama Variabel */}
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

                        {/* Point */}
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

                        {/* Maturity Level */}
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

                        {/* Deskripsi */}
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

               {/* Action */}
            <tr className="odd:bg-white even:bg-gray-50">
              <td className="p-3 font-semibold bg-gray-100 text-left">Action</td>
              {columns.map((c, i) => {
                const pal = getPalette(i);

                // ambil data report UPPS terkait
                const data = reportsByUPPS[c.id] || [];

                // fungsi handle download
                const handleDownload = () => {
                import('xlsx').then(XLSX => {
                import('file-saver').then(FileSaver => {
                  // === 1. Ambil assessment terkait ===
                  const assessment = assessments.find(a => a.id === c.id);
                  if (!assessment) return;

                  // === 2. Siapkan Metadata Sheet ===
                  const metadata = [
                    ['Nama UPPS/KC', assessment.name],
                    ['Periode Submit Assessment', getPeriodeLabel(assessment.submitPeriode)],
                    ['Email', assessment.email],
                    ['Student Body', assessment.studentBody],
                    ['Jumlah Prodi', assessment.jumlahProdi],
                    ['Jumlah Prodi Terakreditasi Unggul', assessment.jumlahProdiUnggul],
                    ['Maturity Level (Institusi)', assessment.maturityLevel],
                    ['Transformation Maturity Index (TMI)', radarDataByUPPS[c.id]?.length
                      ? (radarDataByUPPS[c.id].reduce((a, b) => a + b, 0) / radarDataByUPPS[c.id].length).toFixed(2)
                      : 'N/A'
                    ],
                  ];

                              const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);

                              // === 3. Siapkan Detail Variabel Sheet ===
                              const detailData = (reportsByUPPS[c.id] || []).map(item => ({
                                'Kode Variabel': item.code,
                                'Nama Variabel': item.name,
                                'Point': item.point,
                                'Maturity Level': item.maturityLevel,
                                'Deskripsi': item.desc,
                              }));

                              const detailSheet = XLSX.utils.json_to_sheet(detailData);

                              // === 4. Gabung ke Workbook ===
                              const workbook = XLSX.utils.book_new();
                              XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
                              XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Variabel');

                              // === 5. Ekspor ===
                              const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                              const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                              FileSaver.saveAs(blob, `${c.name.replace(/\s+/g, '_')}-report.xlsx`);
                            });
                          });
                        };
                            return (
                              <td
                                key={c.id}
                                className={`p-3 text-center border-l-2 h-full ${pal.border}`}
                              >
                                <Button variant="primary" onClick={handleDownload}>
                                  Download
                                </Button>
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
