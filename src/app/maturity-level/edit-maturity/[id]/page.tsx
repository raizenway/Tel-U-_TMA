import { Suspense } from "react";
import EditMaturityPage from "./EditMaturityPage";
import Container from "@/components/Container";

export default function Page() {
  return (
    <Container>
    <Suspense fallback={<div>Loading...</div>}>
      <EditMaturityPage />
    </Suspense>
    </Container>
  );
}

