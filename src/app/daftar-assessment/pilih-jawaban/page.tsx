'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import ModalConfirm from '@/components/StarAssessment/ModalConfirm';
import { X, Save } from 'lucide-react';

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState('');
  const [pertanyaan2, setPertanyaan2] = useState('');
  const [status, setStatus] = useState('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Skor dengan rentang nilai (hanya 0-4)
  const [skor, setSkor] = useState<{ [key: number]: { min: number; max: number } }>({
    0: { min: 0, max: 1.9 },
    1: { min: 2, max: 4.9 },
    2: { min: 5, max: 6.9 },
    3: { min: 7, max: 8.9 },
    4: { min: 9, max: 12 },
  });

  // ✅ Deskripsi Skor (tetap sebagai objek untuk keperluan input)
  const [deskripsiSkor, setDeskripsiSkor] = useState<{
    [key: number]: string;
  }>({
    0: 'Tidak ada dokumentasi.',
    1: 'Ada dokumentasi dasar.',
    2: 'Dokumentasi sebagian lengkap.',
    3: 'Dokumentasi hampir lengkap.',
    4: 'Dokumentasi lengkap dan terupdate.',
  });

  // Mode edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNomor, setEditNomor] = useState<number | null>(null);

  // ✅ Interface: Ubah deskripsiSkor jadi flatten fields
  interface AssessmentItem {
    nomor: number;
    variable: string;
    bobot: number;
    indikator: string;
    tipeSoal: string;
    status: 'Active' | 'Inactive';
    pertanyaan: string;
    pertanyaan2?: string;
    skor: Record<number, { min: number; max: number }>;
    // ✅ Ganti objek deskripsiSkor menjadi flatten
    deskripsiSkor0: string;
    deskripsiSkor1: string;
    deskripsiSkor2: string;
    deskripsiSkor3: string;
    deskripsiSkor4: string;
  }

  // Load data jika dalam mode edit
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

      // ✅ Load deskripsiSkor dari format flatten jika tersedia
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

      setEditNomor(data.nomor);
      setIsEditMode(true);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan1.trim()) newErrors.pertanyaan1 = 'Wajib diisi';
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) {
      newErrors.pertanyaan2 = 'Wajib diisi';
    }
    if (!status) newErrors.status = 'Wajib dipilih';
    if (!jumlahPertanyaan) newErrors.jumlahPertanyaan = 'Wajib dipilih';

    // Validasi deskripsi skor
    for (const level in deskripsiSkor) {
      if (!deskripsiSkor[level].trim()) {
        newErrors[`deskripsiSkor${level}`] = 'Deskripsi skor harus diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    try {
      const saved = localStorage.getItem('assessmentList');
      let list: AssessmentItem[] = [];
      if (saved) {
        list = JSON.parse(saved);
      }

      // ✅ Flatten deskripsiSkor saat simpan
      const baseData = {
        variable: namaVariabel,
        bobot,
        indikator,
        tipeSoal: 'Pilihan Jawaban',
        status: status === 'Aktif' ? 'Active' : 'Inactive',
        skor,
        deskripsiSkor0: deskripsiSkor[0],
        deskripsiSkor1: deskripsiSkor[1],
        deskripsiSkor2: deskripsiSkor[2],
        deskripsiSkor3: deskripsiSkor[3],
        deskripsiSkor4: deskripsiSkor[4],
      };

      let updated: AssessmentItem[];

      if (isEditMode && editNomor !== null) {
        updated = list.map((item) =>
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
        const lastNomor = list.length > 0 ? Math.max(...list.map((item) => item.nomor)) : 0;
        const count = jumlahPertanyaan === '2 Pertanyaan' ? 2 : 1;

        const newItems = Array.from({ length: count }, (_, i) => ({
          nomor: lastNomor + i + 1,
          ...baseData,
          pertanyaan: i === 0 ? pertanyaan1 : pertanyaan2,
        }));

        updated = [...list, ...newItems];
      }

      // ✅ Simpan ke localStorage
      localStorage.setItem('assessmentList', JSON.stringify(updated));
      console.log('✅ Data berhasil disimpan:', updated);

      localStorage.setItem('newDataAdded', 'true');
      localStorage.removeItem('editData');
      router.push('/daftar-assessment');
    } catch (error) {
      console.error('❌ Gagal menyimpan data:', error);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editData');
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

  const isFormValid = () => {
    if (!namaVariabel.trim()) return false;
    if (!indikator.trim()) return false;
    if (!pertanyaan1.trim()) return false;
    if (!status) return false;
    if (!jumlahPertanyaan) return false;
    if (jumlahPertanyaan === '2 Pertanyaan' && (!pertanyaan2 || !pertanyaan2.trim())) return false;
    return true;
  };

  return (
    <div className="flex min-h-screen">
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

          {/* ✅ Deskripsi Skor */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Deskripsi Skor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className="flex flex-col space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Skor {level}</label>
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
              {['1 Pertanyaan', '2 Pertanyaan'].map((value) => (
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

          {/* Form Pertanyaan dan Pilihan Jawaban */}
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
                        <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="Lebih dari 3" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

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
                            <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="Lebih dari 3" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* ✅ Rentang Skor */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <th
                      key={level}
                      className="border border-gray-300 px-3 py-2 bg-gray-100 text-center font-medium"
                    >
                      Skor {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <td
                      key={level}
                      className="border border-gray-300 px-0 py-2 text-center"
                    >
                      <div className="flex items-center">
                        <span className="flex-1 text-left px-2">{skor[level].min}</span>
                        <div className="w-px bg-gray-300 h-6"></div>
                        <span className="flex-1 text-right px-2">{skor[level].max}</span>
                      </div>
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
              disabled={!isFormValid()}
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