import { Assessment, CreateAssessment, CreateAssessmentDetail } from "@/interfaces/assessment";
import { ApiResponse } from "@/interfaces/api-response";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/assessment";

// 🔹 List all questions
export const ListAssessment = async (): Promise<ApiResponse<Assessment[]>> => {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache',
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        status: 'error',
        message: `Gagal ambil data: ${res.status} - ${errorText}`,
        data: [],
      };
    }

    const data: Assessment[] = await res.json();
    return {
      status: 'success',
      message: 'Data pertanyaan berhasil dimuat',
      data,
    };
  } catch (error) {
    console.error('🚨 Error di listQuestions:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Terjadi kesalahan koneksi',
      data: [],
    };
  }
};


export async function createAssessment(body: CreateAssessment): Promise<ApiResponse<Assessment>> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}
  

export async function createAssessmentDetail(
  body: CreateAssessmentDetail
): Promise<ApiResponse<Assessment>> {
  const res = await fetch("http://localhost:3000/api/assessment/detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`❌ Gagal create assessment detail: ${errorText}`);
  }

  return res.json();
}
