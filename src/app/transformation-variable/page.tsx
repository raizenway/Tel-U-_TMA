import { Suspense } from "react";
import Container from "@/components/Container";
import Transformationvariablepage from "./Transformationvariablepage";

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<div>Loading...</div>}>
        <Transformationvariablepage />
      </Suspense>
    </Container>
  );
}