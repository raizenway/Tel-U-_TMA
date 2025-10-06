// ✅ PERBAIKI FILE INI → SESUAI DENGAN BACKEND
export interface Assessment {
  periodId: number; 
  userId: number;
  submission_date: string; // tetap string (karena dari JSON)
}

export interface CreateAssessmentDetail {
  assessmentId: number;
  questionId: number;
  textAnswer1: string;
  textAnswer2: string;
  textAnswer3: string;
  textAnswer4: string;
  textAnswer5: string;
}


export interface CreateAssessment {
 periodId: number; 
  userId: number;           
  submission_date: string;  
}