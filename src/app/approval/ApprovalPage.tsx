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

const TablePage = () => {
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [tab] = useState("approval-assessment");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);

  const rowsPerPage = 10;

  const campusOptions = [
    "Tel-U Jakarta",
    "Tel-U Bandung",
    "Tel-U Surabaya",
    "Tel-U Purwokerto",
  ];

  const columns = [
    { header: "Nomor", key: "nomor", width: "100px", sortable: true },
    { header: "Nama Variable", key: "variable", width: "160px", sortable: true },
    { header: "Indikator", key: "indikator", width: "319px" },
    { header: "Pertanyaan", key: "pertanyaan", width: "319px" },
    { header: "Jawaban", key: "jawaban", width: "120px", sortable: true },
    { header: "Skor", key: "skor", width: "100px", sortable: true },
    { header: "Tipe Soal", key: "tipeSoal", width: "120px", sortable: true },
  ];

  useEffect(() => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  if (!API_BASE) {
    console.error("NEXT_PUBLIC_API_URL belum di-set di .env.local");
    setLoading(false);
    return;
  }

  const fetchApprovalData = async () => {
    try {
      setLoading(true);

      // ✅ Ambil assessment list — ini sudah include assessmentDetails!
      const assessmentRes = await axios.get(`${API_BASE}/assessment`, {
        params: { approvalStatus: "onprogress" },
      });

      const assessments = assessmentRes.data.data || [];

      if (assessments.length === 0) {
        setTableData([]);
        return;
      }

      // ✅ Ambil semua questionId unik dari assessmentDetails
      const questionIds = Array.from(
        new Set(
          assessments.flatMap((assessment: any) =>
            (assessment.assessmentDetails || []).map((detail: any) => detail.questionId)
          )
        )
      );

      // ✅ Ambil data question — gunakan endpoint /question/:id (tanpa "s")
      const questionPromises = questionIds.map((id: number) =>
        axios.get(`${API_BASE}/question/${id}`).catch((err) => {
          console.warn(`Gagal ambil question ID ${id}:`, err.message);
          return null;
        })
      );

      const questionResponses = await Promise.all(questionPromises);
      const questionMap: Record<number, any> = {};

      questionResponses.forEach((res, index) => {
        if (res?.data?.data) {
          questionMap[questionIds[index]] = res.data.data;
        }
      });

      // ✅ Gabungkan jadi satu list datar untuk tabel
      const flattenedData = assessments.flatMap((assessment: any) =>
        (assessment.assessmentDetails || []).map((detail: any, idx: number) => {
          const question = questionMap[detail.questionId] || {};
          return {
            nomor: idx + 1,
            variable: question.transformationVariable?.name || 
                     question.transformationVariableId?.toString() || "-",
            indikator: question.indicator || "-",
            pertanyaan: question.questionText || "-",
            jawaban: detail.submissionValue || "-",
            skor: detail.score !== undefined ? detail.score : "-", // mungkin belum ada
            tipeSoal: question.type || "-",
            assessmentId: assessment.id,
            detailId: detail.id,
          };
        })
      );

      setTableData(flattenedData);
    } catch (error: any) {
      console.error("Gagal memuat data approval:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);
      }
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  fetchApprovalData();
}, []);

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

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 border px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  {selectedCampus}
                  <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-10">
                    {campusOptions.map((campus) => (
                      <div
                        key={campus}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedCampus(campus);
                          setDropdownOpen(false);
                        }}
                      >
                        {campus}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">Memuat data approval...</div>
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