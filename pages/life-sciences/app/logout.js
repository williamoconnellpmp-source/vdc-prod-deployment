import { useEffect } from "react";
import { useRouter } from "next/router";
import { logout } from "@/lib/life_sciences_app_lib/auth";

/**
 * Hard logout page
 *
 * - Clears local tokens / demo state
 * - Calls Cognito Hosted UI logout (via auth.logout)
 * - Returns user to /life-sciences/app/login?force=true
 *
 * Safe for PROD: logout() already uses CONFIG.logoutUri which must
 * be registered in the Cognito App Client.
 */
export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger the shared logout flow as soon as the page mounts
    logout(router);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #050b14 0%, #071427 55%, #061326 100%)",
        color: "#fff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(10,20,40,0.7)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.15rem",
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          Signing you out…
        </div>
        <div
          style={{
            fontSize: "0.95rem",
            opacity: 0.9,
          }}
        >
          Closing your VDC demo session and clearing Cognito login. You&apos;ll
          be returned to the login screen in a moment.
        </div>
      </div>
    </div>
  );
}

