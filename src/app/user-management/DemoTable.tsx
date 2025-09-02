// app/user-management/UserTable.tsx
"use client";

import { useState } from "react";
import TableUpdate from "@/components/TableUpdate";
import { useListUsers, useDeactivateUser, useCreateUser, useActivateUser } from "@/hooks/useUserManagementExample";
import { User } from "@/interfaces/user-management-example";

export default function UserTable() {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { data, loading, error } = useListUsers(refreshFlag);
  const { mutate: createUser } = useCreateUser();
  const { mutate: deactivateUser } = useDeactivateUser();
  const { mutate: activatedUser } = useActivateUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const rowsPerPage = 10;
  
  const handleCreate = async () => {
    try {
      const newUser = await createUser({
        fullname: "Admin9",
        username: "admin9",
        email: "atmin9@mail.com",
        password: "admin",
        phoneNumber: "111222333444",
        roleId: 1,
        branchId: 1,
      });
      console.log("New User:", newUser);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };
  
  const handleDeactivate = async (id: number) => {
    try {
      const deactivated = await deactivateUser(id);
      console.log("Deactivated:", deactivated);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      console.error("Failed to deactivate user:", err);
    }
  };

    const handleActivate = async (id: number) => {
    try {
      const activated = await activatedUser(id);
      console.log("Activated:", activated);
      setRefreshFlag(prev => prev + 1);
    } catch (err) {
      console.error("Failed to activated user:", err);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  let users: User[] = data?.data || [];

  if (sortConfig) {
    users = [...users].sort((a, b) => {
      const valA = (a as any)[sortConfig.key];
      const valB = (b as any)[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // ✅ Pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + rowsPerPage);

  const columns = [
    { header: "No", key: "nomor", width: "60px" },
    { header: "Nama Lengkap", key: "fullname", sortable: true },
    { header: "Username", key: "username", sortable: true },
    { header: "Email", key: "email", sortable: true },
    { header: "Telepon", key: "phone_number" },
    { header: "Role", key: "roleId", sortable: true },
    { header: "Status", key: "status", sortable: true },
    {
      header: "Aksi",
      key: "action",
      width: "180px",
      className: "sticky right-0 bg-gray-100 z-10",
    },
  ];

  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create User
      </button>
      <TableUpdate
        columns={columns}
        data={paginatedUsers}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onEdit={(item) => console.log("Edit:", item)}
        onDeactivate={(index) => handleDeactivate(paginatedUsers[index].id)}
        onReactivate={(index) => handleActivate(paginatedUsers[index].id)}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
}
