'use client';

import React, { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';
import Button from '@/components/button';
import { getPeriodeLabel } from '@/utils/periode';
import { getAssessmentResult } from '@/lib/api-assessment-result';
import { useListPeriode } from '@/hooks/usePeriode';
import { BRANCHES } from '@/interfaces/branch';

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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Interfaces
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
  options: Option[];
  periodeOptions: string[];
}

// Palette
const palette = [
  { header: 'bg-red-50', border: 'border-red-300', legend: 'bg-red-500', hex: '#EF4444' },
  { header: 'bg-blue-50', border: 'border-blue-300', legend: 'bg-blue-500', hex: '#3B82F6' },
  { header: 'bg-emerald-50', border: 'border-emerald-300', legend: 'bg-emerald-500', hex: '#10B981' },
  { header: 'bg-amber-50', border: 'border-amber-300', legend: 'bg-amber-500', hex: '#F59E0B' },
  { header: 'bg-violet-50', border: 'border-violet-300', legend: 'bg-violet-500', hex: '#8B5CF6' },
  { header: 'bg-cyan-50', border: 'border-cyan-300', legend: 'bg-cyan-500', hex: '#06B6D4' },
] as const;

const getPalette = (i: number) => palette[i % palette.length];

function hexWithAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

function RadarChart({
  selectedIds,
  radarDataByUPPS,
  assessments,
  radarLabels,
}: {
  selectedIds: string[];
  radarDataByUPPS: Record<string, number[]>;
  assessments: Assessment[];
  radarLabels: string[];
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
      tension: 0,
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
            max: 100,
            ticks: { stepSize: 20 },
            grid: {
              circular: false,
            },
            angleLines: {
              display: true,
              color: '#ccc',
            },
            pointLabels: {
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
        },
      }}
      height={380}
    />
  );
}

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

export default function AssessmentResultPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterIds, setFilterIds] = useState<string[]>([]);

  // State untuk menyimpan data assessment
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [reportsByUPPS, setReportsByUPPS] = useState<Record<string, VariableReport[]>>({});
  const [radarDataByUPPS, setRadarDataByUPPS] = useState<Record<string, number[]>>({});
  const [allBranches, setAllBranches] = useState<Option[]>([]);

  // State untuk menyimpan periode aktif dan ID periode yang dipilih
  const [activePeriods, setActivePeriods] = useState<string[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  // ✅ Ambil daftar branch ID dari constants
  const allBranchIds = useMemo(() => BRANCHES.map(b => b.id), []);

  const { data: periodeData, loading: periodeLoading, error: periodeError } = useListPeriode(0);

  useEffect(() => {
    if (periodeData?.data) {
      const activePeriodes = periodeData.data
        .filter((p) => p.status === 'active')
        .map((p) => ({ label: `${p.semester} ${p.tahun}`, id: p.id }));

      setActivePeriods(activePeriodes.map(p => p.label));

      if (activePeriodes.length > 0) {
        setSelectedPeriodId(activePeriodes[0].id);
        setFilterPeriode(activePeriodes[0].label);
      }
    }
  }, [periodeData]);

  const getPeriodIdByLabel = (label: string): number | null => {
    if (!periodeData?.data) return null;
    const [semester, tahunStr] = label.split(' ');
    const tahun = parseInt(tahunStr, 10);
    const period = periodeData.data.find(p => p.semester === semester && p.tahun === tahun);
    return period ? period.id : null;
  };

  const fetchAssessmentData = async (branchId: number, periodId: number) => {
    try {
      const res = await getAssessmentResult(branchId, periodId);

      const branch = res.data.branch;
      const period = res.data.period;
      const submitPeriode = `${period.semester} ${period.year}`;

      // Ambil data TMI dari API → dinamis!
      const tmiData = res.data.transformationMaturityIndex || [];

      // Ekstrak label radar dari API (misal: 6 item → segi-6)
      const radarLabelsFromAPI = tmiData.map(item => item.name);

      // Hitung radar data sesuai urutan dari API
      const radarData = tmiData.map(item => parseFloat(item.value.toFixed(2)));

      const assessment: Assessment = {
        id: String(branch.id), // Gunakan ID asli sebagai string
        name: branch.name,
        submitPeriode: submitPeriode,
        email: branch.email,
        studentBody: branch.studentBody,
        jumlahProdi: branch.totalProdi,
        jumlahProdiUnggul: branch.totalProdiUnggul,
        maturityLevel: res.data.maturityLevel?.name || "Unknown Maturity",
      };

      const reports = tmiData.map((item: any) => {
        const { name, value } = item;
        const maturityLevelGlobal = res.data.maturityLevel || {};
        return {
          code: "",
          name: name,
          point: parseFloat(value.toFixed(2)),
          maturityLevel: maturityLevelGlobal.name || "Unknown",
          desc: maturityLevelGlobal.description || "",
        };
      });

      return { assessment, reports, radarData, submitPeriode, radarLabels: radarLabelsFromAPI };
    } catch (err) {
      console.error(`Failed to fetch data for branch ${branchId}, period ${periodId}:`, err);
      return null;
    }
  };

  // State untuk menyimpan label radar (dinamis)
  const [radarLabels, setRadarLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedPeriodId) return;

    async function init() {
      try {
        const allDataPromises = allBranchIds.map((branchId) =>
          fetchAssessmentData(branchId, selectedPeriodId)
        );

        const results = await Promise.all(allDataPromises);
        const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);

        if (validResults.length === 0) return;

        // Ambil radarLabels dari hasil pertama (asumsi semua UPPS punya struktur TMI sama)
        setRadarLabels(validResults[0].radarLabels);

        const newAssessments = validResults.map((r) => r.assessment);
        const newReportsByUPPS = validResults.reduce(
          (acc, r) => ({ ...acc, [r.assessment.id]: r.reports }),
          {}
        );
        const newRadarDataByUPPS = validResults.reduce(
          (acc, r) => ({ ...acc, [r.assessment.id]: r.radarData }),
          {}
        );
        const newBranchOptions = validResults.map((r) => ({
          id: r.assessment.id,
          name: r.assessment.name,
        }));

        setAssessments(newAssessments);
        setReportsByUPPS(newReportsByUPPS);
        setRadarDataByUPPS(newRadarDataByUPPS);
        setAllBranches(newBranchOptions);

        const allIds = newBranchOptions.map(b => b.id);
        setFilterIds(allIds);
      } catch (err) {
        console.error("Init failed:", err);
      }
    }

    init();
  }, [selectedPeriodId, allBranchIds]); // ✅ Tambahkan allBranchIds sebagai dependency

  const handleApplyFilter = async ({ periode, ids }: FilterPayload) => {
    setFilterPeriode(periode);
    setFilterIds(ids);

    const periodId = getPeriodIdByLabel(periode);
    if (!periodId) {
      console.warn(`Tidak ditemukan periodId untuk periode: ${periode}`);
      return;
    }

    setSelectedPeriodId(periodId);

    for (const id of ids) {
      if (!assessments.some(a => a.id === id)) {
        const branchId = parseInt(id, 10);
        // ✅ Pastikan branchId valid
        const allBranchIds = useMemo(() => BRANCHES.map(b => b.id), []) as number[];

        const data = await fetchAssessmentData(branchId, periodId);
        if (data) {
          setAssessments(prev => [...prev, data.assessment]);
          setReportsByUPPS(prev => ({ ...prev, [id]: data.reports }));
          setRadarDataByUPPS(prev => ({ ...prev, [id]: data.radarData }));

          // Jika radarLabels belum di-set, ambil dari data ini
          if (radarLabels.length === 0) {
            setRadarLabels(data.radarLabels);
          }

          if (!allBranches.some(b => b.id === id)) {
            setAllBranches(prev => [...prev, { id, name: data.assessment.name }]);
          }
        }
      }
    }
  };

  // ✅ Gunakan BRANCHES untuk opsi awal
  const campusOptions = useMemo<Option[]>(() => {
    // Jika allBranches belum diisi, gunakan dari constants
    if (allBranches.length > 0) return allBranches;
    return BRANCHES.map(b => ({ id: String(b.id), name: b.name }));
  }, [allBranches]);

  const periodeOptions = useMemo<string[]>(() => [...new Set(activePeriods)], [activePeriods]);

  const columns = useMemo<Assessment[]>(() => {
    if (filterIds.length === 0) return [];
    return assessments.filter(
      (a) =>
        filterIds.includes(a.id) &&
        (!filterPeriode || a.submitPeriode === filterPeriode)
    );
  }, [filterIds, filterPeriode, assessments]);

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
          <div className="bg-white p-6 rounded shadow space-y-6 mt-20">
            <div>
              <h2 className="text-lg font-bold text-gray-700">Data Assessment Result</h2>
              <p className="text-sm text-gray-500">
                Berikut adalah data assessment result berdasarkan UPPS/KC
              </p>
            </div>

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
                onApply={handleApplyFilter}
                onReset={() => {
                  setFilterPeriode('');
                  setFilterIds([]);
                }}
              />
            </div>

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
                          label: 'Periode Submit Assessment',
                          render: (c: Assessment) => getPeriodeLabel(c.submitPeriode),
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
                              radarLabels={radarLabels} // ✅ Dinamis dari API
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- TABEL LAPORAN VARIABEL PER UPPS --- */}
                {columns.length > 0 && (
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
                        {(() => {
                          const allVariableData = columns.map(c => {
                            const reports = reportsByUPPS[c.id] || [];
                            return reports.map(r => ({
                              name: r.name,
                              code: r.code,
                              point: r.point,
                              desc: r.desc,
                            }));
                          });

                          const maxVars = Math.max(...allVariableData.map(d => d.length));

                          return (
                            <>
                              {[...Array(maxVars)].map((_, varIdx) => {
                                const variableData = columns.map((c, i) => {
                                  const reports = allVariableData[i];
                                  const report = reports[varIdx];
                                  return {
                                    name: report?.name ?? '',
                                    code: report?.code ?? '',
                                    point: report?.point ?? 0,
                                    desc: report?.desc ?? '-',
                                  };
                                });

                                return (
                                  <React.Fragment key={`var-${varIdx}`}>
                                    <tr className={varIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="p-3 font-semibold bg-gray-100 text-left">Nama Variabel</td>
                                      {columns.map((c, i) => {
                                        const pal = getPalette(i);
                                        const data = variableData[i];
                                        return (
                                          <td
                                            key={`${c.id}-name-${varIdx}`}
                                            className={`p-3 text-center border-l-2 ${pal.border}`}
                                          >
                                            {data.code ? `${data.code} (${data.name})` : data.name}
                                          </td>
                                        );
                                      })}
                                    </tr>

                                    <tr className={varIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="p-3 font-semibold bg-gray-100 text-left">Point</td>
                                      {columns.map((c, i) => {
                                        const pal = getPalette(i);
                                        const data = variableData[i];
                                        return (
                                          <td
                                            key={`${c.id}-point-${varIdx}`}
                                            className={`p-3 text-center border-l-2 ${pal.border}`}
                                          >
                                            {data.point.toFixed(2)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  </React.Fragment>
                                );
                              })}

                              <tr className="bg-gray-50">
                                <td className="p-3 font-semibold bg-gray-100 text-left">Maturity Level</td>
                                {columns.map((c, i) => {
                                  const pal = getPalette(i);
                                  const assessment = assessments.find(a => a.id === c.id);
                                  return (
                                    <td
                                      key={`${c.id}-ml`}
                                      className={`p-3 text-center border-l-2 ${pal.border}`}
                                    >
                                      {assessment?.maturityLevel || 'Unknown'}
                                    </td>
                                  );
                                })}
                              </tr>

                              <tr className="bg-white">
                                <td className="p-3 font-semibold bg-gray-100 text-left">Deskripsi per Variabel</td>
                                {columns.map((c, i) => {
                                  const pal = getPalette(i);
                                  const reports = reportsByUPPS[c.id] || [];
                                  const desc = reports[0]?.desc || '-';
                                  return (
                                    <td
                                      key={`${c.id}-desc`}
                                      className={`p-3 text-center border-l-2 ${pal.border}`}
                                    >
                                      {desc}
                                    </td>
                                  );
                                })}
                              </tr>

                              <tr className="bg-gray-50">
                                <td className="p-3 font-semibold bg-gray-100 text-left">Action</td>
                                {columns.map((c, i) => {
                                  const pal = getPalette(i);
                                  return (
                                    <td
                                      key={`${c.id}-action`}
                                      className={`p-3 text-center border-l-2 ${pal.border}`}
                                    >
                                      <Button
                                        variant="primary"
                                        onClick={() => {
                                          import('xlsx').then(XLSX => {
                                            import('file-saver').then(FileSaver => {
                                              const assessment = assessments.find(a => a.id === c.id);
                                              if (!assessment) return;

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
                                              const detailData = reportsByUPPS[c.id]?.map(item => ({
                                                'Kode Variabel': item.code,
                                                'Nama Variabel': item.name,
                                                'Point': item.point,
                                                'Maturity Level': item.maturityLevel,
                                                'Deskripsi': item.desc,
                                              })) || [];

                                              const detailSheet = XLSX.utils.json_to_sheet(detailData);

                                              const workbook = XLSX.utils.book_new();
                                              XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
                                              XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Variabel');

                                              const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                                              const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                              FileSaver.saveAs(blob, `${c.name.replace(/\s+/g, '_')}-report.xlsx`);
                                            });
                                          });
                                        }}
                                      >
                                        Download
                                      </Button>
                                    </td>
                                  );
                                })}
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}  