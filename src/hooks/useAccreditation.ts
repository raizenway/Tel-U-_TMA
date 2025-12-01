import { useState, useCallback } from 'react';
import { CampusKey, AccreditationRow, AccreditationApiPayloadItem } from '@/interfaces/accreditation';

const CAMPUS_TO_BRANCH_ID: Record<CampusKey, number> = {
  'Tel-U Jakarta': 2,
  'Tel-U Surabaya': 3,
  'Tel-U Purwokerto': 4,
  'Tel-U Bandung': 1,
};

// ✅ Gunakan array eksplisit untuk iterasi — aman & tipe-aman
const ALL_CAMPUSES = Object.keys(CAMPUS_TO_BRANCH_ID) as CampusKey[];

export const useAccreditationData = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToApi = useCallback(
    async (rows: AccreditationRow[]): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_API_URL tidak ditemukan di .env');
        }

        // ✅ Generate payload: semua kampus × semua tahun
        const payload: AccreditationApiPayloadItem[] = rows.flatMap((row) => {
          return ALL_CAMPUSES.map((campus) => ({
            branchId: CAMPUS_TO_BRANCH_ID[campus], // ✅ aman karena ALL_CAMPUSES adalah CampusKey[]
            year: Number(row.year),
            accreditationGrowth: row[campus] ?? 0,
          }));
        });

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
    [] // ✅ Tidak perlu dependency karena ALL_CAMPUSES konstan
  );

  return { saveToApi, isSaving, error };
};