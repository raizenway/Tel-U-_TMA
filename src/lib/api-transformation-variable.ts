// src/lib/api-transformation-variable.ts

import { TransformationVariable } from '@/interfaces/transformation-variable';

const API_URL = 'http://localhost:3000/api/assessment/variable';

export const fetchTransformationVariables = async (): Promise<TransformationVariable[]> => {
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
      throw new Error(`Gagal ambil  ${res.status} - ${errorText}`);
    }

    const data: TransformationVariable[] = await res.json();
    return data;
  } catch (error) {
    console.error('Error di fetchTransformationVariables:', error);
    throw error;
  }
};