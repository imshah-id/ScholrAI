"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip check on onboarding itself (though this guard is for dashboard layout)
    if (pathname.startsWith("/onboarding")) {
      setLoading(false);
      return;
    }

    fetch("/api/user/me")
      .then((res) => {
        if (res.status === 401) {
          // Not logged in
          router.push("/login"); // or let middleware handle it
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          // Check if profile is actually completed
          // currentStage should not be "PROFILE" (which is the default from signup)
          // Also check that essential fields are filled
          const isProfileIncomplete =
            !data.currentStage ||
            data.currentStage === "PROFILE" ||
            !data.gpa ||
            !data.budget ||
            !data.preferredCountries ||
            data.preferredCountries === "" ||
            data.preferredCountries === "[]";

          if (isProfileIncomplete) {
            console.log(
              "Profile incomplete (stage:",
              data.currentStage,
              "), redirecting to onboarding...",
            );
            router.push("/onboarding");
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
