import { User, ApiResponse } from "@/interfaces/user-management";

const API_URL = "http://localhost:3000/api/user";

export async function listUsers(): Promise<ApiResponse<User[]>> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUserById(id: number): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}