import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Section } from "@/components/dashboard/widgets";
import { ChartCard, ChartRenderer } from "@/components/dashboard/ChartKit";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";
import { fmtNaira } from "@/data/itf2024";
import { buildRevenueAggregation, inferRevenueMode } from "@/lib/revenue-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Visual Analytics · ITF Scorecard" }] }),
  component: AnalyticsPage,
});

const GREEN = "#111827"; // near-black
const RED = "#C8102E";
const GOLD = "#D4A017";

function AnalyticsPage() {
  const { year, years } = useYear();

  const { data: areaRev = [] } = useQuery({
    queryKey: ["area_revenue", year],
    enabled: year > 0,
    queryFn: async () => (await supabase.from("area_revenue").select("*").eq("year", year)).data ?? [],
  });

  const { data: allAreaRev = [] } = useQuery({
    queryKey: ["area_revenue_all"],
    queryFn: async () => (await supabase.from("area_revenue").select("*")).data ?? [],
  });

  const { data: training = [] } = useQuery({
    queryKey: ["kra_rows_kra6", year],
    enabled: year > 0,
    queryFn: async () => (await supabase.from("kra_rows").select("*").eq("kra", "KRA 6").eq("year", year).order("sort_order")).data ?? [],
  });

  const areaOfficeRows = areaRev.filter((row: any) => inferRevenueMode(row) === "area-office");
  const allAreaOfficeRows = allAreaRev.filter((row: any) => inferRevenueMode(row) === "area-office");

  const officeTotals = Object.values(
    areaOfficeRows.reduce<Record<string, { office: string; category: string; actual: number; target: number }>>((acc, r) => {
      const k = r.office;
      acc[k] = acc[k] || { office: r.office, category: r.category, actual: 0, target: 0 };
      acc[k].actual += Number(r.actual || 0);
      acc[k].target += Number(r.target || 0);
      return acc;
    }, {}),
  ).sort((a, b) => b.actual - a.actual);

  const topOffices = officeTotals.slice(0, 10).map((o) => ({ ...o, actualB: +(o.actual / 1e9).toFixed(2) }));
  const bottomOffices = officeTotals.slice(-10).reverse().map((o) => ({ ...o, actualM: +(o.actual / 1e6).toFixed(1) }));

  const byCategory = ["A", "B", "C"].map((cat) => {
    const rows = areaOfficeRows.filter((r) => r.category === cat);
    return {
      category: `Cat ${cat}`,
      "Training Contribution": +(rows.filter((r) => r.stream === "Training Contribution").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9).toFixed(2),
      "Course Fee": +(rows.filter((r) => r.stream === "Course Fee").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9).toFixed(2),
      "Other Income": +(rows.filter((r) => r.stream === "Other Income").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9).toFixed(2),
    };
  });

  const catDonut = byCategory.map((c) => ({
    category: c.category,
    total: +(c["Training Contribution"] + c["Course Fee"] + c["Other Income"]).toFixed(2),
  }));

  const programmeDist = training
    .filter((t) => t.kpi !== "Total Number Trained")
    .map((t) => ({ programme: t.kpi, participants: Number(t.actual ?? 0) }));

  const yearlyTrend = years.map((y) => {
    const yr = allAreaRev.filter((row: any) => row.year === y);
    const aggregation = buildRevenueAggregation(yr, []);
    const totals = Object.fromEntries(aggregation.totals.map((row) => [row.stream, row]));
    return {
      year: String(y),
      Training: +(Number(totals["Training Contribution"]?.actual ?? 0) / 1e9).toFixed(2),
      Course: +(Number(totals["Course Fee"]?.actual ?? 0) / 1e9).toFixed(2),
      Other: +(Number(totals["Other Income"]?.actual ?? 0) / 1e9).toFixed(2),
    };
  });

  const prevYear = years[years.indexOf(year) - 1] ?? years[0];
  const officeCompare = topOffices.slice(0, 8).map((o) => {
    const prev = allAreaOfficeRows.filter((row: any) => row.office === o.office && row.year === prevYear).reduce((s, r) => s + Number(r.actual || 0), 0);
    return { office: o.office, [`${prevYear}`]: +(prev / 1e9).toFixed(2), [`${year}`]: +(o.actual / 1e9).toFixed(2) } as any;
  });

  return (
    <DashboardLayout title="Visual Analytics" subtitle={`Extended charts for FY ${year} — comparisons, rankings, distributions and trends. Switch chart type on each card.`}>
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title={`Top 10 Offices by Revenue — FY ${year} (₦B)`} kicker="Ranking" defaultKind="bar" allowKinds={["bar", "line", "area", "radar"]}>
          {(k) => <ChartRenderer data={topOffices} xKey="office" series={["actualB"]} kind={k} unit="B" seriesColors={[GREEN]} />}
        </ChartCard>

        <ChartCard title={`Lowest 10 Offices — FY ${year} (₦M)`} kicker="Ranking" defaultKind="bar" allowKinds={["bar", "line", "area", "radar"]}>
          {(k) => <ChartRenderer data={bottomOffices} xKey="office" series={["actualM"]} kind={k} unit="M" seriesColors={[RED]} />}
        </ChartCard>

        <ChartCard title={`Revenue Share by Office Category — FY ${year}`} kicker="Distribution" defaultKind="donut" allowKinds={["donut", "pie", "bar", "radar"]}>
          {(k) => <ChartRenderer data={catDonut} xKey="category" series={["total"]} kind={k} unit="B" />}
        </ChartCard>

        <ChartCard title={`Revenue Mix by Category — FY ${year} (₦B)`} kicker="Stacked" defaultKind="bar" allowKinds={["bar", "line", "area", "radar"]}>
          {(k) => <ChartRenderer data={byCategory} xKey="category" series={["Training Contribution", "Course Fee", "Other Income"]} kind={k} unit="B" />}
        </ChartCard>

        <ChartCard title={`Top Offices — ${prevYear} vs ${year} (₦B)`} kicker="Comparison" defaultKind="bar" allowKinds={["bar", "line", "area", "radar"]}>
          {(k) => <ChartRenderer data={officeCompare} xKey="office" series={[String(prevYear), String(year)]} kind={k} unit="B" />}
        </ChartCard>

        <ChartCard title="Multi-Year Revenue Trend (₦B)" kicker="Trend" defaultKind="line" allowKinds={["line", "area", "bar", "radar"]}>
          {(k) => <ChartRenderer data={yearlyTrend} xKey="year" series={["Training", "Course", "Other"]} kind={k} unit="B" />}
        </ChartCard>

        {programmeDist.length > 0 && (
          <ChartCard title={`Programme Participation Share — FY ${year}`} kicker="Programmes" defaultKind="donut" allowKinds={["donut", "pie", "bar", "radar"]}>
            {(k) => <ChartRenderer data={programmeDist} xKey="programme" series={["participants"]} kind={k} />}
          </ChartCard>
        )}

        <Section kicker="Health" title={`FY ${year} Revenue Achievement vs Target`}>
          <div className="space-y-3 py-3">
            {buildRevenueAggregation(areaRev, []).totals.map((row) => {
              const pct = row.target > 0 ? (row.actual / row.target) * 100 : 0;
              const tone = pct >= 100 ? GREEN : pct >= 70 ? GOLD : RED;
              return (
                <div key={row.stream}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{row.stream}</span>
                    <span>{fmtNaira(row.actual)} / {fmtNaira(row.target)} — <b>{pct.toFixed(1)}%</b></span>
                  </div>
                  <div className="h-2.5 rounded bg-slate-100 overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, background: tone }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
