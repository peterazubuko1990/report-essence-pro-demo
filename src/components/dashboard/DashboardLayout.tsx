import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/itf-logo.asset.json";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Executive Overview" },
  { to: "/performance", label: "Corporate Performance" },
  { to: "/training", label: "Training Analysis" },
  { to: "/revenue", label: "Revenue Analysis" },
  { to: "/detailed", label: "Detailed Analysis" },
  { to: "/insights", label: "Management Insights" },
  { to: "/validation", label: "Data Validation" },
  { to: "/executive-deck", label: "Executive Presentation" },
];

export function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-itf-canvas text-itf-ink">
      <header className="bg-itf-green text-white border-b-4 border-itf-gold">
        <div className="flex items-center gap-4 px-6 py-3">
          <img src={logo.url} alt="ITF Logo" className="h-14 w-14 rounded-full bg-white p-0.5 shadow" />
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.18em] uppercase text-itf-gold/90">Industrial Training Fund · Federal Government of Nigeria</div>
            <div className="text-lg font-semibold leading-tight">2024 Corporate Scorecard — Management Reporting System</div>
            <div className="text-[11px] text-white/80">Corporate Planning Department · January – December 2024</div>
          </div>
          <div className="text-right text-[11px] text-white/80">
            <div className="font-semibold text-white">Director-Level Dashboard</div>
            <div>Prepared by ICT · Business Intelligence</div>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-60 shrink-0 border-r border-itf-rule bg-white min-h-[calc(100vh-78px)]">
          <nav className="py-3">
            {nav.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm border-l-4 ${
                    active
                      ? "border-itf-red bg-itf-green/5 text-itf-green font-semibold"
                      : "border-transparent text-itf-ink/80 hover:bg-itf-canvas"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-5 mt-3 text-[10px] text-itf-ink/60 leading-relaxed">
            Source: 2024 End-of-Year Corporate Scorecard PowerPoint, presented by Suleyol Fred-Chagu, Director, Corporate Planning Department.
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="px-8 py-6 border-b border-itf-rule bg-white">
            <h1 className="text-2xl font-bold text-itf-green">{title}</h1>
            {subtitle && <p className="text-sm text-itf-ink/70 mt-1">{subtitle}</p>}
          </div>
          <div className="px-8 py-6 space-y-6">{children}</div>
          <footer className="px-8 py-6 text-[11px] text-itf-ink/60 border-t border-itf-rule bg-white">
            © Industrial Training Fund · 2024 Corporate Scorecard · Internal Management Reporting · Generated from official report.
          </footer>
        </main>
      </div>
    </div>
  );
}
