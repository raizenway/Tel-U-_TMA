import { Assessment, CreateAssessment, CreateAssessmentDetail, FinishAssessment } from "@/interfaces/assessment";
import { ApiResponse } from "@/interfaces/api-response";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL belum diatur di .env.local");
}

// 🔹 GET /assessment → List all assessments
export const ListAssessment = async (): Promise<ApiResponse<Assessment[]>> => {
  try {
    const res = await fetch(`${BASE_URL}/assessment`, {
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

    const json = await res.json();
    return {
      status: 'success',
      message: json.message || 'Data berhasil dimuat',
      data: json.data || [],
    };
  } catch (error) {
    console.error('🚨 Error di ListAssessment:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Terjadi kesalahan koneksi',
      data: [],
    };
  }
};

// 🔹 POST /assessment → Create new assessment
export async function createAssessment(body: CreateAssessment): Promise<ApiResponse<Assessment>> {
  const res = await fetch(`${BASE_URL}/assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal membuat assessment: ${errorText}`);
  }

  return res.json();
}

// 🔹 POST /assessment/detail → Create assessment detail
export async function createAssessmentDetail(
  body: CreateAssessmentDetail
): Promise<ApiResponse<Assessment>> {
  const res = await fetch(`${BASE_URL}/assessment/detail`, {
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

// 🔹 POST /assessment/finish → Finish assessment
export async function finishAssessment(
  body: FinishAssessment
): Promise<ApiResponse<{ success: boolean }>> {
  const res = await fetch(`${BASE_URL}/assessment/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch (jsonError) {
    data = {
      status: res.ok ? 'success' : 'error',
      message: res.ok 
        ? 'Assessment finished successfully' 
        : `HTTP ${res.status}: ${res.statusText}`,
      data: res.ok ? { success: true } : null,
    };
  }

  if (res.ok && (!data || data.status !== 'success')) {
    return {
      status: 'success',
      message: 'Assessment finished successfully',
      data: { success: true },
    };
  }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data;
}

// 🔹 GET /assessment/:id → Get assessment by ID
export async function getAssessmentById(id: number): Promise<ApiResponse<Assessment>> {
  const res = await fetch(`${BASE_URL}/assessment/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-cache',
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      status: 'error',
      message: `Gagal ambil assessment ID ${id}: ${res.status} - ${errorText}`,
      data: null,
    };
  }

 try {
  const json = await res.json();
  return {
    status: 'success', // ← selalu 'success' jika res.ok = true
    message: json.message || 'Berhasil',
    data: json.data || null,
  };
} catch (parseError) {
  return {
    status: 'error',
    message: 'Gagal memproses respons dari server',
    data: null,
  };
}
}

 // 🔹 POST /api/assessment/{id}/request-edit → Request edit assessment
export async function requestEditAssessment(
  assessmentId: number
): Promise<ApiResponse<{ success: boolean }>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE_URL}/assessment/${assessmentId}/request-edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // ✅ Jika status 2xx → sukses, kembalikan format valid
  if (res.ok) {
    return {
      status: 'success',
      message: 'Permintaan edit berhasil diajukan',
      data: { success: true },
    };
  }

  // ❌ Jika error → ambil pesan sebaik mungkin
  let errorMessage = `Gagal mengajukan edit: ${res.status}`;
  try {
    const text = await res.text();
    if (text.trim()) {
      errorMessage = text.trim();
    }
  } catch {
    // abaikan
  }

  throw new Error(errorMessage);
}

// 🔹 POST /approval-assessment/approve-edit → Approve edit request
export async function approveEditAssessment(
  assessmentId: number
): Promise<ApiResponse<{ success: boolean }>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE_URL}/assessment/${assessmentId}/approve-edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ assessmentId }),
  });

  // ✅ Jika status 2xx → sukses, kembalikan format valid
  if (res.ok) {
    return {
      status: 'success',
      message: 'Permintaan edit disetujui',
      data: { success: true },
    };
  }

  // ❌ Jika error → ambil pesan sebaik mungkin
  let errorMessage = `Gagal menyetujui edit: ${res.status}`;
  try {
    const text = await res.text();
    if (text.trim()) {
      errorMessage = text.trim();
    }
  } catch {
    // abaikan
  }

  throw new Error(errorMessage);
}