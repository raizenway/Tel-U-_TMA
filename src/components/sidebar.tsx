"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";

// Hapus import Button jika kita ganti dengan div
// import Button from "@/components/button";

type NavItem = {
  name: string;
  value?: string;
  path?: string;
  action?: () => void;
  icon?: React.ReactNode;
  submenu?: NavItem[];
};

type SidebarProps = {
  onItemClick: (item: NavItem) => void;
};

export default function Sidebar({ onItemClick }: SidebarProps) {
  const router = useRouter();
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems: NavItem[] = [
    {
      name: "Home",
      path: "welcome",
      icon: <span className="mr-2 text-lg">🏠</span>,
    },
    {
      name: "Start Assessment",
      path: "assessment",
      icon: <span className="mr-2 text-lg">📝</span>,
    },
    {
      name: "Assessment Result",
      path: "table",
      icon: <span className="mr-2 text-lg">📊</span>,
      submenu: [{ name: "Approval Assessment", path: "approval-assessment" }],
    },
    {
      name: "About TMA",
      icon: <span className="mr-2 text-lg">📘</span>,
      submenu: [{ name: "Daftar Assessment", path: "daftar-assessment" }],
    },
    {
      name: "User Management",
      path: "user-management",
      icon: <span className="mr-2 text-lg">👥</span>,
    },
  ];

  return (
    <aside className="w-80 min-h-screen bg-white border-r shadow-md flex flex-col transition-all duration-300">
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
          <p className="font-semibold text-gray-800">Wilson Curtis</p>
          <p className="text-sm text-gray-500">012345678</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 text-sm font-medium">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isOpen = openSubmenus[item.name];
            return (
              <div key={item.name} className="transition-all duration-200">
                {/* Tombol Navigasi */}
                <div
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 
                    hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600
                    transition-all duration-300 ease-in-out transform hover:scale-[1.01]
                    cursor-pointer select-none
                  `}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.name);
                    } else {
                      onItemClick(item);
                    }
                  }}
                >
                  <span className="flex items-center">
                    {item.icon} {item.name}
                  </span>
                  {item.submenu && (
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 ease-in-out ${
                        isOpen ? "rotate-180" : "rotate-0"
                      } mr-2`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && isOpen && (
                  <div
                    className="ml-4 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "200px" : "0",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    {item.submenu.map((subItem) => (
                      <div
                        key={subItem.name}
                        className="w-full flex items-center justify-start px-4 py-2 text-gray-600 
                          hover:text-white  hover:bg-gradient-to-r from-red-500 to-gray-600 rounded-md transition-all duration-200
                          cursor-pointer select-none"
                        onClick={() => onItemClick(subItem)}
                      >
                        <span className="mr-2">📋</span>
                        {subItem.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-6 py-4 border-t">
        <div
          className="w-full flex items-center justify-start gap-3 px-4 py-3 text-red-600 font-semibold 
            hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200
            cursor-pointer"
          onClick={() => router.push("/login")}
        >
          <LogOut size={18} />
          Keluar
        </div>
      </div>
    </aside>
  );
}