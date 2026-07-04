import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/itf-logo.asset.json";
import { useState, type ReactNode } from "react";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Executive Overview" },
  { to: "/performance", label: "Corporate Performance" },
  { to: "/training", label: "Training Analysis" },
  { to: "/revenue", label: "Revenue Analysis" },
  { to: "/analytics", label: "Visual Analytics" },
  { to: "/detailed", label: "Detailed Analysis" },
  { to: "/insights", label: "Management Insights" },
  { to: "/validation", label: "Data Validation" },
  { to: "/executive-deck", label: "Executive Presentation" },
];


export function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-itf-canvas text-itf-ink">
      <header className="bg-itf-green text-white border-b-4 border-itf-gold">
        <div className="flex items-center gap-3 px-3 sm:px-6 py-3">
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="lg:hidden shrink-0 rounded-md p-2 hover:bg-white/10"
            aria-label="Toggle navigation"
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <img src={logo.url} alt="ITF Logo" className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-full bg-white p-0.5 shadow" />
          <div className="flex-1 min-w-0">
            <div className="hidden sm:block text-[11px] tracking-[0.18em] uppercase text-itf-gold/90">Industrial Training Fund · Federal Government of Nigeria</div>
            <div className="text-sm sm:text-lg font-semibold leading-tight truncate">2024 Corporate Scorecard</div>
            <div className="hidden sm:block text-[11px] text-white/80">Corporate Planning Department · January – December 2024</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <YearSwitcher />
            <Link to="/admin" className="rounded-md bg-itf-gold text-itf-ink px-2 sm:px-3 py-1.5 text-[11px] font-semibold hover:bg-itf-gold/90">Admin</Link>
            <div className="text-right text-[11px] text-white/80 hidden xl:block">
              <div className="font-semibold text-white">Director-Level Dashboard</div>
              <div>Prepared by ICT · Business Intelligence</div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex relative">

        {navOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-30"
            onClick={() => setNavOpen(false)}
          />
        )}
        <aside
          className={`${
            navOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static top-0 left-0 z-40 w-64 lg:w-60 shrink-0 border-r border-itf-rule bg-white h-screen lg:h-auto lg:min-h-[calc(100vh-78px)] transition-transform overflow-y-auto`}
        >
          <div className="lg:hidden flex justify-end p-2">
            <button onClick={() => setNavOpen(false)} className="p-2 text-itf-ink/60" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="py-3">
            {nav.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setNavOpen(false)}
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
          <div className="px-5 mt-3 pb-6 text-[10px] text-itf-ink/60 leading-relaxed">
            Source: 2024 End-of-Year Corporate Scorecard PowerPoint, presented by Suleyol Fred-Chagu, Director, Corporate Planning Department.
          </div>
        </aside>
        <main className="flex-1 min-w-0 w-full">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-itf-rule bg-white">
            <h1 className="text-xl sm:text-2xl font-bold text-itf-green">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-itf-ink/70 mt-1">{subtitle}</p>}
          </div>
          <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 overflow-x-hidden">{children}</div>
          <footer className="px-4 sm:px-8 py-6 text-[11px] text-itf-ink/60 border-t border-itf-rule bg-white">
            © Industrial Training Fund · 2024 Corporate Scorecard · Internal Management Reporting.
          </footer>
        </main>
      </div>
    </div>
  );
}
