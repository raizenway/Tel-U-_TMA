"use client";

import { useState, useEffect } from "react";
import { 
  createAssessment, 
  createAssessmentDetail, 
  ListAssessment,
  finishAssessment,
  getAssessmentById,
  requestEditAssessment,
  approveEditAssessment
} from "@/lib/api-assessment";
import { 
  Assessment, 
  CreateAssessment, 
  CreateAssessmentDetail,
  FinishAssessment   
} from "@/interfaces/assessment";
import { ApiResponse } from "@/interfaces/api-response";

export function useListAssessment() {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    setLoading(true);
    const res = await ListAssessment();
    if (res.status === 'success') {
      setData(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // ✅ Kembalikan refetch
  return { data, loading, error, refetch: fetchAssessments };
}

export function useCreateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateAssessment): Promise<Assessment> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createAssessment(body);
      return response.data;
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
      const res = await createAssessmentDetail(body);
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
      if (res && res.status === 'success') {
        return { success: true };
      }
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
      if (res.status === 'success' && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Gagal memuat data');
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
};

// 🔹 Hook untuk Request Edit Assessment
export function useRequestEditAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (assessmentId: number): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestEditAssessment(assessmentId);
      return { success: true }; // ✅ tidak perlu cek res.status — API sudah handle
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// 🔹 Hook untuk Approve Edit Assessment
export function useApproveEditAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (assessmentId: number): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      await approveEditAssessment(assessmentId);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}