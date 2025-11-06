// app/assessment/Jakarta/page.tsx
import { Suspense } from 'react';
import PurwokertoTab from '@/app/assessment/AssessmentFormTab';

export default function PurwokertoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurwokertoTab  />
    </Suspense>
  );
}