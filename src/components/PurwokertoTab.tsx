"use client";

import { useState } from "react";
import clsx from "clsx";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";

// ==========================
// DATA SOAL
// ==========================
const questions = Array.from({ length: 30 }, (_, i) => {
  const isLast = i === 29;
  return {
    id: i + 1,
    section: `V${Math.floor(i / 5) + 1}`,
    title: `V${Math.floor(i / 5) + 1} (Mutu)`,
    number: i + 1,
    question: isLast
      ? "Apakah Anda merasa seluruh pertanyaan dalam kuesioner ini relevan dengan tugas pokok dan fungsi direktorat Anda?"
      : "Jumlah sertifikasi/akreditasi dalam lingkup direktorat TUNC yang diberikan oleh lembaga internasional bereputasi",
    options: isLast
      ? [
          "Sangat Tidak Relevan",
          "Tidak Relevan",
          "Netral",
          "Relevan",
          "Sangat Relevan",
        ]
      : ["0", "1", "2", "3", "Lebih dari 3"],
  };
});


export default function PurwokertoTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showModal, setShowModal] = useState(false);

  const current = questions[currentIndex];

  const handleOptionChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: value,
    }));
  };

  const handleReset = () => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: "",
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-auto">
      <div className="flex flex-col lg:flex-row gap-1">
        {/* ========== PANEL SOAL KIRI ========== */}
        <div className="flex-1 pr-6 ">
          {/* Judul Bagian */}
          <div className="mb-4 text-center font-semibold text-lg text-black bg-white py-2 rounded-md border border-white shadow">
            {current.title}
          </div>

          {/* Blok Nomor + Pertanyaan dalam 1 Row, tapi div terpisah */}
          <div className="flex items-start gap-4 mb-6">
            {/* Nomor Soal */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-max">
              <div className="w-6 h-10 flex items-center justify-center font-semibold text-sm text-gray-700">
                {current.number}
              </div>
            </div>

           <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm flex-1">
              <p className="text-sm text-gray-800">{current.question}</p>
            </div>
          </div>

          {/* Opsi Jawaban */}
          <div className="bg-white p-6 rounded-xl shadow space-y-9 border border-gray-200">
            <div className="bg-white rounded-lg  ">
              <p className="text-sm text-gray-800">{current.question}</p>
            </div>
            <div className="space-y- pt- pl-9">
              {current.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`question-${current.id}`}
                    value={option}
                    checked={answers[current.id] === option}
                    onChange={() => handleOptionChange(option)}
                    className="accent-blue-700 w-4 h-3"
                  />
                  <span className="text-sm text-gray-700">
                    {option}              
                    </span>
                </label>
              ))}
            </div>

 {/* Teks Pertanyaan */}
            
        <div className="flex justify-end flex-wrap gap-3 pt-6">
  <button
    onClick={() => setShowModal(true)}
    className="px-15 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
  >
    ✖ Batal
  </button>

  {currentIndex > 0 && (
    <button
      onClick={handlePrevious}
      className="px-8 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-100"
    >
      ← Sebelumnya
    </button>
  )}

  {/* Tombol Selanjutnya hanya jika belum di soal terakhir */}
  {currentIndex < questions.length - 1 && (
    <Button
      variant="primary"
      onClick={handleNext}
      className="px-8 py-2 text-white rounded-lg text-sm font-medium"
    >
      Selanjutnya →
    </Button>
  )}
</div>

            </div>
        </div>

        {/* ========== PANEL NAVIGASI KANAN ========== */}
        <div className="w-full lg:w-1/3 ">
          <div className="bg-white p-4 rounded-xl shadow space-y-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600">Navigasi Soal</h3>

            {/* Tombol Nomor Soal */}
            <div className="grid grid-cols-4 gap-4">
              {questions.map((q, i) => {
                const isActive = i === currentIndex;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={clsx(
                      "w-9 h-9 rounded-md text-xs font-semibold flex items-center justify-center",
                      isActive
                        ? "bg-green-500 text-white"
                        : isAnswered
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            {/* Tombol Selesai */}
            <button className="mt-4 w-full bg-gray-200 text-gray-800 text-sm py-2 rounded-lg font-medium hover:bg-gray-300 transition">
              Finish Attempt
            </button>
          </div>
        </div>
      </div>

      {/* ========== MODAL RESET ========== */}
      {showModal && (
        <ModalConfirm
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            handleReset();
            setShowModal(false);
          }}
          title="Reset Jawaban"
          message="Apakah kamu yakin ingin menghapus jawaban pada soal ini?"
          warningTitle="⚠️ Perhatian"
          warningMessage="Jawaban yang sudah kamu isi akan dihapus dan tidak dapat dikembalikan."
          confirmLabel="Ya, hapus"
          cancelLabel="Batal"
        />
      )}
    </div>
  );
}
