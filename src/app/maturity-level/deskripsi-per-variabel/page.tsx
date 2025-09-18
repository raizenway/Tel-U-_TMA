import { Suspense } from "react";
import Container from "@/components/Container";
import DeskripsiVariabelTable from "./DeskripsiPerVariable";

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<div>Loading...</div>}>
        <DeskripsiVariabelTable />
      </Suspense>
    </Container>
  );
}
