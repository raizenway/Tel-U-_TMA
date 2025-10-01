"use client";

import React, { useState } from "react";
import TableUpdate from "@/components/TableUpdate";
import { ChevronDown } from "lucide-react";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import TableButton from "@/components/TableButton";
import Pagination from "@/components/Pagination";
import { useSort } from "@/hooks/useSort";
import SearchTable from "@/components/SearchTable";

const TablePage = () => {
  const [selectedCampus, setSelectedCampus] = useState("Tel-U Jakarta");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<null | "approve" | "revisi">(null);
  const [tab] = useState("approval-assessment");
  const [search, setSearch] = useState("");

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
    { header: "Skor", key: "skor", width: "319px", sortable: true },
    { header: "Tipe Soal", key: "tipeSoal", width: "160px", sortable: true },
  ];

 
  const data: any[] = []; 

  const { sortedData, sortConfig, requestSort } = useSort(data);

  const handleConfirm = () => {
    alert(
      `Data telah ${
        modalType === "approve" ? "disetujui" : "dikirim untuk revisi"
      }`
    );
    setShowModal(false);
    setModalType(null);
  };

  return (
    <div className="flex">
      {tab === "approval-assessment" && (
        <div className="bg-white rounded-xl w-full">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <SearchTable 
                value={search} 
                onChange={setSearch} 
                placeholder="Cari"
              />
            </div>

            <div className="flex items-center gap-2">
              <TableButton data={data} />

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

          <TableUpdate
            columns={columns}
            data={sortedData
              .filter((row) =>
                Object.values(row).some((value) =>
                  value.toString().toLowerCase().includes(search.toLowerCase())
                )
              )
              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onSort={requestSort}
            sortConfig={sortConfig}
          />

          <div className="flex items-center justify-between mt-4 ">
            <div className="h-10 flex items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={5} 
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="success"
                className="px-13 "
                onClick={() => {
                  setModalType("approve");
                  setShowModal(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="px-13 "
                onClick={() => {
                  setModalType("revisi");
                  setShowModal(true);
                }}
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