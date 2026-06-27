import type { ReactNode } from "react";

export function Section({ title, children, kicker }: { title: string; children: ReactNode; kicker?: string }) {
  return (
    <section className="bg-white border border-itf-rule rounded-md shadow-sm">
      <header className="px-5 py-3 border-b border-itf-rule bg-itf-green/[0.04]">
        {kicker && <div className="text-[10px] tracking-[0.18em] uppercase text-itf-red font-semibold">{kicker}</div>}
        <h2 className="text-base font-semibold text-itf-green">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Kpi({
  label, value, sub, tone = "neutral",
}: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" | "neutral" }) {
  const ring =
    tone === "good" ? "border-l-itf-green" :
    tone === "bad" ? "border-l-itf-red" :
    tone === "warn" ? "border-l-itf-gold" : "border-l-itf-ink/40";
  return (
    <div className={`bg-white border border-itf-rule border-l-4 ${ring} rounded-md px-4 py-3 shadow-sm`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-itf-ink/60 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-itf-ink mt-1 leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-itf-ink/60 mt-1">{sub}</div>}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-itf-gold bg-itf-gold/10 px-4 py-3 rounded-sm text-[13px] text-itf-ink/85 leading-relaxed">
      <span className="font-semibold text-itf-green">Presenter note · </span>
      {children}
    </div>
  );
}

export function DataTable({
  headers, rows,
}: { headers: string[]; rows: (string | number | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-itf-green text-white">
            {headers.map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-[12px] tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-itf-canvas" : "bg-white"}>
              {r.map((c, j) => <td key={j} className="px-3 py-2 border-b border-itf-rule align-top">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PctBar({ value }: { value: number }) {
  const capped = Math.min(value, 200);
  const tone = value >= 100 ? "bg-itf-green" : value >= 60 ? "bg-itf-gold" : "bg-itf-red";
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-2 bg-itf-rule rounded-sm overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${(capped / 200) * 100}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums w-12 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}
