import { Suspense } from "react";
import MaturityLevelPage from "./MaturityLevelPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaturityLevelPage />
    </Suspense>
  );
}
