
export interface StudentBodyItem {
  totalStudents: number;
  branch: string;
  year: number;
}


export interface AccreditationGrowthItem {
  year: number;
  score: number;
}


export interface DashboardContent {
  totalBranches: number;
  totalVariable: number;
  totalAssessments: number;
  approvedAssessments: number;
  pendingAssessments: number;
  submittedAssessments: number;
  studentBody: StudentBodyItem[];
  accreditationGrowth: AccreditationGrowthItem[];
}

