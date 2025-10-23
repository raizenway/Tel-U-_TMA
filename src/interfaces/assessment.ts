// User dari API

export interface Branch {
  id: number;
  name: string;
  email: string;
}

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  picName: string;
  status: string;
  roleId: number;
  logoFileId: number | null;
  branchId: number;
  branch: Branch;
  createdAt: string;
  updatedAt: string;
}

// AssessmentPeriod dari API
export interface AssessmentPeriod {
  id: number;
  year: number;
  semester: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// AssessmentDetail dari API
export interface AssessmentDetail {
  id: number;
  assessmentId: number;
  itemId: number;
  questionId: number;
  answerId: number;
  countScore0: number;
  countScore1:  number;
  countScore2:  number;
  countScore3:  number;
  countScore4:  number;
  tmiScore: number;
  submissionValue: string;
}

// ✅ Assessment sesuai respons Postman
export interface Assessment {
  id: number;
  periodId: number;
  userId: number;
  approvalStatus: string; // "submitted", "approved", dll
  submissionDate: string | null; // ISO string atau null
  createdAt: string;
  updatedAt: string;
  user: User;
  assessmentPeriod: AssessmentPeriod;
  assessmentDetails: AssessmentDetail[];
  countScore0: number;
  countScore1:  number;
  countScore2:  number;
  countScore3:  number;
  countScore4:  number;
  tmiScore: number;
 branch: Branch;
}

// Payload untuk create (tetap seperti punyamu)
export interface CreateAssessment {
  periodId: number;
  branchId: number;
  userId: number;
  submission_date: string;
}

export interface CreateAssessmentDetail {
  assessmentId: number;
  questionId: number;
  textAnswer1: string;
  textAnswer2: string;
  textAnswer3: string;
  textAnswer4: string;
  textAnswer5: string;
  evidenceLink: string;
}

export interface FinishAssessment {
  assessmentId: number;
}