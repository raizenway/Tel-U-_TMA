export async function getAssessmentResult(branchId: number, periodId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/assessment/result?branchId=${branchId}&periodId=${periodId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch assessment result: ${res.status}`);
  }

  return res.json();
}
