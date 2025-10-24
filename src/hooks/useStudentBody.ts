// src/hooks/useStudentBodyData.ts
import { useState, useCallback } from 'react';
import { CampusKey, StudentBodyRow, StudentBodyApiPayloadItem } from '@/interfaces/student-Body';

const CAMPUS_LIST: CampusKey[] = [
  "Tel-U Jakarta",
  "Tel-U Surabaya",
  "Tel-U Purwokerto",
  "Tel-U Bandung",
];

// hooks/useStudentBodyData.ts

const CAMPUS_TO_BRANCH_ID: Record<CampusKey, number> = {
  'Tel-U Jakarta': 2,    // ✅ Jakarta → id 2
  'Tel-U Surabaya': 3,   // ✅ Surabaya → id 3
  'Tel-U Purwokerto': 4, // ✅ Purwokerto → id 4
  'Tel-U Bandung': 1,    // ✅ Bandung → id 1
};

export const useStudentBodyData = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToApi = useCallback(async (rows: StudentBodyRow[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // ✅ Buat payload
      const payload: StudentBodyApiPayloadItem[] = rows.flatMap(row =>
        CAMPUS_LIST.map(campus => ({
          branchId: CAMPUS_TO_BRANCH_ID[campus],
          year: Number(row.year),
          studentBodyCount: row[campus] || 0,
        }))
      );

      // ✅ Ambil base URL dari env
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL belum diatur di .env');
      }

      // ✅ Kirim ke backend eksternal (BUKAN /api/...)
      const response = await fetch(`${baseUrl}/branch/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveToApi,
    isSaving,
    error,
  };
};