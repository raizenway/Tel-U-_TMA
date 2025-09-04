// src/hooks/useTransformationVariableList.ts

import { useState, useEffect } from 'react';
import { 
  listTransformationVariables, 
  createTransformationVariable,
  updateTransformationVariable, 
  getTransformationVariableById,
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
      const response: ApiResponse<TransformationVariable[]> = await listTransformationVariables();

      if (response.status === 'success') {
        setData(response.data);
      } else {
        setError(response.message || 'Gagal memuat data dari server.');
        setData([]);
      }
    } catch (err) {
      console.error('Error saat memuat variabel transformasi:', err);
      setError('Tidak dapat terhubung ke server. Periksa koneksi atau server backend.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};

//Hook untuk create 
export const useCreateTransformationVariable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateTransformationVariable): Promise<TransformationVariable | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createTransformationVariable(body);
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

//Hook untuk update 
export const useUpdateTransformationVariable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    id: number,
    body: Partial<Omit<TransformationVariable, 'id'>>
  ): Promise<TransformationVariable | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateTransformationVariable(id, body);
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