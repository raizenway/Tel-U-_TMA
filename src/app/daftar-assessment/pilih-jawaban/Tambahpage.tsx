'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from 'lucide-react';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/useDaftarAssessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';

type StatusInput = 'Aktif' | 'Non-Aktif';

export default function PilihJawabanPage() {
  const router = useRouter();

  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<'1 Pertanyaan' | '2 Pertanyaan' | ''>('');
  const [tipePertanyaan, setTipePertanyaan] = useState<'pg' | 'short-answer'>('pg');
  const [urutan, setUrutan] = useState<string>('');
  
  const { data: rawData, loading: variablesLoading } = useTransformationVariableList();
  const transformationVariables = Array.isArray(rawData) ? rawData : [];
  const [selectedVariableId, setSelectedVariableId] = useState<number | null>(null);

  const [pgAnswers1, setPgAnswers1] = useState<string[]>(['0', '1', '2', '3', '>3']);
  const [pgAnswers2, setPgAnswers2] = useState<string[]>(['0', '1', '2', '3', '>3']);

  const [skor, setSkor] = useState<{ [key: number]: { min: string; max: string } }>({
    0: { min: '0', max: '1.9' },
    1: { min: '2', max: '4.9' },
    2: { min: '5', max: '6.9' },
    3: { min: '7', max: '8.9' },
    4: { min: '9', max: '12' },
  });

  const [deskripsiSkor, setDeskripsiSkor] = useState<{ [key: number]: string }>({
    0: 'Tidak ada dokumentasi.',
    1: 'Ada dokumentasi dasar.',
    2: 'Dokumentasi sebagian lengkap.',
    3: 'Dokumentasi hampir lengkap.',
    4: 'Dokumentasi lengkap dan terupdate.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  const { mutate: createMutate, loading: createLoading, error: createError } = useCreateQuestion();
  const { mutate: updateMutate, loading: updateLoading, error: updateError } = useUpdateQuestion();

  useEffect(() => {
    if (transformationVariables.length === 0) return;
    const editDataRaw = localStorage.getItem('editData');
    if (!editDataRaw) return;

    try {
      const data = JSON.parse(editDataRaw);
      setBobot(data.bobot || 1);
      setIndikator(data.indikator || '');
      setPertanyaan1(data.pertanyaan || '');
      setPertanyaan2(data.pertanyaan2 || '');
      if (data.pgAnswers1) setPgAnswers1(data.pgAnswers1);
      if (data.pgAnswers2) setPgAnswers2(data.pgAnswers2);
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setJumlahPertanyaan(data.pertanyaan2 ? '2 Pertanyaan' : '1 Pertanyaan');
      setTipePertanyaan(data.tipePertanyaan || 'pg');
      setUrutan(String(data.order || ''));
      setSelectedVariableId(data.transformationVariableId ?? null);
      if (data.nomor) {
        setEditNomor(data.nomor);
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
    }
  }, [transformationVariables]);

  // Jika pilih pilihan ganda, otomatis jadi 1 pertanyaan
  useEffect(() => {
    if (tipePertanyaan === 'pg') {
      setJumlahPertanyaan('1 Pertanyaan');
    }
  }, [tipePertanyaan]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedVariableId) newErrors.namaVariabel = 'Wajib dipilih';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan1.trim()) newErrors.pertanyaan1 = 'Wajib diisi';
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) {
      newErrors.pertanyaan2 = 'Wajib diisi';
    }
    if (!status) newErrors.status = 'Wajib dipilih';
    if (!jumlahPertanyaan) newErrors.jumlahPertanyaan = 'Wajib dipilih';

    if (tipePertanyaan === 'short-answer') {
      Object.keys(skor).forEach((level) => {
        const numLevel = Number(level);
        const min = parseFloat(skor[numLevel].min);
        const max = parseFloat(skor[numLevel].max);
        if (isNaN(min) || isNaN(max)) {
          newErrors[`skor${numLevel}`] = 'Wajib diisi';
        } else if (min >= max) {
          newErrors[`skor${numLevel}`] = 'Max harus lebih besar dari min';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const finalStatus = status === 'Aktif' ? 'active' : 'inactive';
      if (!selectedVariableId) {
        setErrors({ namaVariabel: 'Wajib dipilih' });
        return;
      }

      const questionType: 'multitext' | 'text' = tipePertanyaan === 'pg' ? 'multitext' : 'text';
      const basePayload1 = {
        transformationVariable: { connect: { id: selectedVariableId } },
        type: questionType,
        indicator: indikator.trim(),
        questionText: pertanyaan1.trim(),
        answerText1: tipePertanyaan === 'pg' ? pgAnswers1[0] : "",
        answerText2: tipePertanyaan === 'pg' ? pgAnswers1[1] : "",
        answerText3: tipePertanyaan === 'pg' ? pgAnswers1[2] : "",
        answerText4: tipePertanyaan === 'pg' ? pgAnswers1[3] : "",
        answerText5: tipePertanyaan === 'pg' ? pgAnswers1[4] : "",
        scoreDescription0: deskripsiSkor[0].trim(),
        scoreDescription1: deskripsiSkor[1].trim(),
        scoreDescription2: deskripsiSkor[2].trim(),
        scoreDescription3: deskripsiSkor[3].trim(),
        scoreDescription4: deskripsiSkor[4].trim(),
        order: parseInt(urutan, 10) || 1,
        status: finalStatus as 'active' | 'inactive',
      };

      if (isEditMode && editNomor !== null) {
        await updateMutate(editNomor, basePayload1);
        if (jumlahPertanyaan === '2 Pertanyaan' && pertanyaan2?.trim()) {
          const payload2 = { ...basePayload1, questionText: pertanyaan2.trim() };
          await updateMutate(editNomor + 1, payload2);
        }
      } else {
        await createMutate(basePayload1);
        if (jumlahPertanyaan === '2 Pertanyaan' && pertanyaan2?.trim()) {
          const payload2 = { ...basePayload1, questionText: pertanyaan2.trim() };
          await createMutate(payload2);
        }
      }

      localStorage.setItem('newDataAdded', 'true');
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('Error saat menyimpan:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.removeItem('editData');
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') router.push('/daftar-assessment/pilih-jawaban');
    else if (selected === 'api-igracias') router.push('/daftar-assessment/api-igracias');
    else if (selected === 'submit-excel') router.push('/daftar-assessment/submit-excel');
  };

  const handleRadioClick = (value: '1 Pertanyaan' | '2 Pertanyaan') => {
    if (value === '2 Pertanyaan' && tipePertanyaan === 'pg') return;
    setJumlahPertanyaan(value);
  };

  const isFormValid = () => {
    if (!selectedVariableId || !indikator.trim() || !pertanyaan1.trim() || !status || !jumlahPertanyaan) return false;
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) return false;
    if (tipePertanyaan === 'short-answer') {
      for (const level of Object.keys(skor)) {
        const min = parseFloat(skor[Number(level)].min);
        const max = parseFloat(skor[Number(level)].max);
        if (isNaN(min) || isNaN(max) || min >= max) return false;
      }
    }
    return true;
  };

  return (
    <div className="flex min-h-screen">
      <main className="bg-gray-100 flex-1 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditMode ? 'Edit Soal: Pilihan Jawaban' : 'Soal Baru: Pilihan Jawaban'}
          </h1>

          {(createError || updateError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ {createError || updateError}
            </div>
          )}

          {/* Type Soal & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type Soal</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                onChange={handleTypeChange}
                defaultValue="pilihan-jawaban"
              >
                <option value="">Pilih Type Soal</option>
                <option value="pilihan-jawaban">Pilihan Jawaban</option>
                <option value="api-igracias">API dari iGracias</option>
                <option value="submit-excel">Submit Jawaban Excel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
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

          {/* Nama Variabel & Indikator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Variabel</label>
              <select
                className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={selectedVariableId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedVariableId(id || null);
                }}
                disabled={variablesLoading}
              >
                <option value="">Pilih Nama Variabel</option>
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
              {errors.namaVariabel && <p className="text-red-500 text-xs mt-1">{errors.namaVariabel}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indikator</label>
              <textarea
                className={`w-full border ${errors.indikator ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={indikator}
                onChange={(e) => setIndikator(e.target.value)}
                placeholder="Masukkan Indikator"
                rows={2}
              ></textarea>
              {errors.indikator && <p className="text-red-500 text-xs mt-1">{errors.indikator}</p>}
            </div>
          </div>

          <div className="flex flex-col space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">Urutan</label>
            <input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Masukkan urutan"
              min="1"
            />
          </div>

          {/* Deskripsi Skor */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Deskripsi Skor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className="flex flex-col space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Deskripsi Skor {level}</label>
                  <textarea
                    value={deskripsiSkor[level]}
                    onChange={(e) =>
                      setDeskripsiSkor((prev) => ({
                        ...prev,
                        [level]: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
                    placeholder={`Deskripsi untuk skor ${level}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Tipe Pertanyaan — DITEMPATKAN DI ATAS */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pertanyaan</label>
            <div className="flex space-x-6">
              {[
                { value: 'pg' as const, label: 'Pilihan Ganda' },
                { value: 'short-answer' as const, label: 'Jawaban Singkat' },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                  <input
                    type="radio"
                    name="tipePertanyaan"
                    value={option.value}
                    checked={tipePertanyaan === option.value}
                    onChange={(e) => {
                      const newType = e.target.value as 'pg' | 'short-answer';
                      setTipePertanyaan(newType);
                      if (newType === 'pg') setJumlahPertanyaan('1 Pertanyaan');
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ✅ Jumlah Pertanyaan — DITEMPATKAN DI BAWAH, hanya muncul jika short-answer */}
          {tipePertanyaan === 'short-answer' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pertanyaan</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                  <input
                    type="radio"
                    name="jumlahPertanyaan"
                    value="1 Pertanyaan"
                    checked={jumlahPertanyaan === '1 Pertanyaan'}
                    onClick={() => handleRadioClick('1 Pertanyaan')}
                    readOnly
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>1 Pertanyaan</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                  <input
                    type="radio"
                    name="jumlahPertanyaan"
                    value="2 Pertanyaan"
                    checked={jumlahPertanyaan === '2 Pertanyaan'}
                    onClick={() => handleRadioClick('2 Pertanyaan')}
                    readOnly
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>2 Pertanyaan</span>
                </label>
              </div>
            </div>
          )}

          {/* Pertanyaan 1 */}
          {jumlahPertanyaan && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan 1</label>
                <textarea
                  className={`w-full border ${errors.pertanyaan1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                  value={pertanyaan1}
                  onChange={(e) => setPertanyaan1(e.target.value)}
                  placeholder="Masukkan pertanyaan..."
                  rows={2}
                ></textarea>
                {errors.pertanyaan1 && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan1}</p>}
              </div>
              {tipePertanyaan === 'pg' && (
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        {['A', 'B', 'C', 'D', 'E'].map((label) => (
                          <th key={label} className="border border-gray-300 px-3 py-2 text-xs bg-gray-50 text-center">
                            Jawaban {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {['A', 'B', 'C', 'D', 'E'].map((label) => (
                          <td key={label} className="border px-3 py-2">
                            <textarea
                              className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none"
                              rows={2}
                              placeholder={`Tulis Jawaban ${label}...`}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        {['A', 'B', 'C', 'D', 'E'].map((_, idx) => (
                          <th key={idx} className="border border-gray-300 px-3 py-2 text-xs bg-gray-50 text-center">
                            Nilai Jawaban {['A', 'B', 'C', 'D', 'E'][idx]}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {['0', '1', '2', '3', '>3'].map((_, idx) => (
                          <td key={idx} className="border px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md p-2 text-sm"
                              value={pgAnswers1[idx]}
                              onChange={(e) => {
                                const newAnswers = [...pgAnswers1];
                                newAnswers[idx] = e.target.value;
                                setPgAnswers1(newAnswers);
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Pertanyaan 2 */}
          {jumlahPertanyaan === '2 Pertanyaan' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan 2</label>
              <textarea
                className={`w-full border ${errors.pertanyaan2 ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={pertanyaan2}
                onChange={(e) => setPertanyaan2(e.target.value)}
                placeholder="Masukkan pertanyaan..."
                rows={2}
              ></textarea>
              {errors.pertanyaan2 && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan2}</p>}
            </div>
          )}

          {/* Edit Rentang Skor — hanya untuk short-answer */}
          {tipePertanyaan === 'short-answer' && (
            <div className="mb-6 overflow-x-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Edit Rentang Skor (0-4)</h3>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr>
                    {[0, 1, 2, 3, 4].map((level) => (
                      <th key={level} className="border border-gray-300 px-3 py-2 bg-gray-100 text-center font-medium">
                        Skor {level}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[0, 1, 2, 3, 4].map((level) => (
                      <td key={level} className="border border-gray-300 px-0 py-2 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            step="0.1"
                            className={`w-16 border ${errors[`skor${level}`] ? 'border-red-500' : 'border-gray-300'} rounded-md p-1 text-sm text-center`}
                            value={skor[level].min}
                            onChange={(e) =>
                              setSkor((prev) => ({
                                ...prev,
                                [level]: { ...prev[level], min: e.target.value },
                              }))
                            }
                          />
                          <div className="w-px bg-gray-300 h-6 mx-1"></div>
                          <input
                            type="number"
                            step="0.1"
                            className={`w-16 border ${errors[`skor${level}`] ? 'border-red-500' : 'border-gray-300'} rounded-md p-1 text-sm text-center`}
                            value={skor[level].max}
                            onChange={(e) =>
                              setSkor((prev) => ({
                                ...prev,
                                [level]: { ...prev[level], max: e.target.value },
                              }))
                            }
                          />
                        </div>
                        {errors[`skor${level}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`skor${level}`]}</p>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 gap-2">
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
              disabled={!isFormValid() || createLoading || updateLoading}
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSave}
              className="rounded-[12px] px-25 py-2 text-sm font-semibold"
            >
              {(createLoading || updateLoading) ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </main>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <ModalConfirm
          isOpen={true}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmModal(false)}
          header={isEditMode ? 'Perbarui Soal?' : 'Simpan Soal Baru?'}
          title={isEditMode ? 'Perbarui assessment?' : 'Simpan assessment baru?'}
          confirmLabel="Ya, Simpan"
          cancelLabel="Batal"
        >
          <p className="text-gray-700">
            Anda akan {isEditMode ? 'memperbarui' : 'menambahkan'}{' '}
            <strong>{jumlahPertanyaan === '2 Pertanyaan' ? '2' : '1'}</strong> soal.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Status: <strong>{status}</strong>
          </p>
        </ModalConfirm>
      )}
    </div>
  );
}