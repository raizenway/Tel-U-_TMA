"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Button  from "@/components/button";
import { UserCircle, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          <span>Akun</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="z-50 min-w-[10rem] p-1 text-sm shadow-lg bg-white border rounded-md">
        <DropdownMenuItem onClick={() => alert("Lihat Profil")}>Profil</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            alert("Keluar akun");
            router.push("/login");
          }}
        >
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
