"use client";

import { Bell, FileText } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

// --- Tipe untuk Notifikasi ---
interface Notification {
  id: string | number;
  title: string;
  description: string;
  timeAgo: string;
}

interface UserIconWithBadgeProps {
  notifications: Notification[]; // Ganti `count` dengan array notifikasi
  className?: string;
}

export default function UserIconWithBadge({
  notifications = [],
  className,
}: UserIconWithBadgeProps) {
  const hasNotifications = notifications.length > 0;
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Ikon Bell */}
      <div
        className={clsx(
          "inline-flex items-center justify-center border border-gray-300 rounded-md p-2 bg-white hover:bg-gray-50 cursor-pointer",
          "relative",
          className
        )}
        onClick={() => setShowNotifications(true)}
      >
        <Bell className="w-5 h-5 text-gray-700" />

        {/* Badge Jumlah Notifikasi */}
        {hasNotifications && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-500 rounded-full -mr-1 -mt-1">
            {notifications.length}
          </span>
        )}
      </div>

      {/* Dropdown Notifikasi */}
      {showNotifications && (
        <div
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{ minWidth: "540px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Notifikasi</h2>
          </div>

          {/* Daftar Notifikasi */}
          <div className="p-4 space-y-4">
            {hasNotifications ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{notif.title}</h3>
                      <p className="text-xs text-gray-500">{notif.timeAgo}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notif.description}</p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-col mt-2 space-y-2">
                    <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none">
                      Tolak
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 border border-green-300 rounded hover:bg-green-200 focus:outline-none">
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Tidak ada notifikasi</p>
            )}
          </div>

          {/* Tombol Tutup */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              onClick={() => setShowNotifications(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Overlay untuk tutup saat klik di luar */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}