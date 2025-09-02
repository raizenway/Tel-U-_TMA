// app/user-management/UserTable.tsx
"use client";

import { useState } from "react";
import TableUpdate from "@/components/TableUpdate";
import { useListUsers } from "@/hooks/useUserManagement";
import { User } from "@/interfaces/user-management";

export default function UserTable() {
  const { data, loading, error } = useListUsers(); // ✅ pake hook
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const rowsPerPage = 5;

  // ✅ Sorting
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
      <TableUpdate
        columns={columns}
        data={paginatedUsers}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onEdit={(item) => console.log("Edit:", item)}
        onDeactivate={(index) => console.log("Deactivate:", index)}
        onReactivate={(index) => console.log("Reactivate:", index)}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
}
