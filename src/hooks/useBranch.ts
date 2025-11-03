// src/hooks/useBranch.ts
import { useState, useEffect } from 'react';
import { Branch } from '@/interfaces/branch.interface';

interface UseListBranchResult {
  data: { data: Branch[] } | null;
  isLoading: boolean;
  error: Error | null;
}

export const useListBranch = (refreshFlag: number): UseListBranchResult => {
  const [data, setData] = useState<{ data: Branch[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env");
        }

        const response = await fetch(`${baseUrl}/branch`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshFlag]);

  return { data, isLoading, error };
};

// src/hooks/useCreateBranch.ts
export const useCreateBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data: { name: string; email: string }) => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URL belum diatur di .env');

      const res = await fetch(`${baseUrl}/branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      return await res.json();
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};