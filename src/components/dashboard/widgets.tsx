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

export function EnhancedKpi({
  label,
  currentValue,
  previousValue,
  currentYear,
  previousYear,
  formatValue = (v: number) => String(v),
  isPositiveGood = true,
  tone = "neutral",
  showTarget = false,
  targetValue,
}: {
  label: string;
  currentValue: number;
  previousValue?: number;
  currentYear: number;
  previousYear?: number | null;
  formatValue?: (v: number) => string;
  isPositiveGood?: boolean;
  tone?: "good" | "bad" | "warn" | "neutral";
  showTarget?: boolean;
  targetValue?: string;
}) {
  const borderColor =
    tone === "good" ? "border-l-itf-green" :
    tone === "bad" ? "border-l-itf-red" :
    tone === "warn" ? "border-l-itf-gold" : "border-l-itf-ink/20";

  const bgAccent =
    tone === "good" ? "bg-itf-green/5" :
    tone === "bad" ? "bg-itf-red/5" :
    tone === "warn" ? "bg-itf-gold/5" : "bg-slate-50";

  const hasPreviousData = previousYear && previousValue !== undefined && previousValue !== null;
  let diff: number | null = null;
  let pctChange: number | null = null;
  let perfDirection: "up" | "down" | null = null;
  let perfTone: string = "text-itf-ink/70";
  let perfBgTone: string = "";

  if (hasPreviousData) {
    diff = currentValue - (previousValue as number);
    pctChange = ((diff / (previousValue as number)) * 100);
    perfDirection = diff > 0 ? "up" : diff < 0 ? "down" : null;
    
    if (perfDirection === "up") {
      perfTone = isPositiveGood ? "text-itf-green" : "text-itf-red";
      perfBgTone = isPositiveGood ? "bg-itf-green/10" : "bg-itf-red/10";
    } else if (perfDirection === "down") {
      perfTone = isPositiveGood ? "text-itf-red" : "text-itf-green";
      perfBgTone = isPositiveGood ? "bg-itf-red/10" : "bg-itf-green/10";
    }
  }

  return (
    <div className={`bg-white border border-itf-rule border-l-4 ${borderColor} rounded-lg px-5 py-4 shadow-md hover:shadow-lg transition-shadow`}>
      {/* Card Header / Label */}
      <div className="text-[11px] uppercase tracking-[0.16em] text-itf-ink/50 font-semibold mb-1">{label}</div>
      
      {/* Current Year Value - Largest Element */}
      <div className="text-4xl font-bold text-itf-ink leading-none mb-1">{formatValue(currentValue)}</div>
      
      {/* Year Badge */}
      <div className="text-[12px] font-medium text-itf-ink/70 mb-4">FY {currentYear}</div>

      {hasPreviousData ? (
        <>
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-itf-rule via-itf-rule to-transparent mb-4" />

          {/* Comparison Section */}
          <div className="space-y-3">
            {/* Comparison Label */}
            <div className="text-[12px] font-semibold text-itf-ink/60 uppercase tracking-wide">
              {currentYear} vs {previousYear}
            </div>

            {/* Previous Year Value */}
            <div className="flex items-baseline gap-2">
              <span className="text-[12px] font-medium text-itf-ink/60">FY {previousYear}</span>
              <span className="text-lg font-semibold text-itf-ink">{formatValue(previousValue as number)}</span>
            </div>

            {/* Performance Indicator */}
            <div className={`${perfBgTone} rounded-md px-3 py-2 flex items-center justify-between`}>
              <div className={`flex items-center gap-2 ${perfTone}`}>
                <span className="text-lg font-bold">
                  {perfDirection === "up" ? "▲" : perfDirection === "down" ? "▼" : "–"}
                </span>
                <span className="text-sm font-semibold">
                  {diff !== null ? (diff > 0 ? "+" : "") + formatValue(Math.abs(diff)) : "–"}
                </span>
              </div>
              <span className={`text-sm font-bold ${perfTone}`}>
                {pctChange !== null ? (pctChange >= 0 ? "+" : "") + pctChange.toFixed(1) + "%" : "–"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-[12px] text-itf-ink/50 italic py-2">No previous year data available</div>
      )}

      {/* Target Achievement (if applicable) */}
      {showTarget && targetValue && (
        <div className="mt-4 pt-3 border-t border-itf-rule/30 text-[11px] font-medium text-itf-ink/70">
          Target: <span className="text-itf-ink font-semibold">{targetValue}</span>
        </div>
      )}
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

export function EmptyState({ year, hint }: { year: number; hint?: string }) {
  return (
    <div className="bg-white border border-dashed border-itf-rule rounded-md p-10 text-center">
      <div className="text-4xl mb-3">📊</div>
      <div className="text-lg font-semibold text-itf-green">No data yet for FY {year}</div>
      <p className="text-sm text-itf-ink/70 mt-2 max-w-md mx-auto">
        {hint ?? "This year has no records yet. Sign in to the admin panel to add KRA/KPI, revenue, training and other performance data, or clone from a previous year."}
      </p>
    </div>
  );
}

export function CompareYearPicker({
  currentYear, compareYear, onChange, yearsWithData,
}: { currentYear: number; compareYear: number | null; onChange: (y: number | null) => void; yearsWithData: number[] }) {
  const options = yearsWithData.filter((y) => y !== currentYear);
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <span className="text-itf-ink/60 font-semibold uppercase tracking-wider">Compare vs</span>
      <select
        value={compareYear ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="border border-itf-rule rounded px-2 py-1 bg-white"
      >
        <option value="">— none —</option>
        {options.map((y) => <option key={y} value={y}>FY {y}</option>)}
      </select>
    </div>
  );
}

