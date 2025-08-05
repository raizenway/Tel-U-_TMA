'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopbarHeader from '@/components/TopbarHeader';

export default function PilihJawabanPage() {
  const router = useRouter();

  // Form state
  const [namaVariabel, setNamaVariabel] = useState('');
  const [bobot, setBobot] = useState(1);
  const [indikator, setIndikator] = useState('');
  const [pertanyaan1, setPertanyaan1] = useState(''); // Pertanyaan 1
  const [pertanyaan2, setPertanyaan2] = useState(''); // Pertanyaan 2
  const [pilihan, setPilihan] = useState('');
  const [status, setStatus] = useState('');
  const [jumlahPertanyaan, setJumlahPertanyaan] = useState<string>(''); // Awalnya kosong
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

  const handleSkorChange = (level: number, value: string) => {
    setSkor((prev) => ({ ...prev, [level]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!namaVariabel.trim()) newErrors.namaVariabel = 'Wajib diisi';
    if (!indikator.trim()) newErrors.indikator = 'Wajib diisi';
    if (!pertanyaan1.trim()) newErrors.pertanyaan1 = 'Wajib diisi';
    if (!pertanyaan2.trim()) newErrors.pertanyaan2 = 'Wajib diisi';
    if (!pilihan.trim()) newErrors.pilihan = 'Wajib diisi';
    if (!status) newErrors.status = 'Wajib dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      alert('Mohon lengkapi semua field yang wajib.');
      return;
    }

    const saved = localStorage.getItem('assessmentList');
    const list = saved ? JSON.parse(saved) : [];
    const lastNomor = list.length > 0 ? Math.max(...list.map((i: any) => i.nomor)) : 0;
    const count = jumlahPertanyaan === '2 Pertanyaan' ? 2 : 1;

    const newItems = Array.from({ length: count }, (_, i) => ({
      nomor: lastNomor + i + 1,
      variable: namaVariabel,
      bobot: bobot,
      indikator: indikator,
      pertanyaan: `${i === 0 ? pertanyaan1 : pertanyaan2}`,
      tipeSoal: 'Pilihan Jawaban',
      status: status === 'Aktif' ? 'Active' : 'Inactive',
    }));

    const updated = [...list, ...newItems];
    localStorage.setItem('assessmentList', JSON.stringify(updated));
    router.push('/daftar-assessment');
  };

  // Handler untuk redirect otomatis saat pilih tipe soal
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    if (selected === 'pilihan-jawaban') {
      router.push('/pilih-jawaban');
    } else if (selected === 'api-igracias') {
      router.push('/api-igracias');
    } else if (selected === 'submit-excel') {
      router.push('/submit-excel');
    }
  };

  // Handler untuk toggle radio
  const handleRadioClick = (value: string) => {
    setJumlahPertanyaan(prev => prev === value ? '' : value);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onItemClick={(item) => item.path && router.push(`/${item.path}`)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <TopbarHeader />

        {/* Page Content */}
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Soal Baru: Pilihan Jawaban</h1>

            {/* Type Soal & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Dropdown Type Soal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type Soal</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  onChange={handleTypeChange} // 🔥 Trigger redirect saat pilih
                  defaultValue="pilihan-jawaban" // Tetap di halaman ini saat load
                >
                  <option value="">Pilih Type Soal</option>
                  <option value="pilihan-jawaban">Pilihan Jawaban</option>
                  <option value="api-igracias">API dari iGracias</option>
                  <option value="submit-excel">Submit Jawaban Excel</option>
                </select>
              </div>

              {/* Status (tidak berubah) */}
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

            {/* Nama Variabel & Indikator (tidak berubah) */}
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

            {/* Jumlah Pertanyaan (tidak berubah) */}
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
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="1"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="2"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="3"
                          />
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
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="1"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="2"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2"
                                placeholder="3"
                              />
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

            {/* Skor Table (tidak berubah) */}
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

            {/* Buttons (tidak berubah) */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}