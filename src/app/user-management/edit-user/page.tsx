import { Suspense } from "react";
import EditUser from "./EditUser";
import ContainerForm from "@/components/ContainerForm";

export default function Page() {
  return (
    <ContainerForm>
    <Suspense fallback={<div>Loading...</div>}>
      <EditUser />
    </Suspense>
    </ContainerForm>
  );
}