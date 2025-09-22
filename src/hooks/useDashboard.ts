// src/lib/dashboard/hooks.ts

'use client'; // penting jika pakai Next.js 13+ dan dipakai di Client Component

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/lib/api-dashboard';
import { ApiResponse } from '@/interfaces/api-response';
import { DashboardContent } from '@/interfaces/dashboard';


export function useDashboardData() {
  const [data, setData] = useState<DashboardContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result: ApiResponse<DashboardContent> = await getDashboardData();

        if (result.status !== 'success') {
          throw new Error(result.message || 'Unknown error from API');
        }

        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // hanya jalan sekali saat mount

  return {
    data,
    loading,
    error,
  };
}