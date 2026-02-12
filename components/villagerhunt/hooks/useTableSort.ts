import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'value';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface SortableItem {
  name: string;
  value: number;
}

/**
 * Hook for managing table sorting in statistics views
 */
export function useTableSort<T extends SortableItem>(
  data: T[],
  defaultField: SortField = 'value',
  defaultDirection: SortDirection = 'desc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: defaultField,
    direction: defaultDirection,
  });

  const sortedData = useMemo(() => {
    const sorted = [...data];
    
    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortConfig.field === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = a.value;
        bVal = b.value;
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
}
