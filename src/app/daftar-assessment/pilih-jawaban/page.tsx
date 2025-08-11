'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from "lucide-react";

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [pilihan, setPilihan] = useState('');
  const [status, setStatus] = useState('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Skor
  const [skor, setSkor] = useState<{ [key: number]: string }>({
    0: '0',
    1: '1.9',
    2: '2',
    3: '4.9',
    4: '5',
    5: '6.9',
    6: '7',
    7: '8.9',
    8: '9',
    9: '12',
  });

  // ✅ Tambahkan state untuk mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  interface AssessmentItem {
  nomor: number;
  variable: string;
  bobot: number;
  indikator: string;
  tipeSoal: string;
  status: 'Active' | 'Inactive';
  pertanyaan: string;
  pertanyaan2?: string;
  skor: Record<number, string>;
}
  // ✅ Load data jika dalam mode edit
  useEffect(() => {
    const editData = localStorage.getItem('editData');
    if (editData) {
      const data = JSON.parse(editData);
      setNamaVariabel(data.variable || '');
      setBobot(data.bobot || 1);
      setIndikator(data.indikator || '');
      setPertanyaan1(data.pertanyaan || '');
      setPertanyaan2(data.pertanyaan2 || '');
      setStatus(data.status === 'Active' ? 'Aktif' : 'Non-Aktif');
      setJumlahPertanyaan(data.pertanyaan2 ? '2 Pertanyaan' : '1 Pertanyaan');
      setSkor(data.skor || skor);
      setEditNomor(data.nomor);
      setIsEditMode(true);
    }
  }, []);

  const handleSkorChange = (level: number, value: string) => {
    setSkor((prev) => ({ ...prev, [level]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan1.trim()) newErrors.pertanyaan1 = 'Wajib diisi';

    // ✅ Validasi pertanyaan2 hanya jika 2 pertanyaan dipilih
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) {
      newErrors.pertanyaan2 = 'Wajib diisi';
    }

    if (!status) newErrors.status = 'Wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Tambahkan modal konfirmasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    setShowConfirmModal(true); // Tampilkan modal konfirmasi
  };

  // ✅ Simpan (tambah atau update)
  const handleConfirmSave = () => {
    const saved = localStorage.getItem('assessmentList');
    const list = saved ? JSON.parse(saved) : [];
    const baseData = {
      variable: namaVariabel,
      bobot,
      indikator,
      tipeSoal: 'Pilihan Jawaban',
      status: status === 'Aktif' ? 'Active' : 'Inactive',
      skor,
    };

    let updated;
    if (isEditMode && editNomor !== null) {
      // 🔁 Update data lama
     updated = list.map((item: AssessmentItem) => 
        item.nomor === editNomor
          ? {
              ...item,
              ...baseData,
              pertanyaan: pertanyaan1,
              pertanyaan2: jumlahPertanyaan === '2 Pertanyaan' ? pertanyaan2 : undefined,
            }
          : item
      );
    } else {
      // ➕ Tambah data baru
      const lastNomor = list.length > 0 
  ? Math.max(...list.map((item: { nomor: number }) => item.nomor)) 
  : 0;
      const count = jumlahPertanyaan === '2 Pertanyaan' ? 2 : 1;

      const newItems = Array.from({ length: count }, (_, i) => ({
        nomor: lastNomor + i + 1,
        ...baseData,
        pertanyaan: i === 0 ? pertanyaan1 : pertanyaan2,
      }));

      updated = [...list, ...newItems];
    }

    localStorage.setItem('assessmentList', JSON.stringify(updated));
    localStorage.setItem('newDataAdded', 'true');
    localStorage.removeItem('editData'); // Bersihkan flag edit
    router.push('/daftar-assessment');
  };

  const handleCancel = () => {
    localStorage.removeItem('editData'); // Pastikan bersih
    router.push('/daftar-assessment/tambah-assessment');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'pilihan-jawaban') {
      router.push('/daftar-assesment/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/daftar-assessment/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/daftar-assessment/submit-excel');
    }
  };

  const handleRadioClick = (value: string) => {
    setJumlahPertanyaan(prev => prev === value ? '' : value);
  };

  return (
    <div className="flex min-h-screen">
      {/* Page Content */}
      <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
        <div
          className="bg-white p-6 rounded-xl shadow-md mx-auto"
          style={{
            width: '90vw',
            maxWidth: '1200px',
            minWidth: '320px',
            height: 'calc(100vh - 120px)',
            maxHeight: '700px',
            marginTop: '40px',
            overflowY: 'auto',
          }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditMode ? 'Edit Soal: Pilihan Jawaban' : 'Soal Baru: Pilihan Jawaban'}
          </h1>

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
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Pilih Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Nama Variabel & Indikator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Variabel</label>
              <input
                type="text"
                className={`w-full border ${errors.namaVariabel ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                value={namaVariabel}
                onChange={(e) => setNamaVariabel(e.target.value)}
                placeholder="Masukkan Nama Variabel"
              />
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

          {/* Jumlah Pertanyaan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pertanyaan</label>
            <div className="flex space-x-6">
              {['1 Pertanyaan', '2 Pertanyaan'].map((value) => (
                <label
                  key={value}
                  className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 hover:text-blue-700"
                >
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

          {/* Hanya tampilkan form lanjutan jika radio dipilih */}
          {jumlahPertanyaan && (
            <>
              {/* Pertanyaan 1 */}
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

              {/* Jawaban 1 */}
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
                      <td className="border border-gray-300 px-3 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="0" />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="1" />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="2" />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="3" />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2"
                          placeholder="Lebih dari 3"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

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

                  {/* Jawaban 2 */}
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
                          <td className="border border-gray-300 px-3 py-2">
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="0" />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="1" />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="2" />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="3" />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md p-2"
                              placeholder="Lebih dari 3"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* Skor Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  {Object.keys(skor).map((level) => (
                    <th key={level} className="border border-gray-300 px-3 py-2 text-xs bg-gray-50">
                      <div className="flex flex-col items-center space-y-1">
                        <span>Skor {level}</span>
                        <select
                          value={skor[Number(level)]}
                          onChange={(e) => handleSkorChange(Number(level), e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-0.5 w-full"
                        >
                          <option value="0">0</option>
                          <option value="1.9">1.9</option>
                          <option value="2">2</option>
                          <option value="4.9">4.9</option>
                          <option value="5">5</option>
                          <option value="6.9">6.9</option>
                          <option value="7">7</option>
                          <option value="8.9">8.9</option>
                          <option value="9">9</option>
                          <option value="12">12</option>
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(skor).map((value, idx) => (
                    <td key={idx} className="border border-gray-300 px-3 py-2 text-center text-sm">
                      {value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 gap-2">
            <Button
              variant='ghost'
              icon={X}
              iconPosition="left"
              onClick={handleCancel}
              className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
            >
              Batal
            </Button>
            <Button
              variant="simpan"
              icon={Save}
              iconPosition="left"
              onClick={handleSave}
              className="rounded-[12px] px-17 py-2 text-sm font-semibold"
            >
              Simpan
            </Button>
          </div>
        </div>
      </main>

      {/* ✅ Modal Konfirmasi */}
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