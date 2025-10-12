import { Assessment, CreateAssessment, CreateAssessmentDetail,FinishAssessment } from "@/interfaces/assessment";
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
        data: [], // ✅ wajib ada
      };
    }

    const json = await res.json();
    
    // Pastikan json memiliki struktur { status, message, data }
    return {
      status: 'success',
      message: json.message || 'Data berhasil dimuat',
      data: json.data || [], // ✅ perbaiki typo: tambahkan ":"
    };
  } catch (error) {
    console.error('🚨 Error di ListAssessment:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Terjadi kesalahan koneksi',
      data: [], // ✅ wajib ada
    };
  }
};


// lib/api-assessment.ts
export async function createAssessment(body: CreateAssessment): Promise<ApiResponse<Assessment>> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal membuat assessment: ${errorText}`);
  }

  return res.json(); // ✅ Sekarang sesuai tipe: ApiResponse<Assessment>
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

export async function finishAssessment(
  body: FinishAssessment
): Promise<ApiResponse<{ success: boolean }>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assessment/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // ✅ Jangan langsung throw error — cek dulu
  let data;
  try {
    data = await res.json();
  } catch (jsonError) {
    // Jika body kosong atau bukan JSON, buat respons manual
    data = {
      status: res.ok ? 'success' : 'error',
      message: res.ok 
        ? 'Assessment finished successfully' 
        : `HTTP ${res.status}: ${res.statusText}`,
      data: res.ok ? { success: true } : null,
    };
  }

  // Jika res.ok tapi data tidak sesuai, perbaiki
  if (res.ok && (!data || data.status !== 'success')) {
    return {
      status: 'success',
      message: 'Assessment finished successfully',
      data: { success: true },
    };
  }

  // Jika error HTTP
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data;
}