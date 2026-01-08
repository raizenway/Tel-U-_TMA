"use client";

import Image from "next/image";
import Button from "@/components/button";
import { ArrowRight } from "lucide-react";
import { useListBranch } from "@/hooks/useBranch";
import { useEffect, useMemo } from "react";

interface AssessmentSelectorProps {
  onSelectCampus: (branchId: number, branchName: string) => void;
  userBranchId?: number | null;
  userRoleId?: number | null;
}

export default function AssessmentSelector({
  onSelectCampus,
  userBranchId,
  userRoleId,
}: AssessmentSelectorProps) {
  const { data: branchData, isLoading, error } = useListBranch(0);

  // Filter cabang berdasarkan role user
  const branchesToShow = useMemo(() => {
    if (!branchData?.data) return [];

    const allBranches = branchData.data;

    if (userRoleId === 1) {
      return allBranches; // Admin: tampilkan semua
    }

    if (userBranchId) {
      return allBranches.filter((branch: any) => branch.id === userBranchId);
    }

    return [];
  }, [branchData, userRoleId, userBranchId]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-[450px] h-[320px] bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Gagal memuat daftar kampus.</div>;
  }

  if (branchesToShow.length === 0) {
    return <div className="p-6 text-gray-500">Tidak ada kampus yang tersedia.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray min-h-screen">
      <div className="mt-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          {branchesToShow.map((branch: any) => (
            <div
              key={branch.id}
              className="w-[450px] h-[320px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-full h-auto flex justify-center">
                <Image
                  src="/image 2.png"
                  alt={branch.name}
                  width={243}
                  height={107}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onSelectCampus(branch.id, branch.name)}
              >
                Pilih 
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}