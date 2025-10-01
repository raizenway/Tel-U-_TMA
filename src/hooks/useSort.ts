import { useState, useMemo } from "react";

type Direction = "asc" | "desc";

// Hanya terima key yang string
interface SortConfig {
  key: string;
  direction: Direction;
}

export function useSort<T extends Record<string, any>>(
  data: T[],
  defaultKey?: string
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultKey ? { key: defaultKey, direction: "asc" } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sortableData = [...data];
    sortableData.sort((a, b) => {
      // Pastikan key ada di objek
      if (!(sortConfig.key in a) || !(sortConfig.key in b)) return 0;

      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      if (aVal === undefined || bVal === undefined) return 0;

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: Direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { sortedData, sortConfig, requestSort };
}