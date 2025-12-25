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

// types/branch.ts atau file interface terkait
export interface LogoFile {
  id: number;
  originalName: string;
  altText: string | null;
  mimetype: string;
  encoding: string;
  path: string; 
  destination: string | null;
  size: string;
  aux: any;
  uploaderId: any;
  objectId: any;
  objectType: any;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: number;
  name: string;
  email: string;
  logoFileId: number;
  logoFile: LogoFile;
  branchDetails: BranchDetail[];
}