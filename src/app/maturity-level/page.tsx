import { Suspense } from "react";
import Container from "@/components/Container";
import MaturityLevelPage from "./MaturityLevelPage";

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<div>Loading...</div>}>
        <MaturityLevelPage />
      </Suspense>
    </Container>
  );
}
