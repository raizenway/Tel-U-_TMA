
export interface MaturityLevel {
  id: number;
  level: string;               
  namaLevel: string;            
  skorMin: number;              
  skorMax: number;              
  deskripsiUmum: string;       
  deskripsiPerVariabel: string[]; 
  created_at: string;           
  updated_at: string;           
}

export interface CreateMaturityLevelRequest {
  name:string;
  levelNumber:number;
  minScore:number;
  maxScore:number;
  generalDescription:string;
  scoreDescription:string[];
}