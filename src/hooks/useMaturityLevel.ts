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

      if (res && typeof res === "object" && "data" in res) {
        return (res as ApiResponse<MaturityLevel>).data;
      }
      return res as MaturityLevel;
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

  const mutate = async (body: UpdateMaturityLevelRequest): Promise<MaturityLevel> => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateMaturityLevel(body);

      if (res && typeof res === "object" && "data" in res) {
        return (res as ApiResponse<MaturityLevel>).data;
      }
      return res as MaturityLevel;
    } catch (error: any) {
      setError(error.message);
      throw error;
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