import { useState, type ReactNode } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, PieChart as PieIcon, CircleDot, Radar as RadarIcon } from "lucide-react";

export type ChartKind = "bar" | "line" | "area" | "pie" | "donut" | "radar";

const KINDS: { k: ChartKind; label: string; Icon: any }[] = [
  { k: "bar", label: "Bar", Icon: BarChart3 },
  { k: "line", label: "Line", Icon: LineIcon },
  { k: "area", label: "Area", Icon: AreaIcon },
  { k: "pie", label: "Pie", Icon: PieIcon },
  { k: "donut", label: "Donut", Icon: CircleDot },
  { k: "radar", label: "Radar", Icon: RadarIcon },
];

const COLORS = ["#00723F", "#C8102E", "#E6B422", "#1F6FB2", "#7a8a99", "#6d4c41", "#4b5563"];

function TooltipContent({ active, payload, label, unit }: { active?: boolean; payload?: Array<any>; label?: string | number; unit?: string }) {
  if (!active || !payload?.length) return null;

  const formatValue = (value: unknown) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return "—";
    const precision = unit === "%" ? 1 : 0;
    return `${num.toFixed(precision)}${unit ?? ""}`;
  };

  return (
    <div className="rounded-lg border border-itf-rule bg-white/95 px-3 py-2 text-sm shadow-lg">
      <div className="mb-2 font-semibold text-itf-ink">{label ?? "Value"}</div>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const currentValue = Number(entry.value ?? 0);
          const prevValue = index > 0 ? Number(payload[index - 1].value ?? 0) : null;
          const pctChange = prevValue !== null && prevValue !== 0 && Number.isFinite(currentValue) && Number.isFinite(prevValue)
            ? ((currentValue - prevValue) / prevValue) * 100
            : null;

          const tone = pctChange !== null && pctChange > 0 ? "text-itf-green" : pctChange !== null && pctChange < 0 ? "text-itf-red" : "text-itf-ink/70";

          return (
            <div key={`${entry.dataKey ?? entry.name ?? index}`} className="flex items-center justify-between gap-3">
              <span className="font-medium text-itf-ink/70">{entry.name ?? entry.dataKey}</span>
              <div className="text-right">
                <div className="font-semibold text-itf-ink">{formatValue(entry.value)}</div>
                {pctChange !== null && (
                  <div className={`text-[11px] font-semibold ${tone}`}>
                    {pctChange > 0 ? "▲" : pctChange < 0 ? "▼" : "•"} {Math.abs(pctChange).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartTypeSelector({
  value, onChange, allow,
}: { value: ChartKind; onChange: (k: ChartKind) => void; allow?: ChartKind[] }) {
  const opts = allow ? KINDS.filter((x) => allow.includes(x.k)) : KINDS;
  return (
    <div className="inline-flex flex-wrap gap-2 rounded border border-itf-rule bg-white p-2">
      {opts.map(({ k, label, Icon }) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          title={label}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold ${
            k === value ? "bg-itf-green text-white" : "text-itf-ink/70 hover:bg-itf-canvas"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Generic chart renderer.
 * - data: array of records
 * - xKey: category axis
 * - series: array of numeric keys to plot
 * For pie/donut/radar: only the FIRST series key is used.
 */
export function ChartRenderer({
  data, xKey, series, kind, height = 288, unit,
  seriesColors,
}: {
  data: any[];
  xKey: string;
  series: string[];
  kind: ChartKind;
  height?: number;
  unit?: string;
  seriesColors?: string[];
}) {
  const colors = seriesColors ?? COLORS;
  const primary = series[0];

  const pieData = data.map((d) => ({ name: String(d[xKey]), value: Number(d[primary] ?? 0) }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        {kind === "bar" ? (
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 26 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 13, fontWeight: 600 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 13, fontWeight: 600 }} unit={unit} />
            <Tooltip content={<TooltipContent unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
            {series.map((s, i) => <Bar key={s} dataKey={s} fill={colors[i % colors.length]} />)}
          </BarChart>
        ) : kind === "line" ? (
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 26 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 13, fontWeight: 600 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 13, fontWeight: 600 }} unit={unit} />
            <Tooltip content={<TooltipContent unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
            {series.map((s, i) => <Line key={s} type="monotone" dataKey={s} stroke={colors[i % colors.length]} strokeWidth={2} dot />)}
          </LineChart>
        ) : kind === "area" ? (
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 26 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 13, fontWeight: 600 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 13, fontWeight: 600 }} unit={unit} />
            <Tooltip content={<TooltipContent unit={unit} />} />
            <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
            {series.map((s, i) => <Area key={s} type="monotone" dataKey={s} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.35} />)}
          </AreaChart>
        ) : kind === "pie" || kind === "donut" ? (
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={kind === "donut" ? 65 : 0} outerRadius={120} label={(d: any) => `${d.name}`}>
              {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <RadarChart data={data} outerRadius={110}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis tick={{ fontSize: 12, fontWeight: 600 }} />
            {series.map((s, i) => (
              <Radar key={s} name={s} dataKey={s} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.35} />
            ))}
            <Tooltip content={<TooltipContent unit={unit} />} />
            <Legend />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartCard({
  title, kicker, defaultKind = "bar", allowKinds, children, controls,
}: {
  title: string; kicker?: string; defaultKind?: ChartKind; allowKinds?: ChartKind[];
  children: (kind: ChartKind) => ReactNode; controls?: ReactNode;
}) {
  const [kind, setKind] = useState<ChartKind>(defaultKind);
  return (
    <section className="bg-white border border-itf-rule rounded-md shadow-sm">
      <header className="px-6 py-4 border-b border-itf-rule bg-itf-green/[0.04] flex flex-wrap items-center gap-3 justify-between">
        <div>
          {kicker && <div className="text-sm tracking-[0.18em] uppercase text-itf-red font-semibold">{kicker}</div>}
          <h2 className="text-xl sm:text-2xl font-semibold text-itf-green">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {controls}
          <ChartTypeSelector value={kind} onChange={setKind} allow={allowKinds} />
        </div>
      </header>
      <div className="p-6">{children(kind)}</div>
    </section>
  );
}

export function TrendChip({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-itf-ink/40 text-sm">—</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? "text-itf-green" : "text-itf-red"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}
