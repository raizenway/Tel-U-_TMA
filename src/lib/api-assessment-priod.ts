// src/lib/assessment-period.ts

import {
  CreateAssessmentPeriodDto,
  UpdateAssessmentPeriodDto,
  ActivateAssessmentPeriodDto,
  DeactivateAssessmentPeriodDto,
  AssessmentPeriodResponseDto,
  AssessmentPeriodListResponseDto,
} from "@/interfaces/assessment-period";

import { ApiResponse } from "@/interfaces/api-response";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/assessment-period";

// GET /assessment-period → List all with pagination
export async function listAssessmentPeriods(): Promise<
  ApiResponse<AssessmentPeriodListResponseDto>
> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch assessment periods");
  return res.json();
}

// GET /assessment-period/active → Get active period (biasanya hanya 1)
export async function getActiveAssessmentPeriod(): Promise<
  ApiResponse<AssessmentPeriodResponseDto[]>
> {
  const res = await fetch(`${API_URL}/active`);
  if (!res.ok) throw new Error("Failed to fetch active assessment period");
  return res.json();
}

// GET /assessment-period/:id → Get by ID
export async function getAssessmentPeriodById(
  id: number
): Promise<ApiResponse<AssessmentPeriodResponseDto>> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch assessment period");
  return res.json();
}

// POST /assessment-period → Create new
export async function createAssessmentPeriod(
  body: CreateAssessmentPeriodDto
): Promise<ApiResponse<AssessmentPeriodResponseDto>> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create assessment period");
  return res.json();
}

// PUT /assessment-period/:id → Update
export async function updateAssessmentPeriod(
  id: number,
  body: UpdateAssessmentPeriodDto
): Promise<ApiResponse<AssessmentPeriodResponseDto>> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update assessment period");
  return res.json();
}

// PUT /assessment-period/activate/:id → Activate
export async function activateAssessmentPeriod(
  id: number,
  body?: ActivateAssessmentPeriodDto // opsional, karena biasanya tidak perlu body
): Promise<ApiResponse<AssessmentPeriodResponseDto>> {
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = body
    ? { "Content-Type": "application/json" }
    : undefined;

  const res = await fetch(`${API_URL}/activate/${id}`, {
    method: "PUT",
    headers,
    body: payload,
  });
  if (!res.ok) throw new Error("Failed to activate assessment period");
  return res.json();
}

// PUT /assessment-period/deactivate/:id → Deactivate
export async function deactivateAssessmentPeriod(
  id: number,
  body?: DeactivateAssessmentPeriodDto // opsional
): Promise<ApiResponse<AssessmentPeriodResponseDto>> {
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = body
    ? { "Content-Type": "application/json" }
    : undefined;

  const res = await fetch(`${API_URL}/deactivate/${id}`, {
    method: "PUT",
    headers,
    body: payload,
  });
  if (!res.ok) throw new Error("Failed to deactivate assessment period");
  return res.json();
}