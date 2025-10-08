// src/interfaces/periode.ts
export interface Periode {
  id: number;
  tahun: number;      // misal: 2025
  semester: string;  
  status: 'active' | 'inactive';
}