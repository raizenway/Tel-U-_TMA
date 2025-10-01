'use client';

import { useState, useEffect } from "react";
import TableUpdate from "@/components/TableUpdate";
import { Pencil, Trash2, Eye } from "lucide-react";
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


  // Modal lihat deskripsi
  const [showModal, setShowModal] = useState(false);
  const [selectedDeskripsiList, setSelectedDeskripsiList] = useState<string[]>([]);

   const [roleId, setRoleId] = useState<number | null>(null);
  
    // 🔹 Ambil roleId dari localStorage
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

  // Mapping API -> struktur tabel
  useEffect(() => {
    if (maturityRes?.data) {
      const mapped = maturityRes.data.map((item: any) => ({
        id: item.id, 
        level: item.levelNumber,
        namaLevel: item.name,
        skorMin: item.minScore,
        skorMax: item.maxScore,
        deskripsiUmum: item.description,
        deskripsiPerVariabel: [
          item.scoreDescription0,
          item.scoreDescription1,
          item.scoreDescription2,
          item.scoreDescription3,
          item.scoreDescription4,
        ].filter(Boolean),
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

  // Data + kolom aksi
  const dataDenganAksi = paginatedData.map((row, index) => ({
    ...row,
    deskripsiPerVariabel: (
      <button
        className="flex items-center gap-2 text-gray-700 hover:underline"
        onClick={() => {
          setSelectedDeskripsiList(row?.deskripsiPerVariabel || []);
          setShowModal(true);
        }}
      >
        <Eye size={18} strokeWidth={1} /> Lihat Deskripsi
      </button>
    ),
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

  // 🔹 Buat baseColumns — tanpa kolom "Aksi"
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
  { 
    header: "Deskripsi Per Variabel", 
    key: "deskripsiPerVariabel", 
    width: "250px" 
  },
  
];

// 🔹 Tambahkan kolom "Aksi" hanya jika roleId === 1
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
    DeskripsiPerVariabel: Array.isArray(item.deskripsiPerVariabel)
      ? item.deskripsiPerVariabel.join(" | ")
      : "",
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

      {/* Modal Deskripsi */}
      <ModalConfirm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {}}
        title=""
        header="Deskripsi per Variabel"
        footer={
          <div className="flex justify-center pt-4">
            <Button
              variant="simpan"
              className="px-30 py-2 text-lg rounded-md"
              onClick={() => setShowModal(false)}
            >
              Tutup
            </Button>
          </div>
        }
      >
        {Array.isArray(selectedDeskripsiList) &&
        selectedDeskripsiList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedDeskripsiList.map((desc, i) => (
              <div key={i} className="bg-purple-50 border rounded p-3">
                <h3 className="font-semibold mb-2">Deskripsi Skor {i}</h3>
                <p className="text-sm text-gray-700">
                  {desc || "(Tidak ada deskripsi)"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            Tidak ada deskripsi tersedia
          </p>
        )}
      </ModalConfirm>
    </div>
  );
};

export default TablePage;
