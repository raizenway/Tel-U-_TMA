// src/lib/api-transformation-variable.ts

import { TransformationVariable } from '@/interfaces/transformation-variable';
import { ApiResponse } from '@/interfaces/api-response';


const API_URL = process.env.NEXT_PUBLIC_API_URL + "/assessment/variable"; // Menyetel prefix



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



export const UpdateTransformationVariable = async (
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
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Gagal ambil  ${res.status}`);
  }

  return await res.json();
};