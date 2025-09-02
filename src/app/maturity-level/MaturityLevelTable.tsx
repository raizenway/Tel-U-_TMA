import { useEffect, useState } from "react";
import TableUpdate from "@/components/TableUpdate";

interface Column {
  key: string;
  label: string;
}

export default function MaturityLevelTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:3000/api/maturity-level")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal fetch data");
        return res.json();
      })
      .then((result) => {
        // ✅ Bungkus data tunggal menjadi array agar bisa dipakai TableUpdate
        setData([result.data]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const columns = [
    { header: "Level", key: "levelNumber", width: "60px" },
    { header: "Nama Level", key: "name", width: "200px" },
    { header: "Skor Minimum", key: "minScore", width: "160px" },
    { header: "Skor Maximum", key: "maxScore", width: "160px" },
    { header: "Deskripsi Umum", key: "generalDescription", width: "250px" },
    { header: "Deskripsi Per Variabel", key: "deskripsiPerVariabel", width: "250px" },
    {
     header: 'Aksi',
     key: 'aksi',
     width: '200px',
     className: 'text-center sticky right-0 border border-gray-200 z-10 bg-gray-100',
    },  ];

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">List Maturity Level</h1>
      <TableUpdate
        columns={columns}
        data={data}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onEdit={(item) => console.log("Edit:", item)}
        onDeactivate={(index) => console.log("Deactivate index:", index)}
        onReactivate={(index) => console.log("Reactivate index:", index)}
        onSort={(key) => console.log("Sort by:", key)}
        sortConfig={null}
      />
    </div>
  );
}
