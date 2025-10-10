import { User, CreateUserRequest, Branch } from "@/interfaces/user-management"; // Interface User Management
import { ApiResponse } from "@/interfaces/api-response"; // Interface API Response


export const API_URL = process.env.NEXT_PUBLIC_API_URL + "/user";

// Fungsi listUsers yang berguna untuk fetch API List User
export async function listUsers(): Promise<ApiResponse<User[]>> {
  // * Nilai API_URL = http://localhost:3000/api/user
  const res = await fetch(API_URL); 
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Fungsi getUserById berguna untuk fetch API Get User By Id
export async function getUserById(id: number): Promise<ApiResponse<User>> {
  // Nilai yang difetch = http://localhost:3000/api/user/{id}
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}


export async function createUser(body: CreateUserRequest): Promise<ApiResponse<User>> {
  const formData = new FormData();

  // Tambahkan semua field biasa (kecuali 'logo')
  Object.keys(body).forEach(key => {
    if (key !== 'logo') {
      formData.append(key, body[key as keyof CreateUserRequest] as string);
    }
  });

  // Jika ada file logo, tambahkan ke formData dengan key 'logo'
  if (body.logo) {
    formData.append('logo', body.logo); // key 'logo' harus sesuai dengan backend
  }

  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
    // ❗ JANGAN set Content-Type — biarkan browser atur otomatis
  });

  if (!res.ok) {
    let errorMessage = "Gagal membuat user";
    try {
      const errorData = await res.json();
      errorMessage = errorData.errors?.message || errorData.message || res.statusText;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

// Fungsi deactivateUser untuk fetch API Deactivate User
export async function deactivateUser(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_URL}/deactivate/${id}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to deactivate user");
  return res.json();
}

// Fungsi activateUser untuk fetch API Activate User
export async function activateUser(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_URL}/activate/${id}`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to activate user");
  return res.json();
}

// lib/api-user-management.ts
export async function listBranches(): Promise<ApiResponse<Branch[]>> {
  const res = await fetch(`${API_URL}/branches`);
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
}

