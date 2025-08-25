import { Suspense } from "react";
import EditMaturityPage from "./EditMaturityPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditMaturityPage />
    </Suspense>
  );
}
