import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/widgets";
import { ReportHeader, ComparisonTable, PercentageChart, CommentaryBlock } from "@/components/dashboard/KraReportBlocks";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/performance/$kra")({
  head: () => ({ meta: [{ title: "KRA 1 · ITF Corporate Performance" }] }),
  component: KRAReport,
});

type Params = {
  kra: string;
};

type KraRow = {
  id: string;
  kra: string;
  subgroup: string | null;
  kpi: string;
  target: number;
  actual: number;
  pct: number;
  sort_order: number;
  year: number;
};

type NoteRow = {
  id: string;
  title: string | null;
  body: string;
  section: string;
  sort_order: number;
};

function useKraRows(kraKey: string, year: number, enabled: boolean) {
  return useQuery<KraRow[]>({
    queryKey: ["kra_rows", kraKey, year],
    enabled: year > 0 && enabled && !!kraKey,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("kra_rows")
        .select("*")
        .eq("year", year)
        .ilike("kra", `${kraKey}%`)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as KraRow[];
    },
  });
}

function useKraNotes(year: number) {
  return useQuery<NoteRow[]>({
    queryKey: ["presenter_notes", "KRA 1", year],
    enabled: year > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("presenter_notes")
        .select("*")
        .eq("year", year)
        .ilike("section", "%KRA 1%")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as NoteRow[];
    },
  });
}

function KRAReport() {
  const params = Route.useParams<Params>();
  const { year, yearsWithData, hasData } = useYear();
  const title = params.kra ? decodeURIComponent(params.kra) : "KRA 1";
  const isKra1 = title.toUpperCase().startsWith("KRA 1");
  const kraPrefix = isKra1 ? "KRA 1" : title;

  const prevYear = useMemo(() => [...yearsWithData].filter((y) => y < year).pop() ?? null, [year, yearsWithData]);
  const currentQuery = useKraRows(kraPrefix, year, true);
  const previousQuery = useKraRows(kraPrefix, prevYear ?? 0, prevYear !== null);
  const notesQuery = useKraNotes(year);

  if (!isKra1) {
    return (
      <DashboardLayout title="Corporate Performance" subtitle={`Placeholder for ${title}`}>
        <div className="rounded-3xl border border-itf-rule bg-white p-10 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-itf-red font-semibold mb-3">KRA Report</div>
          <h1 className="text-3xl font-semibold text-itf-ink mb-4">{title}</h1>
          <p className="mx-auto max-w-2xl text-sm text-itf-ink/70">
            This section is not yet implemented. KRA 1 is the only completed report page at this time.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const loading = currentQuery.isLoading || previousQuery.isLoading || notesQuery.isLoading;
  const currentRows = currentQuery.data ?? [];
  const previousRows = previousQuery.data ?? [];

  const comparisonRows = useMemo(
    () =>
      currentRows.map((row) => {
        const previous = previousRows.find((prev) => prev.kpi === row.kpi);
        return {
          kpi: row.kpi,
          previousTarget: previous?.target ?? null,
          previousActual: previous?.actual ?? null,
          previousPct: previous?.pct ?? null,
          currentTarget: row.target,
          currentActual: row.actual,
          currentPct: row.pct,
        };
      }),
    [currentRows, previousRows]
  );

  const notes = useMemo(
    () =>
      (notesQuery.data ?? [])
        .map((note) => note.body ?? note.title ?? "")
        .filter((text) => Boolean(text)),
    [notesQuery.data]
  );

  const firstChartRows = comparisonRows.slice(0, 3);
  const secondChartRows = comparisonRows.slice(3, 5);

  if (!year || !hasData(year)) {
    return (
      <DashboardLayout title="KRA 1 — Promoting Training Consciousness" subtitle={year ? `FY ${year}` : "Loading…"}>
        <EmptyState year={year} hint="No KRA 1 data exists for this year. Use the admin panel to add or clone KRA rows for this year." />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="KRA 1 — Promoting Training Consciousness" subtitle={`FY ${year} vs ${prevYear ?? year}`}>
        <div className="text-sm text-itf-ink/60 p-8 text-center">Loading KRA 1 report…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="KRA 1 — Promoting Training Consciousness"
      subtitle={prevYear ? `FY ${year} vs FY ${prevYear}` : `FY ${year}`}
    >
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/performance"
            className="inline-flex items-center gap-2 rounded-full border border-itf-rule bg-white px-4 py-2 text-sm font-semibold text-itf-ink shadow-sm transition hover:bg-itf-canvas"
          >
            ← Back to Corporate Performance
          </Link>
          <div className="text-sm text-itf-ink/60">KRA report navigation for executive review.</div>
        </div>

        <ReportHeader
          title="Promoting Training Consciousness"
          subtitle="Comparative performance analysis for KRA 1 metrics across the selected reporting years."
        />

        <ComparisonTable
          title="KRA 1 — Promoting Training Consciousness"
          currentYear={year}
          previousYear={prevYear}
          rows={comparisonRows}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          {firstChartRows.length > 0 && (
            <PercentageChart
              title="Training Consciousness — % Achieved"
              currentYear={year}
              previousYear={prevYear}
              rows={firstChartRows}
            />
          )}
          {secondChartRows.length > 0 && (
            <PercentageChart
              title="Employers’ Training Programmes — % Achieved"
              currentYear={year}
              previousYear={prevYear}
              rows={secondChartRows}
            />
          )}
        </div>

        <CommentaryBlock notes={notes} />
      </div>
    </DashboardLayout>
  );
}
