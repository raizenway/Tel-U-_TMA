import { Suspense } from "react";
import AddUserPage from "./AddUserPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddUserPage />
    </Suspense>
  );
}
