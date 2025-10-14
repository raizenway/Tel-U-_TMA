// app/assessment/Jakarta/page.tsx
import { Suspense } from 'react';
import PurwokertoTab from '@/components/PengsisianAssessment';

export default function BandungPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurwokertoTab  />
    </Suspense>
  );
}