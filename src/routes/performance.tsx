import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section, DataTable, PctBar } from "@/components/dashboard/widgets";
import { kra1, kra2, revenueActivity, adminSupport, achievement, growth } from "@/data/itf2024";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Corporate Performance · ITF 2024 Scorecard" },
      { name: "description", content: "KRA-by-KRA target vs achievement analysis for ITF corporate performance in 2024 with 2023 comparatives." },
      { property: "og:title", content: "ITF 2024 – Corporate Performance Analysis" },
      { property: "og:description", content: "All Key Result Areas, targets, achievements and year-on-year growth from the 2024 Corporate Scorecard." },
    ],
  }),
  component: Performance,
});

function kraTable(rows: typeof kra1) {
  return (
    <DataTable
      headers={["KPI", "2023 Target", "2023 Actual", "2023 %", "2024 Target", "2024 Actual", "2024 %", "YoY Δ"]}
      rows={rows.map((r) => [
        <div key={r.kpi} className="font-medium">{r.kpi}{r.subgroup && <div className="text-[10px] uppercase tracking-wide text-itf-ink/50">{r.subgroup}</div>}</div>,
        r.target23.toLocaleString(),
        r.actual23.toLocaleString(),
        <PctBar key="a" value={r.pct23} />,
        r.target24.toLocaleString(),
        r.actual24.toLocaleString(),
        <PctBar key="b" value={r.pct24} />,
        <span key="g" className={growth(r.actual24, r.actual23) >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>
          {r.actual23 === 0 ? "—" : `${growth(r.actual24, r.actual23).toFixed(1)}%`}
        </span>,
      ])}
    />
  );
}

function Performance() {
  const subgroups = Array.from(new Set(kra2.filter((r) => r.subgroup).map((r) => r.subgroup!)));

  const kra1Chart = kra1.map((r) => ({ name: r.kpi.split(" ").slice(0,3).join(" "), "2023 %": r.pct23, "2024 %": r.pct24 }));

  return (
    <DashboardLayout title="Corporate Performance Analysis" subtitle="All ten Key Result Areas with target, actual achievement, percentage delivery and YoY change.">
      <Section kicker="KRA 1" title="Promoting Training Consciousness — Achievement % comparison">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={kra1Chart} margin={{ top: 8, right: 16, left: 0, bottom: 30 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="2023 %" fill="#7a8a99" />
              <Bar dataKey="2024 %" fill="#00723F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {kraTable(kra1)}
        <Note>
          Monitoring of employer programmes surged from 171% to 311% — strong field activity. Engagement and claims processing remain the structural weak points: only 48.8% of targeted organisations were engaged, and claims processing dropped further.
        </Note>
      </Section>

      <Section kicker="KRA 2" title="Encouraging / Providing Training — six work-streams">
        {subgroups.map((g) => (
          <div key={g} className="mb-5">
            <div className="text-sm font-semibold text-itf-green mb-2">{g}</div>
            {kraTable(kra2.filter((r) => r.subgroup === g))}
          </div>
        ))}
        <Note>
          In-Company Safety surveys exceeded target (120%) and PPIT surveys reached 103%, but Resource Consultancy, MSME packages and new programme test-runs all came in below 60% — these directly affect intervention pipeline for 2025.
        </Note>
      </Section>

      <Section kicker="KRA 8" title="Revenue-Generation Operating Activities (counts, not naira)">
        {kraTable(revenueActivity)}
        <Note>
          The Fund is acquiring employers faster than it is monetising them: registrations are at 156% of target but only 63% of registered employers are contributing. Closing this collection gap is the single biggest revenue lever for 2025.
        </Note>
      </Section>

      <Section kicker="KRA 7" title="Administrative & Human Resource Support — staff movements and capacity">
        <DataTable
          headers={["Item", "2023", "2024", "Change"]}
          rows={adminSupport.map((r) => [
            r.item,
            r.y2023.toLocaleString(),
            r.y2024.toLocaleString(),
            <span key={r.item} className={r.y2024 - r.y2023 >= 0 ? "text-itf-green" : "text-itf-red"}>{(r.y2024 - r.y2023).toLocaleString()}</span>,
          ])}
        />
        <Note>
          Senior staff strength grew by 136 and 196 new staff were recruited in 2024. Short-term capacity building dropped (1,394 → 1,056) while professional-body participation grew (58 → 100) — staff welfare loans were not extended in 2024.
        </Note>
      </Section>
    </DashboardLayout>
  );
}
