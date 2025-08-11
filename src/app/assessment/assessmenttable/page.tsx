// app/page.js
"use client";
import AssessmentTable from '@/components/AssessmentTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <AssessmentTable />
    </main>
  );
}