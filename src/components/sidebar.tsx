// components/sidebar.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  ChartLine,
  BookOpen,
  Users,
  FileText,
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
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItem | null>(null);

  // Toggle submenu: buka/tutup saat diklik
  const toggleSubmenu = (name: string) => {
    const newOpenSubmenus = new Set(openSubmenus);
    if (newOpenSubmenus.has(name)) {
      newOpenSubmenus.delete(name); // klik lagi → tutup
    } else {
      newOpenSubmenus.add(name);   // buka
    }
    setOpenSubmenus(newOpenSubmenus);
  };

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setOpenSubmenus(new Set()); // Tutup semua submenu saat collapse/expand
  };

  // Tutup semua submenu saat klik di luar sidebar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector("aside");
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setOpenSubmenus(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: NavItem) => {
    if (item.path) {
      setActiveItem(item);
      onItemClick(item);
      setOpenSubmenus(new Set()); // Opsional: tutup semua submenu setelah pilih item
    }
  };

  const navItems: NavItem[] = [
    {
      name: "Home",
      path: "welcome",
      icon: <Home size={20} />,
    },
    {
      name: "Start Assessment",
      path: "assessment",
      icon: <FileText size={20} />,
    },
    {
      name: "Assessment Result",
      icon: <ChartLine size={20} />,
      submenu: [
        {
          name: "Approval Assessment",
          path: "approval",
          icon: <ClipboardList size={18} className="text-gray-600" />,
        },
        {
          name: "Assessment Result",
          path: "assessment-result",
          icon: <ChartLine size={18} className="text-gray-600" />,
        },
      ],
    },
    {
      name: "About TMA",
      icon: <Info size={20} />,
      submenu: [
        {
          name: "Daftar Assessment",
          path: "daftar-assessment",
          icon: <ClipboardList size={18} />,
        },
        {
          name: "Maturity Level",
          path: "maturity-level",
          icon: <ChartLine size={18} />,
        },
        {
          name: "Transformation Variable",
          path: "transformation-variable",
          icon: <BookOpen size={18} />,
        },
      ],
    },
    {
      name: "User Management",
      path: "user-management",
      icon: <Users size={20} />,
    },
  ];

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-80"} h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="px-6 py-8 flex items-center">
        {collapsed ? (
          <Image
            src="/Logo v1.png"
            alt="Logo Telkom University"
            width={40}
            height={40}
            priority
          />
        ) : (
          <Image
            src="/Logo.png"
            alt="Logo Telkom University"
            width={190}
            height={80}
            priority
          />
        )}
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
            const isActive = item.path && activeItem?.path === item.path;
            const isOpen = openSubmenus.has(item.name);

            return (
              <div key={item.name} className="transition-all duration-200">
                {/* Main Item */}
                <div
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg 
                    text-black 
                    hover:bg-gradient-to-r hover:from-[#F34440] hover:to-[#818C9F] hover:text-white
                    ${isActive ? "bg-gradient-to-r from-[#F34440] to-[#818C9F] text-white" : ""}
                    transition-all duration-300 ease-in-out cursor-pointer select-none font-medium
                    ${collapsed ? "justify-center" : "justify-between"}
                  `}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.name);
                    } else {
                      handleItemClick(item);
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
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      } ${isActive ? "text-white" : "text-gray-400"}`}
                    />
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && isOpen && !collapsed && (
                  <div className="ml-4 mt-1 flex flex-col gap-1">
                    {item.submenu.map((subItem) => {
                      const isSubActive = subItem.path && activeItem?.path === subItem.path;
                      return (
                        <div
                          key={subItem.name}
                          className={`
                            px-4 py-2 rounded-md cursor-pointer flex items-center
                            ${isSubActive
                              ? "bg-gradient-to-r from-red-500 to-gray-600 text-white"
                              : "text-gray-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-600 hover:text-white"
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(subItem);
                          }}
                        >
                          {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                          {subItem.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}