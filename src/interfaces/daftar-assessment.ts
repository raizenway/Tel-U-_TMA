export interface Question {
  id: number;
  transformationVariableId: number;
  type: string;
  indicator: string;
  questionText: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface CreateQuestionRequest {
  transformationVariableId: number;
  type: string;
  indicator: string;
  questionText: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface UpdateQuestionRequest {
  transformationVariableId?: number;
  type?: string;
  indicator?: string;
  questionText?: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
  order?: number;
   status?: 'active' | 'inactive';
}

