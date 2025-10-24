'use client';
import React, { useState, useEffect, useMemo, useRef} from 'react';
import { useRouter } from 'next/navigation';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import SuccessNotification from '@/components/SuccessNotification';
import Button from "@/components/button";
import TableUpdate from '@/components/TableUpdate';
import TableButton from '@/components/TableButton';
import Pagination from '@/components/Pagination';
import SearchTable from '@/components/SearchTable';
import { useSort } from "@/hooks/useSort";
import { useListBranch } from "@/hooks/useBranch";
import { Branch, BranchDetail} from '@/interfaces/branch.interface';

export default function KampusCabangPage() {
  const router = useRouter();

  const [refreshFlag, setRefreshFlag] = useState(0);
  const { data, isLoading, error } = useListBranch(refreshFlag); 
  const branches = data?.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ Simpan kampus yang dipilih
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ✅ State untuk data di modal (editable)
  const [modalData, setModalData] = useState<BranchDetail[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const columns = [
    { header: 'No', key: 'id', width: '60px', sortable: true },
    { header: 'Nama UPPS/KC', key: 'name', width: '250px', sortable: true },
    { header: 'Email', key: 'email', width: '300px', sortable: true },
     {
    header: 'Detail',
    key: 'detail',
    width: '100px',
    sortable: false,
    className: 'sticky right-0 bg-gray-100 z-10',
    renderCell: (item: Branch) => (
      <button
        onClick={() => handleDetailClick(item)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        Detail
      </button>
    ),
  },
  ];

  const filteredBranches = useMemo(() => {
    if (!searchTerm) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter(b => {
      const idMatch = b.id.toString().includes(term);
      const nameMatch = b.name.toLowerCase().includes(term);
      const emailMatch = b.email.toLowerCase().includes(term);
      return idMatch || nameMatch || emailMatch;
    });
  }, [branches, searchTerm]);

  const { sortedData, requestSort, sortConfig } = useSort<Branch>(filteredBranches, "id");

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentBranches = sortedData.slice(indexOfFirst, indexOfLast);

  // ✅ Simpan kampus yang diklik & inisialisasi data modal
  const handleDetailClick = (branch: Branch) => {
    setSelectedBranch(branch);
    // Inisialisasi data modal dari branchDetails
    setModalData(branch.branchDetails); 
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBranch(null);
    setModalData([]);
  };

  // ✅ Tambah baris baru
  const handleAddYear = () => {
  if (!selectedBranch) return; // ✅ TAMBAHKAN INI — pastikan selectedBranch ada

  if (modalData.length === 0) {
    setModalData([{
      id: undefined as any,
      branchId: selectedBranch.id,
      year: 2021,
      studentBodyCount: 0,
      studyProgramCount: 0,
      superiorAccreditedStudyProgramCount: 0,
      accreditationGrowth: 0,
    }]);
    return;
  }

    // Cari tahun terakhir
    const lastYear = Math.max(...modalData.map(d => d.year));
    const nextYear = lastYear + 1;

    setModalData(prev => [
    ...prev,
    {
      id: undefined as any, // ← penting: tidak ada id untuk data baru
      branchId: selectedBranch!.id,
      year: nextYear,
      studentBodyCount: 0,
      studyProgramCount: 0,
      superiorAccreditedStudyProgramCount: 0,
      accreditationGrowth: 0,
    }
  ]);
  };

  // ✅ Ubah nilai di input (validasi angka)
const handleInputChange = (idOrYear: number, field: keyof BranchDetail, value: string) => {
  const newValue = value.replace(/[^0-9]/g, '');
  const numValue = newValue === '' ? 0 : parseInt(newValue) || 0;

  setModalData(prev =>
    prev.map(item =>
      // Jika item punya id, cari berdasarkan id
      // Jika tidak (data baru), cari berdasarkan year
      (item.id !== undefined && item.id === idOrYear) ||
      (item.id === undefined && item.year === idOrYear)
        ? { ...item, [field]: numValue }
        : item
    )
  );
};

const handleSave = async () => {
  if (!selectedBranch) return;

  setIsSaving(true);
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL tidak ditemukan di environment variables.');
    }

    const response = await fetch(`${baseUrl}/branch/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modalData),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Gagal menyimpan data: ${errorMsg}`);
    }

    setShowSuccess(true);
    setSuccessMessage('Data berhasil disimpan!');
    setIsDetailModalOpen(false);
    setRefreshFlag(prev => prev + 1);
  } catch (err) {
    console.error('Error menyimpan:', err);
    alert(`Gagal menyimpan data: ${(err as Error).message}`);
  } finally {
    setIsSaving(false);
  }
};

useEffect(() => {
  if (scrollContainerRef.current && modalData.length > 0) {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }
}, [modalData]);

const dataForExport = branches.flatMap(branch => {
  const rows: any[] = [];

  if (branch.branchDetails && branch.branchDetails.length > 0) {
    // 🔹 Baris pertama: isi semua kolom (No, Nama, Email, Tahun, Prodi)
    const firstDetail = branch.branchDetails[0];
    rows.push({
      No: branch.id,
      'Nama UPPS/KC': branch.name,
      Email: branch.email,
      Tahun: firstDetail.year,
      'Jumlah Prodi': firstDetail.studyProgramCount,
      'Jumlah Prodi Terakreditasi Unggul': firstDetail.superiorAccreditedStudyProgramCount,
    });

    // 🔹 Baris kedua dan seterusnya: kosongkan No, Nama, Email — isi hanya Tahun & Prodi
    for (let i = 1; i < branch.branchDetails.length; i++) {
      const detail = branch.branchDetails[i];
      rows.push({
        No: "", // Kosongkan
        'Nama UPPS/KC': "", // Kosongkan
        Email: "", // Kosongkan
        Tahun: detail.year,
        'Jumlah Prodi': detail.studyProgramCount,
        'Jumlah Prodi Terakreditasi Unggul': detail.superiorAccreditedStudyProgramCount,
      });
    }
  } else {
    // Jika tidak ada detail, tambahkan satu baris info
    rows.push({
      No: branch.id,
      'Nama UPPS/KC': branch.name,
      Email: branch.email,
      Tahun: "Tidak ada data",
      'Jumlah Prodi': "",
      'Jumlah Prodi Terakreditasi Unggul': "",
    });
  }

  // 🔹 Tambahkan baris kosong sebagai pemisah antar kampus
  rows.push({
    No: "",
    'Nama UPPS/KC': "",
    Email: "",
    Tahun: "",
    'Jumlah Prodi': "",
    'Jumlah Prodi Terakreditasi Unggul': "",
  });

  return rows;
});

  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex">
        <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
          <div className="bg-white rounded-lg overflow-x-auto w-full p-4 mt-4 mx-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-black-600">Loading data dari server...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
          <div className="bg-white rounded-lg overflow-x-auto w-full p-4 mt-4 mx-4">
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error: {error?.message || 'Terjadi kesalahan'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <main className="w-full h-screen px-6 py-21 bg-gray overflow-y-auto">
        {showSuccess && (
          <SuccessNotification
            isOpen={showSuccess}
            message={successMessage}
            onClose={() => setShowSuccess(false)}
          />
        )}

        <div className="bg-white rounded-lg overflow-x-auto w-full p-10 mt-4">
          <div className="flex justify-between items-center mb-4 relative min-w-max">
            <SearchTable
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari kampus cabang..."
            />
            <div className="flex gap-2">
              <TableButton data={dataForExport} showCopy={false} />
            </div>
          </div>

          {/* ✅ Render tombol Detail per baris */}
          <TableUpdate
            key={refreshFlag}
            columns={columns}
            data={currentBranches}
            currentPage={currentPage}
            rowsPerPage={itemsPerPage}
            onSort={requestSort}
            sortConfig={sortConfig}
           
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
            showTotalItems={true}
          />
        </div>

        {/* Modal */}
        <ModalConfirm
          isOpen={isDetailModalOpen}
          onCancel={closeDetailModal}
          title=""
          header="Ubah Data Mahasiswa"
          // ❌ HAPUS confirmLabel & cancelLabel karena kita render sendiri di footer
          footer={
            <div className="flex justify-center gap-4 mt-2">
              {/* ✅ Tombol Batal — pakai Button */}
              <Button
                variant="ghost"
                onClick={closeDetailModal}
                className="rounded-[2px] px-8 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
              >
                Batal
              </Button>
              {/* ✅ Tombol Simpan — pakai Button */}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-2 text-sm font-medium"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">  
            {/* ✅ Tombol Tambah Tahun — pakai Button yang sama */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddYear}
                className="px-4 py-2  font-medium"
              >
                + Tambah Tahun
              </Button>
            </div>

            {/* 🟢 Tabel Editable*/}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto max-h-[350px] overflow-y-auto border rounded-lg"
            >
              <table className="min-w-full border-collapse border-gray-300">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Tahun</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Jumlah Prodi</th>
                    <th className="border px-3 py-2 text-left text-sm font-medium">Jumlah Prodi Terakreditasi Unggul</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((row) => (
                    <tr key={row.id ?? row.year}>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.year || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'year', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Tahun"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.studyProgramCount || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'studyProgramCount', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Jumlah Prodi"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={row.superiorAccreditedStudyProgramCount || ''}
                          onInput={(e) => handleInputChange(row.id ?? row.year, 'superiorAccreditedStudyProgramCount', e.currentTarget.value)}
                          className="w-full min-w-[80px] px-3 py-2 border border-gray-300 rounded text-base"
                          placeholder="Jumlah Prodi Terakreditasi Unggul"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ModalConfirm>
      </main>
    </div>
  );
}