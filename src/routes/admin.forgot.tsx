import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/forgot")({
  component: ForgotPage,
});

function ForgotPage() {
  const { sendReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await sendReset(email);
    if (error) setError(error);
    else setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-itf-canvas p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-itf-rule p-8">
        <img src='/itf-logo.jpeg' className="w-12 h-12 rounded-full" />
        <h1 className="mt-4 text-lg font-bold text-itf-green">Reset your password</h1>
        {sent ? (
          <p className="mt-3 text-sm text-itf-ink/70">If an account exists for <b>{email}</b>, a reset link has been sent.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@itf.gov.ng"
              className="w-full rounded-md border border-itf-rule px-3 py-2 text-sm focus:border-itf-green focus:outline-none focus:ring-2 focus:ring-itf-green/20" />
            {error && <div className="text-xs text-itf-red">{error}</div>}
            <button className="w-full rounded-md bg-itf-green text-white py-2.5 text-sm font-semibold">Send reset link</button>
          </form>
        )}
        <Link to="/admin/login" className="mt-4 inline-block text-xs text-itf-green hover:underline">← Back to sign in</Link>
      </div>
    </div>
  );
}
