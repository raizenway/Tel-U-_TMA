import { Suspense } from "react";
import EditUser from "./EditUser";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditUser />
    </Suspense>
  );
}