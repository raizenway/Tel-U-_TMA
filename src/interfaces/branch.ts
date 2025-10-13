// src/constants/branches.ts

export const BRANCHES = [
  { id: 1, name: 'Telkom University Bandung' },
  { id: 2, name: 'Telkom University Jakarta' },
  { id: 3, name: 'Telkom University Surabaya' },
  { id: 4, name: 'Telkom University Purwokerto' },

  // Tambahkan cabang baru di sini
  // { id: 5, name: 'Telkom University Bali' },
] as const; // `as const` biar TypeScript tau datanya tetap

// Untuk mapping cepat: id → name
export const BRANCH_NAMES: Record<number, string> = BRANCHES.reduce((acc, branch) => {
  acc[branch.id] = branch.name;
  return acc;
}, {} as Record<number, string>);