import { useEffect, useState } from "react";
import TableUpdate from "@/components/TableUpdate";

interface Column {
  key: string;
  label: string;
}

export default function UserTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const rowsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:3000/api/user")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal fetch data");
        return res.json();
      })
      .then((result) => {
        setData(result.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
          direction = "desc";
        }
        setSortConfig({ key, direction });
  };

  // Tambahkan fungsi untuk sort data sebelum render
    const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
    });

  const columns = [
      { header: 'User ID', key: 'id', width: '140px', sortable: true },
      { header: 'User Name', key: 'fullname', width: '160px', sortable: true },
      { header: 'Password', key: 'password', width: '120px', sortable: false },
      { header: 'Nama User', key: 'username', width: '200px', sortable: true },
      { header: 'Role', key: 'roleId', width: '140px', sortable: true },
      { header: 'Status', key: 'status', width: '100px', sortable: true },
      { 
        header: 'Aksi', 
        key: 'action', 
        width: '180px', 
        sortable: false, 
        className: 'sticky right-0 bg-gray-100 z-10' 
      },
    ];

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <TableUpdate
        columns={columns}
        data={sortedData}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onEdit={(item) => console.log("Edit:", item)}
        onDeactivate={(index) => console.log("Deactivate index:", index)}
        onReactivate={(index) => console.log("Reactivate index:", index)}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
    </div>
  );
}
