"use client";

import { useState } from "react";
import { useGet } from "./useGet";
import { listUsers, getUserById, createUser, deactivateUser, activateUser } from "@/lib/api-user-management-example";
import { CreateUserRequest, User } from "@/interfaces/user-management-example";
import { ApiResponse } from "@/interfaces/api-response";

export function useListUsers(dep: any = null) {
  return useGet<ApiResponse<User[]>>(() => listUsers(), [dep]);
}

export function useGetUserById(id: number) {
  return useGet<ApiResponse<User>>(() => getUserById(id), [id]);
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createUser(body); // panggil API
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useDeactivateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await deactivateUser(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useActivateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await activateUser(id);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
