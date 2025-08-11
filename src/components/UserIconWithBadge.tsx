"use client";

import { Bell } from "lucide-react";
import clsx from "clsx";

interface UserIconWithBadgeProps {
  count?: number;
  className?: string;
}

export default function UserIconWithBadge({
  count = 0,
  className,
}: UserIconWithBadgeProps) {
  const hasCount = count > 0;

  return (
    <div
      className={clsx(
        // border + rounded + padding seperti contoh
        "relative inline-flex items-center justify-center border border-gray-300 rounded-md p-2 bg-white hover:bg-gray-50 cursor-pointer",
        className
      )}
    >
      {/* Ikon Lonceng */}
      <Bell className="w-5 h-5 text-gray-700" />

      {/* Badge */}
      {hasCount && (
        <span
          className={clsx(
            "absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-500 rounded-full",
            "-mr-1 -mt-1"
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}
