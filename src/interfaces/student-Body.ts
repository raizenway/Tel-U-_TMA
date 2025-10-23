// types/studentBody.ts
export type CampusKey = 
  | "Tel-U Jakarta"
  | "Tel-U Surabaya"
  | "Tel-U Purwokerto"
  | "Tel-U Bandung";

export interface StudentBodyRow {
  year: string;
  "Tel-U Jakarta": number;
  "Tel-U Surabaya": number;
  "Tel-U Purwokerto": number;
  "Tel-U Bandung": number;
}

export interface StudentBodyApiPayloadItem {
  branchId: number;
  year: number;
  studentBodyCount: number;
}