"use client";

import { useApi } from "./useApi";
import { listUsers, getUserById } from "@/lib/api-user-management";
import { User, ApiResponse } from "@/interfaces/user-management";

export function useListUsers() {
  return useApi<ApiResponse<User[]>>(listUsers, []);
}

export function useGetUserById(id: number) {
  return useApi<ApiResponse<User>>(() => getUserById(id), [id]);
}
