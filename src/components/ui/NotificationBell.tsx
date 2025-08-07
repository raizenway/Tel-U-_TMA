'use client';

import { Bell } from 'lucide-react';
import React from 'react';

const NotificationBell = () => {
  const unreadCount = 3; // dummy, bisa 0

  return (
    <div className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-gray-300 bg-white shadow-sm">
      <Bell className="w-6 h-6 text-black" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
