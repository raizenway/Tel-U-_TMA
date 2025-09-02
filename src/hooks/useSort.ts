import { useState, useMemo } from "react";

type Direction = "asc" | "desc";

interface SortConfig<T> {
  key: keyof T;
  direction: Direction;
}

export function useSort<T>(data: T[], defaultKey?: keyof T) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    defaultKey ? { key: defaultKey, direction: "asc" } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sortableData = [...data];
    sortableData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || bVal === undefined) return 0;

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: Direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { sortedData, sortConfig, requestSort };
}
