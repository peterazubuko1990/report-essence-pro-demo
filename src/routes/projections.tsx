import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Section, DataTable, EmptyState, Note } from "@/components/dashboard/widgets";
import { ChartCard, ChartRenderer, TrendChip } from "@/components/dashboard/ChartKit";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";

export const Route = createFileRoute("/projections")({
  head: () => ({ meta: [
    { title: "Projections · ITF Scorecard" },
    { name: "description", content: "Forward-looking projections for ITF KPIs and revenue based on historical performance." },
  ] }),
  component: Projections,
});

type KraRow = { year: number; kra: string; kpi: string; actual: number; target: number };
type RevRow = { year: number; line: string; actual: number };

/** Linear-regression forecast: y = a + b*x over the last N observations. */
function forecast(series: { year: number; value: number }[], horizon: number) {
  if (!series.length) return [];
  if (series.length === 1) {
    const last = series[0];
    return Array.from({ length: horizon }, (_, i) => ({ year: last.year + i + 1, value: last.value, projected: true }));
  }
  const n = series.length;
  const sumX = series.reduce((s, p) => s + p.year, 0);
  const sumY = series.reduce((s, p) => s + p.value, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0, den = 0;
  series.forEach((p) => { num += (p.year - meanX) * (p.value - meanY); den += (p.year - meanX) ** 2; });
  const b = den === 0 ? 0 : num / den;
  const a = meanY - b * meanX;
  const lastYear = series[series.length - 1].year;
  return Array.from({ length: horizon }, (_, i) => {
    const y = lastYear + i + 1;
    return { year: y, value: Math.max(0, a + b * y), projected: true };
  });
}

function Projections() {
  const { yearsWithData } = useYear();
  const [horizon, setHorizon] = useState(3);

  const kra = useQuery<KraRow[]>({
    queryKey: ["proj_kra"],
    queryFn: async () => {
      const { data } = await (supabase.from as any)("kra_rows").select("year, kra, kpi, actual, target");
      return (data ?? []) as KraRow[];
    },
  });

  const rev = useQuery<RevRow[]>({
    queryKey: ["proj_rev"],
    queryFn: async () => {
      const { data } = await (supabase.from as any)("revenue_rows").select("year, line, actual");
      return (data ?? []) as RevRow[];
    },
  });

  const revSeries = useMemo(() => {
    const lines = Array.from(new Set((rev.data ?? []).map((r) => r.line)));
    return lines.map((line) => {
      const hist = (rev.data ?? [])
        .filter((r) => r.line === line)
        .map((r) => ({ year: r.year, value: Number(r.actual) }))
        .sort((a, b) => a.year - b.year);
      const proj = forecast(hist, horizon);
      const all = [...hist.map((h) => ({ year: h.year, historical: h.value, forecast: null as number | null })),
                   ...proj.map((p) => ({ year: p.year, historical: null, forecast: p.value }))];
      const lastHist = hist[hist.length - 1]?.value ?? 0;
      const lastProj = proj[proj.length - 1]?.value ?? 0;
      const change = lastHist ? ((lastProj - lastHist) / lastHist) * 100 : null;
      return { line, all, hist, proj, change };
    });
  }, [rev.data, horizon]);

  const kpiSeries = useMemo(() => {
    const map = new Map<string, { year: number; value: number }[]>();
    (kra.data ?? []).forEach((r) => {
      const key = `${r.kra} — ${r.kpi}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ year: r.year, value: Number(r.actual) });
    });
    return Array.from(map.entries()).map(([key, hist]) => {
      hist.sort((a, b) => a.year - b.year);
      const proj = forecast(hist, horizon);
      const lastHist = hist[hist.length - 1]?.value ?? 0;
      const lastProj = proj[proj.length - 1]?.value ?? 0;
      const change = lastHist ? ((lastProj - lastHist) / lastHist) * 100 : null;
      return { key, hist, proj, change, lastHist, lastProj };
    }).sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
  }, [kra.data, horizon]);

  const enoughData = yearsWithData.length >= 1;

  if (!enoughData) {
    return (
      <DashboardLayout title="Projections" subtitle="Forecasted performance based on historical data">
        <EmptyState year={new Date().getFullYear()} hint="No historical data yet. Add at least one year of KRA / revenue records to enable projections." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Projections" subtitle="Forward-looking forecasts using linear regression on your historical performance data.">
      <div className="bg-white border border-itf-rule rounded-md p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs text-itf-ink/70">
          Historical years: <b>{yearsWithData.join(", ") || "—"}</b>. Model: least-squares linear trend, projections capped at zero.
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-itf-ink/60 font-semibold uppercase tracking-wider">Horizon</span>
          <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="border border-itf-rule rounded px-2 py-1 bg-white">
            {[1,2,3,5,10].map((h) => <option key={h} value={h}>{h} year{h>1?"s":""}</option>)}
          </select>
        </div>
      </div>

      {revSeries.length > 0 && (
        <Section kicker="Revenue" title="Revenue projection by stream">
          {revSeries.map((s) => (
            <div key={s.line} className="mb-6 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between mb-2">
                <div className="font-semibold text-itf-green">{s.line}</div>
                <div className="text-xs text-itf-ink/70">
                  Projected {yearsWithData[yearsWithData.length-1]+horizon}: <b>{s.proj[s.proj.length-1]?.value.toLocaleString(undefined,{maximumFractionDigits:0}) ?? "—"}</b>
                  <span className="ml-3">Change vs last actual: <TrendChip value={s.change} /></span>
                </div>
              </div>
              <ChartCard title={s.line} defaultKind="line" allowKinds={["line","area","bar"]}>
                {(k) => (
                  <ChartRenderer
                    data={s.all}
                    xKey="year"
                    series={["historical","forecast"]}
                    kind={k}
                    seriesColors={["#00723F","#C8102E"]}
                  />
                )}
              </ChartCard>
            </div>
          ))}
        </Section>
      )}

      {kpiSeries.length > 0 && (
        <Section kicker="KPIs" title={`Top-movers forecast (next ${horizon} year${horizon>1?"s":""})`}>
          <Note>Projections use the observed trend across every year of data you've entered. Add more years to sharpen accuracy.</Note>
          <div className="mt-3">
            <DataTable
              headers={["KPI", "Last Actual", `Projected ${yearsWithData[yearsWithData.length-1]+horizon}`, "Δ %"]}
              rows={kpiSeries.slice(0, 25).map((s) => [
                <span key="k" className="text-xs">{s.key}</span>,
                s.lastHist.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                s.lastProj.toLocaleString(undefined, { maximumFractionDigits: 0 }),
                <TrendChip key="c" value={s.change} />,
              ])}
            />
          </div>
        </Section>
      )}
    </DashboardLayout>
  );
}
