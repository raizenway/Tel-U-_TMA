export interface MaturityLevel {
  id: number;
  levelNumber: number;
  name: string;
  minScore: string;
  maxScore: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMaturityLevelRequest {
  name: string;
  levelNumber: number;
  minScore: string;
  maxScore: string;
  description: string;
}

export interface UpdateMaturityLevelRequest {
  id?: number;
  name?: string;
  levelNumber?: number;
  minScore?: string;
  maxScore?: string;
  description?: string;
}