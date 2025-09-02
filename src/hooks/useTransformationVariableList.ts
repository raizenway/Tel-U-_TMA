// src/hooks/useTransformationVariableList.ts

import { useState, useEffect } from 'react';
import { fetchTransformationVariables } from '@/lib/api-transformation-variable';
import { TransformationVariable } from '@/interfaces/transformation-variable';

interface UseTransformationVariableListResult {
  data: TransformationVariable[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTransformationVariableList = (): UseTransformationVariableListResult => {
  const [data, setData] = useState<TransformationVariable[]>([]);        // ✅ array kosong sebagai default
  const [loading, setLoading] = useState<boolean>(true);                 // ✅ nilai boolean
  const [error, setError] = useState<string | null>(null);               // ✅ null sebagai default

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTransformationVariables();
      setData(result);
    } catch {
      setError('Tidak bisa terhubung ke server.');
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