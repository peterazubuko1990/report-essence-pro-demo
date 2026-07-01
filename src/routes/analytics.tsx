import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Section } from "@/components/dashboard/widgets";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";
import { fmtNaira } from "@/data/itf2024";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Visual Analytics · ITF Scorecard" }] }),
  component: AnalyticsPage,
});

const GREEN = "#00723F";
const RED = "#C8102E";
const GOLD = "#D4A017";
const SLATE = "#7a8a99";
const PALETTE = [GREEN, RED, GOLD, "#0f766e", "#7c3aed", "#0369a1", "#b45309", "#4b5563"];

function AnalyticsPage() {
  const { year, years } = useYear();

  const { data: areaRev = [] } = useQuery({
    queryKey: ["area_revenue", year],
    queryFn: async () => {
      const { data } = await supabase.from("area_revenue").select("*").eq("year", year);
      return data ?? [];
    },
  });

  const { data: allAreaRev = [] } = useQuery({
    queryKey: ["area_revenue_all"],
    queryFn: async () => {
      const { data } = await supabase.from("area_revenue").select("*");
      return data ?? [];
    },
  });

  const { data: rev = [] } = useQuery({
    queryKey: ["revenue_rows_all"],
    queryFn: async () => {
      const { data } = await supabase.from("revenue_rows").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const { data: training = [] } = useQuery({
    queryKey: ["training_all"],
    queryFn: async () => {
      const { data } = await supabase.from("training_programmes").select("*");
      return data ?? [];
    },
  });

  // Office totals (selected year) with category
  const officeTotals = Object.values(
    areaRev.reduce<Record<string, { office: string; category: string; actual: number; target: number }>>((acc, r) => {
      const k = r.office;
      acc[k] = acc[k] || { office: r.office, category: r.category, actual: 0, target: 0 };
      acc[k].actual += Number(r.actual || 0);
      acc[k].target += Number(r.target || 0);
      return acc;
    }, {}),
  ).sort((a, b) => b.actual - a.actual);

  const topOffices = officeTotals.slice(0, 10).map((o) => ({ ...o, actualB: o.actual / 1e9 }));
  const bottomOffices = officeTotals.slice(-10).reverse().map((o) => ({ ...o, actualM: o.actual / 1e6 }));

  // Revenue by category (stacked)
  const byCategory = ["A", "B", "C"].map((cat) => {
    const rows = areaRev.filter((r) => r.category === cat);
    return {
      category: `Cat ${cat}`,
      "Training Contribution": rows.filter((r) => r.stream === "Training Contribution").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
      "Course Fee": rows.filter((r) => r.stream === "Course Fee").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
      "Other Income": rows.filter((r) => r.stream === "Other Income").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
    };
  });

  // Category donut
  const catDonut = byCategory.map((c) => ({
    name: c.category,
    value: c["Training Contribution"] + c["Course Fee"] + c["Other Income"],
  }));

  // Programme distribution donut
  const programmeDist = training
    .filter((t) => t.year === year && (t.participants ?? 0) > 0)
    .map((t) => ({ name: t.programme, value: Number(t.participants) }));

  // Yearly trend
  const yearlyTrend = years.map((y) => {
    const yr = rev.filter((r) => r.year === y);
    return {
      year: String(y),
      Training: yr.filter((r) => r.line === "Training Contribution").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
      Course: yr.filter((r) => r.line === "Course Fee").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
      Other: yr.filter((r) => r.line === "Other Income").reduce((s, r) => s + Number(r.actual || 0), 0) / 1e9,
    };
  });

  // 2023 vs current year office comparison (top 8 by current year)
  const prevYear = years[years.indexOf(year) - 1] ?? years[0];
  const officeCompare = topOffices.slice(0, 8).map((o) => {
    const prev = allAreaRev.filter((r) => r.office === o.office && r.year === prevYear).reduce((s, r) => s + Number(r.actual || 0), 0);
    return { office: o.office, [`${prevYear}`]: prev / 1e9, [`${year}`]: o.actual / 1e9 } as any;
  });

  return (
    <DashboardLayout title="Visual Analytics" subtitle={`Extended charts for FY ${year} — comparisons, rankings, distributions and trends.`}>
      <div className="grid lg:grid-cols-2 gap-6">
        <Section kicker="Ranking" title={`Top 10 Offices by Total Revenue — FY ${year} (₦B)`}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={topOffices} margin={{ left: 40 }}>
                <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="B" />
                <YAxis type="category" dataKey="office" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
                <Bar dataKey="actualB" fill={GREEN} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section kicker="Ranking" title={`Lowest 10 Offices by Revenue — FY ${year} (₦M)`}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={bottomOffices} margin={{ left: 40 }}>
                <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="M" />
                <YAxis type="category" dataKey="office" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(1)}M`} />
                <Bar dataKey="actualM" fill={RED} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section kicker="Distribution" title={`Revenue Share by Office Category — FY ${year}`}>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catDonut} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                  {catDonut.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section kicker="Stacked" title={`Revenue Mix by Category — FY ${year} (₦B)`}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="B" />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
                <Legend />
                <Bar dataKey="Training Contribution" stackId="a" fill={GREEN} />
                <Bar dataKey="Course Fee" stackId="a" fill={GOLD} />
                <Bar dataKey="Other Income" stackId="a" fill={RED} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section kicker="Comparison" title={`Top Offices — ${prevYear} vs ${year} (₦B)`}>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={officeCompare}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="office" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} unit="B" />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
                <Legend />
                <Bar dataKey={String(prevYear)} fill={SLATE} radius={[3, 3, 0, 0]} />
                <Bar dataKey={String(year)} fill={GREEN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section kicker="Trend" title="Multi-Year Revenue Trend (₦B)">
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={yearlyTrend}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="B" />
                <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
                <Legend />
                <Line type="monotone" dataKey="Training" stroke={GREEN} strokeWidth={3} />
                <Line type="monotone" dataKey="Course" stroke={GOLD} strokeWidth={2} />
                <Line type="monotone" dataKey="Other" stroke={RED} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {programmeDist.length > 0 && (
          <Section kicker="Programmes" title={`Programme Participation Share — FY ${year}`}>
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={programmeDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={110}>
                    {programmeDist.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        <Section kicker="Health" title={`FY ${year} Revenue Achievement vs Target`}>
          <div className="space-y-3 py-3">
            {rev.filter((r) => r.year === year).map((r) => {
              const pct = Number(r.pct ?? 0);
              const tone = pct >= 100 ? GREEN : pct >= 70 ? GOLD : RED;
              return (
                <div key={r.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{r.line}</span>
                    <span>{fmtNaira(Number(r.actual))} / {fmtNaira(Number(r.target))} — <b>{pct.toFixed(1)}%</b></span>
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
