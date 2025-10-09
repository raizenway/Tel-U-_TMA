import { Branch } from "./user-management";

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  password: string; // biasanya tidak dikirim balik oleh API
  phone_number?: string;
  pic?: string;
  status: UserStatus;
  role_id: number;
  logo_file_id?: number;
  branch_id: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  branch: Branch;
}

export interface CreateUserRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId: number;
  branchId: number;
}