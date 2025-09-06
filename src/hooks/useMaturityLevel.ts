"use client";

import { useState } from "react";
import { useGet } from "./useGet";
import { listMaturityLevels, createMaturityLevel } from "@/lib/api-maturity-level";
import { CreateMaturityLevelRequest, MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

export function useListMaturityLevels(dep: any = null) {
  return useGet<ApiResponse<MaturityLevel[]>>(() => listMaturityLevels(), [dep]);
}

export function useCreateMaturityLevel() {
   const [loading, setLoading] = useState(false);        
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateMaturityLevelRequest): Promise<MaturityLevel> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createMaturityLevel(body);
      return res.data; 
    }catch (error:any) {
      setError(error.message);
      throw error;
    }finally{
      setLoading(false);
    }
  };
  
  return { mutate,loading, error }
}