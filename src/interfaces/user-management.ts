export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  password?: string; // biasanya tidak dikirim balik oleh API
  phone_number?: string;
  status: UserStatus;
  roleId: number; 
  phoneNumber: number;
  branch_id: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  logo_file_id?: number | null; // ← tambah ini
  pic: string | null; 
}

export interface CreateUserRequest {
  fullname: string;
  username: string;
  email: string;
  password?: string;
  phoneNumber: string;     // camelCase
  roleId: number;          // camelCase
  branchId: number;  
  status: 'active' | 'inactive';
  logo_file_id?: number | null; // ← tambah ini
  
  
}
