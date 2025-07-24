"use client";

export default function UserManualPage() {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Manual</h2>

      <div className="space-y-3 text-gray-700">
        <p>
          Selamat datang di aplikasi Transformation Maturity Assessment.
          Panduan ini akan membantu Anda memahami cara menggunakan aplikasi ini.
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Login:</strong> Masukkan email dan password yang terdaftar.
          </li>
          <li>
            <strong>Mulai Asesmen:</strong> Klik menu <em>Star Assessment</em> untuk memulai pengisian.
          </li>
          <li>
            <strong>Lihat Hasil:</strong> Buka <em>Star Result</em> untuk melihat ringkasan penilaian.
          </li>
          <li>
            <strong>Dashboard:</strong> Melihat grafik visualisasi hasil dan insight.
          </li>
          <li>
            <strong>Logout:</strong> Klik tombol “Keluar” di sidebar bawah.
          </li>
        </ol>

        <p>
          Jika mengalami kendala, hubungi admin melalui halaman “Kontak Admin”.
        </p>
      </div>
    </div>
  );
}
