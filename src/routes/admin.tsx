import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/itf-logo.asset.json";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, loading, signOut } = useAuth();

  // Public admin pages
  const isPublic = path === "/admin/login" || path === "/admin/forgot" || path === "/admin/reset";
  if (isPublic) return <Outlet />;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-itf-ink/60 text-sm">Loading…</div>;

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-itf-canvas">
        <div className="max-w-md p-8 bg-white rounded-lg shadow border border-itf-rule text-center">
          <img src={logo.url} className="w-14 h-14 mx-auto rounded-full" />
          <h1 className="mt-4 text-lg font-bold text-itf-green">Access Denied</h1>
          <p className="text-sm text-itf-ink/70 mt-2">Your account is not authorised for the admin panel.</p>
          <button onClick={signOut} className="mt-4 text-sm text-itf-red font-semibold">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-itf-canvas text-itf-ink">
      <header className="bg-itf-green text-white border-b-4 border-itf-gold">
        <div className="flex items-center gap-4 px-6 py-3">
          <img src={logo.url} className="h-12 w-12 rounded-full bg-white p-0.5" />
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.18em] uppercase text-itf-gold/90">Administrator Console</div>
            <div className="text-lg font-semibold">ITF Corporate Scorecard — Data Management</div>
          </div>
          <Link to="/" className="text-[11px] rounded bg-white/10 border border-white/20 px-3 py-1.5 hover:bg-white/20">↩ Back to Dashboard</Link>
          <button onClick={signOut} className="text-[11px] rounded bg-itf-red px-3 py-1.5 font-semibold hover:bg-itf-red/90">Sign out</button>
        </div>
      </header>
      <main className="px-6 py-6 max-w-[1400px] mx-auto"><Outlet /></main>
    </div>
  );
}
