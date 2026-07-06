import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login · ITF Scorecard" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("admincpd@itf.gov.ng");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const { error } = await signIn(email, password, remember);
    setLoading(false);
    if (error) setError(error);
    else nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-itf-canvas">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-itf-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#D4A017,transparent_60%)]" />
        <div className="relative">
          <img src='/itf-logo.jpeg' className="w-16 h-16 rounded-full bg-white p-1" />
          <div className="mt-8 text-[11px] tracking-[0.22em] uppercase text-itf-gold">Industrial Training Fund</div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">Corporate Scorecard<br />Administrator Console</h1>
          <p className="mt-4 text-sm text-white/80 max-w-md">
            Secure access for the Corporate Planning Department to manage yearly performance data, revenue,
            training, HR and area-office metrics powering the executive dashboard.
          </p>
        </div>
        <div className="relative text-[11px] text-white/70">
          © Federal Government of Nigeria · Industrial Training Fund
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-itf-rule shadow-sm p-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src='/itf-logo.jpeg' className="w-10 h-10 rounded-full" />
            <div>
              <div className="text-[10px] tracking-widest uppercase text-itf-ink/60">ITF</div>
              <div className="font-semibold text-itf-green">Admin Sign In</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-itf-ink">Welcome back</h2>
          <p className="text-sm text-itf-ink/60 mt-1">Sign in to manage the scorecard data.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-itf-ink/70">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-itf-rule px-3 py-2 text-sm focus:border-itf-green focus:outline-none focus:ring-2 focus:ring-itf-green/20" />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-itf-ink/70">Password</label>
                <Link to="/admin/forgot" className="text-[11px] text-itf-green hover:underline">Forgot password?</Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-itf-rule px-3 py-2 text-sm focus:border-itf-green focus:outline-none focus:ring-2 focus:ring-itf-green/20" />
            </div>
            <label className="flex items-center gap-2 text-xs text-itf-ink/70">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-itf-rule" />
              Remember me on this device
            </label>
            {error && <div className="text-xs text-itf-red bg-itf-red/5 border border-itf-red/20 rounded p-2">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-itf-green text-white py-2.5 text-sm font-semibold hover:bg-itf-green/90 disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-[11px] text-itf-ink/50 text-center">
            Protected area · Authorised personnel only
          </div>
        </div>
      </div>
    </div>
  );
}
