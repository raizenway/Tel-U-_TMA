"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useBlockNavigation(isFormDirty: boolean, onNavigateAttempt: () => void) {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = ""; // required for some browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const originalPush = router.push;

    router.push = ((...args: Parameters<typeof router.push>) => {
      if (isFormDirty) {
        onNavigateAttempt();
        return;
      }
      originalPush(...args);
    }) as typeof router.push;

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.push = originalPush;
    };
  }, [isFormDirty, onNavigateAttempt, router]);
}
