export function getPeriodeLabel(periode: string): string {
  if (periode.includes("Genap")) return `Semester Genap ${periode.replace("Genap ", "")}`;
  if (periode.includes("Ganjil")) return `Semester Ganjil ${periode.replace("Ganjil ", "")}`;
  return periode;
}
