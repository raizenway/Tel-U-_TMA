
export interface MaturityLevel {
  id: number;
  levelNumber: number;
  name: string;
  minScore: number;
  maxScore: number;
  generalDescription: string;
  scoreDescription: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateMaturityLevelRequest {
  name:string;
  levelNumber:number;
  minScore:number;
  maxScore:number;
  generalDescription:string;
  scoreDescription?:string[];
}

export interface UpdateMaturityLevelRequest {
  id?: number;
  name?: string;
  levelNumber?: number;
  minScore?: number;
  maxScore?: number;
  generalDescription?: string;
  scoreDescription?: string[];
}
