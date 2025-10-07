// components/RoleBasedStatusCell.tsx
'use client';

import { useState, useEffect } from 'react';

interface RoleBasedStatusCellProps {
  status: string;
  id: number;
  roleId: number;
  onEdit?: (id: number) => void;
  onToggleStatus?: (id: number, action: 'activate' | 'deactivate') => void;
}

export default function RoleBasedStatusCell({
  status,
  id,
  roleId,
  onEdit,
  onToggleStatus,
}: RoleBasedStatusCellProps) {
 
  const normalizedStatus = (status || 'inactive').toLowerCase();

  if (roleId === 1 && onEdit && onToggleStatus) {
    return (
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onEdit(id)}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(id, normalizedStatus === 'active' ? 'deactivate' : 'activate')}
          className={`px-2 py-1 text-xs rounded text-white ${
            normalizedStatus === 'active'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {normalizedStatus === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>
    );
  }

  if ([2, 3, 4].includes(roleId)) {
    return (
      <span
        style={{
          backgroundColor: normalizedStatus === 'active' ? '#16a34a' : '#9ca3af',
          color: normalizedStatus === 'active' ? 'white' : '#1f2937',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {normalizedStatus === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  }

  // 👉 Role lain: tampilkan strip
  return <div className="text-center">-</div>;
}