// src/hooks/usePeriode.ts
import { useState, useEffect } from 'react';
import { Periode } from '@/interfaces/periode';


export function useListPeriode(refreshFlag: number) {
  const [data, setData] = useState<{ data: Periode[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Refresh flag changed to:', refreshFlag);
    const fetchPeriodes = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env");
        }

        const response = await fetch(`${baseUrl}/assessment-period`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // 👈 TAMBAHKAN INI
          },
          cache: 'no-store', // ✅ Tambahkan ini
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();

        // 🔄 Transformasi data — normalisasi status dari BE
        let transformedData: Periode[] = [];

        const normalizeStatus = (rawStatus: any): 'active' | 'inactive' => {
          // Jika bukan string, langsung return 'inactive'
          if (typeof rawStatus !== 'string') {
            console.warn('Status bukan string:', rawStatus);
            return 'inactive';
          }

          // Normalisasi: lowercase + trim
          const lower = rawStatus.toLowerCase().trim();

          // Daftar nilai yang dianggap 'active'
          const activeValues = ['active', 'aktif', '1', 'true', 'yes', 'on'];

          // Daftar nilai yang dianggap 'inactive'
          const inactiveValues = ['inactive', 'nonaktif', '0', 'false', 'no', 'off'];

          if (activeValues.includes(lower)) {
            return 'active';
          }

          if (inactiveValues.includes(lower)) {
            return 'inactive';
          }

          // Jika tidak match, log peringatan dan return 'inactive'
          console.warn('Status tidak dikenali, fallback ke inactive:', rawStatus);
          return 'inactive';
        };

        if (Array.isArray(result)) {
          transformedData = result.map((item: any) => ({
            id: item.id,
            tahun: item.year,
            semester: item.semester,
            status: normalizeStatus(item.status),
          }));
        } else if (result.data && Array.isArray(result.data)) {
          transformedData = result.data.map((item: any) => ({
            id: item.id,
            tahun: item.year,
            semester: item.semester,
            status: normalizeStatus(item.status),
          }));
        } else {
          throw new Error("Format response API tidak valid. Harus array atau { data: array }");
        }

        setData({ data: transformedData }); // ✅ sekarang aman
      } catch (err) {
        console.error('Error fetching periodes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodes();
  }, [refreshFlag]);

  return { data, loading, error };
}


// create periode
export function useCreatePeriode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data: { 
    tahun: number; 
    semester: string;   // ✅ ubah dari number ke string
    status: 'active' | 'inactive' 
  }) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/assessment-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: data.tahun,
          semester: data.semester, // ✅ kirim langsung string "Ganjil" atau "Genap"
          status: data.status // ✅ ambil dari input user
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Periode berhasil dibuat:', result);
      return result;

    } catch (err) {
      console.error('Error creating periode:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

//update periode
export function useUpdatePeriode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number, data: { 
    tahun: number; 
    semester: string; 
    status: 'active' | 'inactive' 
  }) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env");
      }

      const response = await fetch(`${baseUrl}/assessment-period/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: data.tahun,
          semester: data.semester,
          status: data.status
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Periode berhasil diupdate:', result);
      return result;

    } catch (err) {
      console.error('Error updating periode:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}


export function useActivatePeriode() {
  const mutate = async (id: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env");
      }

      const response = await fetch(`${baseUrl}/assessment-period/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Periode diaktifkan:', result);
      return result;

    } catch (err) {
      console.error('Error activating periode:', err);
      throw err;
    }
  };

  return { mutate };
}

export function useDeactivatePeriode() {
  const mutate = async (id: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env");
      }

      const response = await fetch(`${baseUrl}/assessment-period/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Periode dinonaktifkan:', result);
      return result;

    } catch (err) {
      console.error('Error deactivating periode:', err);
      throw err;
    }
  };

  return { mutate };
}

