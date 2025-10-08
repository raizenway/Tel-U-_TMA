export type UserStatus = 'active' | 'inactive';

export interface Role {
  id: number;
  name: string;
}

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
  branchId: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  picName: string | null; // ← tambah ini
  pic_name: string | null; 
  role: Role; 
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
  picName?: string;  
  logo_file_id?: number | null; // ← tambah ini
  
  
}

// Interface baru untuk branch
export interface Branch {
  id: number;
  name: string;
  email: string; // opsional
}
