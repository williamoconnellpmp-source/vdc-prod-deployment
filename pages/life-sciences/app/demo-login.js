import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy route shim for /life-sciences/app/demo-login
 *
 * This page now immediately redirects to the new login entry point at
 * /life-sciences/app/login, preserving any existing `returnTo` query param.
 *
 * Safe to remove once all bookmarks / docs use /login directly.
 */
export default function DemoLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { returnTo, ...rest } = router.query || {};
    const query = new URLSearchParams();

    if (typeof returnTo === "string" && returnTo.trim()) {
      query.set("returnTo", returnTo);
    }

    // Preserve any other query params defensively
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === "string") {
        query.set(key, value);
      }
    });

    const qs = query.toString();
    const target = `/life-sciences/app/login${qs ? `?${qs}` : ""}`;

    router.replace(target);
  }, [router]);

  return null;
}

