"use client";

import { useState } from "react";
import { useGet } from "./useGet";
import { listUsers, getUserById, createUser, deactivateUser, activateUser, API_URL, listBranches} from "@/lib/api-user-management";
import { CreateUserRequest, User } from "@/interfaces/user-management";
import { ApiResponse } from "@/interfaces/api-response";
import { Branch } from "@/interfaces/user-management";


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
      const res = await createUser(body);
      return res.data;
    } catch (err: any) {
      // Ambil pesan error dari backend
      let userFriendlyMessage = err.message || "Gagal membuat user";

      // ✅ Ubah pesan error jadi lebih ramah
      if (userFriendlyMessage.toLowerCase().includes('username')) {
        userFriendlyMessage = 'Username sudah digunakan. Silakan gunakan username lain.';
      } else if (userFriendlyMessage.toLowerCase().includes('email')) {
        userFriendlyMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
      } else if (userFriendlyMessage.toLowerCase().includes('duplicate')) {
        userFriendlyMessage = 'Data duplikat ditemukan. Periksa kembali username atau email.';
      } else if (userFriendlyMessage.toLowerCase().includes('conflict')) {
        userFriendlyMessage = 'Terjadi konflik data. Pastikan username dan email unik.';
      }


      // Set error state (jika perlu ditampilkan di UI)
      setError(userFriendlyMessage);

      // Lemparkan ulang error agar bisa ditangkap di komponen
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number, body: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal memperbarui user');
      }
      return res.json();
    } catch (err: any) {
      let userFriendlyMessage = err.message || "Gagal memperbarui user";

      // ✅ Ubah pesan error jadi lebih ramah
      if (userFriendlyMessage.toLowerCase().includes('username')) {
        userFriendlyMessage = 'Username sudah digunakan. Silakan gunakan username lain.';
      } else if (userFriendlyMessage.toLowerCase().includes('email')) {
        userFriendlyMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
      } else if (userFriendlyMessage.toLowerCase().includes('duplicate')) {
        userFriendlyMessage = 'Data duplikat ditemukan. Periksa kembali username atau email.';
      }

      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
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

export function useListBranches() {
  return useGet<ApiResponse<Branch[]>>(() => listBranches(), []);
}
