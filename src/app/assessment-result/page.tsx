'use client';

import React, { useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';
import Button from '@/components/button';
import { getPeriodeLabel } from '@/utils/periode';
import { getAssessmentResult } from '@/lib/api-assessment-result';
import { useListPeriode } from '@/hooks/usePeriode';
import { useListBranch } from '@/hooks/useBranch';
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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const normalizeLabel = (str: string) =>
  str.trim().toLowerCase().replace(/\s+/g, ' ');

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

  const [isClient, setIsClient] = useState(false);
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdfExportMode, setPdfExportMode] = useState(false);

  const [radarLabels, setRadarLabels] = useState<string[]>([]);

  const { data: branchData, isLoading: loadingBranches } = useListBranch(0);
  const { data: periodeData } = useListPeriode(0);

  const allBranchIds = useMemo(() => {
    if (!user) return [];

    const roleId = Number(user.role?.id ?? user.roleId ?? -1);

    if (roleId === 1 || roleId === 4) {
      return branchData?.data.map((b) => b.id) || [];
    }

    if (roleId === 2 && user.branchId != null) {
      return [Number(user.branchId)];
    }

    return [];
  }, [user, branchData]);

  useEffect(() => {
    if (!periodeData?.data) return;
    const active = periodeData.data
      .filter((p) => p.status === 'active')
      .map((p) => `${p.semester} ${p.tahun}`);
    setActivePeriods(active);
    if (active.length > 0) {
      const firstLabel = active[0];
      setFilterPeriode(firstLabel);
      const first = periodeData.data.find((p) => `${p.semester} ${p.tahun}` === firstLabel);
      if (first) {
        setSelectedPeriodId(first.id);
      }
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
    const period = periodeData.data.find((p) => p.semester === semester && p.tahun === tahun);
    return period?.id || null;
  };

  const fetchAssessmentData = async (branchId: number, periodId: number) => {
    try {
      const res = await getAssessmentResult(branchId, periodId);
      const { branch, period, transformationMaturityIndex: tmiData, maturityLevel: overallMaturity } = res.data;

      if (!branch || !period) return null;

      const targetYear = period.year;

      let studentBody = branch.studentBody ?? 0;
      let jumlahProdi = branch.totalProdi ?? 0;
      let jumlahProdiUnggul = branch.totalProdiUnggul ?? 0;

      if (Array.isArray(branch.branchDetails)) {
        const detail = branch.branchDetails.find((d: any) => d?.year === targetYear);
        if (detail) {
          studentBody = detail.studentBodyCount ?? studentBody;
          jumlahProdi = detail.studyProgramCount ?? jumlahProdi;
          jumlahProdiUnggul = detail.superiorAccreditedStudyProgramCount ?? jumlahProdiUnggul;
        }
      }

      const submitPeriode = `${period.semester} ${period.year}`;

      const labelsFromAPI = tmiData.map((item: any) => item.name);

      const reports = labelsFromAPI.map((label) => {
        const match = tmiData.find((item: any) => item.name === label);
        const ml = match?.maturityLevel || {};
        return {
          name: label,
          normalized: normalizeLabel(label),
          point: match ? parseFloat((match.value ?? 0).toFixed(2)) : 0,
          maturityLevel: ml.name || 'Unknown',
          desc: ml.description || match?.description || 'Tidak ada deskripsi.',
        };
      });

      const radarData = reports.map(r => r.point);

      const assessment: Assessment = {
        id: String(branch.id),
        name: branch.name,
        submitPeriode,
        email: branch.email,
        studentBody,
        jumlahProdi,
        jumlahProdiUnggul,
        maturityLevel: overallMaturity || { name: 'Unknown', description: 'Tidak ada deskripsi.' },
      };

      return { assessment, reports, radarData, radarLabels: labelsFromAPI };
    } catch (err) {
      console.error(`[API] Fetch failed for branch ${branchId}, period ${periodId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    if (!selectedPeriodId || allBranchIds.length === 0) {
      setAssessments([]);
      setReportsByUPPS({});
      setRadarDataByUPPS({});
      setRadarLabels([]);
      setAllBranches([]);
      setFilterIds([]);
      setLoadError(null);
      return;
    }

    const load = async () => {
      setLoadError(null);
      const promises = allBranchIds.map((id) => fetchAssessmentData(id, selectedPeriodId));
      const results = await Promise.all(promises);
      const validResults = results.filter((r) => r !== null) as Awaited<ReturnType<typeof fetchAssessmentData>>[];

      if (validResults.length === 0) {
        setLoadError('Tidak ada data assessment ditemukan untuk periode dan UPPS yang dipilih.');
        return;
      }

      const labels = validResults[0].radarLabels;
      setRadarLabels(labels);

      setAssessments(validResults.map((r) => r.assessment));
      setReportsByUPPS(
        validResults.reduce((acc, r) => ({ ...acc, [r.assessment.id]: r.reports }), {})
      );
      setRadarDataByUPPS(
        validResults.reduce((acc, r) => {
          const id = r.assessment.id;
          const data = labels.map(label => {
            const report = r.reports.find((rep: VariableReport) => rep.name === label);
            return report ? report.point : 0;
          });
          return { ...acc, [id]: data };
        }, {})
      );
      setAllBranches(validResults.map((r) => ({ id: r.assessment.id, name: r.assessment.name })));
      setFilterIds(validResults.map((r) => r.assessment.id));
    };

    load();
  }, [selectedPeriodId, allBranchIds]);

  const handleApplyFilter = ({ periode, ids }: FilterPayload) => {
    setFilterPeriode(periode);
    setFilterIds(ids);
    const periodId = getPeriodIdByLabel(periode);
    if (periodId !== null) {
      setSelectedPeriodId(periodId);
    } else {
      setSelectedPeriodId(null);
      setLoadError('Periode tidak ditemukan. Silakan pilih periode yang valid.');
    }
  };

  const campusOptions = useMemo(() => {
    if (allBranches.length > 0) {
      return allBranches;
    }
    return (branchData?.data || [])
      .filter((b) => allBranchIds.includes(b.id))
      .map((b) => ({
        id: String(b.id),
        name: b.name,
      }));
  }, [allBranches, allBranchIds, branchData]);

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

  const handleDownloadAll = async () => {
    if (!isClient || columns.length === 0) return;

    setIsDownloading(true);
    setPdfExportMode(true);

    await new Promise(r => setTimeout(r, 800));

    const exportEl = document.getElementById('hedr-pdf-export');
    if (!exportEl) {
      alert('Gagal memuat konten PDF');
      setPdfExportMode(false);
      setIsDownloading(false);
      return;
    }

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      exportEl.style.visibility = 'visible';
      exportEl.style.opacity = '1';

      const canvas = await html2canvas(exportEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HEDR_Report_${filterPeriode || 'all'}.pdf`);

      exportEl.style.visibility = 'hidden';
      exportEl.style.opacity = '0';
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Gagal membuat PDF. Coba lagi.');
    } finally {
      setPdfExportMode(false);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || (user && (user.role?.id === 1 || user.role?.id === 4) && loadingBranches)) {
    return <div className="p-6">Memuat daftar UPPS...</div>;
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
                  setSelectedPeriodId(null);
                  setLoadError(null);
                }}
              />
            </div>

            {loadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {loadError}
              </div>
            )}

            {columns.length === 0 ? (
              <div className="text-center py-8">
                {!loadError && (!filterIds.length || !filterPeriode) && (
                  <p className="text-sm text-gray-500 italic">Belum ada UPPS/KC yang dipilih.</p>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div
                    id="download-content"
                    className={clsx(
                      'inline-block min-w-full space-y-6 p-4 bg-white',
                      isExporting && 'whitespace-nowrap overflow-auto'
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
                          <td className="px-4 py-4 border-l-2 border-gray-100" colSpan={columns.length}>
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

                    <table className="w-full table-auto text-sm border-collapse mt-6">
                      <thead>
                        <tr>
                          <th className="p-4 font-semibold text-center bg-[#12263A] text-white border-r border-[#12263A] min-w-[80px] sticky left-0 z-10">
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
                                (r) => r.name === label
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

                    {isExporting && <div className="h-16"></div>}
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

       {/* Hidden PDF Export Layout — HARUS DI DALAM <main> */}
{/* Hidden PDF Export Layout — 100% inline style */}
{pdfExportMode && (
  <div
    id="hedr-pdf-export"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '210mm',
      minHeight: '297mm',
      backgroundColor: '#ffffff',
      padding: '24px',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      zIndex: -1000,
      opacity: 0,
      pointerEvents: 'none',
    }}
  >
    {columns.map((col) => {
      // Fungsi bantu level → warna
      const getLevelColor = (level: string) => {
        const l = level.toUpperCase();
        if (l === 'BASIC') return { bg: '#f3f4f6', text: '#1f2937' };
        if (l === 'ADOPTING') return { bg: '#dbeafe', text: '#1e40af' };
        if (l === 'IMPROVING') return { bg: '#dcfce7', text: '#166534' };
        if (l === 'DIFFERENTIATING') return { bg: '#ede9fe', text: '#7e22ce' };
        if (l === 'TRANSFORMATIONAL') return { bg: '#fef3c7', text: '#b45309' };
        return { bg: '#f3f4f6', text: '#1f2937' };
      };

      return (
        <div key={col.id} style={{ marginBottom: '48px', pageBreakAfter: 'always' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Higher Education Digital Readiness</h1>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>RESULT</h2>
            <p style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
              Test taken on: {new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })} (Western Indonesia Time)
            </p>
          </div>

          {/* Info Kampus */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <tbody>
              {[
                ['Nama Kampus', col.name],
                ['Email Kampus', col.email],
                ['Student Body', col.studentBody.toString()],
                ['Jumlah Prodi', col.jumlahProdi.toString()],
                ['Jumlah Prodi Terakreditasi Unggul', col.jumlahProdiUnggul.toString()],
              ].map(([label, value], i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold', width: '40%', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>{label}</td>
                  <td style={{ padding: '6px', width: '60%', border: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Overall */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{col.submitPeriode.split(' ')[1] || '2024'}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '16px', color: '#111827' }}>OVERALL DIGITAL READINESS</h3>
            {(() => {
              const color = getLevelColor(col.maturityLevel.name);
              return (
                <div style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  backgroundColor: color.bg,
                  color: color.text,
                }}>
                  {col.maturityLevel.name}
                </div>
              );
            })()}
            <p style={{ marginTop: '8px', color: '#374151', maxWidth: '600px', margin: '8px auto 0' }}>
              {col.maturityLevel.description}
            </p>
          </div>

          {/* Variabel */}
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            Nama Variabel | Poin | Level | Index dan Deskripsi
          </h3>
          <div>
            {(reportsByUPPS[col.id] || []).map((r, idx) => {
              const color = getLevelColor(r.maturityLevel);
              return (
                <div key={idx} style={{ borderLeft: '4px solid #d1d5db', paddingLeft: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ color: '#111827' }}>{r.name}</strong>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#111827' }}>{r.point} POIN</div>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: color.bg,
                        color: color.text,
                      }}>
                        {r.maturityLevel}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#374151', fontSize: '10px', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{r.desc}</p>
                  <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 'bold', color: '#16a34a' }}>DISETUJUI</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '32px', fontSize: '10px', color: '#6b7280' }}>
            ID Result: {col.id}
          </div>
        </div>
      );
    })}
  </div>
)}
      </main>
    </div>
  );
}