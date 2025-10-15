"use client";

import React, { useState, useEffect } from "react";
import TableUpdate from "@/components/TableUpdate";
import { ChevronDown } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import TableButton from "@/components/TableButton";
import Pagination from "@/components/Pagination";
import { useSort } from "@/hooks/useSort";
import SearchTable from "@/components/SearchTable";
import axios from "axios";
import SuccessNotification from "@/components/SuccessNotification"; // ✅ Import notifikasi

const BRANCHES = [
  { id: 1, name: "Tel-U Bandung" },
  { id: 2, name: "Tel-U Jakarta" },
  { id: 3, name: "Tel-U Surabaya" },
  { id: 4, name: "Tel-U Purwokerto" },
];

const TablePage = () => {
  const [selectedCampusId, setSelectedCampusId] = useState<number>(2);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [periodeOptions, setPeriodeOptions] = useState<{ id: number; label: string }[]>([]);
  const [periodeDropdownOpen, setPeriodeDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [tab] = useState("approval-assessment");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ State notifikasi sukses
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Pesan notifikasi

  const rowsPerPage = 10;

  const columns = [
    { header: "Nomor", key: "nomor", width: "100px", sortable: true },
    { header: "Nama Variable", key: "variable", width: "160px", sortable: true },
    { header: "Indikator", key: "indikator", width: "250px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
    { header: "Jawaban", key: "jawaban", width: "120px", sortable: true },
    { header: "Skor", key: "skor", width: "80px", sortable: true },
    { header: "Tipe Soal", key: "tipeSoal", width: "150px", sortable: true },
  ];

  // 🔁 Fetch periode
  useEffect(() => {
    const fetchPeriodeOptions = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        if (!API_BASE) return;

        const res = await axios.get(`${API_BASE}/assessment-period`);
        const periods = res.data.data || [];

        const options = periods.map((p: any) => ({
          id: p.id,
          label: `${p.year} ${p.semester}`,
        }));

        setPeriodeOptions(options);
        if (options.length > 0 && selectedPeriodeId === null) {
          setSelectedPeriodeId(options[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat daftar periode:", err);
        const fallback = [
          { id: 1, label: "2024 Ganjil" },
          { id: 2, label: "2024 Genap" },
        ];
        setPeriodeOptions(fallback);
        if (selectedPeriodeId === null) setSelectedPeriodeId(1);
      }
    };

    fetchPeriodeOptions();
  }, []);

  // 🔁 Fetch data approval
  const fetchData = async () => {
    if (selectedPeriodeId === null) {
      setLoading(false);
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    if (!API_BASE) {
      setError("NEXT_PUBLIC_API_URL belum di-set di .env.local");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE}/assessment/detail`, {
        params: {
          branchId: selectedCampusId,
          periodId: selectedPeriodeId,
        },
      });

      const rawData = res.data.data || [];

      // ✅ Fungsi untuk ambil jawaban dari answer
      const getJawabanFromAnswer = (answer: any): string => {
        if (!answer) return "-";
        for (let i = 1; i <= 5; i++) {
          const value = answer[`textAnswer${i}`];
          if (value && value !== "0" && value !== "") {
            return String(value);
          }
        }
        return "-";
      };

      const transformedData = rawData.map((item: any, index: number) => {
        const question = item.question || {};
        const assessment = item.assessment || {};
        const answer = item.answer || {};

        const jawaban = getJawabanFromAnswer(answer);
        const skor = item.submissionValue !== undefined && item.submissionValue !== ""
          ? String(item.submissionValue)
          : "-";

           // ✅ Tipe Soal disesuaikan
  const tipeSoal = question.type === 'text'
    ? 'Jawaban Singkat'
    : question.type === 'multitext'
      ? 'Pilihan Jawaban'
      : question.type || "-";

        return {
          nomor: index + 1,
          variable: question.transformationVariable?.name || "-",
          indikator: question.indicator || "-",
          pertanyaan: question.questionText || "-",
          jawaban: jawaban,
          skor: skor,
          tipeSoal: tipeSoal,
          assessmentId: assessment.id,
          detailId: item.id,
        };
      });

      setTableData(transformedData);
    } catch (error: any) {
      console.error("Gagal memuat data approval:", error);
      let errorMsg = "Gagal memuat data approval.";
      if (error.response) {
        errorMsg += ` Status: ${error.response.status}`;
        if (error.response.data?.message) {
          errorMsg += ` - ${error.response.data.message}`;
        }
      } else if (error.message) {
        errorMsg += ` - ${error.message}`;
      }
      setError(errorMsg);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampusId, selectedPeriodeId]);

  const { sortedData, sortConfig, requestSort } = useSort(tableData);

  // ✅ Handle konfirmasi untuk 1 assessment saja
  const handleConfirm = async () => {
    if (!modalType || !selectedAssessmentId) {
      setShowModal(false);
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      if (!API_BASE) {
        alert("NEXT_PUBLIC_API_URL belum di-set");
        setShowModal(false);
        return;
      }

      const endpoint = modalType === "approve"
        ? `${API_BASE}/assessment/${selectedAssessmentId}/approve`
        : `${API_BASE}/assessment/${selectedAssessmentId}/reject`;

      await axios.post(endpoint, {});

      // ✅ Tampilkan notifikasi sukses
      const message = modalType === "approve" 
        ? "Assessment berhasil disetujui!" 
        : "Assessment berhasil dikirim untuk revisi!";
      
      setSuccessMessage(message);
      setShowSuccess(true);

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Gagal melakukan aksi:", error);
      alert(`Gagal: ${error.response?.data?.message || error.message}`);
    } finally {
      setShowModal(false);
      setModalType(null);
      setSelectedAssessmentId(null);
    }
  };

  const filteredData = sortedData.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="flex">
      {tab === "approval-assessment" && (
        <div className="bg-white rounded-xl w-full">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <SearchTable
                value={search}
                onChange={setSearch}
                placeholder="Cari indikator, pertanyaan, atau jawaban..."
              />
            </div>

            <div className="flex items-center gap-2">
              <TableButton data={tableData} />

              {/* Dropdown Periode */}
              <div className="relative">
                <button
                  onClick={() => setPeriodeDropdownOpen(!periodeDropdownOpen)}
                  className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  {periodeOptions.find((p) => p.id === selectedPeriodeId)?.label ||
                    "Pilih Periode"}
                  <ChevronDown size={16} />
                </button>
                {periodeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-10">
                    {periodeOptions.map((periode) => (
                      <div
                        key={periode.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedPeriodeId(periode.id);
                          setPeriodeDropdownOpen(false);
                        }}
                      >
                        {periode.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Kampus — hanya 4 pilihan */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  {BRANCHES.find(b => b.id === selectedCampusId)?.name || "Pilih Kampus"}
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-10">
                    {BRANCHES.map((branch) => (
                      <div
                        key={branch.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedCampusId(branch.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {branch.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabel */}
          {loading ? (
            <div className="p-6 text-center">Memuat data approval...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">❌ {error}</div>
          ) : tableData.length === 0 ? (
            <div className="p-6 text-center">Tidak ada data untuk kampus dan periode ini.</div>
          ) : (
            <TableUpdate
              columns={columns}
              data={paginatedData}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onSort={requestSort}
              sortConfig={sortConfig}
            />
          )}

          {/* Pagination & Tombol */}
          <div className="flex items-center justify-between mt-4">
            <div className="h-10 flex items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="success"
                className="px-13"
                onClick={() => {
                  if (tableData.length > 0) {
                    setSelectedAssessmentId(tableData[0].assessmentId);
                    setModalType("approve");
                    setShowModal(true);
                  }
                }}
                disabled={tableData.length === 0}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="px-13"
                onClick={() => {
                  if (tableData.length > 0) {
                    setSelectedAssessmentId(tableData[0].assessmentId);
                    setModalType("revisi");
                    setShowModal(true);
                  }
                }}
                disabled={tableData.length === 0}
              >
                Revisi
              </Button>
            </div>
          </div>

          {/* Modal */}
          <ModalConfirm
            isOpen={showModal}
            onCancel={() => {
              setShowModal(false);
              setModalType(null);
              setSelectedAssessmentId(null);
            }}
            onConfirm={handleConfirm}
            title={`Apakah kamu yakin ingin ${
              modalType === "approve" ? "melakukan approval" : "melakukan revisi"
            } pada data ini?`}
            header="Konfirmasi"
            confirmLabel="Ya, lakukan"
            cancelLabel="Batal"
          />

          {/* ✅ Notifikasi Sukses */}
          <SuccessNotification
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            message={successMessage}
          />
        </div>
      )}
    </div>
  );
};

export default TablePage;