'use client';

import { useState, useEffect } from "react";
import TableUpdate from "@/components/TableUpdate";
import { Pencil, Trash2 } from "lucide-react";
import Button from "@/components/button";
import { useRouter, useSearchParams } from "next/navigation";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import TableButton from "@/components/TableButton";
import SearchTable from "@/components/SearchTable";
import SuccessNotification from "@/components/SuccessNotification";
import Pagination from "@/components/Pagination";
import { useSort } from "@/hooks/useSort";
import { useListMaturityLevels, useDeleteMaturityLevel } from "@/hooks/useMaturityLevel";

const TablePage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const searchParams = useSearchParams();
  const [showNotif, setShowNotif] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const { data: maturityRes, loading, error } = useListMaturityLevels();
  const { mutate: deleteMaturity, loading: deleteLoading } = useDeleteMaturityLevel();


  const [showModal, setShowModal] = useState(false);
  const [selectedDeskripsiList, setSelectedDeskripsiList] = useState<string[]>([]);

   const [roleId, setRoleId] = useState<number | null>(null);
  
    useEffect(() => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setRoleId(Number(parsed.roleId));
        } catch (e) {
          console.error("Gagal parse user:", e);
        }
      }
    }, []);

  useEffect(() => {
    if (maturityRes?.data) {
      const mapped = maturityRes.data.map((item: any) => ({
        id: item.id, 
        level: item.levelNumber,
        namaLevel: item.name,
        skorMin: item.minScore,
        skorMax: item.maxScore,
        deskripsiUmum: item.description,
      }));
      setData(mapped);
    }
  }, [maturityRes]);

  useEffect(() => {
  if (searchParams.get("success") === "true") {
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 3000);
    setRefreshKey(prev => prev + 1);
  }
}, [searchParams, setRefreshKey]); 

  const { sortedData, requestSort, sortConfig } = useSort(data, "level");

  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalItems = filteredData.length;

  const handleTambah = () => {
    router.push("/maturity-level/add-maturity");
  };

  const handleEdit = (index: number) => {
    const selectedData = paginatedData[index];
    if (!selectedData) return;
    router.push(`/maturity-level/edit-maturity/${selectedData.id}`); 
  };

  const handleDelete = async (index: number) => {
  const selectedData = paginatedData[index];
  if (!selectedData) return;

  try {
    await deleteMaturity(selectedData.id);
    setData((prev) => prev.filter((item) => item.id !== selectedData.id));
    setShowDelete(false);
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};

  const dataDenganAksi = paginatedData.map((row, index) => ({
    ...row,
    aksi: (
      <div className="flex justify-center gap-4 text-xs">
        <button
          onClick={() => handleEdit(index)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => {
            setDeleteIndex(index);
            setShowDelete(true);
          }}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    ),
  }));

const baseColumns = [
  { 
    header: "Level", 
    key: "level", 
    width: "60px",
    onClick: () => requestSort("level"),
    isSorted: sortConfig?.key === "level" ? sortConfig.direction : undefined
  },
  { 
    header: "Nama Level", 
    key: "namaLevel", 
    width: "200px",
    onClick: () => requestSort("namaLevel"),
    isSorted: sortConfig?.key === "namaLevel" ? sortConfig.direction : undefined
  },
  { 
    header: "Skor Minimum", 
    key: "skorMin", 
    width: "160px",
    onClick: () => requestSort("skorMin"),
    isSorted: sortConfig?.key === "skorMin" ? sortConfig.direction : undefined
  },
  { 
    header: "Skor Maximum", 
    key: "skorMax", 
    width: "160px",
    onClick: () => requestSort("skorMax"),
    isSorted: sortConfig?.key === "skorMax" ? sortConfig.direction : undefined
  },
  { 
    header: "Deskripsi Umum", 
    key: "deskripsiUmum", 
    width: "250px",
    onClick: () => requestSort("deskripsiUmum"),
    isSorted: sortConfig?.key === "deskripsiUmum" ? sortConfig.direction : undefined
  },
  
];

const columns = roleId === 1
  ? [
      ...baseColumns,
      {
        header: "Aksi",
        key: "aksi",
        width: "200px",
        className: "text-center sticky right-0 border border-gray-200 z-10 bg-gray-100",
        render: (item) => (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(item.id)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        ),
      },
    ]
  : baseColumns; 

  const dataForExport = paginatedData.map((item, index) => ({
    Nomor: (currentPage - 1) * itemsPerPage + index + 1,
    Level: item.level,
    NamaLevel: item.namaLevel,
    SkorMinimum: item.skorMin,
    SkorMaximum: item.skorMax,
    DeskripsiUmum: item.deskripsiUmum,
  }));

  return (
    <div className="">
      <div className="bg-white rounded-xl w-full">
        {loading && (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        )}
        {error && (
          <p className="text-center text-red-600 py-4">
            Gagal load data: {String(error)}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <SearchTable
                value={search}
                onChange={setSearch}
                placeholder="Cari level maturity..."
              />
              <div className="flex items-center gap-2">
                <TableButton data={dataForExport} />
                {roleId === 1 && (
                <Button className="px-8" onClick={handleTambah}>
                  Tambah Maturity Level
                </Button>
                )}
              </div>
            </div>

            <SuccessNotification
              isOpen={showNotif}
              onClose={() => setShowNotif(false)}
              message="Maturity berhasil disimpan"
            />

            <div className="overflow-x-auto w-full">
              <TableUpdate
                columns={columns}
                data={dataDenganAksi}
                currentPage={currentPage}
                rowsPerPage={itemsPerPage}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={(value) => setItemsPerPage(value)}
              showItemsPerPage={true}
              showTotalItems={true}
            />
          </>
        )}
      </div>

      <ModalConfirm
        isOpen={showDelete}
        onConfirm={() => {
          if (deleteIndex !== null) {
            handleDelete(deleteIndex);
          }
        }}
        onCancel={() => setShowDelete(false)}
        title="Apakah kamu yakin, akan menghapus data?"
        header="Konfirmasi "
        confirmLabel="Ya, lakukan"
        cancelLabel="Batal"
      >
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-left text-sm">
          <div className="font-bold mb-1">⚠ Peringatan</div>
          <div>Data yang sudah dihapus tidak akan bisa dipulihkan.</div>
        </div>
      </ModalConfirm>
    </div>
  );
};

export default TablePage;
