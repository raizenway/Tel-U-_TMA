"use client";

import Image from "next/image";
import Button from "@/components/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type SidebarProps = {
  navItems: { name: string; value?: string; action?: () => void }[];
  setTab: (tab: string) => void;
};

export default function Sidebar({ navItems, setTab }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="w-80 bg-white border-r flex flex-col shadow-md min-h-screen">
      {/* Logo */}
      <div className="px-6 py-8">
        <Image
          src="/Logo.png"
          alt="Logo Telkom University"
          width={190}
          height={80}
          priority
        />
      </div>

      {/* User Info */}
      <div className="px-6 py-6 border-y flex items-center gap-4">
        <Image
          src="/user-icon.png"
          alt="User"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div>
          <p className="font-semibold text-gray-700">Wilson Curtis</p>
          <p className="text-sm text-gray-500">012345678</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 mt-4 space-y-2 text-sm font-medium">
        <div className="flex flex-col gap-4">
          {navItems
            .filter((item) => item.value !== "dashboard") // 👈 HILANGKAN DASHBOARD
            .map(({ name, value, action }) => (
              <Button
                key={name}
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600"
                onClick={() => (action ? action() : setTab(value || ""))}
              >
                {name}
              </Button>
            ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-6 py-4 border-t">
        <Button
          variant="ghost"
          className="text-red-600 font-semibold gap-2 w-full justify-start"
          onClick={() => router.push("/login")}
        >
          <LogOut size={16} />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
