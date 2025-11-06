// src/app/assessment/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import AssessmentFormTab from "@/app/assessment/AssessmentFormTab";

export default function AssessmentWrapper() {
  const params = useParams();
  const branchId = parseInt(params.id as string, 10);

  if (isNaN(branchId) || branchId <= 0) {
    return <div className="p-10 text-red-600">ID cabang tidak valid</div>;
  }

  return <AssessmentFormTab />;
}