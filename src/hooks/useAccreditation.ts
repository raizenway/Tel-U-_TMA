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

  const saveToApi = useCallback(
    async (rows: AccreditationRow[], selectedCampus: CampusKey): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        if (!CAMPUS_TO_BRANCH_ID[selectedCampus]) {
          throw new Error(`Kampus tidak valid: ${selectedCampus}`);
        }

        const branchId = CAMPUS_TO_BRANCH_ID[selectedCampus];
        const payload: AccreditationApiPayloadItem[] = rows.map((row) => ({
          branch_id: branchId,
          year: Number(row.year),
          accreditationGrowth: row[selectedCampus] ?? 0,
        }));

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_API_URL tidak ditemukan di .env');
        }

        const response = await fetch(`${baseUrl}/branch/detail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Gagal menyimpan: ${response.status} - ${text}`);
        }

        return true;
      } catch (err: any) {
        const msg = err.message || 'Gagal menyimpan data akreditasi';
        setError(msg);
        console.error('[useAccreditationData] Error:', msg);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { saveToApi, isSaving, error };
};