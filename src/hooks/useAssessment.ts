"use client";

import { useState,useEffect } from "react";
import { useGet } from "./useGet";
import { createAssessment, createAssessmentDetail, ListAssessment,finishAssessment,getAssessmentById} from "@/lib/api-assessment";
import { Assessment, CreateAssessment, CreateAssessmentDetail,FinishAssessment   } from "@/interfaces/assessment";
import { ApiResponse } from "@/interfaces/api-response";

export function useListAssessment() {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await ListAssessment();
      if (res.status === 'success') {
        setData(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { data, loading, error };
}

export function useCreateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const mutate = async (body: CreateAssessment): Promise<Assessment> => {
  setLoading(true);
  setError(null);
  try {
    const response = await createAssessment(body); // ← ini return ApiResponse<Assessment>
    return response.data; // ✅ BENAR — ambil data dari response
  } catch (err: any) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

  return { mutate, loading, error };
}
export function useCreateAssessmentDetail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateAssessmentDetail): Promise<Assessment> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createAssessmentDetail(body); // panggil API
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}


export function useFinishAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: FinishAssessment): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await finishAssessment(body);

      // ✅ Tambahkan pengecekan res tidak null
      if (res && res.status === 'success') {
        return { success: true };
      }

      // Jika res null atau status bukan 'success'
      const message = res?.message || 'Gagal menyelesaikan assessment';
      throw new Error(message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export const useAssessmentById = (id: number | null) => {
  const [data, setData] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const res = await getAssessmentById(id);
      console.log("🔍 Response dari API:", res); // ← tambahkan ini

      if (res.status === 'success' && res.data) {
        setData(res.data);
        console.log("✅ Data diterima:", res.data);
      } else {
        setError(res.message || 'Gagal memuat data');
        console.error("❌ Gagal muat assessment:", res.message);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
};