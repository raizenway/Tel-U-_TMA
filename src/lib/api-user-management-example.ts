import { User, CreateUserRequest } from "@/interfaces/user-management-example"; // Interface User Management
import { ApiResponse } from "@/interfaces/api-response"; // Interface API Response

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/user"; // Menyetel prefix
// API_URL = http://localhost:3000/api/user

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

// Fungsi createUser untuk fetch API Create User dengan menggunakan interface CreateUserRequest
export async function createUser(body: CreateUserRequest): Promise<ApiResponse<User>> {
  const res = await fetch(API_URL, {
    method: "POST", // Method yang digunakan
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create user");
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