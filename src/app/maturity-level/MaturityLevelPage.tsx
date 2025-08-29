'use client';

import { useState, useEffect } from "react";
import TableUpdate from "@/components/TableUpdate";
import { Copy, Printer, Download, Pencil, Trash2, Plus, Eye, ChevronDown, Search } from "lucide-react";
import Button from "@/components/button";
import { useRouter, useSearchParams } from "next/navigation";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";

const TablePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const searchParams = useSearchParams();
  const [showNotif, setShowNotif] = useState(false);

  // Modal lihat deskripsi
  const [showModal, setShowModal] = useState(false);
  const [selectedDeskripsiList, setSelectedDeskripsiList] = useState<string[]>([]);

  // Fungsi untuk muat dan validasi data dari localStorage
   const loadData = () => {
    try {
      const savedData = localStorage.getItem("maturityData");
      if (savedData) {
        const parsed = JSON.parse(savedData);

        if (Array.isArray(parsed)) {
          const validatedData = parsed.map((item) => ({
            ...item,
            level: typeof item.level === "string" ? item.level : String(item.level || ""),
            namaLevel: typeof item.namaLevel === "string" ? item.namaLevel : "",
            skorMin: typeof item.skorMin === "string" ? item.skorMin : "",
            skorMax: typeof item.skorMax === "string" ? item.skorMax : "",
            deskripsiUmum: typeof item.deskripsiUmum === "string" ? item.deskripsiUmum : "",
            deskripsiPerVariabel: Array.isArray(item.deskripsiPerVariabel)
              ? item.deskripsiPerVariabel.map((d) => (typeof d === "string" ? d : ""))
              : Array(5).fill(""),
          }));
          setData(validatedData);
        } else {
          throw new Error("Data tidak dalam format array");
        }
      } else {
        // ❌ jangan ada data default
        setData([]);
        localStorage.setItem("maturityData", JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error loading maturityData:", error);
      setData([]);
    }
  };

  // Muat data pertama kali
  useEffect(() => {
    loadData();
  }, []);

  // Dengarkan perubahan localStorage (misal dari tab lain)
  useEffect(() => {
    const handleStorageChange = () => {
      loadData(); // Reload dengan validasi
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update localStorage saat data berubah
  useEffect(() => {
    if (data.length > 0) {
      try {
        localStorage.setItem("maturityData", JSON.stringify(data));
      } catch (e) {
        console.error("Gagal simpan ke localStorage", e);
      }
    }
  }, [data]);

  // Tampilkan notifikasi jika dari query success
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 3000);
    }
  }, [searchParams]);

  // Filter pencarian
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / 10);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const handleTambah = () => {
    router.push("/maturity-level/add-maturity");
  };

  const handleEdit = (index: number) => {
    const realIndex = (currentPage - 1) * 10 + index;
    const selectedData = data[realIndex];
    localStorage.setItem("editMaturityData", JSON.stringify(selectedData));
    router.push(`/maturity-level/edit-maturity/${realIndex}`);
  };

 const handleDelete = (index: number) => {
  const realIndex = (currentPage - 1) * 10 + index;
  const newData = [...data];
  newData.splice(realIndex, 1);

  // update state
  setData(newData);

  // update localStorage juga
  localStorage.setItem("maturityData", JSON.stringify(newData));

  setShowDelete(false);
};


  const handlePrint = () => window.print();

  const handleDownload = () => {
    const headers = ["Level", "Nama Level", "Skor Minimum", "Skor Maximum", "Deskripsi Umum", "Deskripsi Per Variabel"];
    const rows = filteredData
      .map((row) => [
        row.level,
        row.namaLevel,
        row.skorMin,
        row.skorMax,
        row.deskripsiUmum,
        Array.isArray(row.deskripsiPerVariabel) ? row.deskripsiPerVariabel.join(" | ") : "",
      ].join("\t"))
      .join("\n");

    const tsv = headers.join("\t") + "\n" + rows;
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maturity-level.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const headers = ["Level", "Nama Level", "Skor Minimum", "Skor Maximum", "Deskripsi Umum", "Deskripsi Per Variabel"];
    const rows = filteredData
      .map((row) => [
        row.level,
        row.namaLevel,
        row.skorMin,
        row.skorMax,
        row.deskripsiUmum,
        Array.isArray(row.deskripsiPerVariabel) ? row.deskripsiPerVariabel.join(" | ") : "",
      ].join("\t"))
      .join("\n");

    const textToCopy = headers.join("\t") + "\n" + rows;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("✅ Data berhasil disalin ke clipboard!");
    });
  };

  // Data + kolom aksi
  const dataDenganAksi = paginatedData.map((row, index) => ({
    ...row,
    level: row.level,
    deskripsiPerVariabel: (
      <button
        className="flex items-center gap-2 text-gray-700 hover:underline"
        onClick={() => {
          // Ambil data terbaru dari localStorage
          const savedData = localStorage.getItem("maturityData");
          const freshData = savedData ? JSON.parse(savedData) : data;
          const realIndex = (currentPage - 1) * 10 + index;
          const currentRow = freshData[realIndex];

          // ✅ Validasi deskripsiPerVariabel selalu array
          const deskripsi = Array.isArray(currentRow?.deskripsiPerVariabel)
            ? currentRow.deskripsiPerVariabel
            : Array(5).fill("");

          setSelectedDeskripsiList(deskripsi);
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

  const columns = [
    { header: "Level", key: "level", width: "60px" },
    { header: "Nama Level", key: "namaLevel", width: "200px" },
    { header: "Skor Minimum", key: "skorMin", width: "160px" },
    { header: "Skor Maximum", key: "skorMax", width: "160px" },
    { header: "Deskripsi Umum", key: "deskripsiUmum", width: "250px" },
    { header: "Deskripsi Per Variabel", key: "deskripsiPerVariabel", width: "250px" },
    {
     header: 'Aksi',
     key: 'aksi',
     width: '200px',
     className: 'text-center sticky right-0 border border-gray-200 z-10 bg-gray-100',
    },  ];

  return (
    <div>
        {/* Search & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-64 bg-white">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Cari"
              className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Copy} iconPosition="left" onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="outline" icon={Printer} iconPosition="left" onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" icon={ChevronDown} iconPosition="right" onClick={handleDownload}>
              Download
            </Button>
            <Button className="px-8" onClick={handleTambah}>
              Tambah Maturity Level
            </Button>
          </div>
        </div>

        {/* Notifikasi */}
        {showNotif && (
          <div className="absolute bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-between min-w-[280px]">
            <span className="font-medium">Data Berhasil Disimpan</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto w-full">
           <TableUpdate
              columns={columns}
              data={dataDenganAksi}
              currentPage={currentPage}
              rowsPerPage={10}
              onEdit={(item) => {
                const realIndex = data.findIndex(d => d.level === item.level);
                if (realIndex !== -1) {
                  localStorage.setItem("editMaturityData", JSON.stringify(data[realIndex]));
                  router.push(`/maturity-level/edit-maturity/${realIndex}`);
                }
              }}
              onDeactivate={(index) => {
                setDeleteIndex(index);
                setShowDelete(true);
              }}
            />
          </div>


        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 border rounded-full disabled:opacity-50"
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 border rounded-full ${currentPage === i + 1 ? "bg-blue-100 font-bold" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 border rounded-full disabled:opacity-50"
            >
              {">"}
            </button>
          </div>
        </div>

      {/* Modal konfirmasi hapus */}
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

      {/* Modal Deskripsi per Variabel */}
     {/* Modal Deskripsi per Variabel */}
      <ModalConfirm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {}}
        title=""
        header="Deskripsi per Variabel"
        footer={
          <div className="flex justify-center pt-4">
            <Button variant="simpan" className="px-30 py-2 text-lg rounded-md" onClick={() => setShowModal(false)}>
              Tutup
            </Button>
          </div>
        }
      >
        {Array.isArray(selectedDeskripsiList) && selectedDeskripsiList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedDeskripsiList.map((desc, i) => (
              <div key={i} className="bg-purple-50 border rounded p-3">
                <h3 className="font-semibold mb-2">Deskripsi Skor {i}</h3>
                <p className="text-sm text-gray-700">{desc || "(Tidak ada deskripsi)"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Tidak ada deskripsi tersedia</p>
        )}
      </ModalConfirm>

    </div>
  );
};

export default TablePage;