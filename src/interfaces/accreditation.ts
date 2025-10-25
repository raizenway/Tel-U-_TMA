// src/interfaces/accreditation.ts
export type CampusKey =
  | 'Tel-U Jakarta'
  | 'Tel-U Surabaya'
  | 'Tel-U Purwokerto'
  | 'Tel-U Bandung';

export interface AccreditationRow {
  year: string;
  'Tel-U Jakarta': number;
  'Tel-U Surabaya': number;
  'Tel-U Purwokerto': number;
  'Tel-U Bandung': number;
}

export interface AccreditationApiPayloadItem {
  branch_id: number;
  year: number;
  accreditationGrowth: number;
} 