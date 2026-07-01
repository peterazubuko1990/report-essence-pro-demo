import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/itf-logo.asset.json";

export const Route = createFileRoute("/admin/reset")({
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => nav({ to: "/admin" }), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-itf-canvas p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-itf-rule p-8">
        <img src={logo.url} className="w-12 h-12 rounded-full" />
        <h1 className="mt-4 text-lg font-bold text-itf-green">Choose a new password</h1>
        {done ? (
          <p className="mt-3 text-sm text-itf-ink/70">Password updated. Redirecting…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md border border-itf-rule px-3 py-2 text-sm" />
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-md border border-itf-rule px-3 py-2 text-sm" />
            {error && <div className="text-xs text-itf-red">{error}</div>}
            <button className="w-full rounded-md bg-itf-green text-white py-2.5 text-sm font-semibold">Update password</button>
          </form>
        )}
      </div>
    </div>
  );
}
