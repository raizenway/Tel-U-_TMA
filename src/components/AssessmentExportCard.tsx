// components/AssessmentExportCard.tsx
import React from 'react';
import type { UiAssessment, UiVariableReport } from '@/types/ui-assessment';
import RadarChartSingle from './RadarChartSingle';

interface Props {
  assessment: UiAssessment;
  reports: UiVariableReport[];
  radarData: number[];
  radarLabels: string[];
}

export default function AssessmentExportCard({
  assessment,
  reports,
  radarData,
  radarLabels,
}: Props) {
  // Fungsi bantu warna level
 const getLevelStyle = (level: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    BASIC: { bg: '#f3f4f6', text: '#1f2937' },        // gray-100, gray-800
    ADOPTING: { bg: '#dbeafe', text: '#1e40af' },    // blue-100, blue-800
    IMPROVING: { bg: '#dcfce7', text: '#166534' },   // green-100, green-800
    DIFFERENTIATING: { bg: '#ede9fe', text: '#7e22ce' }, // purple-100, purple-800
    TRANSFORMATIONAL: { bg: '#fef3c7', text: '#b45309' }, // yellow-100, yellow-800
  };
  return map[level.toUpperCase()] || map.BASIC;
};

  return (
    <div className="mb-12 break-inside-avoid" style={{ pageBreakAfter: 'always' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Higher Education Digital Readiness</h1>
        <h2 className="text-xl font-semibold">RESULT</h2>
        <p className="text-sm mt-1">
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
      <table className="w-full border-collapse text-sm mb-6">
        <tbody>
          {[
            { label: 'Nama Kampus', value: assessment.name },
            { label: 'Email Kampus', value: assessment.email },
            { label: 'Student Body', value: assessment.studentBody.toString() },
            { label: 'Jumlah Prodi', value: assessment.jumlahProdi.toString() },
            { label: 'Jumlah Prodi Terakreditasi Unggul', value: assessment.jumlahProdiUnggul.toString() },
          ].map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 font-medium w-1/3 border">{row.label}</td>
              <td className="p-2 w-2/3 border">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Periode & Overall */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold">{assessment.submitPeriode.split(' ')[1] || '2024'}</div>
        <h3 className="text-xl font-bold mt-4">OVERALL DIGITAL READINESS</h3>
        <div className={`inline-block px-4 py-2 rounded-full font-bold mt-2 ${getLevelStyle(assessment.maturityLevel.name).bg} ${getLevelStyle(assessment.maturityLevel.name).text}`}>
          {assessment.maturityLevel.name}
        </div>
        <p className="mt-2 text-gray-700 max-w-2xl mx-auto">{assessment.maturityLevel.description}</p>
      </div>

      {/* Radar Chart Placeholder */}
      <div className="w-full h-64 flex items-center justify-center border mb-6">
  <RadarChartSingle data={radarData} labels={radarLabels} />
</div>

      {/* Detail Variabel */}
      <h3 className="text-lg font-bold mb-4">Nama Variabel | Poin | Level | Index dan Deskripsi</h3>
      <div className="space-y-6">
        {reports.map((r, idx) => {
          const style = getLevelStyle(r.maturityLevel);
          return (
            <div key={idx} className="border-l-4 pl-4 border-gray-300">
              <div className="flex justify-between items-start mb-2">
                <strong>{r.name}</strong>
                <div className="text-right">
                  <div className="font-bold">{r.point} POIN</div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${style.bg} ${style.text}`}>
                    {r.maturityLevel}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{r.desc}</p>
              <div className="mt-2 text-xs font-semibold text-green-700">DISETUJUI</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        ID Result: {assessment.id}
      </div>
    </div>
  );
}