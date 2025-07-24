"use client";

import { useState } from "react";
import clsx from "clsx";

export default function DashboardMenu({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}) {
  const menu = [
    { name: "Welcome", id: "welcome" },
    { name: "Dashboard", id: "dashboard" },
    { name: "User Manual", id: "user-manual" },
  ];

  return (
    <div className="flex space-x-6 border-b border-gray-300 px-6 pt-6 bg-white">
      {menu.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelectedTab(item.id)}
          className={clsx(
            "pb-2 font-semibold transition",
            selectedTab === item.id
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-700 hover:text-red-600"
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
