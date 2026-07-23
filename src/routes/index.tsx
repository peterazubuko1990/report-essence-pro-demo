import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, EnhancedKpi, Note, Section, EmptyState } from "@/components/dashboard/widgets";
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

  const { data: managementAttentionNotes = [] } = useQuery<any[]>({
    queryKey: ["presenter_notes", "management_attention", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("presenter_notes")
        .select("*")
        .eq("year", year)
        .ilike("section", "management_attention")
        .order("sort_order");
      return data ?? [];
    },
  });

  if (!year || !hasData(year)) {
    return (
      <DashboardLayout title="Executive Overview" subtitle={year ? `TY ${year}` : "Loading…"}>
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
      title={`Executive Overview — TY ${year}`}
      subtitle={prevYear ? `One-page snapshot for TY ${year} with TY ${prevYear} comparisons.` : `One-page snapshot for TY ${year}.`}
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
          noteText="This total combines the live revenue streams and includes training-centre income in the stream totals."
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
            tone={kpiTone(Number(tc.pct ?? 0))}
            noteText="This Training Contribution total reflects all area-office entries. Training-centre rows are excluded from map and office breakdown calculations."
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
            tone={kpiTone(Number(cf.pct ?? 0))}
            noteText="This card reflects the live Course Fee stream total for the selected year and includes training-centre values in the stream total."
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
            tone={kpiTone(Number(oi.pct ?? 0))}
            noteText="This card reflects the live Other Income stream total for the selected year and includes training-centre values in the stream total."
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
          noteText="This is a headline participation count drawn from the current KRA 6 programme rows."
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
          noteText="This counts the KRA rows loaded for the selected year. It is a reporting count rather than a performance score."
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
          noteText="This counts the headline revenue streams available in the current dataset."
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
          noteText="Achievement is calculated as Actual ÷ Target × 100. It is a ratio view, not a stand-alone performance verdict."
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
            <p className="text-sm text-itf-ink/60">No KRA/KPI records for TY {year}.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {wins.map((k, i) => (
                <li key={i}>✅ <b>{k.kpi}</b> — {k.pct.toFixed(1)}% of target ({Number(k.actual).toLocaleString()} vs {Number(k.target).toLocaleString()})</li>
              ))}
            </ul>
          )}
        </Section>
        <Section kicker="Attention" title="Items Requiring Management Attention">
          {managementAttentionNotes.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {managementAttentionNotes.map((note: any) => (
                <li key={note.id}>⚠ {note.title ? <b>{note.title}. </b> : null}{note.body}</li>
              ))}
            </ul>
          ) : declines.length === 0 ? (
            <p className="text-sm text-itf-ink/60">No KRA/KPI records for TY {year}.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {declines.map((k, i) => (
                <li key={i}>⚠ <b>{k.kpi}</b> — {k.pct.toFixed(1)}% of target ({Number(k.actual).toLocaleString()} vs {Number(k.target).toLocaleString()})</li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="text-xs text-itf-ink/60">
        Achievement formula: <code>Actual ÷ Target × 100</code>. Growth formula: <code>(Current − Previous) ÷ Previous × 100</code>.
      </div>
    </DashboardLayout>
  );
}
