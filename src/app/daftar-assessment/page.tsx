import { Suspense } from "react";
import Container from "@/components/Container";
import Daftarassessmentpage from "./Daftarassessmentpage";

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<div>Loading...</div>}>
        <Daftarassessmentpage />
      </Suspense>
    </Container>
  );
}