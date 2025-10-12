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

// ✅ Daftar kampus — termasuk opsi "Semua Kampus"
const BRANCHES = [
  { id: 1, name: "Tel-U Bandung" },
  { id: 2, name: "Tel-U Jakarta" },
  { id: 3, name: "Tel-U Surabaya" },
  { id: 4, name: "Tel-U Purwokerto" },
];

const TablePage = () => {
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null); // default: null = semua
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<number | null>(null);
  const [periodeOptions, setPeriodeOptions] = useState<{ id: number; label: string }[]>([]);
  const [periodeDropdownOpen, setPeriodeDropdownOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [tab] = useState("approval-assessment");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const rowsPerPage = 10;

  const columns = [
    { header: "Nomor", key: "nomor", width: "80px", sortable: true },
    { header: "Nama Variable", key: "variable", width: "160px", sortable: true },
    { header: "Indikator", key: "indikator", width: "250px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "250px" },
    { header: "Jawaban", key: "jawaban", width: "120px", sortable: true },
    { header: "Skor", key: "skor", width: "80px", sortable: true },
    { header: "Tipe Soal", key: "tipeSoal", width: "120px", sortable: true },
  
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
          { id: 1, label: "2025 Ganjil" },
          { id: 2, label: "2024 Genap" },
        ];
        setPeriodeOptions(fallback);
        if (selectedPeriodeId === null) setSelectedPeriodeId(1);
      }
    };

    fetchPeriodeOptions();
  }, []);

  // 🔁 Fetch data approval
  useEffect(() => {
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

    const fetchApprovalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Bangun params: branchId opsional
        const params: Record<string, any> = {
          periodId: selectedPeriodeId,
        };
        if (selectedCampusId !== null) {
          params.branchId = selectedCampusId;
        }

        const res = await axios.get(`${API_BASE}/assessment/detail`, { params });

        const rawData = res.data.data || [];

        const transformedData = rawData.map((item: any, index: number) => {
          const question = item.question || {};
          const assessment = item.assessment || {};
          const user = assessment.user || {};

          const branchName = BRANCHES.find(b => b.id === user.branchId)?.name || "—";

          return {
            nomor: index + 1,
            variable: question.transformationVariable?.name || "-",
            indikator: question.indicator || "-",
            pertanyaan: question.questionText || "-",
            jawaban: item.submissionValue || "-",
            skor: item.score !== undefined ? item.score : "-",
            tipeSoal: question.type || "-",
            kampus: branchName,
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

    fetchApprovalData();
  }, [selectedCampusId, selectedPeriodeId]);

  const { sortedData, sortConfig, requestSort } = useSort(tableData);

  const handleConfirm = () => {
    alert(
      `Data telah ${
        modalType === "approve" ? "disetujui" : "dikirim untuk revisi"
      }`
    );
    setShowModal(false);
    setModalType(null);
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

              {/* Dropdown Kampus */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  {BRANCHES.find(b => b.id === selectedCampusId)?.name || "Semua Kampus"}
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-10">
                    {BRANCHES.map((branch) => (
                      <div
                        key={branch.id ?? "all"}
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
                  setModalType("approve");
                  setShowModal(true);
                }}
                disabled={tableData.length === 0}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="px-13"
                onClick={() => {
                  setModalType("revisi");
                  setShowModal(true);
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
            }}
            onConfirm={handleConfirm}
            title={`Apakah kamu yakin ingin ${
              modalType === "approve" ? "melakukan approval" : "melakukan revisi"
            } pada data ini?`}
            header="Konfirmasi"
            confirmLabel="Ya, lakukan"
            cancelLabel="Batal"
          />
        </div>
      )}
    </div>
  );
};

export default TablePage;