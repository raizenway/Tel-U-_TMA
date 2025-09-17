import { Suspense } from "react";
import AddUserPage from "./AddUserPage";
import ContainerForm from "@/components/ContainerForm";


export default function Page() {
  return (
    <ContainerForm>
    <Suspense fallback={<div>Loading...</div>}>
      <AddUserPage />
    </Suspense>
    </ContainerForm>
  );
}
