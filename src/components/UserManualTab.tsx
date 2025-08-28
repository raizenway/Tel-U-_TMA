export default function UserManualTab() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">
        📘 User Manual
      </h2>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-xl font-semibold text-[#1d2c4c]">
          1. Login ke Dashboard
        </h3>
        <p className="text-gray-600">
          Klik tombol Login, masukkan email dan password Anda, lalu tekan
          tombol Masuk.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-xl font-semibold text-[#1d2c4c]">
          2. Memilih Kampus
        </h3>
        <p className="text-gray-600">
          Pada halaman Welcome, klik tombol Pilih pada kampus yang Anda tuju.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-xl font-semibold text-[#1d2c4c]">
          3. Mulai Assessment
        </h3>
        <p className="text-gray-600">
          Setelah memilih kampus, klik tombol Start Assessment untuk mengisi
          penilaian.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-xl font-semibold text-[#1d2c4c]">
          4. Navigasi Halaman
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>
            <strong>Welcome</strong>: Pilih kampus & info dasar.
          </li>
          <li>
            <strong>Dashboard</strong>: Melihat grafik hasil assessment.
          </li>
          <li>
            <strong>User Manual</strong>: Panduan penggunaan sistem.
          </li>
        </ul>
      </div>
    </div>
  );
}
