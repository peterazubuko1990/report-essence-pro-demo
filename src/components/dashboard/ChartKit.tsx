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

export function ChartTypeSelector({
  value, onChange, allow,
}: { value: ChartKind; onChange: (k: ChartKind) => void; allow?: ChartKind[] }) {
  const opts = allow ? KINDS.filter((x) => allow.includes(x.k)) : KINDS;
  return (
    <div className="inline-flex flex-wrap gap-1 rounded border border-itf-rule bg-white p-1">
      {opts.map(({ k, label, Icon }) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          title={label}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
            k === value ? "bg-itf-green text-white" : "text-itf-ink/70 hover:bg-itf-canvas"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
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
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} unit={unit} />
            <Tooltip />
            <Legend />
            {series.map((s, i) => <Bar key={s} dataKey={s} fill={colors[i % colors.length]} />)}
          </BarChart>
        ) : kind === "line" ? (
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} unit={unit} />
            <Tooltip />
            <Legend />
            {series.map((s, i) => <Line key={s} type="monotone" dataKey={s} stroke={colors[i % colors.length]} strokeWidth={2} dot />)}
          </LineChart>
        ) : kind === "area" ? (
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} unit={unit} />
            <Tooltip />
            <Legend />
            {series.map((s, i) => <Area key={s} type="monotone" dataKey={s} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} fillOpacity={0.35} />)}
          </AreaChart>
        ) : kind === "pie" || kind === "donut" ? (
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={kind === "donut" ? 55 : 0} outerRadius={95} label={(d: any) => `${d.name}`}>
              {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <RadarChart data={data} outerRadius={100}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            {series.map((s, i) => (
              <Radar key={s} name={s} dataKey={s} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.35} />
            ))}
            <Tooltip />
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
      <header className="px-5 py-3 border-b border-itf-rule bg-itf-green/[0.04] flex flex-wrap items-center gap-3 justify-between">
        <div>
          {kicker && <div className="text-[10px] tracking-[0.18em] uppercase text-itf-red font-semibold">{kicker}</div>}
          <h2 className="text-base font-semibold text-itf-green">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {controls}
          <ChartTypeSelector value={kind} onChange={setKind} allow={allowKinds} />
        </div>
      </header>
      <div className="p-5">{children(kind)}</div>
    </section>
  );
}

export function TrendChip({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-itf-ink/40 text-xs">—</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-itf-green" : "text-itf-red"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}
