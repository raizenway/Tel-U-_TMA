import { MaturityLevel } from "@/interfaces/maturity-level";
import { ApiResponse } from "@/interfaces/api-response";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/maturity-level";

// ✅ List semua maturity level
export async function listMaturityLevels(): Promise<ApiResponse<MaturityLevel[]>> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch maturity levels");
  return res.json();
}
