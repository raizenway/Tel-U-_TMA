// src/lib/api-transformation-variable.ts

import { TransformationVariable } from '@/interfaces/transformation-variable';
import { ApiResponse } from '@/interfaces/api-response';


const API_URL = process.env.NEXT_PUBLIC_API_URL + "/assessment/variable"; 

//list
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


//nambah
export const createTransformationVariable = async (
  body: Omit<TransformationVariable, 'id'>
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



export const updateTransformationVariable = async (
  id: number,
  body: Partial<Omit<TransformationVariable, 'id'>>
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