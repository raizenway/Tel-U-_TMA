// src/hooks/useAssessmentPeriod.ts

import { useState, useCallback } from "react";
import {
  listAssessmentPeriods,
  getActiveAssessmentPeriod,
  getAssessmentPeriodById,
  createAssessmentPeriod,
  updateAssessmentPeriod,
  activateAssessmentPeriod,
  deactivateAssessmentPeriod,
} from "@/lib/api-assessment-priod";

import {
  CreateAssessmentPeriodDto,
  UpdateAssessmentPeriodDto,
  ActivateAssessmentPeriodDto,
  DeactivateAssessmentPeriodDto,
  AssessmentPeriodResponseDto,
  AssessmentPeriodListResponseDto,
} from "@/interfaces/assessment-period";

// ===== HOOK UTAMA =====
export function useAssessmentPeriod() {
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Helper: reset error ---
  const clearError = useCallback(() => setError(null), []);

  // --- 1. List All ---
  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAssessmentPeriods();
      return response.data; // AssessmentPeriodListResponseDto
    } catch (err: any) {
      const message = err.message || "Failed to load assessment periods";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 2. Get Active ---
  const getActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActiveAssessmentPeriod();
      return response.data; // AssessmentPeriodResponseDto[]
    } catch (err: any) {
      const message = err.message || "Failed to load active assessment period";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 3. Get By ID ---
  const getById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAssessmentPeriodById(id);
      return response.data; // AssessmentPeriodResponseDto
    } catch (err: any) {
      const message = err.message || "Failed to load assessment period";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 4. Create ---
  const create = useCallback(async (data: CreateAssessmentPeriodDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createAssessmentPeriod(data);
      return response.data; // AssessmentPeriodResponseDto
    } catch (err: any) {
      const message = err.message || "Failed to create assessment period";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 5. Update ---
  const update = useCallback(
    async (id: number, data: UpdateAssessmentPeriodDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await updateAssessmentPeriod(id, data);
        return response.data; // AssessmentPeriodResponseDto
      } catch (err: any) {
        const message = err.message || "Failed to update assessment period";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- 6. Activate ---
  const activate = useCallback(
    async (id: number, body?: ActivateAssessmentPeriodDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await activateAssessmentPeriod(id, body);
        return response.data; // AssessmentPeriodResponseDto
      } catch (err: any) {
        const message = err.message || "Failed to activate assessment period";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- 7. Deactivate ---
  const deactivate = useCallback(
    async (id: number, body?: DeactivateAssessmentPeriodDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await deactivateAssessmentPeriod(id, body);
        return response.data; // AssessmentPeriodResponseDto
      } catch (err: any) {
        const message = err.message || "Failed to deactivate assessment period";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    // State
    loading,
    error,
    clearError,

    // Actions
    list,
    getActive,
    getById,
    create,
    update,
    activate,
    deactivate,
  };
}