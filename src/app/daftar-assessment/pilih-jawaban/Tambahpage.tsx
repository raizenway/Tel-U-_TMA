'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from 'lucide-react';
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/useDaftarAssessment';
import { useTransformationVariableList } from '@/hooks/useTransformationVariableList';

// Interface untuk data assessment
interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  tipeSoal: string;
  tipePertanyaan: 'pg' | 'short-answer';
  status: 'Active' | 'Inactive';
  pertanyaan: string;
  pertanyaan2?: string;
  skor: { [key: number]: { min: number; max: number } };
  deskripsiSkor0: string;
  deskripsiSkor1: string;
  deskripsiSkor2: string;
  deskripsiSkor3: string;
  deskripsiSkor4: string;
}

// Type untuk status input (UI)
type StatusInput = 'Aktif' | 'Non-Aktif';

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [status, setStatus] = useState<StatusInput | ''>('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<'1 Pertanyaan' | '2 Pertanyaan' | ''>('');
  const [tipePertanyaan, setTipePertanyaan] = useState<'pg' | 'short-answer'>('pg');
  const [urutan, setUrutan] = useState<string>('');
  const { data: transformationVariables = [], loading: variablesLoading } = useTransformationVariableList();  
  const [selectedVariableId, setSelectedVariableId] = useState<number | null>(null);

  // Skor dan deskripsi
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

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // Hook create & update
  const { mutate: createMutate, loading: createLoading, error: createError } = useCreateQuestion();
  const { mutate: updateMutate, loading: updateLoading, error: updateError } = useUpdateQuestion();

  // Load data dari editData
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (!editData) return;

    try {
      const data = JSON.parse(editData);

      setNamaVariabel(data.variable || '');
      setBobot(data.bobot || 1);
      setIndikator(data.indikator || '');
      setPertanyaan1(data.pertanyaan || '');
      setPertanyaan2(data.pertanyaan2 || '');
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setJumlahPertanyaan(data.pertanyaan2 ? '2 Pertanyaan' : '1 Pertanyaan');
      setTipePertanyaan(data.tipePertanyaan || 'pg');

      if (data.skor) {
        const loadedSkor: { [key: number]: { min: string; max: string } } = {};
        for (let i = 0; i <= 4; i++) {
          loadedSkor[i] = {
            min: String(data.skor[i]?.min ?? ''),
            max: String(data.skor[i]?.max ?? ''),
          };
        }
        setSkor(loadedSkor);
      }

      if (data.deskripsiSkor0 !== undefined) {
        setDeskripsiSkor({
          0: data.deskripsiSkor0,
          1: data.deskripsiSkor1,
          2: data.deskripsiSkor2,
          3: data.deskripsiSkor3,
          4: data.deskripsiSkor4,
        });
      } else if (data.deskripsiSkor) {
        setDeskripsiSkor(data.deskripsiSkor);
      }

      if (data.nomor !== undefined && data.nomor !== null && data.nomor !== '') {
        setEditNomor(data.nomor);
        setIsEditMode(true);
      } else {
        setEditNomor(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Gagal parsing editData:', error);
    }
  }, []);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  // ✅ HANDLE SIMPAN — INTEGRASI API (CREATE & UPDATE)
  const handleConfirmSave = async () => {
    try {
      const finalStatus = status === 'Aktif' ? 'active' : 'inactive';

     if (!selectedVariableId) {
        alert('Silakan pilih Nama Variabel terlebih dahulu.');
        return;
      }

      if (isEditMode && editNomor !== null) {
        // ✅ Mode Edit — kirim ke API

        // Kirim Pertanyaan 1
        const payload1 = {
          transformationVariableId: selectedVariableId,
          type: tipePertanyaan === 'pg' ? 'multitext' : 'text',
          indicator: indikator.trim(),
          questionText: pertanyaan1.trim(),
          scoreDescription0: deskripsiSkor[0].trim(),
          scoreDescription1: deskripsiSkor[1].trim(),
          scoreDescription2: deskripsiSkor[2].trim(),
          scoreDescription3: deskripsiSkor[3].trim(),
          scoreDescription4: deskripsiSkor[4].trim(),
          order: parseInt(urutan, 10) || 1,
          status: finalStatus as 'active' | 'inactive',
        };

        const result1 = await updateMutate(editNomor, payload1);
        if (!result1) {
          alert('Gagal memperbarui pertanyaan 1. Silakan coba lagi.');
          return;
        }

        // Kirim Pertanyaan 2 (jika ada)
        if (jumlahPertanyaan === '2 Pertanyaan' && pertanyaan2?.trim()) {
          const payload2 = {
            ...payload1,
            questionText: pertanyaan2.trim(),
          };

          const result2 = await updateMutate(editNomor + 1, payload2); // Asumsi ID berurutan
          if (!result2) {
            alert('Gagal memperbarui pertanyaan 2. Silakan coba lagi.');
            return;
          }
        }

        // Berhasil
        localStorage.setItem('newDataAdded', 'true');
        alert('Data berhasil diperbarui!');
        router.push('/daftar-assessment');
      } else {
        // ✅ Mode Create — kirim ke API

        // Kirim Pertanyaan 1
        const payload1 = {
          transformationVariableId: selectedVariableId,
          type: tipePertanyaan === 'pg' ? 'multitext' : 'text',
          indicator: indikator.trim(),
          questionText: pertanyaan1.trim(),
          scoreDescription0: deskripsiSkor[0].trim(),
          scoreDescription1: deskripsiSkor[1].trim(),
          scoreDescription2: deskripsiSkor[2].trim(),
          scoreDescription3: deskripsiSkor[3].trim(),
          scoreDescription4: deskripsiSkor[4].trim(),
          order: parseInt(urutan, 10) || 1,
          status: finalStatus as 'active' | 'inactive',
        };

        const result1 = await createMutate(payload1);
        if (!result1) {
          alert('Gagal menyimpan pertanyaan 1. Silakan coba lagi.');
          return;
        }

        // Kirim Pertanyaan 2 (jika ada)
        if (jumlahPertanyaan === '2 Pertanyaan' && pertanyaan2?.trim()) {
          const payload2 = {
            ...payload1,
            questionText: pertanyaan2.trim(),
          };

          const result2 = await createMutate(payload2);
          if (!result2) {
            alert('Gagal menyimpan pertanyaan 2. Silakan coba lagi.');
            return;
          }
        }

        // Berhasil
        localStorage.setItem('newDataAdded', 'true');
        alert('Data berhasil disimpan!');
        router.push('/daftar-assessment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
    router.push('/daftar-assessment');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    localStorage.removeItem('editData');
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assessment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  const handleRadioClick = (value: '1 Pertanyaan' | '2 Pertanyaan') => {
    setJumlahPertanyaan((prev) => (prev === value ? '' : value));
    if (jumlahPertanyaan !== value) {
      setTipePertanyaan('pg');
    }
  };

  const isFormValid = () => {
    if (!namaVariabel.trim()) return false;
    if (!indikator.trim()) return false;
    if (!pertanyaan1.trim()) return false;
    if (!status) return false;
    if (!jumlahPertanyaan) return false;
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) return false;

    // Validasi skor
    for (const level of Object.keys(skor)) {
      const min = parseFloat(skor[Number(level)].min);
      const max = parseFloat(skor[Number(level)].max);
      if (isNaN(min) || isNaN(max) || min >= max) return false;
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

          {/* Tampilkan error API */}
          {createError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ {createError}
            </div>
          )}
          {updateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ❌ {updateError}
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
                value={namaVariabel}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedVar = transformationVariables.find(v => v.name === selectedName);
                  setNamaVariabel(selectedName);
                  setSelectedVariableId(selectedVar?.id || null); // ✅ UPDATE ID
                }}
                disabled={variablesLoading}
              >
                <option value="">Pilih Nama Variabel</option>
                {variablesLoading ? (
                  <option>Loading...</option>
                ) : (
                  transformationVariables.map((varItem) => (
                    <option key={varItem.id} value={varItem.name}>
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

          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700">Urutan</label>
            <input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Masukkan urutan"
              min="1"
            />
            {errors.urutan && <p className="text-red-500 text-xs mt-1">{errors.urutan}</p>}
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
                    className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Deskripsi untuk skor ${level}`}
                  />
                  {errors[`deskripsiSkor${level}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`deskripsiSkor${level}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Jumlah Pertanyaan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pertanyaan</label>
            <div className="flex space-x-6">
              {(['1 Pertanyaan', '2 Pertanyaan'] as const).map((value) => (
                <label key={value} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700">
                  <input
                    type="radio"
                    name="jumlahPertanyaan"
                    value={value}
                    checked={jumlahPertanyaan === value}
                    onClick={() => handleRadioClick(value)}
                    readOnly
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tipe Pertanyaan */}
          {jumlahPertanyaan && (
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
                      onChange={() => setTipePertanyaan(option.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
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
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban A</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban B</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban C</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban D</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="0" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="1" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="2" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="3" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue=">3" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Pertanyaan 2 */}
          {jumlahPertanyaan === '2 Pertanyaan' && (
            <>
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

              {tipePertanyaan === 'pg' && (
                <div className="mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban A</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban B</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban C</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban D</th>
                        <th className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">Jawaban E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="0" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="1" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="2" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue="3" /></td>
                        <td className="border px-3 py-2"><input type="text" className="w-full border border-gray-300 rounded-md p-2" defaultValue=">3" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Edit Rentang Skor */}
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
              {(createLoading || updateLoading) ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
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