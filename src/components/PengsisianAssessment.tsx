"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import { Download, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessNotification from "./SuccessNotification";
import ModalBlockNavigation from "@/components/ModalBlockNavigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList'; 
import { useCreateAssessmentDetail, useFinishAssessment } from '@/hooks/useAssessment';

interface PurwokertoTabProps {
  setIsFormDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AssessmentFormTab({ setIsFormDirty }: PurwokertoTabProps) {
  // Perbarui tipe untuk menyertakan answerText*
  const [rawQuestions, setRawQuestions] = useState<Array<{
    id: number;
    section: string;
    number: number;
    question: string;
    indicator?: string;
    options: string[];
    transformationVariableId?: number;
  }>>([]);

  const [loading, setLoading] = useState(true);
  const hookResult = useTransformationVariableList();
  const transformationVariables = hookResult.data;
  const variablesLoading = hookResult.loading;
  const [variableMap, setVariableMap] = useState<Record<number, string>>({});

  useEffect(() => {
    if (Array.isArray(transformationVariables) && transformationVariables.length > 0) {
      const map: Record<number, string> = {};
      transformationVariables.forEach((variable: any) => {
        if (typeof variable?.id === 'number' && typeof variable?.name === 'string') {
          map[variable.id] = variable.name;
        }
      });
      setVariableMap(map);
    }
  }, [transformationVariables]);

  const getSectionTitle = (sectionCode: string, transformationVariableId?: number) => {
    if (transformationVariableId !== undefined && transformationVariableId !== null) {
      const variableName = variableMap[transformationVariableId];
      if (variableName) {
        return `${sectionCode} - ${variableName}`;
      }
    }
    return `${sectionCode} (Mutu)`;
  };

  useEffect(() => {
    const fetchAllQuestions = async () => {
      const tempQuestions = [];
      for (let i = 0; i < 30; i++) {
        const id = i + 1;
        try {
          const response = await fetch(`http://localhost:3000/api/question/${id}`);
          if (!response.ok) {
            console.warn(`⚠️ Question ${id} not found`);
            continue;
          }
          const result = await response.json();
          if (
            (result.status === 'success' || result.status === 200) &&
            result.data && 
            typeof result.data === 'object' &&
            result.data.questionText &&
            result.data.indicator
          ) {
            const section = `V${Math.floor(i / 5) + 1}`;
            
            // ✅ Ambil teks pilihan dari answerText*
            const options = [];
            if (result.data.answerText1) options.push(result.data.answerText1);
            if (result.data.answerText2) options.push(result.data.answerText2);
            if (result.data.answerText3) options.push(result.data.answerText3);
            if (result.data.answerText4) options.push(result.data.answerText4);
            if (result.data.answerText5) options.push(result.data.answerText5);
            
            // Jika tidak ada answerText*, fallback ke angka
            const finalOptions = options.length > 0 
              ? options 
              : (id === 30 ? [] : ["0", "1", "2", "3", "Lebih dari 3"]);

            tempQuestions.push({
              id,
              section,
              number: id,
              question: [
                result.data.questionText,
                result.data.questionText2,
                result.data.questionText3,
                result.data.questionText4
              ]
                .filter(part => part && typeof part === 'string' && part.trim() !== '')
                .join(' | '),
              indicator: result.data.indicator,
              options: finalOptions,
              transformationVariableId: result.data.transformationVariableId 
                ? Number(result.data.transformationVariableId) 
                : undefined,
            });
          } else {
            console.warn(`⚠️ Question ${id} has no data or invalid format`, result);
          }
        } catch (err) {
          console.error(`❌ Error fetching question ${id}:`, err);
        }
      }
      setRawQuestions(tempQuestions);
    };
    fetchAllQuestions();
  }, []);

  const questions = useMemo(() => {
    return rawQuestions.map(q => ({
      ...q,
      title: getSectionTitle(q.section, q.transformationVariableId),
      indicator: q.indicator || getSectionTitle(q.section, q.transformationVariableId),
    }));
  }, [rawQuestions, variableMap]);

  useEffect(() => {
    if (Object.keys(variableMap).length > 0 && rawQuestions.length > 0) {
      setLoading(false);
    }
  }, [variableMap, rawQuestions.length]);

  const { mutate: saveAssessmentDetail, loading: savingAnswers, error: saveError } = useCreateAssessmentDetail();
  const { mutate: finishAssessment, loading: finishing, error: finishError } = useFinishAssessment();

  useEffect(() => {
    if (saveError) {
      console.error("Error menyimpan jawaban:", saveError);
      alert("Gagal menyimpan jawaban: " + saveError);
    }
  }, [saveError]);

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
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const selectedAssessmentId = assessmentIdFromUrl ? parseInt(assessmentIdFromUrl, 10) : null;

  useEffect(() => {
    if (selectedAssessmentId === null || isNaN(selectedAssessmentId) || selectedAssessmentId <= 0) {
      alert("Periode tidak valid. Silakan kembali ke halaman pemilihan.");
      router.push("/assessment");
    }
  }, [selectedAssessmentId, router]);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleNext = () => { if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
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
          // Cari teks pilihan yang sesuai
          const questionItem = questions.find((q) => q.id.toString() === idStr);
          let jawabanStr = String(jawaban).trim();
          
          // Jika jawaban adalah angka, cari teksnya di options
          if (!isNaN(Number(jawabanStr))) {
            const optionIndex = parseInt(jawabanStr);
            if (questionItem && questionItem.options[optionIndex]) {
              jawabanStr = questionItem.options[optionIndex];
            } else if (jawabanStr === "4") {
              jawabanStr = "Lebih dari 3";
            }
          }

          updatedAnswers[idStr] = jawabanStr;
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

  const handleConfirm = async () => {
    if (selectedAssessmentId === null) {
      alert("Periode tidak valid.");
      return;
    }

    try {
      let successCount = 0;
      let totalCount = 0;
      
      for (const q of questions) {
        const userAnswer = answers[q.id];
        if (userAnswer == null) continue;

        totalCount++;
        
        const answerData = {
          assessmentId: selectedAssessmentId,
          questionId: q.id,
          textAnswer1: "0",
          textAnswer2: "0", 
          textAnswer3: "0",
          textAnswer4: "0",
          textAnswer5: "0",
        };

        // Cari indeks berdasarkan teks pilihan
        const optionIndex = q.options.findIndex(opt => opt === userAnswer);
        if (optionIndex === 0) answerData.textAnswer1 = "1";
        else if (optionIndex === 1) answerData.textAnswer2 = "1";
        else if (optionIndex === 2) answerData.textAnswer3 = "1";
        else if (optionIndex === 3) answerData.textAnswer4 = "1";
        else if (optionIndex === 4) answerData.textAnswer5 = "1";

        try {
          await saveAssessmentDetail(answerData);
          successCount++;
        } catch (error) {
          console.error(`❌ Gagal menyimpan soal ${q.id}:`, error);
        }
      }

      if (successCount === 0 && totalCount > 0) {
        alert("❌ GAGAL MENYIMPAN DATA KE DATABASE!\n\nSilakan coba lagi.");
        return;
      }

      if (successCount < totalCount) {
        alert(`⚠️ PERINGATAN: Sebagian data gagal disimpan!\nBerhasil: ${successCount}/${totalCount} soal`);
      }

      try {
        console.log("📤 Mengirim request finishAssessment dengan ID:", selectedAssessmentId);
        const finishResult = await finishAssessment({ assessmentId: selectedAssessmentId });
        console.log("✅ Finish assessment berhasil:", finishResult);
      } catch (err) {
        console.error("❌ Gagal menyelesaikan assessment:", err);
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tak dikenal";
        alert(`Gagal menyelesaikan assessment: ${errorMessage}`);
        return;
      }

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
        resultData,
      };
      localStorage.setItem("assessmentResults", JSON.stringify([...existingResults, newEntry]));

      setShowModal(false);
      setShowSuccess(true);
      localStorage.setItem("showSuccessNotification", "Assessment berhasil dikirim!");
      setTimeout(() => router.push("/assessment/assessmenttable"), 1500);

    } catch (err) {
      console.error("❌ Gagal menyimpan jawaban ke API:", err);
      alert("❌ GAGAL MENYIMPAN DATA KE DATABASE!\nError: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formBelumDisimpan) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formBelumDisimpan]);

  const allAnswered = questions.slice(0, -1).every((q) => {
    if (q.id === 1) {
      const val = answers["1"];
      return val != null && val !== "" && !isNaN(Number(val)) && Number(val) >= 0;
    } else {
      return answers[q.id] != null && answers[q.id] !== "";
    }
  });

  const isLoading = variablesLoading || rawQuestions.length === 0;
  if (isLoading) {
    return <div>Memuat variabel transformasi dan soal...</div>;
  }

  if (selectedAssessmentId === null) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <p className="text-red-600">Periode penilaian tidak valid.</p>
        <Button onClick={() => router.push("/assessment")} className="mt-4">
          Kembali ke Halaman Utama
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
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
              <p className="text-sm text-gray-800">{current.indicator}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
            <div className="text-sm text-gray-600 font-medium">{current.question}</div>

            {current.id === 1 && (
              <div className="space-y-4">
                {current.question
                  .split('|')
                  .map((part, index) => {
                    const text = part.trim();
                    if (!text) return null;

                    const answerKey = index === 0 ? "1" : `1${String.fromCharCode(97 + index - 1)}`;

                    return (
                      <div key={index}>
                        <label className="block text-sm text-gray-800 mb-1">
                          {text}
                        </label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                          value={answers[answerKey] ?? ""}
                          onChange={(e) => {
                            setAnswers((prev) => ({
                              ...prev,
                              [answerKey]: e.target.value,
                            }));
                            setIsFormDirty(true);
                            setFormBelumDisimpan(true);
                          }}
                          placeholder="Masukkan angka"
                        />
                      </div>
                    );
                  })
                  .filter(Boolean)}
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
                  placeholder="Masukkan link evidence"
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
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-not-allowed'
                }
              `}
              onClick={() => {
                if (!allAnswered) return;
                const summaryData = questions.map((q) => ({
                  no: q.id,
                  answered: !!answers[q.id],
                }));
                setModalData(summaryData);
                setShowPreConfirmModal(true);
              }}
              disabled={!allAnswered}
            >
              Finish attempt
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pre-Confirm */}
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
            Pastikan semua jawaban telah diisi dengan benar sebelum menekan tombol Submit
          </p>
        </div>
      </ModalConfirm>

      {/* Modal Submit */}
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
              onClick={handleConfirm}
              disabled={savingAnswers || finishing}
              className="px-4 py-2 text-white rounded"
            >
              {savingAnswers || finishing ? 'Menyimpan...' : 'Submit'}
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

      {/* Modal Reset */}
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