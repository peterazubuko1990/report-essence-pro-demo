import type { ReactNode } from "react";

export function Section({ title, children, kicker }: { title: string; children: ReactNode; kicker?: string }) {
  return (
    <section className="bg-white border border-itf-rule rounded-md shadow-sm">
      <header className="px-6 py-4 border-b border-itf-rule bg-itf-green/[0.04]">
        {kicker && <div className="text-sm tracking-[0.18em] uppercase text-itf-red font-black">{kicker}</div>}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-itf-ink">{title}</h2>
      </header>
      <div className="p-6">{children}</div>
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
    <div className={`bg-white border border-itf-rule border-l-4 ${ring} rounded-md px-5 py-4 shadow-sm`}>
      <div className="text-sm sm:text-base uppercase tracking-[0.16em] text-itf-ink/80 font-black">{label}</div>
      <div className="text-4xl sm:text-5xl font-black text-itf-ink mt-2 leading-tight">{value}</div>
      {sub && <div className="text-base font-semibold text-itf-ink/70 mt-2">{sub}</div>}
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
  noteText,
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
  noteText?: string;
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
    <div className={`bg-white border border-itf-rule border-l-4 ${borderColor} rounded-lg px-6 py-5 shadow-md hover:shadow-lg transition-shadow`}>
      {/* Card Header / Label */}
      <div className="text-sm uppercase tracking-[0.16em] text-itf-ink/80 font-black mb-2">{label}</div>
      
      {/* Current Year Value - Largest Element */}
      <div className="text-6xl sm:text-7xl font-black text-itf-ink leading-none mb-2">{formatValue(currentValue)}</div>
      
      {/* Year Badge */}
      <div className="text-base font-black text-itf-ink/80 mb-5">FY {currentYear}</div>

      {hasPreviousData ? (
        <>
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-itf-rule via-itf-rule to-transparent mb-4" />

          {/* Comparison Section */}
          <div className="space-y-3">
            {/* Comparison Label */}
            <div className="text-sm font-black text-itf-ink/80 uppercase tracking-wide">
              FY {currentYear} vs FY {previousYear}
            </div>

            {/* Previous Year Value */}
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-itf-ink/70">FY {previousYear}</span>
              <span className="text-xl font-black text-itf-ink">{formatValue(previousValue as number)}</span>
            </div>

            {/* Performance Indicator */}
            <div className={`${perfBgTone} rounded-md px-4 py-3 flex items-center justify-between`}> 
              <div className={`flex items-center gap-3 ${perfTone}`}>
                <span className="text-xl font-black">
                  {perfDirection === "up" ? "▲" : perfDirection === "down" ? "▼" : "–"}
                </span>
                <span className="text-base font-black">
                  {diff !== null ? (diff > 0 ? "+" : "") + formatValue(Math.abs(diff)) : "–"}
                </span>
              </div>
              <span className={`text-base font-black ${perfTone}`}>
                {pctChange !== null ? (pctChange >= 0 ? "+" : "") + pctChange.toFixed(1) + "%" : "–"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-[12px] text-itf-ink/50 italic py-2">No previous year data available</div>
      )}

      {/* Presenter note / target context */}
      {noteText ? (
        <div className="mt-4 pt-3 border-t border-itf-rule/30">
          <div className="text-[10px] uppercase tracking-[0.12em] text-itf-gold font-black mb-1">Presenter note</div>
          <div className="text-[12px] font-semibold leading-relaxed text-itf-ink/80">{noteText}</div>
        </div>
      ) : showTarget && targetValue ? (
        <div className="mt-4 pt-3 border-t border-itf-rule/30 text-[11px] font-medium text-itf-ink/70">
          Target: <span className="text-itf-ink font-semibold">{targetValue}</span>
        </div>
      ) : null}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-itf-gold bg-itf-gold/10 px-5 py-4 rounded-sm text-base text-itf-ink/85 leading-relaxed">
      <span className="font-semibold text-itf-green">Presenter note · </span>
      {children}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
  className = "",
}: { headers: string[]; rows: (string | number | ReactNode)[][]; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-base border-separate border-spacing-0">
        <thead>
          <tr className="bg-itf-green text-white">
            {headers.map((h) => (
              <th key={h} className="px-6 py-5 text-left font-semibold text-base uppercase tracking-[0.14em]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-itf-canvas" : "bg-white"}>
              {r.map((c, j) => (
                <td key={j} className="px-6 py-5 align-top border-b border-itf-rule text-itf-ink/80 font-medium text-base">
                  {c}
                </td>
              ))}
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
    <div className="flex items-center gap-3 min-w-[160px]">
      <div className="flex-1 h-3 bg-itf-rule rounded-sm overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${(capped / 200) * 100}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums w-14 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

export function EmptyState({ year, hint }: { year: number; hint?: string }) {
  return (
    <div className="bg-white border border-dashed border-itf-rule rounded-md p-12 text-center">
      <div className="text-6xl mb-4">📊</div>
      <div className="text-3xl font-bold text-itf-green">No data yet for FY {year}</div>
      <p className="text-lg text-itf-ink/70 mt-4 max-w-2xl mx-auto leading-relaxed">
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
    <div className="inline-flex flex-wrap items-center gap-3 text-base">
      <span className="text-itf-ink/70 font-semibold uppercase tracking-wider">Compare vs</span>
      <select
        value={compareYear ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="border border-itf-rule rounded px-3 py-2 bg-white text-base"
      >
        <option value="">— none —</option>
        {options.map((y) => <option key={y} value={y}>FY {y}</option>)}
      </select>
    </div>
  );
}

