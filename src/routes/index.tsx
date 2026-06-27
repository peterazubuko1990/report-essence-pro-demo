import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, Note, Section, DataTable, PctBar } from "@/components/dashboard/widgets";
import { headlineRevenue, fmtNaira, growth, achievement, trainingTotals } from "@/data/itf2024";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview · ITF 2024 Corporate Scorecard" },
      { name: "description", content: "Director-level executive overview of the Industrial Training Fund 2024 corporate performance, revenue, and training delivery." },
      { property: "og:title", content: "ITF 2024 Corporate Scorecard – Executive Overview" },
      { property: "og:description", content: "Interactive management reporting system covering corporate performance, revenue generation, training and area-office delivery for 2024." },
    ],
  }),
  component: ExecutiveOverview,
});

function ExecutiveOverview() {
  const tc = headlineRevenue[0];
  const cf = headlineRevenue[1];
  const oi = headlineRevenue[2];
  const totalRev24 = tc.actual24 + cf.actual24 + oi.actual24;
  const totalRev23 = tc.actual23 + cf.actual23 + oi.actual23;
  const totalGrowth = growth(totalRev24, totalRev23);

  const revChart = headlineRevenue.map((r) => ({
    name: r.line, "2023": r.actual23 / 1_000_000_000, "2024": r.actual24 / 1_000_000_000,
  }));

  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle="One-page snapshot of corporate performance, revenue and people indicators for January – December 2024."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Total Revenue 2024" value={fmtNaira(totalRev24)} sub={`${totalGrowth >= 0 ? "+" : ""}${totalGrowth.toFixed(1)}% vs 2023`} tone={totalGrowth >= 0 ? "good" : "bad"} />
        <Kpi label="Training Contribution" value={fmtNaira(tc.actual24)} sub={`${tc.pct24.toFixed(1)}% of target`} tone="good" />
        <Kpi label="Course Fee" value={fmtNaira(cf.actual24)} sub={`${cf.pct24.toFixed(1)}% of target`} tone="warn" />
        <Kpi label="Other Income" value={fmtNaira(oi.actual24)} sub={`${oi.pct24.toFixed(1)}% of target`} tone="bad" />
        <Kpi label="Employers Registered" value="114,391" sub="156.4% of target · +13.9% YoY" tone="good" />
        <Kpi label="Employers Contributing" value="58,563" sub="62.8% of target · +47.9% YoY" tone="warn" />
        <Kpi label="Participants Trained" value={trainingTotals.p2024.toLocaleString()} sub={`+${growth(trainingTotals.p2024, trainingTotals.p2023).toFixed(1)}% vs 2023`} tone="good" />
        <Kpi label="New Companies Discovered" value="10,833" sub="455.2% of target" tone="good" />
      </div>

      <Section kicker="Revenue" title="2023 vs 2024 — Headline Revenue Streams (₦ Billions)">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={revChart} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="B" />
              <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}B`} />
              <Legend />
              <Bar dataKey="2023" fill="#7a8a99" radius={[3, 3, 0, 0]} />
              <Bar dataKey="2024" fill="#00723F" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Note>
          Training Contribution continues to anchor the Fund, growing from ₦58.04 B in 2023 to ₦64.53 B in 2024 (+11.2%). Course Fee and Other Income both declined and require management attention — Other Income fell sharply to only 5.4% of its 2024 target.
        </Note>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section kicker="Wins" title="Major Achievements">
          <ul className="space-y-2 text-sm">
            <li>✅ Employers Training Programmes Monitored hit <b>310.7%</b> of target (3,781 vs 1,217).</li>
            <li>✅ Discovery & registration of new companies at <b>455%</b> of target.</li>
            <li>✅ Total participants trained nearly doubled — 21,672 → 39,032 (+80.1%).</li>
            <li>✅ Training Contribution exceeded target by ₦6.23 B.</li>
            <li>✅ Staff School WASSCE pass rate reached <b>100%</b> (up from 98%).</li>
          </ul>
        </Section>
        <Section kicker="Areas of Decline" title="Items Requiring Director Attention">
          <ul className="space-y-2 text-sm">
            <li>⚠ Training Claims processed dropped from 652 → 321 (-50.8%).</li>
            <li>⚠ Other Income collapsed to ₦46.6 M vs ₦856.1 M target (5.4%).</li>
            <li>⚠ Course Fee delivery only 52.3% of target.</li>
            <li>⚠ Employers' accounts verified fell from 1,002 → 654.</li>
            <li>⚠ Several Cat-A offices (Benin, Port Harcourt) under-performed Training Contribution targets.</li>
          </ul>
        </Section>
      </div>

      <Section kicker="Snapshot" title="Headline Revenue Table">
        <DataTable
          headers={["Stream", "2023 Target", "2023 Actual", "2023 %", "2024 Target", "2024 Actual", "2024 %", "YoY Growth"]}
          rows={headlineRevenue.map((r) => [
            r.line,
            fmtNaira(r.target23),
            fmtNaira(r.actual23),
            <PctBar key={r.line+"a"} value={r.pct23} />,
            fmtNaira(r.target24),
            fmtNaira(r.actual24),
            <PctBar key={r.line+"b"} value={r.pct24} />,
            <span key={r.line+"g"} className={growth(r.actual24, r.actual23) >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>
              {growth(r.actual24, r.actual23).toFixed(1)}%
            </span>,
          ])}
        />
        <Note>
          Achievement % is recomputed as <i>Actual / Target × 100</i>; growth % as <i>(2024 − 2023) / 2023 × 100</i>. See the Data Validation page for corrections made against the original report.
        </Note>
      </Section>

      <Section kicker="Reading Guide" title="How to use this dashboard">
        <p className="text-sm leading-relaxed">
          The seven pages mirror the structure of the original 2024 End-of-Year PowerPoint while replacing repetitive tables with visuals: <b>Corporate Performance</b> covers all KRAs and KPIs, <b>Training Analysis</b> details participant programmes and Staff School, <b>Revenue Analysis</b> compares 2023 vs 2024, <b>Detailed Analysis</b> drills into individual Area Offices and Training Centres, <b>Management Insights</b> auto-generates risks and recommendations, and <b>Data Validation</b> documents every correction applied to the source numbers.
        </p>
      </Section>

      <div className="text-xs text-itf-ink/60">
        Achievement formula: <code>Actual ÷ Target × 100</code>. Growth formula: <code>(Current − Previous) ÷ Previous × 100</code>.
      </div>
    </DashboardLayout>
  );
}
