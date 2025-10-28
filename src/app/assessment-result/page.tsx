'use client';

import React, { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';
import Button from '@/components/button';
import { getPeriodeLabel } from '@/utils/periode';
import { getAssessmentResult } from '@/lib/api-assessment-result';
import { useListPeriode } from '@/hooks/usePeriode';
import { BRANCHES } from '@/interfaces/branch';
import { useRouter } from 'next/navigation';

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

import { toPng } from 'dom-to-image-more';
import jsPDF from 'jspdf';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const normalizeLabel = (str: string) => str.trim().toLowerCase();

interface Assessment {
  id: string;
  name: string;
  submitPeriode: string;
  email: string;
  studentBody: number;
  jumlahProdi: number;
  jumlahProdiUnggul: number;
  maturityLevel: {
    name: string;
    description: string;
  };
}

interface VariableReport {
  code: string;
  name: string;
  normalized: string;
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

const palette = [
  { header: 'bg-red-50', border: 'border-red-300', legend: 'bg-red-500', hex: '#EF4444' },
  { header: 'bg-blue-50', border: 'border-blue-300', legend: 'bg-blue-500', hex: '#3B82F6' },
  { header: 'bg-emerald-50', border: 'border-emerald-300', legend: 'bg-emerald-500', hex: '#10B981' },
  { header: 'bg-amber-50', border: 'border-amber-300', legend: 'bg-amber-500', hex: '#F59E0B' },
  { header: 'bg-violet-50', border: 'border-violet-300', legend: 'bg-violet-500', hex: '#8B5CF6' },
  { header: 'bg-cyan-50', border: 'border-cyan-300', legend: 'bg-cyan-500', hex: '#06B6D4' },
] as const;

const getPalette = (i: number) => palette[i % palette.length];

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
            grid: { circular: false },
            angleLines: { display: true, color: '#ccc' },
            pointLabels: { font: { size: 12, weight: 'bold' } },
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

function FilterUPPSPopover({
  open,
  onClose,
  defaultPeriode,
  defaultSelectedIds,
  onApply,
  onReset,
  options,
  periodeOptions,
}: {
  open: boolean;
  onClose: () => void;
  defaultPeriode: string;
  defaultSelectedIds: string[];
  onApply: (payload: FilterPayload) => void;
  onReset: () => void;
  options: Option[];
  periodeOptions: string[];
}) {
  const [periode, setPeriode] = useState(defaultPeriode);
  const [ids, setIds] = useState(defaultSelectedIds);
  const allIds = options.map((o) => o.id);

  useEffect(() => {
    setPeriode(defaultPeriode);
    setIds(defaultSelectedIds);
  }, [defaultPeriode, defaultSelectedIds]);

  const toggle = (id: string | 'all') => {
    if (id === 'all') {
      setIds(ids.length === allIds.length ? [] : allIds);
    } else {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  };

  if (!open) return null;

  return (
    <div className="absolute z-30 mt-2 w-80 bg-white rounded-md shadow-lg border">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Pilih Periode</label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-red-400"
          >
            <option value="">-- Pilih Periode --</option>
            {periodeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-700">
            <input
              type="checkbox"
              checked={ids.length === allIds.length && allIds.length > 0}
              onChange={() => toggle('all')}
              className="accent-red-600"
            />
            Semua
          </label>
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ids.includes(opt.id)}
                onChange={() => toggle(opt.id)}
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
            className="w-full border text-gray-700 py-2 rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentResultPage() {
  const router = useRouter();

  const user = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState('');
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [radarImageUrls, setRadarImageUrls] = useState<Record<string, string>>({});

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [reportsByUPPS, setReportsByUPPS] = useState<Record<string, VariableReport[]>>({});
  const [radarDataByUPPS, setRadarDataByUPPS] = useState<Record<string, number[]>>({});
  const [allBranches, setAllBranches] = useState<Option[]>([]);
  const [activePeriods, setActivePeriods] = useState<string[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [radarLabels, setRadarLabels] = useState<string[]>([
    'Budaya Mutu',
    'Relevansi Pengabdian Pada Masyarakat',
    'Akuntabilitas',
    'Diferensiasi Misi',
    'Relevansi Pendidikan',
    'Relevansi Penelitian',
  ]);

 const allBranchIds = useMemo(() => {
  if (!user) return [];

  const roleId = user.role?.id ?? user.roleId;
  const branchId = user.branchId ? Number(user.branchId) : null;

  // Daftar role yang diizinkan
  const allowedRoles = [1, 2, 3, 4];
  const allowedBranches = [1, 2, 3, 4];

  // Pastikan roleId valid
  if (!allowedRoles.includes(Number(roleId))) {
    console.warn('RoleId tidak diizinkan:', roleId);
    return [];
  }

  // Jika roleId === 1 → akses semua cabang
  if (roleId === 1) {
    return BRANCHES.map((b) => b.id);
  }

  // Jika roleId 2, 3, atau 4 → harus punya branchId yang valid
  if (branchId && allowedBranches.includes(branchId)) {
    return [branchId];
  }

  // Jika tidak punya branchId atau branchId tidak valid → tidak ada akses
  console.warn('User tidak memiliki branchId yang valid:', branchId);
  return [];
}, [user]);

  const { data: periodeData } = useListPeriode(0);

  useEffect(() => {
    if (!periodeData?.data) return;
    const active = periodeData.data
      .filter((p) => p.status === 'active')
      .map((p) => `${p.semester} ${p.tahun}`);
    setActivePeriods(active);
    if (active.length > 0) {
      setFilterPeriode(active[0]);
      const first = periodeData.data.find((p) => `${p.semester} ${p.tahun}` === active[0]);
      setSelectedPeriodId(first?.id ?? null);
    }
  }, [periodeData]);

  const getPeriodIdByLabel = (label: string): number | null => {
    if (!periodeData?.data || !label) return null;
    const parts = label.trim().split(' ');
    if (parts.length < 2) return null;
    const semester = parts[0];
    const tahunStr = parts[1];
    const tahun = parseInt(tahunStr, 10);
    if (isNaN(tahun)) return null;
    return periodeData.data.find((p) => p.semester === semester && p.tahun === tahun)?.id ?? null;
  };

  const fetchAssessmentData = async (branchId: number, periodId: number) => {
    try {
      const res = await getAssessmentResult(branchId, periodId);
      const { branch, period, transformationMaturityIndex: tmiData, maturityLevel: overallMaturity } = res.data;
      const submitPeriode = `${period.semester} ${period.year}`;
      const radarLabels = tmiData.map((item: any) => item.name);
      const radarData = tmiData.map((item: any) => parseFloat(item.value.toFixed(2)));

      const assessment: Assessment = {
        id: String(branch.id),
        name: branch.name,
        submitPeriode,
        email: branch.email,
        studentBody: branch.studentBody,
        jumlahProdi: branch.totalProdi,
        jumlahProdiUnggul: branch.totalProdiUnggul,
        maturityLevel: overallMaturity || { name: 'Unknown', description: 'Tidak ada deskripsi.' },
      };

      const reports = tmiData.map((item: any) => {
        const ml = item.maturityLevel || {};
        return {
          code: item.code || item.name,
          name: item.name,
          normalized: normalizeLabel(item.name),
          point: parseFloat(item.value.toFixed(2)),
          maturityLevel: ml.name || 'Unknown',
          desc: ml.description || item.description || 'Tidak ada deskripsi.',
        };
      });

      return { assessment, reports, radarData, radarLabels };
    } catch (err) {
      console.error(`Fetch failed for branch ${branchId}, period ${periodId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    if (!selectedPeriodId || allBranchIds.length === 0) {
      setAssessments([]);
      setReportsByUPPS({});
      setRadarDataByUPPS({});
      setAllBranches([]);
      setFilterIds([]);
      return;
    }

    const load = async () => {
      const promises = allBranchIds.map((id) => fetchAssessmentData(id, selectedPeriodId));
      const results = (await Promise.all(promises)).filter(Boolean) as Awaited<
        ReturnType<typeof fetchAssessmentData>
      >[];

      if (results.length === 0) return;

      setRadarLabels(results[0].radarLabels);
      setAssessments(results.map((r) => r.assessment));
      setReportsByUPPS(
        results.reduce((acc, r) => ({ ...acc, [r.assessment.id]: r.reports }), {})
      );
      setRadarDataByUPPS(
        results.reduce((acc, r) => ({ ...acc, [r.assessment.id]: r.radarData }), {})
      );
      setAllBranches(results.map((r) => ({ id: r.assessment.id, name: r.assessment.name })));
      setFilterIds(results.map((r) => r.assessment.id));
    };

    load();
  }, [selectedPeriodId, allBranchIds]);

  const handleApplyFilter = ({ periode, ids }: FilterPayload) => {
    setFilterPeriode(periode);
    setFilterIds(ids);
    const periodId = getPeriodIdByLabel(periode);
    if (periodId) setSelectedPeriodId(periodId);
  };

  const campusOptions = useMemo(() => {
    if (allBranches.length > 0) {
      return allBranches;
    }
    return BRANCHES.filter((b) => allBranchIds.includes(b.id)).map((b) => ({
      id: String(b.id),
      name: b.name,
    }));
  }, [allBranches, allBranchIds]);

  const periodeOptions = useMemo(() => [...new Set(activePeriods)], [activePeriods]);

  const columns = useMemo(
    () =>
      assessments.filter(
        (a) => filterIds.includes(a.id) && (!filterPeriode || a.submitPeriode === filterPeriode)
      ),
    [filterIds, filterPeriode, assessments]
  );

  const filterLabel = useMemo(() => {
    const count = filterIds.length;
    const isAll = count === assessments.length;
    const periodePart = filterPeriode ? ` • ${getPeriodeLabel(filterPeriode)}` : '';
    if (!count && !filterPeriode) return 'Pilih UPPS/KC';
    if (isAll) return `Semua UPPS${periodePart}`;
    return `${count} UPPS${periodePart}`;
  }, [filterIds, filterPeriode, assessments]);

  const captureRadarAsImage = () => {
  const canvas = document.querySelector('#download-content canvas') as HTMLCanvasElement | null; 
   if (canvas) {
      const url = canvas.toDataURL('image/png');
      setRadarImageUrls({ radar: url });
    }
  };

  const handleDownloadAll = async () => {
    const original = document.getElementById('download-content');
    if (!original) {
      console.warn('Elemen #download-content tidak ditemukan');
      return;
    }

    setIsDownloading(true);
    setIsExporting(true);

    await new Promise((r) => setTimeout(r, 600));
    captureRadarAsImage();
    await new Promise((r) => setTimeout(r, 300)); 

    const clone = original.cloneNode(true) as HTMLElement;
    clone.id = 'temp-clone-for-pdf';

    Object.assign(clone.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: 'fit-content',
      minWidth: '100%',
      overflow: 'visible',
      whiteSpace: 'nowrap',
      backgroundColor: 'white',
      padding: '24px',
      zIndex: '-1000',
      transform: 'scale(1)',
      transformOrigin: 'top left',
    });

    document.body.appendChild(clone);
    clone.getBoundingClientRect();

    try {
      await new Promise((r) => setTimeout(r, 500));

      const dataUrl = await toPng(clone, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const img = new Image();
      img.src = dataUrl;
      await img.decode();

      const px2mm = 25.4 / 96;
      const imgW = img.width * px2mm;
      const imgH = img.height * px2mm;
      const pageW = 297;
      const pageH = 210;

      const scale = Math.min(pageW / imgW, pageH / imgH, 1);
      const finalW = imgW * scale;
      const finalH = imgH * scale;

      pdf.addImage(
        dataUrl,
        'PNG',
        (pageW - finalW) / 2,
        (pageH - finalH) / 2,
        finalW,
        finalH
      );

      pdf.save(`Laporan_Assessment_${filterPeriode || 'semua_periode'}.pdf`);
    } catch (err) {
      console.error('Gagal generate PDF:', err);
      alert('Gagal membuat PDF. Coba lagi.');
    } finally {
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      setIsDownloading(false);
      setIsExporting(false);
      setRadarImageUrls({}); 
    }
  };

  if (user && allBranchIds.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center p-6 bg-white rounded shadow">
          <p className="text-red-600">Anda tidak memiliki akses ke data assessment.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

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
                className="min-w-[16rem] flex justify-between items-center px-4 py-2 border rounded-md bg-white text-sm"
              >
                <span
                  className={clsx(!filterIds.length && !filterPeriode && 'text-gray-400')}
                >
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
              <p className="text-sm text-gray-500 italic">Belum ada UPPS/KC yang dipilih.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div
                    id="download-content"
                    className={clsx(
                      'inline-block min-w-full space-y-6 p-4 bg-white',
                      isExporting && 'whitespace-nowrap'
                    )}
                  >
                    <table className="w-full table-auto text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="p-4 font-semibold text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10">
                            Nama UPPS/KC
                          </th>
                          {columns.map((c, i) => {
                            const pal = getPalette(i);
                            return (
                              <th
                                key={c.id}
                                className={clsx(
                                  'px-4 py-3 text-center font-semibold border-l-2 min-w-[220px]',
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
                      <tbody>
                        {[
                          { label: 'Periode Submit Assessment', render: (c: Assessment) => getPeriodeLabel(c.submitPeriode) },
                          { label: 'Email', render: (c: Assessment) => c.email },
                          { label: 'Student Body', render: (c: Assessment) => c.studentBody },
                          { label: 'Jumlah Prodi', render: (c: Assessment) => c.jumlahProdi },
                          { label: 'Jumlah Prodi Terakreditasi Unggul', render: (c: Assessment) => c.jumlahProdiUnggul },
                          { label: 'Maturity Level', render: (c: Assessment) => c.maturityLevel.name },
                          { 
                            label: 'Deskripsi', 
                            render: (c: Assessment) => c.maturityLevel.description || '-' 
                          },
                        ].map((row, idx) => (
                          <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <th className="p-4 font-semibold text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10">
                              {row.label}
                            </th>
                            {columns.map((c, i) => {
                              const pal = getPalette(i);
                              return (
                                <td
                                  key={c.id}
                                  className={clsx(
                                    'px-4 py-2 border-l-2 min-w-[220px]',
                                    row.label === 'Deskripsi' ? 'whitespace-pre-line text-xs' : '',
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
                          <th className="p-4 font-semibold text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10">
                            Transformation Maturity Index
                          </th>
                          <td className="px-4 py-4 border-l-2 border-gray-200" colSpan={columns.length}>
                            <div className="w-full h-[420px] flex items-center justify-center">
                              {isExporting && radarImageUrls.radar ? (
                                <img
                                  src={radarImageUrls.radar}
                                  alt="Radar Chart"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <RadarChart
                                  key={`radar-${isExporting ? 'export' : 'view'}`} 
                                  selectedIds={columns.map((c) => c.id)}
                                  radarDataByUPPS={radarDataByUPPS}
                                  assessments={assessments}
                                  radarLabels={radarLabels}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full table-auto text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="p-4 font-semibold text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10" style={{ width: '280px' }}>
                            Report
                          </th>
                          {columns.map((c, i) => {
                            const pal = getPalette(i);
                            return (
                              <th
                                key={c.id}
                                colSpan={4}
                                className={clsx(
                                  'p-4 text-center font-semibold border-l whitespace-nowrap',
                                  pal.header,
                                  pal.border
                                )}
                              >
                                {c.name}
                              </th>
                            );
                          })}
                        </tr>
                        <tr>
                          <th className="p-3 text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10"></th>
                          {columns.map((c, i) => {
                            const pal = getPalette(i);
                            return (
                              <React.Fragment key={`${c.id}-sub`}>
                                <th className={clsx('p-3 text-center border-l min-w-[150px] whitespace-nowrap font-medium', pal.header, pal.border)}>
                                  Nama Variabel
                                </th>
                                <th className={clsx('p-3 text-center border-l min-w-[90px] whitespace-nowrap font-medium', pal.header, pal.border)}>
                                  Point
                                </th>
                                <th className={clsx('p-3 text-center min-w-[160px] whitespace-nowrap font-medium', pal.header, pal.border)}>
                                  Maturity Level
                                </th>
                                <th className={clsx('p-3 text-center max-w-[200px] whitespace-nowrap font-medium', pal.header, pal.border)}>
                                  Deskripsi
                                </th>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {radarLabels.map((label, idx) => (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                            <th className="p-3 text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[280px] sticky left-0 z-10">
                              &nbsp;
                            </th>
                            {columns.map((c, i) => {
                              const pal = getPalette(i);
                              const report = (reportsByUPPS[c.id] || []).find(
                                (r) => r.normalized === normalizeLabel(label)
                              );
                              return (
                                <React.Fragment key={`${c.id}-${label}`}>
                                  <td className={clsx('p-3 text-center border-l min-w-[150px] whitespace-pre-line', pal.border)}>
                                    {report?.name ?? label}
                                  </td>
                                  <td className={clsx('p-3 text-center border-l min-w-[90px]', pal.border)}>
                                    {report?.point ?? 0}
                                  </td>
                                  <td className={clsx('p-3 text-center border-l min-w-[160px]', pal.border)}>
                                    {report?.maturityLevel ?? 'Unknown'}
                                  </td>
                                  <td className={clsx('p-3 text-center border-l max-w-[200px] whitespace-pre-line text-xs', pal.border)}>
                                    {report?.desc || 'Tidak ada deskripsi.'}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    variant="primary"
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="px-6 py-2 text-sm"
                  >
                    {isDownloading ? 'Mengunduh...' : 'Download'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}