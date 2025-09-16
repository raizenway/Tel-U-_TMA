"use client";

import { useState } from "react";
import { useGet } from "./useGet";
import { listMaturityLevels, createMaturityLevel, updateMaturityLevel, getMaturityLevelById, deleteMaturityLevel  } from "@/lib/api-maturity-level";
import { CreateMaturityLevelRequest, UpdateMaturityLevelRequest, MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

export function useListMaturityLevels(dep: any = null) {
  return useGet<ApiResponse<MaturityLevel[]>>(() => listMaturityLevels(), [dep]);
}

export function useGetMaturityLevelById(id: number | null) {
  return useGet<MaturityLevel>(
    () => id ? getMaturityLevelById(id).then(res => res.data) : null,
    [id]
  );
}

export function useCreateMaturityLevel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutate = async (body: CreateMaturityLevelRequest): Promise<MaturityLevel> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createMaturityLevel(body);
      // Perbaikan: Tangani kedua kemungkinan tipe respons
      let maturityLevel: MaturityLevel;
      if (res && typeof res === "object" && "data" in res) {
        maturityLevel = (res as ApiResponse<MaturityLevel>).data;
      } else {
        maturityLevel = res as MaturityLevel;
      }
      return maturityLevel; // <-- Kembalikan objek MaturityLevel yang konsisten
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return { mutate, loading, error };
}

export function useUpdateMaturityLevel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    id: number,
    body: UpdateMaturityLevelRequest
  ): Promise<MaturityLevel> => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateMaturityLevel(id, body);
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


export function useDeleteMaturityLevel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<ApiResponse<null>> => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteMaturityLevel(id);
      return res;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}