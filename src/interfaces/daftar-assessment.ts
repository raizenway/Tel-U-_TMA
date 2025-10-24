type QuestionType= 'text' | 'multitext' | 'api' |'excel';

export interface Question {
  id: number;
  transformationVariableId: number;
  transformationVariable: { connect: { id: number } };
  type:   QuestionType;
  indicator: string;
   questionApiUrl?: string;
  questionText: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText1?: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  minScore0: number;
  maxScore0: number;
  minScore1: number;
  maxScore1: number;
  minScore2: number;
  maxScore2: number;
  minScore3: number;
  maxScore3: number;
  minScore4: number;
  maxScore4: number;
  order: number;
  status: 'active' | 'inactive';
}

export interface CreateQuestionRequest {
  transformationVariable: { connect: { id: number } };
  type: QuestionType;
  indicator: string;
   questionApiUrl?: string;
  questionText: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText1?: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0: string;
  scoreDescription1: string;
  scoreDescription2: string;
  scoreDescription3: string;
  scoreDescription4: string;
  minScore0: number;
  maxScore0: number;
  minScore1: number;
  maxScore1: number;
  minScore2: number;
  maxScore2: number;
  minScore3: number;
  maxScore3: number;
  minScore4: number;
  maxScore4: number;
  order: number;
  status: 'active' | 'inactive';
}

export interface UpdateQuestionRequest {
  transformationVariable?: { connect: { id: number } };
  type?: QuestionType;
  indicator?: string;
  questionText?: string;
  questionText2?: string;
  questionText3?: string;
  questionText4?: string;
  answerText1?: string;
  answerText2?: string;
  answerText3?: string;
  answerText4?: string;
  answerText5?: string;
  scoreDescription0?: string;
  scoreDescription1?: string;
  scoreDescription2?: string;
  scoreDescription3?: string;
  scoreDescription4?: string;
  minScore0?: number;
  maxScore0?: number;
  minScore1?: number;
  maxScore1?: number;
  minScore2?: number;
  maxScore2?: number;
  minScore3?: number;
  maxScore3?: number;
  minScore4?: number;
  maxScore4?: number;
  order?: number;
  status?: 'active' | 'inactive';
}

