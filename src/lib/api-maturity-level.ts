import { CreateMaturityLevelRequest, MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/maturity-level";

// List semua maturity level
export async function listMaturityLevels(): Promise<ApiResponse<MaturityLevel[]>> {
  const res = await fetch(API_URL);
  console.log(API_URL)
  if (!res.ok) throw new Error("Failed to fetch maturity levels");
  return res.json();
}

// Fungsi createMaturityLevel untuk fetch Api Create Maturity Level dengan menggunakan interface CreateMaturityLevelRequest
export async function createMaturityLevel(body: CreateMaturityLevelRequest): Promise<ApiResponse<MaturityLevel>> {
  const res = await fetch(API_URL, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create Maturity Level");
  return res.json();
}
