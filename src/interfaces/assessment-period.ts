// ===== CREATE =====
export interface CreateAssessmentPeriodDto {
  year: number;
  semester: 'Ganjil' | 'Genap';
  status: 'active' | 'inactive';
}

// ===== UPDATE =====
export interface UpdateAssessmentPeriodDto {
  year?: number;
  semester?: 'Ganjil' | 'Genap';
  status?: 'active' | 'inactive';
}

// ===== ACTIVATE / DEACTIVATE =====
// (Biasanya tidak butuh body, tapi kalau perlu, bisa pakai ini)
export interface ActivateAssessmentPeriodDto {
  status: 'active';
}

export interface DeactivateAssessmentPeriodDto {
  status: 'inactive';
}

// ===== RESPONSE (GET) =====
export interface AssessmentPeriodResponseDto {
  id: number;
  year: number;
  semester: 'Ganjil' | 'Genap';
  status: 'active' | 'inactive';
  createdAt: string; // ISO format: "2025-04-05T10:00:00Z"
  updatedAt: string;
}

// ===== LIST RESPONSE =====
export interface AssessmentPeriodListResponseDto {
  data: AssessmentPeriodResponseDto[];
  total: number;
  page: number;
  limit: number;
}