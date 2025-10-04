  // src/hooks/useTransformationVariableList.ts

  import { useState, useEffect } from 'react';
  import { 
    listTransformationVariables, 
    createTransformationVariable,
    updateTransformationVariable, 
    getTransformationVariableById,
    updateTransformationVariableWithFile,
    createTransformationVariableWithFile,
  } from '@/lib/api-transformation-variable';
  import { 
    TransformationVariable, 
    CreateTransformationVariableRequest as CreateTransformationVariable 
  } from '@/interfaces/transformation-variable';
  import { ApiResponse } from '@/interfaces/api-response';

 //Hook untuk list
export const useTransformationVariableList = () => {
  const [data, setData] = useState<TransformationVariable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listTransformationVariables();
      console.log('API Response:', response);

      if (response.status === 'success') {
        // ✅ Handle struktur nested dari API-mu
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          if (Array.isArray(response.data.data)) {
            setData(response.data.data); // ← INI YANG BENAR UNTUK API-MU
          } else {
            console.warn('Format data tidak valid:', response.data);
            setError('Format data tidak valid');
            setData([]);
          }
        } else if (Array.isArray(response.data)) {
          // Handle format flat (jika ada)
          setData(response.data);
        } else {
          console.warn('Format data tidak dikenali:', response.data);
          setError('Format data tidak valid');
          setData([]);
        }
      } else {
        console.warn('API error:', response);
        setError(response.message || 'Gagal memuat data');
        setData([]);
      }
    } catch (err) {
      console.error('Error saat memuat variabel transformasi:', err);
      setError('Gagal memuat data');
      setData([]);
    } finally {
  console.log('✅ Loading set to false');
  setLoading(false);
}
  };

  useEffect(() => {
    refetch();
  }, []);

  
  return { data, loading, error, refetch };
};
  // 🔥 HOOK CREATE YANG SUDAH DIPERBAIKI
  export const useCreateTransformationVariable = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = async (
      body: FormData | CreateTransformationVariable
    ): Promise<TransformationVariable | null> => {
      setLoading(true);
      setError(null);
      try {
        let res;
        
        // 🔥 PILIH FUNGSI BERDASARKAN TIPE
        if (body instanceof FormData) {
          res = await createTransformationVariableWithFile(body); // ← gunakan fungsi baru
        } else {
          res = await createTransformationVariable(body); // ← fungsi lama untuk JSON
        }

        if (res.status === 'success') {
          return res.data;
        } else {
          setError(res.message || 'Gagal membuat variabel');
          return null;
        }
      } catch (err: any) {
        const message = err.message || 'Tidak dapat terhubung ke server';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    };

    return { mutate, loading, error };
  };

  // 🔥 HOOK UPDATE YANG SEMPURNA
  export const useUpdateTransformationVariable = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = async (
      id: number,
      body: FormData | Partial<Omit<TransformationVariable, 'id'>>
    ): Promise<TransformationVariable | null> => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (body instanceof FormData) {
          // 🔥 Pastikan sudah impor updateTransformationVariableWithFile!
          res = await updateTransformationVariableWithFile(id, body);
        } else {
          res = await updateTransformationVariable(id, body);
        }

        if (res.status === 'success') {
          return res.data;
        } else {
          setError(res.message || 'Gagal memperbarui variabel');
          return null;
        }
      } catch (err: any) {
        const message = err.message || 'Tidak dapat terhubung ke server';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    };

    return { mutate, loading, error };
  };
  export const useGetTransformationVariableById = (id: number) => {
    const [data, setData] = useState<TransformationVariable | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // ✅ 1. Validasi ID
      if (!id || isNaN(id)) {
        setError('ID tidak valid');
        setData(null);
        setLoading(false);
        return;
      }

      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log(`[API] Fetching variable with ID: ${id}`); 

          const response = await getTransformationVariableById(id);

          if (response.status === 'success') {
            if (response.data) {
              setData(response.data);
            } else {
              setError('Data tidak ditemukan di server.');
              setData(null);
            }
          } else {
          
            setError(response.message || 'Gagal memuat data dari server');
            setData(null);
          }
        } catch (err: any) {
          
          const errorMessage = err.message 
            ? `Network error: ${err.message}` 
            : 'Tidak dapat terhubung ke server';
          
          console.error('Error fetching variable:', err); 
          setError(errorMessage);
          setData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [id]);

    return { data, loading, error };
  };