// app/assessment/Jakarta/page.tsx
import { Suspense } from 'react';
import PurwokertoTab from '@/components/PengsisianAssessment';

export default function PurwokertoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurwokertoTab  />
    </Suspense>
  );
}