// src/lib/dashboard/api.ts

import { ApiResponse } from "@/interfaces/api-response";
import { DashboardContent } from "@/interfaces/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/assessment/dashboard";


export async function getDashboardData(): Promise<ApiResponse<DashboardContent>> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

