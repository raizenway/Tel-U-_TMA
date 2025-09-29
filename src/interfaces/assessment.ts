
export interface Assessment {
    periodeId: number;
    userId: number;
    submission_date: Date;
}
export interface CreateAssessmentDetail {
  assessmentId: number;
  questionId: number;
  textAnswer1: number;
  textAnswer2: number;
  textAnswer3: number;
  textAnswer4: number;
  textAnswer5: number;
}
export interface CreateAssessment {
    periodeId: number;
    userId: number;
    submission_date: Date;
}