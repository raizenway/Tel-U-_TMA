export interface MaturityLevel {
  id: number;
  levelNumber: number;
  name: string;
  minScore: number;
  maxScore: number;
  generalDescription: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
  created_at: string;
  updated_at: string;

  [key: string]: any;
}

export interface CreateMaturityLevelRequest {
  name: string;
  levelNumber: number;
  minScore: number;
  maxScore: number;
  generalDescription: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
}

export interface UpdateMaturityLevelRequest {
  id?: number;
  name?: string;
  levelNumber?: number;
  minScore?: number;
  maxScore?: number;
  generalDescription?: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
}