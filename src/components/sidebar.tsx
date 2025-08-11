// components/sidebar.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  ChartLine,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Info,
} from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    if (!collapsed) {
      setOpenSubmenus({});
    }
  };

  const navItems: NavItem[] = [
    {
      name: "Home",
      path: "welcome",
      icon: <Home size={20} className="text-gray-700" />,
    },
    {
      name: "Start Assessment",
      path: "assessment",
      icon: <FileText size={20} className="text-gray-700" />,
    },
    {
      name: "Assessment Result",
      path: "table",
      icon: <ChartLine size={20} className="text-gray-700" />,
      submenu: [
        {
          name: "Approval Assessment",
          path: "table",
          icon: <ClipboardList size={18} className="text-gray-600" />,
        },
      ],
    },
    {
      name: "About TMA",
      icon: <Info size={20} className="text-gray-700" />,
      submenu: [
        {
          name: "Daftar Assessment",
          path: "daftar-assessment",
          icon: <ClipboardList size={18} className="text-gray-600" />,
        },
        {
          name: "Maturity Level",
          path: "maturity-level",
          icon: <ChartLine size={18} className="text-gray-600" />,
        },
        {
          name: "Transformation Variable",
          path: "transformation-variable",
          icon: <BookOpen size={18} className="text-gray-600" />,
        },
      ],
    },
    {
      name: "User Management",
      path: "user-management",
      icon: <Users size={20} className="text-gray-700" />,
    },
  ];

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-80"} h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="px-6 py-8 flex items-center">
        <Image
          src="/Logo.png"
          alt="Logo Telkom University"
          width={collapsed ? 40 : 190}
          height={80}
          priority
        />
        <button
          onClick={toggleCollapse}
          className="ml-auto p-2 text-gray-500 hover:text-gray-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Info */}
      <div className={`px-6 py-6 border-y flex items-center gap-4 ${collapsed ? "justify-center" : ""}`}>
        <Image
          src="/Logo (1).png"
          alt="User"
          width={40}
          height={40}
          className="rounded-full"
        />
        {!collapsed && (
          <div>
            <p className="font-semibold text-gray-800">Wilson</p>
            <p className="text-xs text-gray-500">012345678</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 text-sm font-medium">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isOpen = openSubmenus[item.name];
            return (
              <div key={item.name} className="transition-all duration-200">
                {/* Main Item */}
                <div
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg 
                    text-black hover:bg-gradient-to-r from-[#F34440] to-[#818C9F]
                    transition-all duration-300 ease-in-out cursor-pointer select-none font-medium
                    ${collapsed ? "justify-center" : "justify-between"}
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
                    {item.icon}
                    {!collapsed && <span className="ml-2">{item.name}</span>}
                  </span>

                  {/* Chevron hanya muncul jika tidak collapsed */}
                  {item.submenu && !collapsed && (
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && isOpen && !collapsed && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {item.submenu.map((subItem) => (
                      <div
                        key={subItem.name}
                        className="px-4 py-2 text-gray-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-gray-600 rounded-md cursor-pointer flex items-center"
                        onClick={() => onItemClick(subItem)}
                      >
                        <span className="mr-2">{subItem.icon}</span>
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
          className="flex items-center gap-3 px-4 py-3 text-red-600 font-semibold hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition"
          onClick={() => router.push("/login")}
        >
          <LogOut size={18} />
          {!collapsed && <span>Keluar</span>}
        </div>
      </div>
    </aside>
  );
}