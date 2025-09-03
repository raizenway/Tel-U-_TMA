"use client";

//import { useState } from "react";
import { useGet } from "./useGet";
import { listMaturityLevels } from "@/lib/api-maturity-level";
import { MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

export function useListMaturityLevels(dep: any = null) {
  return useGet<ApiResponse<MaturityLevel[]>>(() => listMaturityLevels(), [dep]);
}
