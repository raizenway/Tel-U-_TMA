"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import clsx from "clsx";
import * as XLSX from "xlsx";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";
import { Download, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessNotification from "../../components/SuccessNotification";
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

// ✅ Helper: Menentukan apakah jawaban valid (termasuk "0")
const isAnswerValid = (val: any): boolean => {
  if (val == null) return false;
  const s = String(val).trim();
  return s !== "" && /^\d+$/.test(s); // hanya angka non-negatif
};

export default function AssessmentFormTab() {
  // --- State Umum ---
  const [isClient, setIsClient] = useState(false);
  const [isAssessmentIdReady, setIsAssessmentIdReady] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // --- State Form ---
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [rawQuestions, setRawQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  // --- Loading ---
  const hookResult = useTransformationVariableList();
  const transformationVariables = hookResult.data;
  const variablesLoading = hookResult.loading;
  const [variableMap, setVariableMap] = useState<Record<number, string>>({});
  // --- Modal & UI ---
  const [showModal, setShowModal] = useState(false);
  const [showPreConfirmModal, setShowPreConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetQuestionId, setResetQuestionId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formBelumDisimpan, setFormBelumDisimpan] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- Router & Params ---
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get('assessmentId');
  const fromEdit = searchParams.get('from') === 'edit';
  const fromContinue = searchParams.get('from') === 'continue';
  const viewOnly = searchParams.get('viewOnly') === 'true';

  // === Hanya di client ===
  useEffect(() => {
    setIsClient(true);
  }, []);

  // === Set assessmentId dengan aman ===
  useEffect(() => {
    if (!isClient) return;
    let id: number | null = assessmentIdFromUrl ? parseInt(assessmentIdFromUrl, 10) : null;
    if (fromEdit || fromContinue) {
      let storageKey = fromEdit ? 'currentAssessmentForEdit' : 'currentAssessmentForContinue';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          id = JSON.parse(saved).id;
        } catch (e) {
          console.warn(`Gagal parse ${storageKey}`);
        }
      }
    } else if (viewOnly) {
      const saved = localStorage.getItem('currentAssessmentForView');
      if (saved) {
        try {
          id = JSON.parse(saved).id;
        } catch (e) {
          console.warn("Gagal parse currentAssessmentForView");
        }
      }
    }
    setSelectedAssessmentId(id);
    setIsAssessmentIdReady(true);
  }, [isClient, assessmentIdFromUrl, fromEdit, fromContinue, viewOnly]);

  // === Validasi assessmentId ===
  useEffect(() => {
    if (!isAssessmentIdReady) return;
    if (selectedAssessmentId === null || isNaN(selectedAssessmentId) || selectedAssessmentId <= 0) {
      setError("Periode tidak valid.");
      const timer = setTimeout(() => router.push("/assessment"), 2000);
      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [isAssessmentIdReady, selectedAssessmentId, router]);

  // === Variable Map ===
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

  // === Fetch Questions ===
  useEffect(() => {
    if (!isClient || !isAssessmentIdReady || error) return;
    const fetchAllQuestions = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL belum diatur");
        return;
      }
      const tempQuestions: QuestionItem[] = [];
      for (let i = 0; i < 30; i++) {
        const id = i + 1;
        try {
          const response = await fetch(`${apiUrl}/question/${id}`);
          if (!response.ok) continue;
          const result = await response.json();
          if (result.data && result.data.questionText && result.data.indicator && result.data.status === 'active') {
            const options = [];
            if (result.data.answerText1) options.push(result.data.answerText1);
            if (result.data.answerText2) options.push(result.data.answerText2);
            if (result.data.answerText3) options.push(result.data.answerText3);
            if (result.data.answerText4) options.push(result.data.answerText4);
            if (result.data.answerText5) options.push(result.data.answerText5);
            const finalOptions = options.length > 0 ? options : ["0", "1", "2", "3", "Lebih dari 3"];
            const type = result.data.type === 'text' ? 'text' : 'multitext';
            const questionParts = [
              result.data.questionText,
              result.data.questionText2,
              result.data.questionText3,
              result.data.questionText4,
            ].filter(p => p != null && String(p).trim() !== '').map(p => String(p).trim());
            const question = questionParts.join(' | ');
            tempQuestions.push({
              id,
              section: "",
              number: id,
              question,
              questionParts,
              indicator: result.data.indicator,
              options: finalOptions,
              transformationVariableId: result.data.transformationVariableId ? Number(result.data.transformationVariableId) : undefined,
              type,
            });
          }
        } catch (err) {
          console.error(`❌ Error fetching question ${id}:`, err);
        }
      }
      setRawQuestions(tempQuestions);
    };
    fetchAllQuestions();
  }, [isClient, isAssessmentIdReady, error]);

  // === Bersihkan localStorage saat mode CREATE ===
  useEffect(() => {
    if (!isClient || !isAssessmentIdReady || selectedAssessmentId === null) return;
    if (fromEdit || fromContinue || viewOnly) return;
    localStorage.removeItem(`assessment-${selectedAssessmentId}-answers`);
    localStorage.removeItem('currentAssessmentForEdit');
    localStorage.removeItem('currentAssessmentForContinue');
    console.log("✅ LocalStorage dibersihkan untuk assessment baru");
  }, [isClient, isAssessmentIdReady, selectedAssessmentId, fromEdit, fromContinue, viewOnly]);

  // === Load Answers dari localStorage atau API ===
  useEffect(() => {
    if (!isClient || !isAssessmentIdReady || selectedAssessmentId === null || rawQuestions.length === 0) return;
    const loadAnswers = async () => {
      // 🔸 Jika mode EDIT atau VIEW → ambil dari API
      if (fromEdit || viewOnly) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assessment/${selectedAssessmentId}`);
          const data = await res.json();
          if (data.data?.assessmentDetails) {
            const mappedAnswers: { [key: string]: string } = {};
            data.data.assessmentDetails.forEach((detail: any) => {
              const qId = detail.questionId;
              const baseKey = String(qId);
              const ans = detail.answer;
              const question = rawQuestions.find(q => q.id === qId);
              if (!question) return;
              const getAnswer = (val: any): string => {
                if (val == null || val === "") return "";
                return String(val).trim();
              };
              if (question.type === 'text') {
                mappedAnswers[baseKey] = getAnswer(ans.textAnswer1);
                mappedAnswers[`${baseKey}a`] = getAnswer(ans.textAnswer2);
                mappedAnswers[`${baseKey}b`] = getAnswer(ans.textAnswer3);
                mappedAnswers[`${baseKey}c`] = getAnswer(ans.textAnswer4);
                mappedAnswers[`${baseKey}d`] = getAnswer(ans.textAnswer5);
              } else if (question.type === 'multitext') {
                mappedAnswers[baseKey] = getAnswer(ans.textAnswer1);
              }
              if (detail.evidenceLink) {
                mappedAnswers[`evidence-${qId}`] = detail.evidenceLink;
              }
            });
            setAnswers(mappedAnswers);
            setIsFormDirty(false);
            setFormBelumDisimpan(false);
          }
        } catch (err) {
          console.error("Gagal memuat data dari API:", err);
        }
        return;
      }

      // 🔸 Mode CONTINUE: prioritaskan auto-saved data
      if (fromContinue) {
        const autoSavedKey = `assessment-${selectedAssessmentId}-answers`;
        const savedAuto = localStorage.getItem(autoSavedKey);
        if (savedAuto) {
          try {
            setAnswers(JSON.parse(savedAuto));
            setIsFormDirty(true);
            setFormBelumDisimpan(true);
            return;
          } catch (e) {
            console.warn("Gagal parse auto-saved answers");
          }
        }

        // Fallback ke currentAssessmentForContinue
        const savedContinue = localStorage.getItem('currentAssessmentForContinue');
        if (savedContinue) {
          try {
            const item = JSON.parse(savedContinue);
            const answersMap: { [key: string]: string } = {};
            if (item.assessmentDetails && Array.isArray(item.assessmentDetails)) {
              item.assessmentDetails.forEach((detail: any) => {
                const qId = detail.questionId;
                const baseKey = String(qId);
                const ans = detail.answer || {};
                const answer1 = 
                  ans.textAnswer1 != null && ans.textAnswer1 !== "" 
                    ? String(ans.textAnswer1) 
                    : detail.submissionValue || "0";
                const answer2 = ans.textAnswer2 != null ? String(ans.textAnswer2) : "0";
                const answer3 = ans.textAnswer3 != null ? String(ans.textAnswer3) : "0";
                const answer4 = ans.textAnswer4 != null ? String(ans.textAnswer4) : "0";
                const answer5 = ans.textAnswer5 != null ? String(ans.textAnswer5) : "0";
                answersMap[baseKey] = answer1;
                if (answer2 !== "0") answersMap[`${baseKey}a`] = answer2;
                if (answer3 !== "0") answersMap[`${baseKey}b`] = answer3;
                if (answer4 !== "0") answersMap[`${baseKey}c`] = answer4;
                if (answer5 !== "0") answersMap[`${baseKey}d`] = answer5;
                if (detail.evidenceLink) {
                  answersMap[`evidence-${qId}`] = detail.evidenceLink;
                }
              });
            }
            setAnswers(answersMap);
            setIsFormDirty(true);
            setFormBelumDisimpan(true);
            return;
          } catch (e) {
            console.warn("Gagal parse currentAssessmentForContinue");
          }
        }
      }

      // 🔸 Mode CREATE: cek localStorage
      const savedAnswers = localStorage.getItem(`assessment-${selectedAssessmentId}-answers`);
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
          setIsFormDirty(false);
          setFormBelumDisimpan(false);
          return;
        } catch (e) {
          console.warn("Gagal parse localStorage answers");
        }
      }
    };
    loadAnswers();
  }, [isClient, isAssessmentIdReady, selectedAssessmentId, rawQuestions, fromEdit, fromContinue, viewOnly]);

  // ✅ AUTO-SAVE KE LOCALSTORAGE SETIAP KALI JAWABAN BERUBAH (DENGAN DEBOUNCE)
  useEffect(() => {
    if (!isClient || viewOnly || selectedAssessmentId === null) return;

    const saveToLocalStorage = () => {
      try {
        const key = `assessment-${selectedAssessmentId}-answers`;
        localStorage.setItem(key, JSON.stringify(answers));
        console.log("✅ Auto-saved to localStorage:", key);
      } catch (e) {
        console.warn("⚠️ Gagal auto-save ke localStorage:", e);
      }
    };

    // Gunakan debounce 500ms agar tidak terlalu sering menulis ke disk
    const debounceTimeout = setTimeout(saveToLocalStorage, 500);
    return () => clearTimeout(debounceTimeout);
  }, [answers, selectedAssessmentId, isClient, viewOnly]);

  // === Hooks ===
  const { mutate: saveAssessmentDetail, loading: savingAnswers, error: saveError } = useCreateAssessmentDetail();
  const { mutate: finishAssessment, loading: finishing, error: finishError } = useFinishAssessment();
  useEffect(() => {
    if (saveError) console.error("Error menyimpan jawaban:", saveError);
  }, [saveError]);

  // === Helpers ===
  const getSectionTitle = (_sectionCode: string, transformationVariableId?: number) => {
    if (transformationVariableId !== undefined && transformationVariableId !== null) {
      const variableName = variableMap[transformationVariableId];
      if (variableName) return variableName;
    }
    return "Pertanyaan Mutu";
  };

  const questions = useMemo(() => {
    return rawQuestions.map(q => ({
      ...q,
      title: getSectionTitle(q.section, q.transformationVariableId),
      indicator: q.indicator || getSectionTitle(q.section, q.transformationVariableId),
    }));
  }, [rawQuestions, variableMap]);

  const current = questions[currentIndex] || {
    id: 0,
    title: "Memuat...",
    indicator: "",
    question: "",
    type: 'text',
    questionParts: [],
    options: [],
    section: "",
    number: 0,
    transformationVariableId: undefined,
  };
  const isLast = currentIndex === questions.length - 1;

  // === Handlers ===
  const handleNext = () => { if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleBrowseClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (viewOnly || !isClient) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = "Rumus 2.1";
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" tidak ditemukan.`);
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
        if (headerRowIndex === -1) throw new Error("Header 'No' tidak ditemukan.");
        const rows = jsonData.slice(headerRowIndex + 1);
        let currentQuestionId: number | null = null;
        const updatedAnswers: { [key: string]: string } = {};
        const questionCounter: Record<number, number> = {};
        for (const row of rows) {
          if (!Array.isArray(row) || row.length < 7) continue;
          const noCell = row[0];
          const inputDesc = row[5];
          const valueCell = row[6];
          if (noCell != null && (typeof noCell === 'number' || (/^\d+$/.test(String(noCell).trim())))) {
            const id = Number(noCell);
            if (id >= 1 && id <= 19) currentQuestionId = id;
            else currentQuestionId = null;
          }
          if (currentQuestionId === null || !inputDesc || String(inputDesc).trim() === "") {
            continue;
          }
          const questionItem = questions.find(q => q.id === currentQuestionId);
          if (!questionItem) continue;
          const valueStr = valueCell == null ? "" : String(valueCell).trim();
          if (questionItem.type === 'multitext') {
            const letterToIndex: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
            const lowerVal = valueStr.toLowerCase();
            if (letterToIndex.hasOwnProperty(lowerVal)) {
              const idx = letterToIndex[lowerVal];
              if (idx < questionItem.options.length) {
                updatedAnswers[String(currentQuestionId)] = String(idx);
              }
            }
          } else if (questionItem.type === 'text') {
            if (questionCounter[currentQuestionId!] === undefined) questionCounter[currentQuestionId!] = 0;
            const index = questionCounter[currentQuestionId!];
            if (index < questionItem.questionParts.length) {
              const key = index === 0 ? String(currentQuestionId) : `${currentQuestionId}${String.fromCharCode(97 + index - 1)}`;
              updatedAnswers[key] = valueStr;
            }
            questionCounter[currentQuestionId!]++;
          }
        }
        setAnswers(prev => ({ ...prev, ...updatedAnswers }));
        setCurrentIndex(questions.length - 1);
        alert(`✅ Berhasil memuat ${Object.keys(updatedAnswers).length} jawaban dari Excel!`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Gagal membaca file Excel.
Error: ${msg}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = async () => {
    if (viewOnly || selectedAssessmentId === null) {
      setError("Periode tidak valid.");
      return;
    }
    try {
      let successCount = 0, totalCount = 0;
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
          if (isAnswerValid(userAnswer)) {
            const idx = parseInt(userAnswer, 10);
            if (!isNaN(idx) && idx >= 0 && idx < q.options.length) {
              answerData.textAnswer1 = String(idx);
              hasValidAnswer = true;
            }
          }
        } else if (q.type === 'text') {
          for (let i = 0; i < q.questionParts.length && i < 5; i++) {
            const key = i === 0 ? baseKey : `${baseKey}${String.fromCharCode(97 + i - 1)}`;
            const val = answers[key];
            if (isAnswerValid(val)) {
              if (i === 0) answerData.textAnswer1 = val;
              else if (i === 1) answerData.textAnswer2 = val;
              else if (i === 2) answerData.textAnswer3 = val;
              else if (i === 3) answerData.textAnswer4 = val;
              else if (i === 4) answerData.textAnswer5 = val;
              hasValidAnswer = true;
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
        alert(`⚠️ Sebagian data gagal disimpan!
Berhasil: ${successCount}/${totalCount}`);
      }
      await finishAssessment({ assessmentId: selectedAssessmentId });
      localStorage.setItem(`assessment-${selectedAssessmentId}-answers`, JSON.stringify(answers));
      localStorage.setItem('currentAssessmentForEdit', JSON.stringify({ id: selectedAssessmentId }));
      const resultData = questions.map(q => {
        const baseKey = String(q.id);
        let jawaban = q.type === 'multitext'
          ? (isAnswerValid(answers[baseKey]) ? q.options[parseInt(answers[baseKey])] : "-")
          : q.questionParts.map((_, i) => {
              const key = i === 0 ? baseKey : `${baseKey}${String.fromCharCode(97 + i - 1)}`;
              return isAnswerValid(answers[key]) ? answers[key] : "-";
            }).join(" | ");
        return {
          no: q.id,
          kode: q.section,
          pertanyaan: q.question,
          jawaban,
          evidence: answers[`evidence-${q.id}`] || "-",
          status: jawaban.split(" | ").every(a => a === "-") ? "Kosong" : "Terisi",
        };
      });
      const existing = JSON.parse(localStorage.getItem("assessmentResults") || "[]");
      localStorage.setItem("assessmentResults", JSON.stringify([...existing, {
        id: Date.now(),
        unit: "Tel-U Purwokerto",
        tanggal: new Date().toLocaleDateString("id-ID"),
        totalTerisi: Object.keys(answers).length,
        resultData,
      }]));
      localStorage.setItem("showSuccessNotification", "Assessment berhasil dikirim!");
      localStorage.removeItem('currentAssessmentForEdit');
      localStorage.removeItem('currentAssessmentForContinue');
      router.push("/assessment/assessmenttable");
    } catch (err) {
      console.error("❌ Gagal menyimpan:", err);
      
    }
  };

  useEffect(() => {
    if (!isClient || viewOnly) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (formBelumDisimpan) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isClient, formBelumDisimpan, viewOnly]);

  // ✅ Gunakan isAnswerValid di sini
  const allAnswered = questions.every(q => {
    if (q.type === 'text') {
      return q.questionParts.every((_, i) => {
        const key = i === 0 ? String(q.id) : `${q.id}${String.fromCharCode(97 + i - 1)}`;
        return isAnswerValid(answers[key]);
      });
    }
    return isAnswerValid(answers[q.id]);
  });

  // === UI Rendering ===
  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="bg-white p-6 rounded-xl space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-9 rounded-xl space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-9 h-9 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
        <Button onClick={() => router.push("/assessment")} className="mt-4">
          Kembali ke Halaman Utama
        </Button>
      </div>
    );
  }
  if (!isAssessmentIdReady || variablesLoading || rawQuestions.length === 0) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
      {/* Badge Mode */}
      {viewOnly ? (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-sm font-medium text-center">
          Mode Lihat — Hanya untuk melihat hasil assessment
        </div>
      ) : fromEdit ? (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium text-center">
          Mode Edit — Data akan diperbarui
        </div>
      ) : fromContinue ? (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium text-center">
          Mode Lanjutkan — Melanjutkan pengisian assessment
        </div>
      ) : null}
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
            {current.type === 'text' ? (
              <div className="space-y-4">
                {current.questionParts.map((part, index) => {
                  const answerKey = index === 0 ? String(current.id) : `${current.id}${String.fromCharCode(97 + index - 1)}`;
                  return (
                    <div key={index}>
                      <label className="block text-sm text-gray-800 mb-1">{part}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                        value={answers[answerKey] ?? ""}
                        onChange={(e) => {
                          if (viewOnly) return;
                          const value = e.target.value;
                          if (value === "" || /^\d*$/.test(value)) {
                            setAnswers(prev => ({ ...prev, [answerKey]: value }));
                            setIsFormDirty(true);
                            setFormBelumDisimpan(true);
                          }
                        }}
                        placeholder="Masukkan angka"
                        disabled={viewOnly}
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
                      value={String(index)}
                      checked={answers[current.id] === String(index)}
                      onChange={() => {
                        if (viewOnly) return;
                        setAnswers(prev => ({ ...prev, [current.id]: String(index) }));
                        setIsFormDirty(true);
                        setFormBelumDisimpan(true);
                      }}
                      className="w-4 h-4 accent-blue-700 cursor-pointer"
                      disabled={viewOnly}
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : null}
            {current.id && !viewOnly && (
              <div className="mt-4">
                <label className="block text-sm text-gray-800 mb-1">Link Evidence</label>
                <input
                  type="url"
                  placeholder="Masukkan link evidence"
                  className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                  value={answers[`evidence-${current.id}`] || ""}
                  onChange={(e) => {
                    if (viewOnly) return;
                    setAnswers(prev => ({
                      ...prev,
                      [`evidence-${current.id}`]: e.target.value,
                    }));
                    setIsFormDirty(true);
                    setFormBelumDisimpan(true);
                  }}
                  disabled={viewOnly}
                />
              </div>
            )}
            {!viewOnly && isLast && (
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
                <div className="border-2 border-dashed border-blue-800 rounded-lg p-6 text-center space-y-2">
                  <p className="text-sm text-gray-600">Upload file Excel</p>
                  <Button
                    type="button"
                    onClick={handleBrowseClick}
                    className="bg-gray-700 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
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
              {!viewOnly && (
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
              )}
              {currentIndex > 0 && (
                <Button variant="outline" icon={ArrowLeft} iconPosition="left" className="px-6" onClick={handlePrevious}>
                  Previous Question
                </Button>
              )}
              {currentIndex < questions.length - 1 && (
                <Button variant="simpan" icon={ArrowRight} iconPosition="right" className="px-6" onClick={handleNext}>
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
                      return isAnswerValid(answers[key]);
                    })
                  : isAnswerValid(answers[q.id]);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={clsx(
                      "w-9 h-9 rounded-md text-xs font-semibold flex items-center justify-center",
                      isActive || isAnswered ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500",
                      viewOnly && "cursor-pointer hover:bg-gray-200"
                    )}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>
            <button
              className={`mt-4 w-full text-sm py-2 rounded-lg font-medium transition ${
                viewOnly
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : allAnswered 
                  ? 'bg-[#263859] text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-not-allowed'
              }`}
              onClick={() => {
                if (viewOnly || !allAnswered) return;
                const summaryData = questions.map(q => ({
                  no: q.id,
                  answered: q.type === 'text'
                    ? q.questionParts.every((_, idx) => {
                        const key = idx === 0 ? String(q.id) : `${q.id}${String.fromCharCode(97 + idx - 1)}`;
                        return isAnswerValid(answers[key]);
                      })
                    : isAnswerValid(answers[q.id]),
                }));
                setModalData(summaryData);
                setShowPreConfirmModal(true);
              }}
              disabled={viewOnly || !allAnswered}
            >
              {viewOnly ? 'Mode Lihat' : 'Finish attempt'}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
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
              disabled={savingAnswers || finishing || viewOnly}
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
      {!viewOnly && (
        <ModalConfirm
          isOpen={showResetModal}
          onCancel={() => {
            setShowResetModal(false);
            setResetQuestionId(null);
          }}
          onConfirm={() => {
            if (resetQuestionId !== null) {
              setAnswers(prev => {
                const updated = { ...prev };
                const q = questions.find(q => q.id === resetQuestionId);
                if (q?.type === 'text') {
                  q.questionParts.forEach((_, i) => {
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
                    setAnswers(prev => {
                      const updated = { ...prev };
                      const q = questions.find(q => q.id === resetQuestionId);
                      if (q?.type === 'text') {
                        q.questionParts.forEach((_, i) => {
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
      )}
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