'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import { X, Save } from 'lucide-react';
import {useCreateQuestion, useUpdateQuestion } from '@/hooks/useDaftarAssessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';

type StatusInput = 'Aktif' | 'Non-Aktif';

export default function ApiIgraciasPage() {
  const router = useRouter();

  // Form state
  const [linkApi, setLinkApi] = useState('');
  const [indikator, setIndikator] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [urutan, setUrutan] = useState<string>('');
  const [deskripsiSkor, setDeskripsiSkor] = useState<{
    [key: number]: string;
  }>({
    0: 'Tidak ada dokumentasi.',
    1: 'Ada dokumentasi dasar.',
    2: 'Dokumentasi sebagian lengkap.',
    3: 'Dokumentasi hampir lengkap.',
    4: 'Dokumentasi lengkap dan terupdate.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null); // ✅ state error lokal

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);
  const [selectedVariableId, setSelectedVariableId] = useState<number | null>(null);

  // Hook API
  const { mutate: createMutate, loading: createLoading } = useCreateQuestion();
  const { mutate: updateMutate, loading: updateLoading } = useUpdateQuestion();

  // Data variabel
  const { data: rawData, loading: variablesLoading } = useTransformationVariableList();
  const transformationVariables = Array.isArray(rawData) ? rawData : [];

  useEffect(() => {
  const editData = localStorage.getItem('editData');
  if (!editData) {
    setIsEditMode(false);
    setEditNomor(null);
    return;
  }

  try {
    const data = JSON.parse(editData);

    setLinkApi(data.linkApi || data.questionApiUrl || '');
    setIndikator(data.indikator || data.indicator || '');
    setPertanyaan(data.pertanyaan || data.questionText || '');
    setStatus(data.status === 'active' ? 'Aktif' : 'Non-Aktif');
    setUrutan(String(data.order || data.urutan || ''));
    setSelectedVariableId(data.transformationVariableId || data.transformationVariable?.id || null);

    // ✅ Baca dari field yang benar: scoreDescription0, bukan deskripsiSkor0
    const loadedDeskripsi = {
      0: data.scoreDescription0 ?? 'Tidak ada dokumentasi.',
      1: data.scoreDescription1 ?? 'Ada dokumentasi dasar.',
      2: data.scoreDescription2 ?? 'Dokumentasi sebagian lengkap.',
      3: data.scoreDescription3 ?? 'Dokumentasi hampir lengkap.',
      4: data.scoreDescription4 ?? 'Dokumentasi lengkap dan terupdate.',
    };

    setDeskripsiSkor(loadedDeskripsi);

    if (data.id !== undefined || data.nomor !== undefined) {
      setEditNomor(data.id ?? data.nomor);
      setIsEditMode(true);
    }
  } catch (error) {
    console.error('Gagal parsing editData:', error);
    localStorage.removeItem('editData');
  }
}, []);

  // Validasi
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedVariableId) newErrors.namaVariabel = 'Wajib dipilih';
    if (!linkApi.trim()) newErrors.linkApi = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan.trim()) newErrors.pertanyaan = 'Wajib diisi';
    if (!status) newErrors.status = 'Wajib dipilih';
    if (!urutan || isNaN(parseFloat(urutan)) || parseFloat(urutan) < 1) {
      newErrors.urutan = 'Urutan harus angka dan > 0';
    }

    Object.keys(deskripsiSkor).forEach((level) => {
      const numLevel = Number(level);
      if (!deskripsiSkor[numLevel]?.trim()) {
        newErrors[`deskripsiSkor${numLevel}`] = 'Wajib diisi';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      selectedVariableId !== null &&
      linkApi.trim() !== '' &&
      indikator.trim() !== '' &&
      pertanyaan.trim() !== '' &&
      status !== '' &&
      urutan !== '' &&
      !isNaN(parseFloat(urutan)) &&
      parseFloat(urutan) >= 1
    );
  };

  const handleSimpan = async () => {
    setSubmitError(null); // ✅ Reset error sebelum simpan
    if (!validate()) return;

    const finalStatus = status === 'Aktif' ? 'active' : 'inactive';
    const finalUrutan = parseInt(urutan, 10) || 1;

    const payload = {
      transformationVariable: { connect: { id: selectedVariableId } },
      type: 'api' as const,
      indicator: indikator.trim(),
      questionText: pertanyaan.trim(),
      questionApiUrl: linkApi.trim(),
      answerText1: '',
      answerText2: '',
      answerText3: '',
      answerText4: '',
      answerText5: '',
      scoreDescription0: deskripsiSkor[0].trim(),
      scoreDescription1: deskripsiSkor[1].trim(),
      scoreDescription2: deskripsiSkor[2].trim(),
      scoreDescription3: deskripsiSkor[3].trim(),
      scoreDescription4: deskripsiSkor[4].trim(),
      order: finalUrutan,
      status: finalStatus as 'active' | 'inactive',
    };

    try {
      let result;
      if (isEditMode && editNomor !== null) {
        result = await updateMutate(editNomor, payload);
      } else {
        result = await createMutate(payload);
      }

      if (result) {
        localStorage.removeItem('editData');
        setIsEditMode(false); // ✅ Reset mode
        router.push('/daftar-assessment');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan soal.');
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    localStorage.removeItem('editData'); // ✅ Pastikan bersih
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assessment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

  const isLoading = createLoading || updateLoading;

  return (
    <div className="flex">
      <main className="flex-1">
        <div className="rounded-xl shadow-md mx-auto">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Soal: API dari iGracias' : 'Soal Baru: API dari iGracias'}
            </h1>
          </div>

          {/* Error Submit (bukan dari hook) */}
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-8 mb-4">
              ❌ {submitError}
            </div>
          )}

          {/* Form Content */}
          <div className="p-8 space-y-6 overflow-y-auto max-h-[500px]">
            {/* Type Soal & Link API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type Soal</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  onChange={handleTypeChange}
                  defaultValue="api-igracias"
                >
                  <option value="">Pilih Type Soal</option>
                  <option value="pilihan-jawaban">Pilihan Jawaban</option>
                  <option value="api-igracias">API dari iGracias</option>
                  <option value="submit-excel">Submit Jawaban Excel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link API</label>
                <input
                  type="text"
                  className={`w-full border ${errors.linkApi ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={linkApi}
                  onChange={(e) => setLinkApi(e.target.value)}
                  placeholder="Masukkan Link API"
                />
                {errors.linkApi && <p className="text-red-500 text-xs mt-1">{errors.linkApi}</p>}
              </div>
            </div>

            {/* Nama Variabel & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Variabel</label>
                <select
                  className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 bg-white`}
                  value={selectedVariableId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedVariableId(id || null);
                  }}
                  disabled={variablesLoading}
                >
                  <option value="" disabled>
                    Pilih Nama Variabel
                  </option>
                  {variablesLoading ? (
                    <option>Loading...</option>
                  ) : (
                    transformationVariables.map((varItem) => (
                      <option key={varItem.id} value={varItem.id}>
                        {varItem.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.namaVariabel && (
                  <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusInput)}
                >
                  <option value="">Pilih Status</option>
                  <option value="Aktif">Active</option>
                  <option value="Non-Aktif">Inactive</option>
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* Indikator & Pertanyaan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Indikator</label>
                <textarea
                  className={`w-full border ${errors.indikator ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={indikator}
                  onChange={(e) => setIndikator(e.target.value)}
                  placeholder="Masukkan Indikator"
                  rows={4}
                ></textarea>
                {errors.indikator && <p className="text-red-500 text-xs mt-1">{errors.indikator}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
                <textarea
                  className={`w-full border ${errors.pertanyaan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Masukkan Pertanyaan"
                  rows={4}
                ></textarea>
                {errors.pertanyaan && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan}</p>}
              </div>
            </div>

            {/* Urutan & Deskripsi Skor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                <input
                  type="number"
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value)}
                  className={`w-full border ${errors.urutan ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3`}
                  placeholder="Masukkan urutan"
                  min="1"
                />
                {errors.urutan && <p className="text-red-500 text-xs mt-1">{errors.urutan}</p>}
              </div>
              {[0, 1, 2, 3, 4].map((skor) => (
                <div key={skor}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Skor {skor}</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    value={deskripsiSkor[skor]}
                    onChange={(e) =>
                      setDeskripsiSkor((prev) => ({
                        ...prev,
                        [skor]: e.target.value,
                      }))
                    }
                    placeholder={`Deskripsi untuk skor ${skor}`}
                    rows={3}
                  ></textarea>
                  {errors[`deskripsiSkor${skor}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`deskripsiSkor${skor}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="p-8 border-t bg-gray-50 flex justify-end gap-4">
            <Button
              variant="ghost"
              icon={X}
              iconColor="text-red-600"
              iconPosition="left"
              onClick={handleCancel}
              className="rounded-[12px] px-20 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              icon={Save}
              iconPosition="left"
              onClick={handleSimpan}
              disabled={!isFormValid() || isLoading}
              className="rounded-[12px] px-25 py-2 text-sm font-semibold"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}