// src/lib/api-branch.ts
import { Branch } from '@/interfaces/branch.interface'; // 👈 impor interface

export const getBranchList = async (): Promise<{ data: Branch[] }> => {
  const response = await fetch('/api/branch', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
};