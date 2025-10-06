"use client";

import { useState } from "react";
import { useGet } from "./useGet";
import { createAssessment, createAssessmentDetail, ListAssessment,finishAssessment} from "@/lib/api-assessment";
import { Assessment, CreateAssessment, CreateAssessmentDetail,FinishAssessment   } from "@/interfaces/assessment";
import { ApiResponse } from "@/interfaces/api-response";

export function useListAssessment(dep: any = null) {
  return useGet<ApiResponse<Assessment[]>>(() => ListAssessment(), [dep]);
}
export function useCreateAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateAssessment): Promise<Assessment> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createAssessment(body); // panggil API
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
      const res = await finishAssessment(body); // panggil API
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