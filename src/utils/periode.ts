// normalisasi label semester
export function mapSemesterLabel(semester: string, year: number): string {
  if (!semester) return "";
  const s = semester.toLowerCase();

  if (s.includes("even") || s.includes("genap")) return `Genap ${year}`;
  if (s.includes("odd") || s.includes("ganjil")) return `Ganjil ${year}`;

  return `${semester} ${year}`; // fallback
}

export function getPeriodeLabel(value: string): string {
  return value;
}

// generate list periode unik dari assessments
export function generatePeriodeOptions(assessments: { submitPeriode: string }[]): string[] {
  const set = new Set<string>();
  assessments.forEach((a) => {
    if (a.submitPeriode) set.add(a.submitPeriode);
  });

  // urutkan: tahun terbaru dulu
  return Array.from(set).sort((a, b) => {
    const [semA, yearA] = a.split(" ");
    const [semB, yearB] = b.split(" ");
    if (yearA !== yearB) return Number(yearB) - Number(yearA);
    // urutkan Genap dulu baru Ganjil dalam tahun yang sama
    if (semA === "Genap" && semB === "Ganjil") return -1;
    if (semA === "Ganjil" && semB === "Genap") return 1;
    return 0;
  });
}
