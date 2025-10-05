  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { FaSchool } from 'react-icons/fa';
  import Table from '@/components/Table';
  import SuccessNotification from '@/components/SuccessNotification';
  import Button from '@/components/button';
  import ModalConfirm from './StarAssessment/ModalConfirm';
  import { MessageCircleWarning, Pencil, Eye, Play, BookOpenCheck } from 'lucide-react';
  import { Search, Copy, Printer, Download } from 'lucide-react';

  const AssessmentTable = ({ hideStartButton = false }) => {
    const [data, setData] = useState([
      {
        id: 1,
        logo: <FaSchool className="text-blue-600 text-xl" />,
        nama: "Tel-U Jakarta",
        tanggal: "12/04/2025",
        skor: [3, 3, 3, 3],
        hasil: 3,
        status: "Submitted",
        aksi: "edit",
      },
      {
        id: 2,
        logo: <FaSchool className="text-blue-600 text-xl" />,
        nama: "Tel-U Surabaya",
        tanggal: "19/01/2025",
        skor: [3, 3, 3, 3],
        hasil: 3,
        status: "Approved",
        aksi: "view",
      },
      {
        id: 4,
        logo: <FaSchool className="text-blue-600 text-xl" />,
        nama: "Tel-U Bandung",
        tanggal: "On Progress",
        skor: ["-", "-", "-", "-"],
        hasil: "-",
        status: "Belum Selesai",
        aksi: "progress",
      },
    ]);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

  //baca local
    useEffect(() => {
      const savedMessage = localStorage.getItem("showSuccessNotification");
      if (savedMessage) {
        setShowSuccess(true);
        localStorage.removeItem("showSuccessNotification");
      }

      const campuses = [
        { key: "assessment_submission_purwokerto", name: "Tel-U Purwokerto" },
        { key: "assessment_submission_jakarta", name: "Tel-U Jakarta" },
        { key: "assessment_submission_surabaya", name: "Tel-U Surabaya" },
      ];

      let newData = [...data];

      campuses.forEach(({ key, name }) => {
        const saved = localStorage.getItem(key);
        const hasCampus = newData.some((item) => item.nama === name);

        if (saved && !hasCampus) {
          try {
            const campusData = JSON.parse(saved);
            const logo = <FaSchool className="text-blue-600 text-xl" />;
            const insertIndex = newData.length - 1;

            newData.splice(insertIndex, 0, {
              id: Date.now() + Math.random(),
              logo,
              nama: name,
              skor: campusData.skor || [3, 3, 3, 3],
              hasil: campusData.hasil || 3,
              tanggal: new Date().toLocaleDateString("id-ID"),
              status: "Submitted",
              aksi: "view",
            });
          } catch (e) {
            console.error(`Gagal parsing data ${name}:`, e);
          }
        }
      });

      setData(newData);
    }, []);

    // ✏️ Edit
    const handleEdit = (id) => {
      console.log("Edit item:", id);
    };

    // 👁️ Lihat Detail
    const handleView = (id) => {
      console.log("View item:", id);
    };

    // ✅ Approve
    const handleApprove = (id) => {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, aksi: "edit", status: "Edit" } : item
        )
      );
      setShowModal(false);
      setShowSuccess(true);
    };

    // 🔢 Kolom tabel
    const columns = [
      { header: "No", key: "nomor", width: "50px" },
      { header: "Logo", key: "logo", width: "60px" },
      { header: "Nama UPPS/KC", key: "nama", width: "220px" },
      { header: "Tanggal Submit", key: "tanggal", width: "140px" },
      { header: "Skor 1", key: "skor1", width: "80px" },
      { header: "Skor 2", key: "skor2", width: "80px" },
      { header: "Skor 3", key: "skor3", width: "80px" },
      { header: "Skor 4", key: "skor4", width: "80px" },
      { header: "Hasil", key: "hasil", width: "80px" },
      { header: "Status", key: "status", width: "120px" },
      { header: "Aksi", key: "aksi", width: "80px" },
    ];

    // 🗂️ Data untuk tabel (dengan filter search)
    const filteredData = data.filter(item =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableData = filteredData.map((item, index) => ({
      nomor: index + 1,
      logo: <div className="flex items-center">{item.logo}</div>,
      nama: (
        <div className="flex items-center gap-2 relative group">
          <span>{item.nama}</span>
          {item.nama === "Tel-U Purwokerto" && item.aksi !== "edit" && (
            <div className="relative">
              <MessageCircleWarning
                onClick={() => setShowModal(true)}
                className="text-yellow-500 cursor-pointer"
                size={18}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-[13px] rounded-lg px-3 py-1 whitespace-normal w-[220px] shadow-lg z-50 text-center">
                User mengajukan untuk mengubah data. Klik ikon untuk approve.
                <div className="absolute left-1/2 bottom-full -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      ),
      tanggal: item.tanggal,
      skor1: item.skor[0],
      skor2: item.skor[1],
      skor3: item.skor[2],
      skor4: item.skor[3],
      hasil: item.hasil,
      status: (
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full capitalize ${
            item.status === "Submitted"
              ? "bg-blue-800"
              : item.status === "Approved"
              ? "bg-green-500"
              : item.status === "Belum Selesai"
              ? "bg-red-500"
              : item.status === "Edit"
              ? "bg-orange-500"
              : "bg-gray-500"
          }`}
        >
          {item.status}
        </span>
      ),
      statusText: item.status,
      aksi: (
        <div className="flex items-center justify-between w-full max-w-[120px] mx-auto">
          {item.aksi !== "progress" && (
            <>
              <button
                className="text-blue-600 hover:text-blue-800 transition"
                onClick={() => handleEdit(item.id)}
                title="Edit"
              >
                <Pencil size={20} />
              </button>
              <div className="w-2" />
            </>
          )}

          {item.aksi === "edit" && (
            <button
              className="text-green-600 hover:text-green-800 transition"
              onClick={() => handleApprove(item.id)}
              title="Approve"
            >
              <BookOpenCheck size={20} />
            </button>
          )}
          {item.aksi === "view" && (
            <button
              className="text-gray-600 hover:text-green-800 transition"
              onClick={() => handleView(item.id)}
              title="Lihat Detail"
            >
              <Eye size={20} />
            </button>
          )}
          {item.aksi === "progress" && (
            <div className="text-red-600">
              <Play size={20} />
            </div>
          )}
        </div>
      ),
    }));

    // 🔍 SEARCH: Sudah terhubung via `searchTerm`

    // 📋 COPY: Salin data sebagai teks (tab-delimited)
    const handleCopy = () => {
      const headers = ["No", "Nama UPPS/KC", "Tanggal Submit", "Skor 1", "Skor 2", "Skor 3", "Skor 4", "Hasil", "Status"];
      const rows = tableData.map(row => [
        row.nomor,
        typeof row.nama === 'string' ? row.nama : row.nama.props.children[0],
        row.tanggal,
        row.skor1,
        row.skor2,
        row.skor3,
        row.skor4,
        row.hasil,
        row.statusText
      ].join('\t'));

      const text = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(text).then(
        () => alert('Data berhasil disalin!'),
        () => alert('Gagal menyalin data.')
      );
    };

    // 🖨️ PRINT: Cetak tabel
    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      const content = `
        <html>
          <head><title>Cetak Assessment</title></head>
          <body style="font-family:Arial,sans-serif;padding:20px;">
            <h2>Pengisian Assessment</h2>
            <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;">
              <thead>
                <tr>${columns.map(col => `<th style="text-align:left;background:#f3f4f6;">${col.header}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${tableData.map(row => `
                  <tr>
                    <td>${row.nomor}</td>
                    <td>🏫</td>
                    <td>${typeof row.nama === 'string' ? row.nama : row.nama.props.children[0]}</td>
                    <td>${row.tanggal}</td>
                    <td>${row.skor1}</td>
                    <td>${row.skor2}</td>
                    <td>${row.skor3}</td>
                    <td>${row.skor4}</td>
                    <td>${row.hasil}</td>
                    <td>${row.statusText}</td>
                    <td>-</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => printWindow.print();
    };

    // 🔽 DOWNLOAD: Ekspor ke CSV
    const handleDownloadCSV = () => {
      const headers = ["No", "Nama UPPS/KC", "Tanggal Submit", "Skor 1", "Skor 2", "Skor 3", "Skor 4", "Hasil", "Status"];
      const rows = tableData.map(row => [
        row.nomor,
        typeof row.nama === 'string' ? row.nama : row.nama.props.children[0],
        row.tanggal,
        row.skor1,
        row.skor2,
        row.skor3,
        row.skor4,
        row.hasil,
        row.statusText
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assessment-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-45 w-full relative mt-20 space-y-6 overflow-x-auto">
        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Assessment berhasil diubah menjadi status Edit!"
        />

        <ModalConfirm
          isOpen={showModal}
          title="Menyetujui pengajuan edit assessment?"
          header="Konfirmasi"
          message="Menyetujui pengajuan edit assessment?"
          confirmLabel="Approve"
          cancelLabel="Tolak"
          onConfirm={() => {
            const purwokerto = data.find((item) => item.nama === "Tel-U Purwokerto");
            if (purwokerto) handleApprove(purwokerto.id);
          }}
          onCancel={() => setShowModal(false)}
        />

        {/* Header Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pengisian Assessment
          </h2>
          <p className="text-sm text-gray-600">
            Berikut adalah daftar UPPS/KC yang sudah melakukan assessment
          </p>
        </div>

        {/* Search + Action Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white shadow-sm w-80">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari UPPS/KC..."
                className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={Copy}
                iconPosition="left"
                onClick={handleCopy}
                className="h-10 px-4 py-2 text-sm"
              >
                Copy
              </Button>

              <Button
                variant="outline"
                icon={Printer}
                iconPosition="left"
                onClick={handlePrint}
                className="h-10 px-4 py-2 text-sm"
              >
                Print
              </Button>

              <Button
                variant="outline"
                icon={Download}
                iconPosition="left"
                onClick={handleDownloadCSV}
                className="h-10 px-4 py-2 text-sm"
              >
                Download
              </Button>

              {!hideStartButton && (
                <Button
                  variant="primary"
                  onClick={() => router.push("/assessment")}
                  className="h-10 px-8 py-2 text-sm font-semibold rounded flex items-center gap-2"
                >
                  Start Assessment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div id="assessment-table">
          <Table
            columns={columns}
            data={tableData}
            currentPage={1}
            rowsPerPage={10}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  export default AssessmentTable;