# Standarisasi Implementasi BE

Dokumen ini merangkum best practices dalam membuat fungsi API, interface, hooks, dan penggunaannya di client component. Tujuannya: *konsistensi*, *readability*, dan *maintainability*.


## 🌳 Struktur Project
``` bash
├─ ⚙️ .env
├─ 📂 src/
│  ├─ 📂 app/
│  │  ├─ 📂[nama-fitur]       
│  │  │├─ ⚛️[NamaFiturClient].tsx 
│  │  │└─ ⚛️page.tsx 
│  │  └─ ...                
│  │
│  ├─ 📂 interfaces/ # Berisi struktur entitas/body
│  │  ├─ 📄api-response.ts    
│  │  ├─ 📄user-management-example.ts 
│  │  ├─ 📄[nama-fitur].ts
│  │  └─ ...
│  │
│  ├─ 📂 lib/ # Berisi fungsi Fetch API
│  │  ├─ 📄api-user-management-example.ts
│  │  ├─ 📄[nama-fitur].ts
│  │  └─ ...
│  │
│  ├─ 📂 hooks/ # Berisi fungsi handling Fetch API dari lib
│  │  ├─ 📄useUserManagementExample.ts
│  │  ├─ 📄useGet.ts
│  │  └─ 📄[useNamaFitur].ts
│  │
│  ├─ 📂 components/
│  │  ├─ ⚛️TableUpdate.tsx       
│  │  └─ ...                           
│  └─ ...
└─ ...
```

## ⚙️ Setup .env
```ts
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🗒️ 1. Interface
- Definisikan struktur dari entitas dan body API di dalam folder `interface`
- Pastikan penulisan field di interface sesuai dengan field pada JSON API
- Gunakan format penamaan Kebab Case `nama-fitur.ts`
- Struktur:

```bash
interfaces/
├─ user-management-example.ts # Entity User
├─ api-response.ts # Generic ApiResponse<T>
└─ [nama-fitur].ts
```

### `user-management-example.ts`
```ts
// Interface dari entitas User
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  pic?: string;
  status: UserStatus;
  roleId: number;
  logoFileId?: number;
  branchId: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Interface dari body API Create User
export interface CreateUserRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId: number;
  branchId: number;
}

```
### `api-response.ts`
```ts
// Interface dari respon API secara umum
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
```

> Tip: ApiResponse adalah interface untuk standar format yang dikembalikan API 

## 📬 2. Lib
- Berisi daftar function untuk Fetch API
- Satu file mewakili satu fitur dengan format penamaan file Kebab Case dengan diawali kata 'api ': `api-nama-fitur.ts`
- Function dibuat untuk masing-masing entrypoint/tugas dengan format penamaan Camel Case: `createUser`
- Menggunakan interface yang telah dibuat untuk struktur datanya
- Gunakan prefix `NEXT_PUBLIC_API_URL` untuk variabel `API_URL` diikuti dengan entrypoint masing-masing
- Tuliskan komen kegunaan fungsi yang dibuat supaya terlihat bahwa tiap fungsi punya tujuan kegunaannya

### `api-user-management-example.ts`:

```ts
import { User, CreateUserRequest } from "@/interfaces/user-management-example"; // Interface User Management
import { ApiResponse } from "@/interfaces/api-response"; // Interface API Response

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/user"; // Menyetel prefix

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
```

## 🎣 3. Hooks
- Hooks dalam menjalankan fungsi pada lib, berisi penanganan loading beserta error. Dibuat dalam rangka meminimalisir penulisan kode di halaman client
- Satu file mewakili satu fitur dengan penamaan Camel Case dengan diawali kata 'use' dan dilanjut dengan nama fitur: `useUserManagement.ts`
- Penamaan fungsi pada hooks juga mewakili satu fungsi API yang ditulis pada lib dengan di aturan penulisan serupa dengan nama file: `useListUsers`


### `useUserManagementExample.ts`
```ts
export function useListUsers(dep: any = null) {
  return useGet<ApiResponse<User[]>>(() => listUsers(), [dep]);
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createUser(body); // Panggil Fungsi Fetch API
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
```
Tips:

> Untuk melakukan fetch dengan method GET, gunakan hook `useGet` seperti pada hook `useListUser`

> Gunakan state loading dan error untuk reusable feedback UI.



## 👨‍💻 4. Client Component Usage
- Untuk melakukan Fetch gunakan Hook yang telah dibuat
- Penamaan file Client Component menggunakan Pascal Case dengan diawali nama fitur: `UserManagementTable.tsx`
- Minimalisir pembuatan fungsi jika tidak dibutuhkan. Pembuatan fungsi dilakukan dengan format Pascal Case: `handleCreate`
- *Destructure assignment* dari fungsi yang digunakan dari Hooks. Contoh:
```
const { mutate: createUser } = useCreateUser();
```

### `DemoTable.tsx`
> Method POST
```tsx
"use client";

import { useCreateUser } from "@/hooks/useUserManagementExample";

export default function DemoTable() {
  const { mutate: createUser } = useCreateUser();

  const handleCreate = async () => {
    try {
      // Hanya untuk uji coba create, nanti mah isinya dari input di UI
      // Menggunakan fungsi Fetch API createUser
      // Berasal dari lib api-user-management-example.ts
      // Yang telah di-destructure oleh hook useCreateUser.ts
      const newUser = await createUser({ // < createUser
        fullname: "Admin",
        username: "admin",
        email: "admin@mail.com",
        password: "admin",
        phoneNumber: "111222333444",
        roleId: 1,
        branchId: 1,
      });
      console.log("New User:", newUser); // < Tampilin di console
      setRefreshFlag(prev => prev + 1); // Ini mah buat auto refresh
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreate} // < Fungsi handleCreate dijalankan
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create User
      </button>
    </div>
  )
}

```
> Method GET
```tsx
"use client";

import { User } from "@/interfaces/user-management-example";
import { useListUsers } from "@/hooks/useUserManagementExample";
import TableUpdate from "@/components/TableUpdate";

export default function DemoTable() {
  const { data, loading, error } = useListUsers(refreshFlag);
  let users: User[] = data?.data || [];
  
  const columns = [
    // Cocokkan key dengan field pada interface
    { header: "Username", key: "username", sortable: true },
    { header: "Email", key: "email", sortable: true },
    { header: "Status", key: "status", sortable: true },
    {
      header: "Aksi",
      key: "action",
      width: "180px",
      className: "sticky right-0 bg-gray-100 z-10",
    },
  ];

  return (
    <div>
      <TableUpdate
        columns={columns}
        data={users}
      />
    </div>
  )
}

```