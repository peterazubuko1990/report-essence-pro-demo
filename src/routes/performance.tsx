import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Section, DataTable, PctBar, EmptyState, CompareYearPicker, Note } from "@/components/dashboard/widgets";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Corporate Performance · ITF Scorecard" }] }),
  component: Performance,
});

type KraRow = {
  id: string; year: number; kra: string; subgroup: string | null;
  kpi: string; target: number; actual: number; pct: number; sort_order: number;
};

type HrRow = { id: string; year: number; item: string; value: number; sort_order: number };
type NoteRow = { id: string; year: number; section: string; title: string | null; body: string };

function growth(a: number, b: number) { return b === 0 ? 0 : ((a - b) / b) * 100; }

function useYearRows<T = any>(table: string, year: number, enabled = true) {
  return useQuery<T[]>({
    queryKey: [table, year],
    enabled: enabled && year > 0,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)(table).select("*").eq("year", year);
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

function Performance() {
  const { year, yearsWithData } = useYear();
  const [compareYear, setCompareYear] = useState<number | null>(null);

  const cur = useYearRows<KraRow>("kra_rows", year);
  const cmp = useYearRows<KraRow>("kra_rows", compareYear ?? 0, !!compareYear);
  const hr = useYearRows<HrRow>("hr_metrics", year);
  const notes = useYearRows<NoteRow>("presenter_notes", year);

  const curRows = useMemo(() => (cur.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order), [cur.data]);
  const cmpRows = cmp.data ?? [];

  const hasCurrent = curRows.length > 0;

  // Auto-suggest compare year if not chosen: most recent year-with-data that is not `year`
  const suggestedCompare = useMemo(() => {
    const others = yearsWithData.filter((y) => y !== year);
    return others.length ? others[others.length - 1] : null;
  }, [yearsWithData, year]);

  const effectiveCompare = compareYear ?? suggestedCompare;
  const compareRows = compareYear ? cmpRows : (effectiveCompare ? undefined : []);

  // Fetch effective comparison automatically if user didn't pick one
  const auto = useYearRows<KraRow>("kra_rows", effectiveCompare ?? 0, !!effectiveCompare && !compareYear);
  const effectiveCompareRows = compareYear ? cmpRows : (auto.data ?? []);

  // Group by KRA name
  const kras = useMemo(() => {
    const map = new Map<string, KraRow[]>();
    curRows.forEach((r) => {
      if (!map.has(r.kra)) map.set(r.kra, []);
      map.get(r.kra)!.push(r);
    });
    return Array.from(map.entries());
  }, [curRows]);

  const findPrev = (r: KraRow) =>
    effectiveCompareRows.find((p) => p.kpi === r.kpi && (p.subgroup ?? "") === (r.subgroup ?? ""));

  const kraChart = (rows: KraRow[]) =>
    rows.map((r) => {
      const prev = findPrev(r);
      const point: any = { name: r.kpi.split(" ").slice(0, 3).join(" ") };
      point[`FY ${year} %`] = Number(r.pct ?? 0);
      if (effectiveCompare) point[`FY ${effectiveCompare} %`] = Number(prev?.pct ?? 0);
      return point;
    });

  return (
    <DashboardLayout
      title="Corporate Performance Analysis"
      subtitle={`Live from database · FY ${year}${effectiveCompare ? ` vs FY ${effectiveCompare}` : ""}`}
    >
      <div className="flex items-center justify-between bg-white border border-itf-rule rounded-md px-4 py-3">
        <div className="text-xs text-itf-ink/70">
          {hasCurrent
            ? <>Showing <b>{curRows.length}</b> KPI(s) across <b>{kras.length}</b> KRA group(s) for FY {year}.</>
            : <>No KPI data recorded for FY {year}.</>}
        </div>
        <CompareYearPicker
          currentYear={year}
          compareYear={compareYear}
          onChange={setCompareYear}
          yearsWithData={yearsWithData}
        />
      </div>

      {cur.isLoading ? (
        <div className="text-sm text-itf-ink/60 p-8 text-center">Loading…</div>
      ) : !hasCurrent ? (
        <EmptyState year={year} hint="No KRA / KPI rows exist for this year. Add rows via the admin panel or clone from a previous year." />
      ) : (
        <>
          {kras.map(([kraName, rows]) => {
            // If rows have subgroups, render each subgroup as its own table
            const subgroups = Array.from(new Set(rows.map((r) => r.subgroup).filter(Boolean))) as string[];
            const kraNote = notes.data?.find((n) => n.section === kraName);
            return (
              <Section key={kraName} kicker="KRA" title={kraName}>
                <div className="h-72 mb-4">
                  <ResponsiveContainer>
                    <BarChart data={kraChart(rows)} margin={{ top: 8, right: 16, left: 0, bottom: 30 }}>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} unit="%" />
                      <Tooltip />
                      <Legend />
                      {effectiveCompare && <Bar dataKey={`FY ${effectiveCompare} %`} fill="#7a8a99" />}
                      <Bar dataKey={`FY ${year} %`} fill="#00723F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {subgroups.length > 0
                  ? subgroups.map((sg) => (
                      <div key={sg} className="mb-4">
                        <div className="text-sm font-semibold text-itf-green mb-2">{sg}</div>
                        {renderKraTable(rows.filter((r) => r.subgroup === sg), effectiveCompare, findPrev, year)}
                      </div>
                    ))
                  : renderKraTable(rows, effectiveCompare, findPrev, year)}

                {kraNote && (
                  <Note>
                    {kraNote.title && <b>{kraNote.title}. </b>}
                    {kraNote.body}
                  </Note>
                )}
              </Section>
            );
          })}

          {(hr.data?.length ?? 0) > 0 && (
            <Section kicker="KRA 7" title="Administrative & Human Resource Support">
              <DataTable
                headers={effectiveCompare ? ["Item", `FY ${effectiveCompare}`, `FY ${year}`, "Change"] : ["Item", `FY ${year}`]}
                rows={(hr.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((r) => {
                  const cells: any[] = [r.item];
                  if (effectiveCompare) {
                    // hr_metrics for compare year would need a fetch; keep simple: skip prev value inline
                    cells.push("—");
                    cells.push(r.value.toLocaleString());
                    cells.push("");
                  } else {
                    cells.push(r.value.toLocaleString());
                  }
                  return cells;
                })}
              />
            </Section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function renderKraTable(
  rows: KraRow[],
  effectiveCompare: number | null,
  findPrev: (r: KraRow) => KraRow | undefined,
  year: number,
) {
  const headers = effectiveCompare
    ? ["KPI", `Target ${year}`, `Actual ${year}`, `% ${year}`, `% ${effectiveCompare}`, "YoY Δ"]
    : ["KPI", "Target", "Actual", "% Achieved"];
  return (
    <DataTable
      headers={headers}
      rows={rows.map((r) => {
        const cells: any[] = [
          <div key="k" className="font-medium">
            {r.kpi}
            {r.subgroup && <div className="text-[10px] uppercase tracking-wide text-itf-ink/50">{r.subgroup}</div>}
          </div>,
          Number(r.target).toLocaleString(),
          Number(r.actual).toLocaleString(),
          <PctBar key="p" value={Number(r.pct ?? 0)} />,
        ];
        if (effectiveCompare) {
          const prev = findPrev(r);
          cells.push(<PctBar key="cp" value={Number(prev?.pct ?? 0)} />);
          const g = prev ? growth(Number(r.actual), Number(prev.actual)) : 0;
          cells.push(
            <span key="g" className={g >= 0 ? "text-itf-green font-semibold" : "text-itf-red font-semibold"}>
              {prev ? `${g.toFixed(1)}%` : "—"}
            </span>
          );
        }
        return cells;
      })}
    />
  );
}
