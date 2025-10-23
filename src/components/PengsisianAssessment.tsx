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
import { CreateAssessmentDetail } from '@/interfaces/assessment';

interface QuestionItem {
  id: number;
  section: string;
  number: number;
  question: string;
  questionParts: string[];
  indicator?: string;
  options: string[];
  transformationVariableId?: number;
  type: 'text' | 'multitext';
}

export default function AssessmentFormTab() {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [rawQuestions, setRawQuestions] = useState<QuestionItem[]>([]);
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

  const getSectionTitle = (_sectionCode: string, transformationVariableId?: number) => {
    if (transformationVariableId !== undefined && transformationVariableId !== null) {
      const variableName = variableMap[transformationVariableId];
      if (variableName) {
        return variableName;
      }
    }
    return "Pertanyaan Mutu";
  };

  useEffect(() => {
    const fetchAllQuestions = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL belum diatur di .env.local");
        setLoading(false);
        return;
      }

      const tempQuestions: QuestionItem[] = [];
      for (let i = 0; i < 30; i++) {
        const id = i + 1;
        try {
          const response = await fetch(`${apiUrl}/question/${id}`);
          if (!response.ok) continue;
          const result = await response.json();
          if (result.data && result.data.questionText && result.data.indicator) {
            const options = [];
            if (result.data.answerText1) options.push(result.data.answerText1);
            if (result.data.answerText2) options.push(result.data.answerText2);
            if (result.data.answerText3) options.push(result.data.answerText3);
            if (result.data.answerText4) options.push(result.data.answerText4);
            if (result.data.answerText5) options.push(result.data.answerText5);
            const finalOptions = options.length > 0 
              ? options 
              : ["0", "1", "2", "3", "Lebih dari 3"];

            const type = result.data.type === 'text' ? 'text' : 'multitext';

            // ✅ FILTER KETAT: hanya ambil bagian yang benar-benar berisi teks
            const questionParts = [
              result.data.questionText,
              result.data.questionText2,
              result.data.questionText3,
              result.data.questionText4,
            ]
              .filter(p => p != null && String(p).trim() !== '')
              .map(p => String(p).trim());

            const question = questionParts.join(' | ');

            tempQuestions.push({
              id,
              section: "",
              number: id,
              question,
              questionParts,
              indicator: result.data.indicator,
              options: finalOptions,
              transformationVariableId: result.data.transformationVariableId 
                ? Number(result.data.transformationVariableId) 
                : undefined,
              type,
            });
          }
        } catch (err) {
          console.error(`❌ Error fetching question ${id}:`, err);
        }
      }
      setRawQuestions(tempQuestions);
      setLoading(false);
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
      alert("Periode tidak valid.");
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
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = "Rumus 2.1";
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" tidak ditemukan di file Excel.`);
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | null)[][];

        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (Array.isArray(row) && String(row[0]).trim() === "No") {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error("Header 'No' tidak ditemukan di sheet Rumus 2.1.");
        }

        const rows = jsonData.slice(headerRowIndex + 1);
        let currentQuestionId: number | null = null;
        const updatedAnswers: { [key: string]: string } = {};
        const questionCounter: Record<number, number> = {}; // ✅ Counter per soal

        for (const row of rows) {
          if (!Array.isArray(row) || row.length < 7) continue;

          const noCell = row[0]; 
          const inputDesc = row[5]; 
          const valueCell = row[6]; 

          if (
            noCell != null &&
            (typeof noCell === 'number' || (/^\d+$/.test(String(noCell).trim())))
          ) {
            const id = Number(noCell);
            if (id >= 1 && id <= 19) {
              currentQuestionId = id;
            } else {
              currentQuestionId = null;
            }
          }

          if (
            currentQuestionId === null ||
            valueCell == null ||
            String(valueCell).trim() === "" ||
            inputDesc == null ||
            String(inputDesc).trim() === ""
          ) {
            continue;
          }

          const questionItem = questions.find(q => q.id === currentQuestionId);
          if (!questionItem) continue;

          const valueStr = String(valueCell).trim();

          if (questionItem.type === 'multitext') {
            const letterToIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
            const lowerVal = valueStr.toLowerCase();
            if (letterToIndex.hasOwnProperty(lowerVal)) {
              const optionIndex = letterToIndex[lowerVal];
              if (optionIndex < questionItem.options.length) {
                updatedAnswers[String(currentQuestionId)] = questionItem.options[optionIndex];
              }
            }
          } else if (questionItem.type === 'text') {
            // ✅ Gunakan counter yang andal
            if (questionCounter[currentQuestionId!] === undefined) {
              questionCounter[currentQuestionId!] = 0;
            }

            const index = questionCounter[currentQuestionId!];
            // Pastikan tidak melebihi jumlah bagian yang valid
            if (index < questionItem.questionParts.length) {
              const answerKey = index === 0 
                ? String(currentQuestionId) 
                : `${currentQuestionId}${String.fromCharCode(97 + index - 1)}`;
              updatedAnswers[answerKey] = valueStr;
            }
            questionCounter[currentQuestionId!]++; // increment
          }
        }

        console.log("✅ Jawaban dari Excel:", updatedAnswers);
        setAnswers(prev => ({ ...prev, ...updatedAnswers }));
        setCurrentIndex(questions.length - 1);
        alert(`✅ Berhasil memuat ${Object.keys(updatedAnswers).length} jawaban dari Excel!`);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("❌ Error membaca file Excel:", err);
        alert(`Gagal membaca file Excel.\n\nPastikan file memiliki sheet "Rumus 2.1".\nError: ${msg}`);
      }
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
        const baseKey = String(q.id);
        const answerData: CreateAssessmentDetail = {
          assessmentId: selectedAssessmentId,
          questionId: q.id,
          textAnswer1: "0",
          textAnswer2: "0",
          textAnswer3: "0",
          textAnswer4: "0",
          textAnswer5: "0",
          evidenceLink: answers[`evidence-${q.id}`] || "",
        };

        let hasValidAnswer = false;

        if (q.type === 'multitext') {
          const userAnswer = answers[baseKey];
          if (userAnswer != null && userAnswer !== "") {
            const optionIndex = q.options.findIndex(opt => opt === userAnswer);
            if (optionIndex !== -1) {
              answerData.textAnswer1 = String(optionIndex);
              hasValidAnswer = true;
            }
          }
        } else if (q.type === 'text') {
          for (let i = 0; i < q.questionParts.length && i < 5; i++) {
            const key = i === 0 ? baseKey : `${baseKey}${String.fromCharCode(97 + i - 1)}`;
            const rawValue = answers[key];
            if (rawValue != null && rawValue !== "" && !isNaN(Number(rawValue))) {
              const numValue = Number(rawValue);
              if (numValue >= 0) {
                if (i === 0) answerData.textAnswer1 = String(numValue);
                else if (i === 1) answerData.textAnswer2 = String(numValue);
                else if (i === 2) answerData.textAnswer3 = String(numValue);
                else if (i === 3) answerData.textAnswer4 = String(numValue);
                else if (i === 4) answerData.textAnswer5 = String(numValue);
                hasValidAnswer = true;
              }
            }
          }
        }

        if (!hasValidAnswer) continue;
        totalCount++;

        try {
          await saveAssessmentDetail(answerData);
          successCount++;
        } catch (error) {
          console.error(`❌ Gagal menyimpan soal ${q.id}:`, error);
        }
      }

      if (successCount === 0 && totalCount > 0) {
        alert("❌ GAGAL MENYIMPAN DATA KE DATABASE!");
        return;
      }

      if (successCount < totalCount) {
        alert(`⚠️ PERINGATAN: Sebagian data gagal disimpan!\nBerhasil: ${successCount}/${totalCount} soal`);
      }

      try {
        await finishAssessment({ assessmentId: selectedAssessmentId });
      } catch (err) {
        console.error("❌ Gagal menyelesaikan assessment:", err);
        alert(`Gagal menyelesaikan assessment: ${err instanceof Error ? err.message : "Error tidak dikenal"}`);
        return;
      }

      const resultData = questions.map((q) => {
        const baseKey = String(q.id);
        let jawaban = "";
        if (q.type === 'multitext') {
          jawaban = answers[baseKey] || "-";
        } else {
          const answersArr = q.questionParts.map((_, i) => {
            const key = i === 0 ? baseKey : `${baseKey}${String.fromCharCode(97 + i - 1)}`;
            return answers[key] || "-";
          });
          jawaban = answersArr.join(" | ");
        }

        return {
          no: q.id,
          kode: q.section,
          pertanyaan: q.question,
          jawaban,
          evidence: answers[`evidence-${q.id}`] || "-",
          status: jawaban.split(" | ").every(a => a === "-") ? "Kosong" : "Terisi",
        };
      });

      const existingResults = JSON.parse(localStorage.getItem("assessmentResults") || "[]");
      const newEntry = {
        id: Date.now(),
        unit: "Tel-U Purwokerto",
        tanggal: new Date().toLocaleDateString("id-ID"),
        totalTerisi: Object.keys(answers).length,
        resultData,
      };
      localStorage.setItem("assessmentResults", JSON.stringify([...existingResults, newEntry]));
      localStorage.setItem("showSuccessNotification", "Assessment berhasil dikirim!");
      router.push("/assessment/assessmenttable");
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

  const allAnswered = questions.every((q) => {
    if (q.type === 'text') {
      const baseKey = String(q.id);
      for (let i = 0; i < q.questionParts.length; i++) {
        const key = i === 0 ? baseKey : `${baseKey}${String.fromCharCode(97 + i - 1)}`;
        const val = answers[key];
        if (val == null || val === "" || isNaN(Number(val)) || Number(val) < 0) {
          return false;
        }
      }
      return true;
    }
    return answers[q.id] != null && answers[q.id] !== "";
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

            {/* ✅ GUNAKAN questionParts */}
            {current.type === 'text' ? (
              <div className="space-y-4">
                {current.questionParts.map((part, index) => {
                  const answerKey = index === 0 ? String(current.id) : `${current.id}${String.fromCharCode(97 + index - 1)}`;
                  return (
                    <div key={index}>
                      <label className="block text-sm text-gray-800 mb-1">{part}</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                        value={String(answers[answerKey] ?? "")}
                        onChange={(e) => {
                          setAnswers(prev => ({ ...prev, [answerKey]: e.target.value }));
                          setIsFormDirty(true);
                          setFormBelumDisimpan(true);
                        }}
                        placeholder="Masukkan angka"
                        min="0"
                      />
                    </div>
                  );
                })}
              </div>
            ) : current.type === 'multitext' && current.options.length > 0 ? (
              <div className="space-y-3">
                {current.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${current.id}`}
                      value={option}
                      checked={answers[current.id] === option}
                      onChange={() => {
                        setAnswers(prev => ({ ...prev, [current.id]: option }));
                        setIsFormDirty(true);
                        setFormBelumDisimpan(true);
                      }}
                      className="accent-blue-700 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : null}

            {/* Evidence */}
            {!isLast && current.id && (
              <div className="mt-4">
                <label className="block text-sm text-gray-800 mb-1">Link Evidence</label>
                <input
                  type="url"
                  placeholder="Masukkan link evidence"
                  className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                  value={answers[`evidence-${current.id}`] || ""}
                  onChange={(e) => {
                    setAnswers(prev => ({
                      ...prev,
                      [`evidence-${current.id}`]: e.target.value,
                    }));
                    setIsFormDirty(true);
                    setFormBelumDisimpan(true);
                  }}
                />
              </div>
            )}

            {/* Upload/Download */}
            {isLast && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center space-y-2">
                  <p className="text-sm text-gray-600">Download template jawaban</p>
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
                  <p className="text-sm text-gray-600">Upload file Excel</p>
                  <Button
                    type="button"
                    onClick={handleBrowseClick}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                  >
                    Browse File
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
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
                const isAnswered = q.type === 'text'
                  ? q.questionParts.every((_, idx) => {
                      const key = idx === 0 ? String(q.id) : `${q.id}${String.fromCharCode(97 + idx - 1)}`;
                      return answers[key] != null && answers[key] !== "";
                    })
                  : !!answers[q.id];
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
                  answered: q.type === 'text'
                    ? q.questionParts.every((_, idx) => {
                        const key = idx === 0 ? String(q.id) : `${q.id}${String.fromCharCode(97 + idx - 1)}`;
                        return answers[key] != null && answers[key] !== "";
                      })
                    : !!answers[q.id],
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
              if (questions.find(q => q.id === resetQuestionId)?.type === 'text') {
                const parts = questions.find(q => q.id === resetQuestionId)!.questionParts;
                parts.forEach((_, i) => {
                  const key = i === 0 ? String(resetQuestionId) : `${resetQuestionId}${String.fromCharCode(97 + i - 1)}`;
                  delete updated[key];
                });
              } else {
                delete updated[resetQuestionId];
              }
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
                    if (questions.find(q => q.id === resetQuestionId)?.type === 'text') {
                      const parts = questions.find(q => q.id === resetQuestionId)!.questionParts;
                      parts.forEach((_, i) => {
                        const key = i === 0 ? String(resetQuestionId) : `${resetQuestionId}${String.fromCharCode(97 + i - 1)}`;
                        delete updated[key];
                      });
                    } else {
                      delete updated[resetQuestionId];
                    }
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
          Jawaban untuk soal <strong>nomor {resetQuestionId}</strong> akan dihapus.
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