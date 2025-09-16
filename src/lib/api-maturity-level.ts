import { CreateMaturityLevelRequest, UpdateMaturityLevelRequest, MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/maturity-level";

// Ambil semua maturity level
export async function listMaturityLevels(): Promise<ApiResponse<MaturityLevel[]>> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch maturity levels");
  return res.json();
}

// Ambil maturity level by ID
export async function getMaturityLevelById(
  id: number
): Promise<ApiResponse<MaturityLevel>> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch maturity level with id ${id}`);
  return res.json();
}

// Create maturity level baru
export async function createMaturityLevel(
  body: CreateMaturityLevelRequest
): Promise<ApiResponse<MaturityLevel> | MaturityLevel> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Maturity Level: ${res.status} ${errText}`);
  }

  const json = await res.json();
  console.log("CreateMaturityLevel response JSON:", json);
  return json;
}

// Update maturity level
export async function updateMaturityLevel(
  body: UpdateMaturityLevelRequest
): Promise<ApiResponse<MaturityLevel> | MaturityLevel> {
  const cleanBody = {
    name: body.name,
    levelNumber: Number(body.levelNumber),
    minScore: Number(body.minScore),
    maxScore: Number(body.maxScore),
    generalDescription: body.generalDescription,
    scoreDescription: body.scoreDescription, 
  };

  console.log("Final body before PUT:", cleanBody);

  const res = await fetch(`${API_URL}/${body.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update Maturity Level: ${res.status} ${errText}`);
  }

  return res.json();
}

// Delete maturity level
export async function deleteMaturityLevel(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete Maturity Level: ${res.status} ${errText}`);
  }

  return res.json();
}
