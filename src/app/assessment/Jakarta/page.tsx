// app/assessment/Jakarta/page.tsx
import { Suspense } from 'react';
import AssessmentFormTab from '@/components/PengsisianAssessment';

export default function JakartaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentFormTab /> {/* ✅ Tidak ada prop fungsi */}
    </Suspense>
  );
}