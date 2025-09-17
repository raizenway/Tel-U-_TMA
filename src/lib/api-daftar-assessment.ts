import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/interfaces/daftar-assessment';
import { ApiResponse } from '@/interfaces/api-response';

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/question";

// 🔹 List all questions
export const listQuestions = async (): Promise<ApiResponse<Question[]>> => {
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

    const data: Question[] = await res.json();
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

// 🔹 Get question by id
export const getQuestionById = async (
  id: number
): Promise<ApiResponse<Question>> => {
  try {
    const url = `${API_URL}/${id}`;
    console.log('📡 GET Request ke:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: 'error',
        message: errorData.message || `Gagal ambil data: ${res.status}`,
        data: null,
      };
    }

    const data = await res.json();
    return {
      status: 'success',
      message: 'Berhasil',
      data,
    };
  } catch (err: any) {
    console.error('🚨 Error di getQuestionById:', err);
    return {
      status: 'error',
      message: err.message || 'Network error atau CORS',
      data: null,
    };
  }
};

// 🔹 Create question
export const createQuestion = async (
  body: CreateQuestionRequest
): Promise<ApiResponse<Question>> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal membuat pertanyaan: ${res.status}`);
  }

  return await res.json();
};

// 🔹 Update question
export const updateQuestion = async (
  id: number,
  body: UpdateQuestionRequest
): Promise<ApiResponse<Question>> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal update pertanyaan: ${res.status}`);
  }

  return await res.json();
};

// 🔹 Delete question
export const deleteQuestion = async (
  id: number
): Promise<ApiResponse<null>> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal hapus pertanyaan: ${res.status}`);
  }

  return {
    status: 'success',
    message: 'Pertanyaan berhasil dihapus',
    data: null,
  };
};
