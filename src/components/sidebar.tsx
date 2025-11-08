// components/sidebar.tsx
  "use client";

  import Image from "next/image";
  import { useState, useEffect, useMemo} from "react";
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
    Calendar,
    Building,      
  } from "lucide-react";
  import { useListBranch } from "@/hooks/useBranch";

  type NavItem = {
    name: string;
    path?: string;
    icon?: React.ReactNode;
    submenu?: NavItem[];
  };

  type SidebarProps = {
    onItemClick: (item: NavItem) => void;
  };

  export default function Sidebar({ onItemClick }: SidebarProps) {
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
    const [collapsed, setCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState<NavItem | null>(null);
    
    const [userData, setUserData] = useState<any>(null); // ← simpan semua data user
    const [roleId, setRoleId] = useState<number | null>(null);
    const { data: branchData, isLoading: isBranchLoading } = useListBranch(0);

  // Buat mapping branchId → nama
  const branchNames = useMemo(() => {
    if (!branchData?.data) return {};
    return branchData.data.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<number, string>);
  }, [branchData]);

    // Ambil roleId dari localStorage
    useEffect(() => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setUserData(parsed);           // ← simpan semua data
          setRoleId(Number(parsed.roleId)); // ← tetap butuh roleId untuk filter menu
        } catch (e) {
          console.error("Gagal baca user:", e);
        }
      }
    }, []);

    // Toggle submenu
    const toggleSubmenu = (name: string) => {
      const newOpenSubmenus = new Set(openSubmenus);
      if (newOpenSubmenus.has(name)) {
        newOpenSubmenus.delete(name);
      } else {
        newOpenSubmenus.add(name);
      }
      setOpenSubmenus(newOpenSubmenus);
    };

    const toggleCollapse = () => {
      setCollapsed((prev) => !prev);
      setOpenSubmenus(new Set());
    };

    // Tutup submenu saat klik luar
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
      }
    };

    // 💡 SEMUA NAV ITEMS — akan difilter berdasarkan role
    const allNavItems: NavItem[] = [
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
          {
            name: "Assessment Period",
            path: "periode",
            icon: <Calendar size={18} />,
          },
          {
            name: "UPPS/KC",
            path: "kampus-cabang",
            icon: <Building size={18} />,
          },
        ],
      },
      {
        name: "User Management",
        path: "user-management",
        icon: <Users size={20} />,
      },
    ];

    const filteredNavItems = allNavItems
  .map((item) => {
    // Filter submenu "Assessment Result"
    if (item.name === "Assessment Result" && item.submenu) {
      const filteredSubmenu = item.submenu.filter((subItem) => {
        if (subItem.name === "Approval Assessment") {
          return roleId === 1; // Hanya Super User
        }
        return true;
      });
      item = { ...item, submenu: filteredSubmenu };
    }

    // 🔥 Filter submenu "About TMA": sembunyikan "Assessment Period" dan "UPPS/KC" untuk kampus cabang (roleId === 2)
    if (item.name === "About TMA" && item.submenu) {
      const filteredSubmenu = item.submenu.filter((subItem) => {
        if (subItem.name === "Assessment Period" || subItem.name === "UPPS/KC") {
          return roleId !== 2; // Sembunyikan kedua menu ini jika roleId === 2
        }
        return true;
      });
      item = { ...item, submenu: filteredSubmenu };
    }
    
    // Filter item utama berdasarkan roleId
    if (roleId === 2) {
      return (
        item.name === "Home" ||
        item.name === "Start Assessment" ||
        item.name === "Assessment Result" ||
        item.name === "About TMA"
      ) ? item : null;
    }

    if (roleId === 4) {
      return (
        item.name === "Home" ||
        item.name === "Assessment Result" ||
        item.name === "About TMA"
      ) ? item : null;
    }

    if (roleId === 3) {
      return (item.name === "Home" || item.name === "About TMA") ? item : null;
    }

    return item;
  })
  .filter((item) => item !== null) as NavItem[];

  if (isBranchLoading) {
  return (
    <aside className={`relative ${collapsed ? "w-20" : "w-80"} h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out`}>
      <div className="px-6 py-8 flex items-center">
        {collapsed ? (
          <Image src="/Logo v1.png" alt="Logo Telkom University" width={40} height={40} priority />
        ) : (
          <Image src="/Logo.png" alt="Logo Telkom University" width={190} height={80} priority />
        )}
        <button onClick={toggleCollapse} className="ml-auto p-2 text-gray-500 hover:text-gray-700 transition">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Info — Loading */}
      <div className={`px-6 py-6 border-y flex items-center gap-4 ${collapsed ? "justify-center" : ""}`}>
        <Image src="/Logo (1).png" alt="User" width={40} height={40} className="rounded-full" />
        {!collapsed && (
          <div>
            <p className="font-semibold text-gray-800">Loading...</p>
            <p className="text-xs text-gray-500">Memuat data kampus...</p>
          </div>
        )}
      </div>

      {/* Navigation — Kosong sementara */}
      <nav className="flex-1 px-4 mt-4 text-sm font-medium">
        <div className="flex flex-col gap-1">
          <div className="w-full flex items-center px-4 py-3 rounded-lg text-black cursor-pointer select-none font-medium justify-between">
            <span>Loading menu...</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}

    return (
      <aside
        className={`relative ${collapsed ? "w-20" : "w-80"} h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out`}
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
        <div
          className={`px-6 py-6 border-y flex items-center gap-4 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Image
            src="/Logo (1).png"
            alt="User"
            width={40}
            height={40}
            className="rounded-full"
          />
          {!collapsed && userData && (
            <div>
              {/* Nama User */}
              <p className="font-semibold text-gray-800">
                {userData.fullname || userData.name || "User"}
              </p>

              {/* Nama Kampus Cabang */}
              <p className="text-xs text-gray-500">
                {branchNames[Number(userData.branchId)] 
                  ? branchNames[Number(userData.branchId)] 
                  : 'Kampus Tidak Diketahui'}
              </p>
            </div>
          )}

          {/* Fallback jika data tidak ada */}
          {!collapsed && !userData && (
            <div>
              <p className="font-semibold text-gray-800">User</p>
              <p className="text-xs text-gray-500">Kampus Tidak Diketahui</p>
            </div>
          )}
        </div>

        {/* Navigation — MASIH PAKAI SUBMENU */}
        <nav className="flex-1 px-4 mt-4 text-sm font-medium">
          <div className="flex flex-col gap-1">
            {filteredNavItems.map((item) => {
              const isActive = item.path && activeItem?.path === item.path;
              const isOpen = openSubmenus.has(item.name);

              return (
                <div key={item.name} className="relative">
                  {/* Main Item */}
                  <div
                    className={`w-full flex items-center px-4 py-3 rounded-lg 
                      text-black hover:bg-gradient-to-r hover:from-[#F34440] hover:to-[#818C9F] hover:text-white
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

                    {item.submenu && !collapsed && (
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        } ${isActive ? "text-white" : "text-gray-400"}`}
                      />
                    )}
                  </div>

                  {/* Submenu (expanded mode) */}
                  {item.submenu && isOpen && !collapsed && (
                    <div className="ml-4 mt-1 flex flex-col gap-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive =
                          subItem.path && activeItem?.path === subItem.path;
                        return (
                          <div
                            key={subItem.name}
                            className={`px-4 py-2 rounded-md cursor-pointer flex items-center
                              ${
                                isSubActive
                                  ? "bg-gradient-to-r from-red-500 to-gray-600 text-white"
                                  : "text-gray-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-gray-600 hover:text-white"
                              }
                            `}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(subItem);
                            }}
                          >
                            <span className="mr-2">{subItem.icon}</span>
                            {subItem.name}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submenu (collapsed mode → floating) */}
                  {item.submenu && isOpen && collapsed && (
                    <div
                      className="absolute left-full top-0 ml-2 w-56 bg-white shadow-lg rounded-lg border p-2 z-50"
                    >
                      {item.submenu.map((subItem) => {
                        const isSubActive =
                          subItem.path && activeItem?.path === subItem.path;
                        return (
                          <div
                            key={subItem.name}
                            className={`px-3 py-2 rounded-md cursor-pointer flex items-center
                              ${
                                isSubActive
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