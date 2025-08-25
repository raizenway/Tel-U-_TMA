"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import { Download, X } from "lucide-react";
import { useRouter } from "next/navigation";
import SuccessNotification from "./SuccessNotification";
import ModalBlockNavigation from "@/components/ModalBlockNavigation";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  LogOut,
  Info,
  Upload,
  Copy,
  ExternalLink,
  ArrowRight,
  DoorOpen,
  ArrowLeft,
} from "lucide-react";

const questions = Array.from({ length: 30 }, (_, i) => {
  const section = `V${Math.floor(i / 5) + 1}`;
  return {
    id: i + 1,
    section,
    title: `${section} (Mutu)`,
    number: i + 1,
    question:
      i + 1 === 1
        ? "Jumlah sertifikasi/akreditasi dalam lingkup direktorat TUNC yang diberikan oleh lembaga internasional bereputasi"
        : i + 1 === 30
        ? "Jumlah program studi pada program utama (S1) di TUNC yang terakreditasi oleh lembaga internasional bereputasi"
        : "Jumlah sertifikasi/akreditasi dalam lingkup direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
    options: i + 1 === 30 ? [] : ["0", "1", "2", "3", "Lebih dari 3"],
  };
});

interface PurwokertoTabProps {
  setIsFormDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PurwokertoTab({ setIsFormDirty }: PurwokertoTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetQuestionId, setResetQuestionId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreConfirmModal, setShowPreConfirmModal] = useState(false);
  const [formBelumDisimpan, setFormBelumDisimpan] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const router = useRouter();
  const current = questions[currentIndex];
  const isLast = current.id === 30;

  const handleOptionChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setIsFormDirty(true);
    setFormBelumDisimpan(true);
  };

  const handleReset = () => {
    setAnswers((prev) => ({ ...prev, [current.id]: "" }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const rows = jsonData.slice(1);
      const updatedAnswers: { [key: string]: string } = {};
      const modalDataArray: any[] = [];

      (rows as any[][]).forEach((row) => {
        const id = row?.[0];
        const jawaban = row?.[3];

        if (id !== undefined && jawaban !== undefined && jawaban !== "") {
          const idStr = String(id).trim();
          const jawabanStr = String(jawaban).trim() === "4" ? "Lebih dari 3" : String(jawaban).trim();

          updatedAnswers[idStr] = jawabanStr;

          const questionItem = questions.find((q) => q.id.toString() === idStr);

          modalDataArray.push({
            no: idStr,
            kode: questionItem?.section,
            pertanyaan: questionItem?.question,
            jawaban: jawabanStr,
            options: questionItem?.options ?? [],
          });
        }
      });

      setAnswers((prev) => ({ ...prev, ...updatedAnswers }));
      setModalData(modalDataArray);
      setCurrentIndex(29);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    const resultData = questions.map((q) => ({
      no: q.id,
      kode: q.section,
      pertanyaan: q.question,
      jawaban: answers[q.id] || "-",
      evidence: answers[`evidence-${q.id}`] || "-",
      status: answers[q.id] ? "Terisi" : "Kosong",
    }));

    const existingResults = JSON.parse(localStorage.getItem("assessmentResults") || "[]");
    const newEntry = {
      id: Date.now(),
      unit: "Tel-U Purwokerto",
      tanggal: new Date().toLocaleDateString("id-ID"),
      totalTerisi: Object.keys(answers).length,
      data: resultData,
    };
    localStorage.setItem("assessmentResults", JSON.stringify([...existingResults, newEntry]));

    setShowModal(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push("/assessmenttable");
    }, 1500);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formBelumDisimpan) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formBelumDisimpan]);

  const handleSidebarClick = (path: string) => {
    if (formBelumDisimpan) {
      setPendingPath(path);
      setShowBlockModal(true);
    } else {
      router.push(path);
    }
  };

  const handleConfirmLeave = () => {
    if (pendingPath) {
      router.push(pendingPath);
      setShowBlockModal(false);
      setPendingPath(null);
    }
  };

  const handleNavigate = (path: string) => {
    if (formBelumDisimpan) {
      setShowBlockModal(true);
      setPendingPath(path);
    } else {
      router.push(path);
    }
  };

  const allAnswered = questions.slice(0, 29).every((q) => {
    if (q.id === 1) {
      const val = answers["1"];
      return val != null && val !== "" && !isNaN(Number(val)) && Number(val) >= 0;
    } else {
      return answers[q.id] != null && answers[q.id] !== "";
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="text-center font-semibold text-lg text-black bg-white py-2 rounded-md border shadow">
            {current.title}
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-max">
              <div className="w-1 h-10 flex items-center justify-center font-semibold text-sm text-gray-700">
                {current.number}
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm flex-1">
              <p className="text-sm text-gray-800">{current.question}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
            <div className="text-sm text-gray-600 font-medium">{current.question}</div>

            {current.id === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-800 mb-1">
                    Jumlah program studi S1 TUNC yang terakreditasi oleh lembaga internasional bereputasi
                  </label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                    value={answers["1"] || ""}
                    onChange={(e) => {
                      setAnswers((prev) => ({ ...prev, "1": e.target.value }));
                      setIsFormDirty(true);
                      setFormBelumDisimpan(true);
                    }}
                    placeholder="Masukkan angka"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-1">Jumlah total program studi S1 TUNC</label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                    value={answers["1b"] || ""}
                    onChange={(e) => {
                      setAnswers((prev) => ({ ...prev, "1b": e.target.value }));
                      setIsFormDirty(true);
                      setFormBelumDisimpan(true);
                    }}
                    placeholder="Masukkan angka"
                  />
                </div>
              </div>
            )}

            {isLast && (
              <>
                <ul className="text-sm text-gray-800 list-decimal list-inside space-y-2">
                  <li>Jumlah dosen tetap TUNC yang memiliki jabatan akademik Guru Besar</li>
                  <li>Jumlah dosen tetap TUNC yang memiliki jabatan akademik Lektor Kepala</li>
                  <li>Jumlah dosen tetap TUNC yang memiliki jabatan akademik Lektor</li>
                  <li>Jumlah dosen tetap TUNC</li>
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center space-y-2">
                    <p className="text-sm text-gray-600">Klik tombol di bawah untuk mendownload template jawaban</p>
                    <Button
                      type="link"
                      variant="primary"
                      href="/files/template_jawaban_tunch.xlsx"
                      download
                      icon={Download}
                      iconPosition="left"
                    >
                      Download di sini
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center space-y-2">
                    <p className="text-sm text-gray-600">Tarik & tahan lampiran untuk mengupload</p>
                    <Button
                      type="button"
                      onClick={handleBrowseClick}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                    >
                      Browse File
                    </Button>
                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                </div>
              </>
            )}

            {!isLast && current.id !== 1 && (
              <div className="space-y-3">
                {current.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${current.id}`}
                      value={option}
                      checked={answers[current.id] === option}
                      onChange={() => {
                        setAnswers((prev) => ({ ...prev, [current.id]: option }));
                        setIsFormDirty(true);
                        setFormBelumDisimpan(true);
                      }}
                      className="accent-blue-700 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {current.id && (
              <div className="mt-4">
                <label className="block text-sm text-gray-800 mb-1">Link Evidence</label>
                <input
                  type="url"
                  placeholder="Masukkan link evidence (jika ada)"
                  className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                  value={answers[`evidence-${current.id}`] || ""}
                  onChange={(e) => {
                    setAnswers((prev) => ({
                      ...prev,
                      [`evidence-${current.id}`]: e.target.value,
                    }));
                    setIsFormDirty(true);
                    setFormBelumDisimpan(true);
                  }}
                />
              </div>
            )}

            <div className="flex justify-end items-center gap-3 pt-4">
              <Button
                variant="outline"
                icon={X}
                iconPosition="left"
                className="px-14 text-red-600 border-red-500 hover:bg-red-100"
                onClick={() => {
                  setResetQuestionId(current.id);
                  setShowResetModal(true);
                }}
              >
                Batal
              </Button>

              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  icon={ArrowLeft}
                  iconPosition="left"
                  className="px-6"
                  onClick={handlePrevious}
                >
                  Previous Question
                </Button>
              )}
              {currentIndex < questions.length - 1 && (
                <Button
                  variant="simpan"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="px-6"
                  onClick={handleNext}
                >
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white p-9 rounded-xl shadow border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-600">Navigasi Soal</h3>
            <div className="grid grid-cols-4 gap-3">
              {questions.map((q, i) => {
                const isActive = i === currentIndex;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={clsx(
                      "w-9 h-9 rounded-md text-xs font-semibold flex items-center justify-center",
                      isActive || isAnswered ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            <button
              className={`mt-4 w-full text-sm py-2 rounded-lg font-medium transition
                ${allAnswered 
                  ? 'bg-[#263859] text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }
              `}
              onClick={() => {
                const summaryData = questions.map((q) => ({
                  no: q.id,
                  answered: !!answers[q.id],
                }));
                setModalData(summaryData);
                setShowPreConfirmModal(true);
              }}
            >
              Finish attempt
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Konfirmasi Selesai */}
      <ModalConfirm
        isOpen={showPreConfirmModal}
        onCancel={() => setShowPreConfirmModal(false)}
        onConfirm={() => {
          setShowPreConfirmModal(false);
          setShowModal(true);
        }}
        title=""
        header="Konfirmasi"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setShowPreConfirmModal(false);
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-md text-white text-sm"
            >
              Cek Pengisian Assessment
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <img src="/modal.png" alt="Confirm" className="w-40 h-40" />
          <h2 className="text-lg font-semibold text-gray-900">Kamu Telah Menyelesaikan Pengisian Assesment.</h2>
          <p className="text-sm text-gray-700">
            Pastikan semua jawaban telah diisi dengan benar sebelum menekan tombol 'Submit'
          </p>
        </div>
      </ModalConfirm>

      {/* Modal 2: Submit Assessment */}
      <ModalConfirm
        isOpen={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Apakah Anda yakin ingin menyelesaikan?"
        header="Konfirmasi"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Kembali ke Pengisian Assessment
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const allAnswers = Object.keys(answers).map((id) => ({
                  id,
                  jawaban: answers[id],
                  evidence: answers[`evidence-${id}`] || "-",
                }));

                const skorTinggi = allAnswers.filter(
                  (a) => a.jawaban === "3" || a.jawaban === "Lebih dari 3"
                ).length;
                const hasilSkor = Math.min(4, Math.ceil(skorTinggi / 7));

                const submissionData = {
                  id: 3,
                  logo: "school",
                  nama: "Tel-U Purwokerto",
                  tanggal: new Date().toLocaleDateString("id-ID"),
                  skor: [hasilSkor, hasilSkor, hasilSkor, hasilSkor],
                  hasil: hasilSkor,
                  status: "Lulus",
                  aksi: "view",
                  evidence: Object.fromEntries(
                    questions.map((q) => [q.id, answers[`evidence-${q.id}`] || "-"])
                  ),
                };

                localStorage.setItem("assessment_submission_purwokerto", JSON.stringify(submissionData));
                setFormBelumDisimpan(false);

                handleConfirm();
                setShowSuccess(true);
                localStorage.setItem("showSuccessNotification", "Assessment berhasil dikirim!");

                setTimeout(() => {
                  router.push("/assessment/assessmenttable");
                }, 1500);
              }}
              className="px-4 py-2 text-white rounded"
            >
              Submit
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto text-sm pb-2">
          {modalData.map((item, index) => (
            <div key={index} className="border rounded-md p-2 text-center shadow-sm bg-gray-50">
              <div className="font-semibold text-gray-800">No {item.no}</div>
              {item.answered ? (
                <div className="text-green-600 flex items-center justify-center gap-1">Answered ✅</div>
              ) : (
                <div className="text-red-500 flex items-center justify-center gap-1">Not Answered ❌</div>
              )}
            </div>
          ))}
        </div>
      </ModalConfirm>

      {/* Modal 3: Reset Jawaban */}
      <ModalConfirm
        isOpen={showResetModal}
        onCancel={() => {
          setShowResetModal(false);
          setResetQuestionId(null);
        }}
        onConfirm={() => {
          if (resetQuestionId !== null) {
            setAnswers((prev) => {
              const updated = { ...prev };
              delete updated[resetQuestionId];
              return updated;
            });
          }
          setShowResetModal(false);
          setResetQuestionId(null);
        }}
        title={`Apakah Anda yakin ingin membatalkan jawaban untuk soal nomor ${resetQuestionId}?`}
        header="Konfirmasi Batal"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowResetModal(false);
                setResetQuestionId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (resetQuestionId !== null) {
                  setAnswers((prev) => {
                    const updated = { ...prev };
                    delete updated[resetQuestionId];
                    return updated;
                  });
                }
                setShowResetModal(false);
                setResetQuestionId(null);
              }}
              className="px-4 py-2 text-white rounded"
            >
              Ya, Hapus Jawaban
            </Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700">
          Jawaban untuk soal <strong>nomor {resetQuestionId}</strong> akan dihapus dan Anda dapat mengisinya kembali nanti.
        </div>
      </ModalConfirm>

      <ModalBlockNavigation
        isOpen={showBlockModal}
        onCancel={() => setShowBlockModal(false)}
        onConfirm={() => {
          if (pendingPath) {
            router.push(pendingPath);
            setFormBelumDisimpan(false);
            setPendingPath(null);
          }
        }}
      />

      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Assessment berhasil dikirim!"
      />
    </div>
  );
}