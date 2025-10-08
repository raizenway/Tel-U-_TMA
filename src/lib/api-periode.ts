// src/lib/periodeUtils.ts

/**
 * Validasi input form periode (untuk tambah & edit)
 */
export interface PeriodeFormData {
  tahun: string; // input sebagai string
  semester: string;
  status: 'active' | 'inactive' | '';
}

export function validatePeriodeForm(data: PeriodeFormData) {
  const errors: string[] = [];

  // Validasi tahun
  if (!/^\d{4}$/.test(data.tahun)) {
    errors.push("Tahun harus 4 digit angka (contoh: 2025)");
  } else {
    const yearNum = parseInt(data.tahun, 10);
    if (yearNum < 2000 || yearNum > 2100) {
      errors.push("Tahun harus antara 2000 - 2100");
    }
  }

  // Validasi semester
  if (data.semester !== "Ganjil" && data.semester !== "Genap") {
    errors.push("Semester harus 'Ganjil' atau 'Genap'");
  }

  // Validasi status
  if (data.status !== "active" && data.status !== "inactive") {
    errors.push("Status harus dipilih");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Konversi status untuk tampilan
 */
export function formatStatus(status: 'active' | 'inactive'): string {
  return status === 'active' ? 'Aktif' : 'Nonaktif';
}

/**
 * Parse error message dari API
 */
export function parseApiErrorMessage(error: any): string {
  let message = 'Terjadi kesalahan';

  if (error?.message) {
    if (error.message.includes('HTTP 409')) {
      message = "Periode ini sudah ada di sistem. Silakan pilih tahun dan semester lain.";
    } else if (error.message.includes('HTTP 400')) {
      message = "Data tidak valid. Pastikan tahun antara 2000–2100 dan semester benar.";
    } else {
      try {
        // Coba ekstrak pesan dari response JSON
        const text = error.message.split('HTTP ')[1]?.split(': ')[1] || '{}';
        const json = JSON.parse(text);
        if (json.errors?.message) {
          message = json.errors.message;
        } else if (json.message) {
          message = json.message;
        } else {
          message = error.message;
        }
      } catch {
        message = error.message;
      }
    }
  }

  return message;
}