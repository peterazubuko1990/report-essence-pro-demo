import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section, DataTable } from "@/components/dashboard/widgets";
import { validationNotes, areaRevenue, headlineRevenue, fmtNaira, achievement } from "@/data/itf2024";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Data Validation · ITF 2024 Scorecard" },
      { name: "description", content: "Corrections applied to the original 2024 Corporate Scorecard data and the formulas used to validate them." },
      { property: "og:title", content: "ITF 2024 – Data Validation Report" },
      { property: "og:description", content: "Audit trail of percentage and total corrections applied during the dashboard build." },
    ],
  }),
  component: Validation,
});

function Validation() {
  // Recompute Category A weighted achievement to demonstrate
  const catA_TC = areaRevenue.filter((r) => r.category === "A" && r.stream === "Training Contribution");
  const a_t23 = catA_TC.reduce((s,r)=>s+r.target23,0);
  const a_a23 = catA_TC.reduce((s,r)=>s+r.actual23,0);
  const a_t24 = catA_TC.reduce((s,r)=>s+r.target24,0);
  const a_a24 = catA_TC.reduce((s,r)=>s+r.actual24,0);

  return (
    <DashboardLayout title="Data Validation Report" subtitle="Every correction made to the source numbers is documented here. The dashboards above use the corrected values.">
      <Section kicker="Formulas" title="Validation Formulas Applied">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-itf-canvas border border-itf-rule rounded p-4">
            <div className="font-semibold text-itf-green">Achievement %</div>
            <code className="block mt-1 text-itf-ink/80">Actual Achievement ÷ Annual Target × 100</code>
          </div>
          <div className="bg-itf-canvas border border-itf-rule rounded p-4">
            <div className="font-semibold text-itf-green">Year-on-Year Growth %</div>
            <code className="block mt-1 text-itf-ink/80">(Current Year − Previous Year) ÷ Previous Year × 100</code>
          </div>
          <div className="bg-itf-canvas border border-itf-rule rounded p-4">
            <div className="font-semibold text-itf-green">Group / Total Achievement</div>
            <code className="block mt-1 text-itf-ink/80">Σ Actual ÷ Σ Target × 100  <span className="text-itf-red">(weighted)</span></code>
            <div className="text-[11px] text-itf-ink/60 mt-1">Replaces the source approach of summing percentage values across rows.</div>
          </div>
          <div className="bg-itf-canvas border border-itf-rule rounded p-4">
            <div className="font-semibold text-itf-green">Group Total (₦)</div>
            <code className="block mt-1 text-itf-ink/80">Σ row-level Actual</code>
            <div className="text-[11px] text-itf-ink/60 mt-1">Recomputed for every Category total to detect typographical errors.</div>
          </div>
        </div>
      </Section>

      <Section kicker="Corrections" title="Corrections Applied vs Source PowerPoint">
        <DataTable
          headers={["Source Location", "Issue Identified", "Correction Applied"]}
          rows={validationNotes.map((v) => [v.page, v.issue, v.correction])}
        />
        <Note>No source figures were discarded; the original values remain on file in <code>src/data/itf2024.ts</code>. Corrections affect only derived totals and percentages used in dashboards.</Note>
      </Section>

      <Section kicker="Worked Example" title="Category A – Training Contribution (corrected totals)">
        <DataTable
          headers={["Year", "Σ Target", "Σ Actual", "Source % (sum of rows)", "Corrected % (Σ Actual / Σ Target)"]}
          rows={[
            ["2023", fmtNaira(a_t23), fmtNaira(a_a23), "1,200.93 %", <b key="x" className="text-itf-green">{achievement(a_a23, a_t23).toFixed(2)} %</b>],
            ["2024", fmtNaira(a_t24), fmtNaira(a_a24), "1,100.12 %", <b key="y" className="text-itf-green">{achievement(a_a24, a_t24).toFixed(2)} %</b>],
          ]}
        />
      </Section>

      <Section kicker="Headline Cross-Check" title="Headline Revenue — recomputed YoY">
        <DataTable
          headers={["Stream", "2023 Actual", "2024 Actual", "Reported 2024 %", "Verified 2024 %"]}
          rows={headlineRevenue.map((r) => [
            r.line, fmtNaira(r.actual23), fmtNaira(r.actual24),
            `${r.pct24.toFixed(2)} %`,
            <b key={r.line} className="text-itf-green">{achievement(r.actual24, r.target24).toFixed(2)} %</b>,
          ])}
        />
        <Note>All three headline percentages reconcile exactly with the source report. No correction required at this aggregation level.</Note>
      </Section>
    </DashboardLayout>
  );
}
