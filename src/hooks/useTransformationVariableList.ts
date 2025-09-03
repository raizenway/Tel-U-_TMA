// src/hooks/useTransformationVariableList.ts

import { useState, useEffect } from 'react';
import { 
  listTransformationVariables, 
  createTransformationVariable,
  UpdateTransformationVariable, 
  getTransformationVariableById,
} from '@/lib/api-transformation-variable';
import { 
  TransformationVariable, 
  CreateTransformationVariableRequest as CreateTransformationVariable 
} from '@/interfaces/transformation-variable';
import { ApiResponse } from '@/interfaces/api-response';

// 🔹 Hook untuk list
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

// 🔹 Hook untuk create
export const useCreateTransformationVariable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateTransformationVariable): Promise<TransformationVariable> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createTransformationVariable(body);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

// 🔹 Hook untuk update (PUT)
export const useUpdateTransformationVariable = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    id: number,
    body: Partial<Omit<TransformationVariable, 'id'>>
  ): Promise<TransformationVariable> => {
    setLoading(true);
    setError(null);
    try {
      const res = await UpdateTransformationVariable(id, body); // ✅ Ganti: put → update
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
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
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTransformationVariableById(id);
        if (response.status === 'success') {
          setData(response.data);
        } else {
          setError(response.message || 'Gagal memuat data');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
fetchData();
  }, [id]);

  return { data, loading, error };
};
