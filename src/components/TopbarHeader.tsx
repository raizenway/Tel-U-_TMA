"use client";

import { Globe, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TopbarHeader() {
  return (
    <div className="bg-white rounded-lg shadow-sm px-6 py-3 flex items-center justify-between border">
      {/* Title */}
      <h1 className="text-sm font-bold tracking-wide text-gray-800 uppercase">
        TRANSFORMATION MATURITY ASSESSMENT DASHBOARD
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 border border-red-500 text-red-500 text-sm px-2 py-1 rounded-md">
              <Globe className="w-4 h-4" />
              IND
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50 bg-white border p-1 text-sm shadow">
            <DropdownMenuItem>IND</DropdownMenuItem>
            <DropdownMenuItem>ENG</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Icon */}
        <div className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
