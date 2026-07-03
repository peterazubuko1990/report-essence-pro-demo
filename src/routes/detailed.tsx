import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section, DataTable, PctBar, EmptyState } from "@/components/dashboard/widgets";
import { areaRevenue, trainingCentres, fmtNaira, growth, achievement } from "@/data/itf2024";
import { useMemo, useState } from "react";
import { useYear } from "@/lib/year-context";

export const Route = createFileRoute("/detailed")({
  head: () => ({
    meta: [
      { title: "Detailed Analysis · ITF 2024 Scorecard" },
      { name: "description", content: "Filter by office category and stream — drill into every ITF Area Office and Training Centre." },
      { property: "og:title", content: "ITF 2024 – Detailed Office & Centre Analysis" },
      { property: "og:description", content: "Interactive drill-down across area offices, categories and revenue streams." },
    ],
  }),
  component: Detailed,
});

function Detailed() {
  const { year, hasData } = useYear();
  if (!hasData(year)) {
    return (
      <DashboardLayout title="Detailed Analysis" subtitle={`FY ${year}`}>
        <EmptyState year={year} hint="No area-office or training-centre data recorded for this year." />
      </DashboardLayout>
    );
  }

  const [cat, setCat] = useState<"all" | "A" | "B" | "C">("all");
  const [stream, setStream] = useState<"all" | "Training Contribution" | "Course Fee" | "Other Income">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => areaRevenue.filter((r) =>
    (cat === "all" || r.category === cat) &&
    (stream === "all" || r.stream === stream) &&
    (q === "" || r.office.toLowerCase().includes(q.toLowerCase()))
  ), [cat, stream, q]);

  const totals = useMemo(() => ({
    t23: filtered.reduce((s, r) => s + r.target23, 0),
    a23: filtered.reduce((s, r) => s + r.actual23, 0),
    t24: filtered.reduce((s, r) => s + r.target24, 0),
    a24: filtered.reduce((s, r) => s + r.actual24, 0),
  }), [filtered]);

  return (
    <DashboardLayout title="Detailed Analysis" subtitle="Drill into individual offices, categories and revenue streams. Filters update totals and tables in real time.">
      <Section kicker="Filters" title="Filter & Drill Down">
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-itf-ink/60">Category</span>
            <select className="border border-itf-rule rounded px-2 py-1.5 bg-white" value={cat} onChange={(e) => setCat(e.target.value as any)}>
              <option value="all">All categories</option><option value="A">Category A</option><option value="B">Category B</option><option value="C">Category C</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-itf-ink/60">Revenue Stream</span>
            <select className="border border-itf-rule rounded px-2 py-1.5 bg-white" value={stream} onChange={(e) => setStream(e.target.value as any)}>
              <option value="all">All streams</option>
              <option>Training Contribution</option><option>Course Fee</option><option>Other Income</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[11px] uppercase tracking-wide text-itf-ink/60">Search office</span>
            <input className="border border-itf-rule rounded px-2 py-1.5 bg-white" placeholder="e.g. Abuja, Kano, Lekki" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button className="px-3 py-1.5 text-xs border border-itf-rule rounded bg-itf-canvas" onClick={() => { setCat("all"); setStream("all"); setQ(""); }}>Reset</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
          <div className="bg-itf-green/5 border border-itf-rule rounded px-3 py-2">
            <div className="text-[10px] uppercase text-itf-ink/60">2023 Actual (sum)</div>
            <div className="text-lg font-bold">{fmtNaira(totals.a23)}</div>
            <div className="text-[10px] text-itf-ink/60">{totals.t23 > 0 ? `${achievement(totals.a23, totals.t23).toFixed(1)}% of target` : "—"}</div>
          </div>
          <div className="bg-itf-green/5 border border-itf-rule rounded px-3 py-2">
            <div className="text-[10px] uppercase text-itf-ink/60">2024 Actual (sum)</div>
            <div className="text-lg font-bold text-itf-green">{fmtNaira(totals.a24)}</div>
            <div className="text-[10px] text-itf-ink/60">{totals.t24 > 0 ? `${achievement(totals.a24, totals.t24).toFixed(1)}% of target` : "—"}</div>
          </div>
          <div className="bg-itf-green/5 border border-itf-rule rounded px-3 py-2">
            <div className="text-[10px] uppercase text-itf-ink/60">YoY Growth</div>
            <div className={`text-lg font-bold ${growth(totals.a24, totals.a23) >= 0 ? "text-itf-green" : "text-itf-red"}`}>{growth(totals.a24, totals.a23).toFixed(1)}%</div>
          </div>
          <div className="bg-itf-green/5 border border-itf-rule rounded px-3 py-2">
            <div className="text-[10px] uppercase text-itf-ink/60">Rows shown</div>
            <div className="text-lg font-bold">{filtered.length}</div>
          </div>
        </div>
      </Section>

      <Section kicker="Drill" title="Filtered Area-Office Performance">
        <DataTable
          headers={["Office", "Cat", "Stream", "2023 Target", "2023 Actual", "2023 %", "2024 Target", "2024 Actual", "2024 %", "YoY"]}
          rows={filtered.map((r) => [
            r.office, r.category, r.stream,
            fmtNaira(r.target23),
            fmtNaira(r.actual23),
            <PctBar key="a" value={achievement(r.actual23, r.target23)} />,
            fmtNaira(r.target24),
            fmtNaira(r.actual24),
            <PctBar key="b" value={achievement(r.actual24, r.target24)} />,
            <span key="g" className={growth(r.actual24, r.actual23) >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>
              {growth(r.actual24, r.actual23).toFixed(1)}%
            </span>,
          ])}
        />
        <Note>Use the filters above to focus on under-performing categories (e.g. Cat B Training Contribution) or compare a single office's streams. Achievement bars colour-grade results: red &lt; 60%, amber 60-100%, green ≥ 100%.</Note>
      </Section>

      <Section kicker="Centres" title="Training Centres — Course Fee & Other Income">
        <DataTable
          headers={["Centre", "CF 2023", "CF 2024", "CF 2024 %", "OI 2023", "OI 2024", "OI 2024 %"]}
          rows={trainingCentres.map((c) => [
            c.centre,
            fmtNaira(c.cfActual23),
            fmtNaira(c.cfActual24),
            <PctBar key="a" value={achievement(c.cfActual24, c.cfTarget24)} />,
            fmtNaira(c.oiActual23),
            fmtNaira(c.oiActual24),
            <PctBar key="b" value={achievement(c.oiActual24, c.oiTarget24)} />,
          ])}
        />
        <Note>
          MSTC Abuja is the largest centre by Course Fee target but delivered only 11.4% in 2024 — a sharp fall from 43.7% in 2023. Centre for Excellence generated no Course Fee at all in 2024. These centres should be the first review priority for the Training Services Department.
        </Note>
      </Section>
    </DashboardLayout>
  );
}
