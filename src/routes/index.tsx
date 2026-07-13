import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, EnhancedKpi, Note, Section, DataTable, PctBar, EmptyState } from "@/components/dashboard/widgets";
import { ChartCard, ChartRenderer } from "@/components/dashboard/ChartKit";
import { fmtNaira, growth } from "@/data/itf2024";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";
import { buildRevenueAggregation } from "@/lib/revenue-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview · ITF Corporate Scorecard" },
      { name: "description", content: "Director-level executive overview of ITF corporate performance, revenue and training delivery." },
      { property: "og:title", content: "ITF Corporate Scorecard – Executive Overview" },
      { property: "og:description", content: "Interactive management reporting for corporate performance, revenue and training." },
    ],
  }),
  component: ExecutiveOverview,
});

function ExecutiveOverview() {
  const { year, hasData, yearsWithData } = useYear();

  // pick prior year with data (most recent before selected year)
  const prevYear = [...yearsWithData].filter((y) => y < year).pop() ?? null;

  const { data: areaRevCurrent = [] } = useQuery({
    queryKey: ["area_revenue", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data } = await supabase.from("area_revenue").select("*").eq("year", year).order("office");
      return data ?? [];
    },
  });

  const { data: areaRevPrev = [] } = useQuery({
    queryKey: ["area_revenue", prevYear],
    enabled: !!prevYear,
    queryFn: async () => {
      const { data } = await supabase.from("area_revenue").select("*").eq("year", prevYear as number).order("office");
      return data ?? [];
    },
  });

  const { data: kraRows = [] } = useQuery({
    queryKey: ["kra_rows", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data } = await supabase.from("kra_rows").select("*").eq("year", year);
      return data ?? [];
    },
  });

  const { data: kraPrev = [] } = useQuery({
    queryKey: ["kra_rows", prevYear],
    enabled: !!prevYear,
    queryFn: async () => {
      const { data } = await supabase.from("kra_rows").select("*").eq("year", prevYear as number);
      return data ?? [];
    },
  });

  if (!year || !hasData(year)) {
    return (
      <DashboardLayout title="Executive Overview" subtitle={year ? `FY ${year}` : "Loading…"}>
        <EmptyState year={year} hint="No operational data recorded for this year. Use the admin panel to add KRA, revenue and training records, or clone from a previous year." />
      </DashboardLayout>
    );
  }

  const aggregation = buildRevenueAggregation(areaRevCurrent, areaRevPrev);
  const revenueTotals = aggregation.totals;
  const totalRevCur = revenueTotals.reduce((sum, row) => sum + row.actual, 0);
  const totalRevPrev = revenueTotals.reduce((sum, row) => sum + row.previousActual, 0);
  const totalGrowth = prevYear ? growth(totalRevCur, totalRevPrev) : null;

  const streamMap = Object.fromEntries(revenueTotals.map((row) => [row.stream, row]));
  const tc = streamMap["Training Contribution"];
  const cf = streamMap["Course Fee"];
  const oi = streamMap["Other Income"];

  const kra6RowsForYear = kraRows.filter((r: any) => r.kra === "KRA 6" && r.kpi !== "Total Number Trained");
  const kra6RowsForPrevYear = kraPrev.filter((r: any) => r.kra === "KRA 6" && r.kpi !== "Total Number Trained");
  const pTrainedCur = kra6RowsForYear.reduce((s, r) => s + Number(r.actual || 0), 0);
  const pTrainedPrev = prevYear ? kra6RowsForPrevYear.reduce((s, r) => s + Number(r.actual || 0), 0) : 0;

  const revChart = revenueTotals.map((row) => ({
    name: row.stream,
    [`${prevYear ?? "Prev"}`]: row.previousActual / 1_000_000_000,
    [`${year}`]: row.actual / 1_000_000_000,
  }));

  const kpiTone = (pct: number) => pct >= 100 ? "good" : pct >= 70 ? "warn" : "bad";
  const totalPct = revenueTotals.reduce((sum, row) => sum + row.target, 0) > 0 ? (totalRevCur / revenueTotals.reduce((sum, row) => sum + row.target, 0)) * 100 : 0;

  // top KRA wins & declines
  const kraWithPct = kraRows.map((k: any) => ({ ...k, pct: Number(k.target) > 0 ? (Number(k.actual) / Number(k.target)) * 100 : 0 }));
  const wins = [...kraWithPct].sort((a, b) => b.pct - a.pct).slice(0, 5);
  const declines = [...kraWithPct].sort((a, b) => a.pct - b.pct).slice(0, 5);

  return (
    <DashboardLayout
      title={`Executive Overview — FY ${year}`}
      subtitle={prevYear ? `One-page snapshot for FY ${year} with FY ${prevYear} comparisons.` : `One-page snapshot for FY ${year}.`}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <EnhancedKpi
          label={`Total Revenue ${year}`}
          currentValue={totalRevCur}
          previousValue={prevYear ? totalRevPrev : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={fmtNaira}
          tone={totalGrowth === null ? "neutral" : totalGrowth >= 0 ? "good" : "bad"}
        />

        {/* Training Contribution */}
        {tc && (
          <EnhancedKpi
            label="Training Contribution"
            currentValue={Number(tc.actual)}
            previousValue={prevYear ? Number(tc.previousActual) : undefined}
            currentYear={year}
            previousYear={prevYear}
            formatValue={fmtNaira}
            showTarget={true}
            targetValue={`${Number(tc.pct ?? 0).toFixed(1)}% of target`}
            tone={kpiTone(Number(tc.pct ?? 0))}
          />
        )}

        {/* Course Fee */}
        {cf && (
          <EnhancedKpi
            label="Course Fee"
            currentValue={Number(cf.actual)}
            previousValue={prevYear ? Number(cf.previousActual) : undefined}
            currentYear={year}
            previousYear={prevYear}
            formatValue={fmtNaira}
            showTarget={true}
            targetValue={`${Number(cf.pct ?? 0).toFixed(1)}% of target`}
            tone={kpiTone(Number(cf.pct ?? 0))}
          />
        )}

        {/* Other Income */}
        {oi && (
          <EnhancedKpi
            label="Other Income"
            currentValue={Number(oi.actual)}
            previousValue={prevYear ? Number(oi.previousActual) : undefined}
            currentYear={year}
            previousYear={prevYear}
            formatValue={fmtNaira}
            showTarget={true}
            targetValue={`${Number(oi.pct ?? 0).toFixed(1)}% of target`}
            tone={kpiTone(Number(oi.pct ?? 0))}
          />
        )}

        {/* Participants Trained */}
        <EnhancedKpi
          label="Participants Trained"
          currentValue={pTrainedCur}
          previousValue={prevYear && pTrainedPrev > 0 ? pTrainedPrev : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => v.toLocaleString()}
          tone={prevYear && pTrainedPrev > 0 ? (growth(pTrainedCur, pTrainedPrev) >= 0 ? "good" : "bad") : "neutral"}
        />

        {/* KRAs Reported */}
        <EnhancedKpi
          label="KRAs Reported"
          currentValue={kraRows.length}
          previousValue={prevYear ? kraPrev.length : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => String(v)}
          isPositiveGood={true}
          tone={prevYear && kraPrev.length > 0 ? (kraRows.length >= kraPrev.length ? "good" : "warn") : "neutral"}
        />

        {/* Revenue Streams */}
        <EnhancedKpi
          label="Revenue Streams"
          currentValue={revenueTotals.length}
          previousValue={undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => String(v)}
          isPositiveGood={true}
          tone="neutral"
        />

        {/* Target Achievement */}
        <EnhancedKpi
          label="Target Achievement"
          currentValue={totalPct}
          previousValue={prevYear ? (revenueTotals.reduce((sum, row) => sum + row.previousTarget, 0) > 0 ? (totalRevPrev / revenueTotals.reduce((sum, row) => sum + row.previousTarget, 0)) * 100 : 0) : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => `${v.toFixed(1)}%`}
          tone={kpiTone(totalPct)}
        />
      </div>

      {revChart.length > 0 && (
        <ChartCard
          title={prevYear ? `${prevYear} vs ${year} — Revenue Streams (₦B)` : `${year} — Revenue Streams (₦B)`}
          kicker="Revenue"
          defaultKind="bar"
          allowKinds={["bar", "line", "area", "radar"]}
        >
          {(k) => <ChartRenderer data={revChart} xKey="name" series={prevYear ? [String(prevYear), String(year)] : [String(year)]} kind={k} unit="B" />}
        </ChartCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Section kicker="Wins" title="Top Performing KPIs">
          {wins.length === 0 ? (
            <p className="text-sm text-itf-ink/60">No KRA/KPI records for FY {year}.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {wins.map((k, i) => (
                <li key={i}>✅ <b>{k.kpi}</b> — {k.pct.toFixed(1)}% of target ({Number(k.actual).toLocaleString()} vs {Number(k.target).toLocaleString()})</li>
              ))}
            </ul>
          )}
        </Section>
        <Section kicker="Attention" title="Items Requiring Director Attention">
          {declines.length === 0 ? (
            <p className="text-sm text-itf-ink/60">No KRA/KPI records for FY {year}.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {declines.map((k, i) => (
                <li key={i}>⚠ <b>{k.kpi}</b> — {k.pct.toFixed(1)}% of target ({Number(k.actual).toLocaleString()} vs {Number(k.target).toLocaleString()})</li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {areaRevCurrent.length > 0 && (
        <Section kicker="Snapshot" title={`Revenue Summary — FY ${year}`}>
          <DataTable
            headers={prevYear
              ? [`Stream`, `${prevYear} Target`, `${prevYear} Actual`, `${prevYear} %`, `${year} Target`, `${year} Actual`, `${year} %`, `YoY Growth`]
              : [`Stream`, `${year} Target`, `${year} Actual`, `${year} %`]}
            rows={revenueTotals.map((row) => {
              const g = growth(row.actual, row.previousActual);
              if (prevYear) {
                return [
                  row.stream,
                  fmtNaira(row.previousTarget),
                  fmtNaira(row.previousActual),
                  <PctBar key={row.stream+"a"} value={row.previousPct} />,
                  fmtNaira(row.target),
                  fmtNaira(row.actual),
                  <PctBar key={row.stream+"b"} value={row.pct} />,
                  <span key={row.stream+"g"} className={g >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>{g.toFixed(1)}%</span>,
                ];
              }
              return [
                row.stream,
                fmtNaira(row.target),
                fmtNaira(row.actual),
                <PctBar key={row.stream+"a"} value={row.pct} />,
              ];
            })}
          />
          <Note>
            Achievement % is <i>Actual ÷ Target × 100</i>; growth % is <i>(Current − Previous) ÷ Previous × 100</i>. All figures reflect live data from the admin console.
          </Note>
        </Section>
      )}

      <div className="text-xs text-itf-ink/60">
        Achievement formula: <code>Actual ÷ Target × 100</code>. Growth formula: <code>(Current − Previous) ÷ Previous × 100</code>.
      </div>
    </DashboardLayout>
  );
}
