export interface Question {
  id: number;
   transformationVariable: { connect: { id: number } };
  type: string;
  indicator: string;
  questionText: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface CreateQuestionRequest {
  transformationVariable: { connect: { id: number } };
  type: string;
  indicator: string;
  questionText: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface UpdateQuestionRequest {
  transformationVariable: { connect: { id: number } };
  type?: string;
  indicator?: string;
  questionText?: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText?: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
  order?: number;
  status?: 'active' | 'inactive';
}

