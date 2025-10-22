export interface BranchDetail {
  id: number;
  tempId?: string; 
  branchId: number;
  year: number;
  studentBodyCount: number;
  studyProgramCount: number;
  superiorAccreditedStudyProgramCount: number;
  accreditationGrowth: number;
}

export interface Branch {
  id: number;
  name: string;
  email: string;
  branchDetails: BranchDetail[];
}