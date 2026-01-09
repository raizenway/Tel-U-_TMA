// src/types/ui-assessment.ts

export interface UiAssessment {
  id: string;
  name: string;
  email: string;
  submitPeriode: string;

  // Data tambahan dari branch / API
  kodePT?: string;
  status?: string;
  akreditasi?: string;
  tanggalBerdiri?: string; // atau Date
  noSKPT?: string;
  tanggalSKPT?: string;
  alamat?: string;
  kota?: string;
  kodePos?: string;
  noTelepon?: string;

  // Existing
  studentBody: number;
  jumlahProdi: number;
  jumlahProdiUnggul: number;
  maturityLevel: {
    name: string;
    description: string;
  };
}

export interface UiVariableReport {
  name: string;
  point: number;
  maturityLevel: string;
  desc: string;
}