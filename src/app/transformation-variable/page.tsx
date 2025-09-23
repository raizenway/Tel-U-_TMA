
import Container from "@/components/Container";
import TransformationVariablePage from "./TransformationVariablePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<div>Loading...</div>}>
        <TransformationVariablePage />
      </Suspense>
    </Container>
  );
}