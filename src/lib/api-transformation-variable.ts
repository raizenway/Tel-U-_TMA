// src/lib/api-transformation-variable.ts

import { 
  TransformationVariable, 
  CreateTransformationVariableRequest,
  UpdateTransformationVariableRequest 
} from '@/interfaces/transformation-variable';
import { ApiResponse } from '@/interfaces/api-response';

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/variable"; 

// 🔹 LIST
export const listTransformationVariables = async (): Promise<ApiResponse<TransformationVariable[]>> => {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

    const data: TransformationVariable[] = await res.json();
    return {
      status: 'success',
      message: 'Data variabel transformasi berhasil dimuat',
      data,
    };
  } catch (error) {
    console.error('Error di listTransformationVariables:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Terjadi kesalahan koneksi',
      data: [],
    };
  }
};


// 🔹 CREATE (JSON - tanpa file)
export const createTransformationVariable = async (
  body: CreateTransformationVariableRequest
): Promise<ApiResponse<TransformationVariable>> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal membuat variable: ${res.status}`);
  }

  return await res.json(); 
};

// 🔥 CREATE DENGAN FILE (FormData - dengan logo)
export const createTransformationVariableWithFile = async (
  formData: FormData
): Promise<ApiResponse<TransformationVariable>> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    //biarkan browser atur otomatis
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal membuat variable: ${res.status}`);
  }

  return await res.json(); 
};

// 🔹 UPDATE (JSON - tanpa file)
export const updateTransformationVariable = async (
  id: number,
  body: UpdateTransformationVariableRequest
): Promise<ApiResponse<TransformationVariable>> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal update variable: ${res.status}`);
  }

  return await res.json();
};

// 🔥 UPDATE DENGAN FILE (FormData - dengan logo)
export const updateTransformationVariableWithFile = async (
  id: number,
  formData: FormData
): Promise<ApiResponse<TransformationVariable>> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    // ⚠️ JANGAN set 'Content-Type'
    body: formData, 
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Gagal update variable: ${res.status}`);
  }

  return await res.json();
};

// 🔹 GET BY ID
export const getTransformationVariableById = async (
  id: number
): Promise<ApiResponse<TransformationVariable>> => {
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
    console.error('🚨 Error di getTransformationVariableById:', err);
    return {
      status: 'error',
      message: err.message || 'Network error atau CORS',
      data: null,
    };
  }
};