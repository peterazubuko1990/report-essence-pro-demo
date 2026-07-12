import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, EnhancedKpi, Note, Section, DataTable, PctBar, EmptyState } from "@/components/dashboard/widgets";
import { ChartCard, ChartRenderer } from "@/components/dashboard/ChartKit";
import { fmtNaira, growth } from "@/data/itf2024";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: revCurrent = [] } = useQuery({
    queryKey: ["revenue_rows", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data } = await supabase.from("revenue_rows").select("*").eq("year", year).order("sort_order");
      return data ?? [];
    },
  });

  const { data: revPrev = [] } = useQuery({
    queryKey: ["revenue_rows", prevYear],
    enabled: !!prevYear,
    queryFn: async () => {
      const { data } = await supabase.from("revenue_rows").select("*").eq("year", prevYear as number).order("sort_order");
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

  const sumActual = (rows: any[]) => rows.reduce((s, r) => s + Number(r.actual || 0), 0);
  const sumTarget = (rows: any[]) => rows.reduce((s, r) => s + Number(r.target || 0), 0);

  const totalRevCur = sumActual(revCurrent);
  const totalRevPrev = sumActual(revPrev);
  const totalGrowth = prevYear ? growth(totalRevCur, totalRevPrev) : null;

  const streamOf = (line: string, rows: any[]) => rows.find((r) => (r.line || "").toLowerCase().includes(line.toLowerCase()));
  const tc = streamOf("Training Contribution", revCurrent);
  const cf = streamOf("Course Fee", revCurrent);
  const oi = streamOf("Other Income", revCurrent);

  const kra6RowsForYear = kraRows.filter((r: any) => r.kra === "KRA 6" && r.kpi !== "Total Number Trained");
  const kra6RowsForPrevYear = kraPrev.filter((r: any) => r.kra === "KRA 6" && r.kpi !== "Total Number Trained");
  const pTrainedCur = kra6RowsForYear.reduce((s, r) => s + Number(r.actual || 0), 0);
  const pTrainedPrev = prevYear ? kra6RowsForPrevYear.reduce((s, r) => s + Number(r.actual || 0), 0) : 0;

  // build headline table dynamically
  const streams = Array.from(new Set([...revCurrent, ...revPrev].map((r: any) => r.line)));
  const revChart = streams.map((line) => {
    const cur = streamOf(line, revCurrent);
    const prev = streamOf(line, revPrev);
    return {
      name: line,
      [`${prevYear ?? "Prev"}`]: (Number(prev?.actual || 0)) / 1_000_000_000,
      [`${year}`]: (Number(cur?.actual || 0)) / 1_000_000_000,
    };
  });

  const kpiTone = (pct: number) => pct >= 100 ? "good" : pct >= 70 ? "warn" : "bad";
  const totalPct = sumTarget(revCurrent) > 0 ? (totalRevCur / sumTarget(revCurrent)) * 100 : 0;

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
            previousValue={prevYear ? Number(streamOf("Training Contribution", revPrev)?.actual || 0) : undefined}
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
            previousValue={prevYear ? Number(streamOf("Course Fee", revPrev)?.actual || 0) : undefined}
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
            previousValue={prevYear ? Number(streamOf("Other Income", revPrev)?.actual || 0) : undefined}
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
          currentValue={revCurrent.length}
          previousValue={prevYear ? revPrev.length : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => String(v)}
          isPositiveGood={true}
          tone={prevYear && revPrev.length > 0 ? (revCurrent.length >= revPrev.length ? "good" : "warn") : "neutral"}
        />

        {/* Target Achievement */}
        <EnhancedKpi
          label="Target Achievement"
          currentValue={totalPct}
          previousValue={prevYear ? (sumTarget(revPrev) > 0 ? (totalRevPrev / sumTarget(revPrev)) * 100 : 0) : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(v) => `${v.toFixed(1)}%`}
          tone={kpiTone(totalPct)}
        />
      </div>

      {revChart.length > 0 && (
        <ChartCard
          title={prevYear ? `${prevYear} vs ${year} — Headline Revenue Streams (₦B)` : `${year} — Headline Revenue Streams (₦B)`}
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

      {revCurrent.length > 0 && (
        <Section kicker="Snapshot" title={`Headline Revenue Table — FY ${year}`}>
          <DataTable
            headers={prevYear
              ? [`Stream`, `${prevYear} Target`, `${prevYear} Actual`, `${prevYear} %`, `${year} Target`, `${year} Actual`, `${year} %`, `YoY Growth`]
              : [`Stream`, `${year} Target`, `${year} Actual`, `${year} %`]}
            rows={streams.map((line) => {
              const cur = streamOf(line, revCurrent);
              const prev = streamOf(line, revPrev);
              if (prevYear) {
                const g = growth(Number(cur?.actual || 0), Number(prev?.actual || 0));
                return [
                  line,
                  fmtNaira(Number(prev?.target || 0)),
                  fmtNaira(Number(prev?.actual || 0)),
                  <PctBar key={line+"a"} value={Number(prev?.pct || 0)} />,
                  fmtNaira(Number(cur?.target || 0)),
                  fmtNaira(Number(cur?.actual || 0)),
                  <PctBar key={line+"b"} value={Number(cur?.pct || 0)} />,
                  <span key={line+"g"} className={g >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>{g.toFixed(1)}%</span>,
                ];
              }
              return [
                line,
                fmtNaira(Number(cur?.target || 0)),
                fmtNaira(Number(cur?.actual || 0)),
                <PctBar key={line+"a"} value={Number(cur?.pct || 0)} />,
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
