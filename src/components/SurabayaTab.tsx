
"use client";

import { useState } from "react";
import clsx from "clsx";
import ModalConfirm from "@/components/StarAssessment/ModalConfirm";
import Button from "@/components/button";

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
    options:
      i + 1 === 30
        ? []
        : ["0", "1", "2", "3", "Lebih dari 3"],
  };
});

export default function SurabayaTab() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);

  const current = questions[currentIndex];
  const isLast = current.id === 30;

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
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* KIRI */}
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

            <div className="text-sm text-gray-600 font-medium">
               {current.question}
            </div>
            {/* Soal 1: Input Angka */}
           {current.id === 1 && (
  <div className="space-y-4">
    {/* Input 1a */}
    <div>
      <label className="block text-sm text-gray-800 mb-1">
        Jumlah program studi S1 TUNC yang terakreditasi oleh lembaga internasional bereputasi
      </label>
      <input
        type="number"
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
        value={answers[1] || ""}
        onChange={(e) =>
          setAnswers((prev) => ({
            ...prev,
            1: e.target.value,
          }))
        }
        placeholder="Masukkan angka"
      />
      <p className="text-sm text-gray-500 mt-1">Jawaban berupa angka</p>
    </div>

    {/* Input 1b */}
    <div>
      <label className="block text-sm text-gray-800 mb-1">
        Jumlah total program studi S1 TUNC
      </label>
      <input
        type="number"
        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
        value={answers["1b"] || ""}
        onChange={(e) =>
          setAnswers((prev) => ({
            ...prev,
            "1b": e.target.value,
          }))
        }
        placeholder="Masukkan angka"
      />
      <p className="text-sm text-gray-500 mt-1">Jawaban berupa angka</p>
    </div>
  </div>
)}


            {/* Soal 30: Upload File */}
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
                    <p className="text-sm text-gray-600">
                      Klik tombol di bawah untuk mendownload template jawaban
                    </p>
                    <Button variant="primary">Download di sini</Button>
                  </div>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Tarik & tahan lampiran untuk mengupload
                    </p>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm">
                      Browse File
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Soal 2–29: Radio Options */}
            {!isLast && current.id !== 1 && (
              <div className="space-y-3">
                {current.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${current.id}`}
                      value={option}
                      checked={answers[current.id] === option}
                      onChange={() => handleOptionChange(option)}
                      className="accent-blue-700 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Tombol Navigasi */}
            <div className="flex justify-end flex-wrap gap-3 pt-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
              >
                ✖ Batal
              </button>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  ← Sebelumnya
                </button>
              )}
              {currentIndex < questions.length - 1 && (
                <Button variant="primary" onClick={handleNext}>
                  Selanjutnya →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* KANAN - Panel Soal */}
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
                      isActive
                        ? "bg-green-500 text-gray"
                        : isAnswered
                        ? "bg-green-500 text-gray"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>
            <button className="mt-4 w-full bg-gray-200 text-gray-800 text-sm py-2 rounded-lg font-medium hover:bg-gray-300 transition">
              Selesai
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
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
