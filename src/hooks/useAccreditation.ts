// hooks/useAccreditationData.ts
import { useState, useCallback } from 'react';
import { CampusKey, AccreditationRow, AccreditationApiPayloadItem } from '@/interfaces/accreditation';

const CAMPUS_TO_BRANCH_ID: Record<CampusKey, number> = {
  'Tel-U Jakarta': 2,
  'Tel-U Surabaya': 3,
  'Tel-U Purwokerto': 4,
  'Tel-U Bandung': 1,
};

export const useAccreditationData = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToApi = useCallback(async (
    rows: AccreditationRow[],
    selectedCampus: CampusKey
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // ✅ HANYA buat payload untuk kampus yang dipilih
      const payload: AccreditationApiPayloadItem[] = rows.map(row => ({
        branch_id: CAMPUS_TO_BRANCH_ID[selectedCampus],
        year: Number(row.year),
        accreditationGrowth: row[selectedCampus] ?? 0,
      }));

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_URL belum diatur di .env');
      }

      const response = await fetch(`${baseUrl}/branch/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return { saveToApi, isSaving, error };
};