import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/widgets";
import { ReportHeader, ComparisonTable, PercentageChart, MetricComparisonSection, CommentaryBlock } from "@/components/dashboard/KraReportBlocks";
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
  previousValue?: number | null;
  currentValue?: number | null;
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

type ComparisonRow = {
  kpi: string;
  previousTarget?: number | null;
  previousActual?: number | null;
  previousPct?: number | null;
  currentTarget?: number | null;
  currentActual?: number | null;
  currentPct?: number | null;
};

function buildComparisonRows(currentRows: KraRow[], previousRows: KraRow[]) {
  return currentRows.map((row) => {
    const previous = previousRows.find((prev) => prev.kpi === row.kpi);
    return {
      kpi: row.kpi,
      previousTarget: previous?.target ?? null,
      previousActual: previous?.actual ?? null,
      previousPct: previous?.pct ?? null,
      currentTarget: row.target,
      currentActual: row.actual,
      currentPct: row.pct,
    } satisfies ComparisonRow;
  });
}

function buildMetricRows(currentRows: KraRow[], previousRows: KraRow[]) {
  return currentRows.map((row) => {
    const previous = previousRows.find((prev) => prev.kpi === row.kpi);
    return {
      kpi: row.kpi,
      previousValue: previous?.actual ?? previous?.currentValue ?? null,
      currentValue: row.actual ?? row.currentValue ?? null,
    };
  });
}

function formatDataSlideHeading(subgroup: string) {
  const cleaned = subgroup.trim();
  if (!cleaned) return "OVERALL";
  const compact = cleaned.replace(/\s+/g, " ");
  const match = compact.match(/^(\d+)\.(\d+)\s+(.*)$/);
  if (!match) return compact.toUpperCase();
  return `${match[1]}.${match[2]}. ${match[3].toUpperCase()}`;
}

function formatTitleSlideHeading(subgroup: string) {
  const cleaned = subgroup.trim();
  if (!cleaned) return "OVERALL";
  const compact = cleaned.replace(/\s+/g, " ");
  const match = compact.match(/^(\d+)\.(\d+)\s+(.*)$/);
  if (!match) return compact.toUpperCase();
  return match[3].toUpperCase();
}

function formatChartTitle(subgroup: string) {
  const cleaned = subgroup.trim();
  if (!cleaned) return "Performance Comparison";
  return `${formatDataSlideHeading(subgroup)} — % Achieved`;
}

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

function useKraNotes(year: number, enabled: boolean) {
  return useQuery<NoteRow[]>({
    queryKey: ["presenter_notes", "KRA 1", year],
    enabled: year > 0 && enabled,
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
  const params = Route.useParams();
  const { year, yearsWithData, hasData } = useYear();
  const title = params.kra ? decodeURIComponent(params.kra) : "KRA 1";
  const isKra1 = title.toUpperCase().startsWith("KRA 1");
  const isKra2 = title.toUpperCase().startsWith("KRA 2");
  const isKra3 = title.toUpperCase().startsWith("KRA 3");
  const isKra4 = title.toUpperCase().startsWith("KRA 4");
  const isKra5 = title.toUpperCase().startsWith("KRA 5");
  const isKra6 = title.toUpperCase().startsWith("KRA 6");
  const isKra7 = title.toUpperCase().startsWith("KRA 7");
  const isKra8 = title.toUpperCase().startsWith("KRA 8");
  const kraPrefix = isKra1
    ? "KRA 1"
    : isKra2
    ? "KRA 2"
    : isKra3
    ? "KRA 3"
    : isKra4
    ? "KRA 4"
    : isKra5
    ? "KRA 5"
    : isKra6
    ? "KRA 6"
    : isKra7
    ? "KRA 7"
    : isKra8
    ? "KRA 8"
    : title;

  const prevYear = useMemo(() => [...yearsWithData].filter((y) => y < year).pop() ?? null, [year, yearsWithData]);
  const currentQuery = useKraRows(kraPrefix, year, true);
  const previousQuery = useKraRows(kraPrefix, prevYear ?? 0, prevYear !== null);
  const notesQuery = useKraNotes(year, isKra1);

  if (!isKra1 && !isKra2 && !isKra3 && !isKra4 && !isKra5 && !isKra6 && !isKra7 && !isKra8) {
    return (
      <DashboardLayout title="Corporate Performance" subtitle={`Placeholder for ${title}`}>
        <div className="rounded-3xl border border-itf-rule bg-white p-10 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-itf-red font-semibold mb-3">KRA Report</div>
          <h1 className="text-3xl font-semibold text-itf-ink mb-4">{title}</h1>
          <p className="mx-auto max-w-2xl text-sm text-itf-ink/70">
            This section is not yet implemented.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const loading = currentQuery.isLoading || previousQuery.isLoading;
  const currentRows = currentQuery.data ?? [];
  const previousRows = previousQuery.data ?? [];

  const comparisonRows = useMemo(() => buildComparisonRows(currentRows, previousRows), [currentRows, previousRows]);
  const isMetricKra = isKra5 || isKra6 || isKra7;

  const metricGroups = useMemo(() => {
    if (!isMetricKra) return [];

    if (isKra5) {
      return [{ subgroup: "Overall", rows: buildMetricRows(currentRows, previousRows) }];
    }

    const groups = new Map<string, KraRow[]>();
    currentRows.forEach((row) => {
      const subgroup = (row.subgroup ?? "Overall").trim() || "Overall";
      const existing = groups.get(subgroup);
      if (existing) existing.push(row);
      else groups.set(subgroup, [row]);
    });

    return Array.from(groups.entries())
      .map(([subgroup, rows]) => {
        const previousSubgroupRows = previousRows.filter((row) => {
          const normalizedSubgroup = (row.subgroup ?? "Overall").trim() || "Overall";
          return normalizedSubgroup === subgroup;
        });

        return {
          subgroup,
          rows: buildMetricRows(rows, previousSubgroupRows),
        };
      })
      .sort((a, b) => {
        const aRank = a.subgroup.match(/^(\\d+)\\.(\\d+)/)?.slice(1).join(".") ?? a.subgroup;
        const bRank = b.subgroup.match(/^(\\d+)\\.(\\d+)/)?.slice(1).join(".") ?? b.subgroup;
        return aRank.localeCompare(bRank);
      });
  }, [currentRows, isKra5, isMetricKra, previousRows]);

  const subgroupGroups = useMemo(() => {
    if (!(isKra2 || isKra3 || isKra4 || isKra6 || isKra7 || isKra8)) return [];
    const groups = new Map<string, KraRow[]>();
    currentRows.forEach((row) => {
      const subgroup = (row.subgroup ?? "Overall").trim() || "Overall";
      const existing = groups.get(subgroup);
      if (existing) existing.push(row);
      else groups.set(subgroup, [row]);
    });

    return Array.from(groups.entries())
      .map(([subgroup, rows]) => {
        const previousSubgroupRows = previousRows.filter((row) => {
          const normalizedSubgroup = (row.subgroup ?? "Overall").trim() || "Overall";
          return normalizedSubgroup === subgroup;
        });

        return {
          subgroup,
          rows: buildComparisonRows(rows, previousSubgroupRows),
        };
      })
      .sort((a, b) => {
        const aRank = a.subgroup.match(/^(\d+)\.(\d+)/)?.slice(1).join(".") ?? a.subgroup;
        const bRank = b.subgroup.match(/^(\d+)\.(\d+)/)?.slice(1).join(".") ?? b.subgroup;
        return aRank.localeCompare(bRank);
      });
  }, [currentRows, isKra2, previousRows]);

  const notes = useMemo(
    () =>
      (notesQuery.data ?? [])
        .map((note) => note.body ?? note.title ?? "")
        .filter((text) => Boolean(text)),
    [notesQuery.data]
  );

  const firstChartRows = comparisonRows.slice(0, 3);
  const secondChartRows = comparisonRows.slice(3, 5);

  const pageTitle = isKra1
    ? "Promoting Training Consciousness"
    : isKra2
    ? "Encouraging / Providing Training"
    : isKra3
    ? "Providing Training in Management, Technical, Vocational & Entrepreneurial Skills"
    : isKra4
    ? "Setting Training Standards and Certification"
    : isKra5
    ? "Managing & Administering SIWES"
    : isKra6
    ? "Standards, Accreditation & Apprenticeship Activities"
    : isKra7
    ? "Administrative & HR Support"
    : isKra8
    ? "Revenue, Financial & Audit Support Services"
    : title;
  const pageSubtitle = isKra1
    ? "Comparative performance analysis for KRA 1 metrics across the selected reporting years."
    : isKra2
    ? "Comparative performance analysis for KRA 2 subgroup performance across the selected reporting years."
    : isKra3
    ? "Comparative performance analysis for KRA 3 subgroup performance across the selected reporting years."
    : isKra4
    ? "Comparative performance analysis for KRA 4 subgroup performance across the selected reporting years."
    : isKra5
    ? "Comparative performance analysis for KRA 5 SIWES metrics across the selected reporting years."
    : isKra6
    ? "Comparative performance analysis for KRA 6 subgroup performance across the selected reporting years."
    : isKra7
    ? "Comparative performance analysis for KRA 7 subgroup performance across the selected reporting years."
    : isKra8
    ? "Comparative performance analysis for KRA 8 subgroup performance across the selected reporting years."
    : title;

  const kraNumber = isKra1 ? 1 : isKra2 ? 2 : isKra3 ? 3 : isKra4 ? 4 : isKra5 ? 5 : isKra6 ? 6 : isKra7 ? 7 : isKra8 ? 8 : null;
  const topKraLabel = kraNumber ? `KRA ${kraNumber}` : "KRA Report";
  const bigHeading = kraNumber ? `KEY RESULT AREA ${kraNumber}: ${pageTitle}` : pageTitle;

  const dashboardTitle = isKra1
    ? "KRA 1 — Promoting Training Consciousness"
    : isKra2
    ? "KRA 2 — Encouraging / Providing Training"
    : isKra3
    ? "KRA 3 — Providing Training in Management, Technical, Vocational & Entrepreneurial Skills"
    : isKra4
    ? "KRA 4 — Setting Training Standards and Certification"
    : isKra5
    ? "KRA 5 — Managing & Administering SIWES"
    : isKra6
    ? "KRA 6 — Standards, Accreditation & Apprenticeship Activities"
    : isKra7
    ? "KRA 7 — Administrative & HR Support"
    : isKra8
    ? "KRA 8 — Revenue, Financial & Audit Support Services"
    : "Corporate Performance";

  if (!year || !hasData(year)) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle={year ? `FY ${year}` : "Loading…"}>
        <EmptyState year={year} hint={isKra1 ? "No KRA 1 data exists for this year. Use the admin panel to add or clone KRA rows for this year." : isKra5 ? "No KRA 5 data exists for this year. Use the admin panel to add or clone KRA rows for this year." : "No KRA data exists for this year. Use the admin panel to add or clone KRA rows for this year."} />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle={`FY ${year} vs ${prevYear ?? year}`}>
        <div className="text-sm text-itf-ink/60 p-8 text-center">{isKra1 ? "Loading KRA 1 report…" : isKra5 ? "Loading KRA 5 report…" : "Loading KRA report…"}</div>
      </DashboardLayout>
    );
  }

  if (isMetricKra) {
    return (
      <DashboardLayout
        title={
          isKra5
            ? "KRA 5 — Managing & Administering SIWES"
            : isKra6
            ? "KRA 6 — Standards, Accreditation & Apprenticeship Activities"
            : "KRA 7 — Administrative & HR Support"
        }
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

          <ReportHeader title={pageTitle} subtitle={pageSubtitle} />

          <div className="space-y-8">
            {metricGroups.map(({ subgroup, rows }) => (
              <div key={`${subgroup}-metric`} className="rounded-[44px] border border-itf-rule bg-white p-6 shadow-[0_22px_60px_-26px_rgba(0,0,0,0.25)] sm:p-8">
                <div className="mb-6 border-b border-itf-rule/70 pb-4">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-itf-red font-semibold">Metric values</div>
                  <h3 className="mt-3 text-2xl font-semibold text-itf-ink">{subgroup === "Overall" ? "Overall KPI Values" : subgroup}</h3>
                </div>
                <MetricComparisonSection title={subgroup === "Overall" ? `${pageTitle} — KPI values` : `${subgroup} — KPI values`} currentYear={year} previousYear={prevYear} rows={rows} />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isKra2 || isKra3 || isKra4 || isKra6 || isKra7 || isKra8) {
    return (
      <DashboardLayout
        title={
          isKra2
            ? "KRA 2 — Encouraging / Providing Training"
            : isKra3
            ? "KRA 3 — Providing Training in Management, Technical, Vocational & Entrepreneurial Skills"
            : isKra4
            ? "KRA 4 — Setting Training Standards and Certification"
            : isKra6
            ? "KRA 6 — Standards, Accreditation & Apprenticeship Activities"
            : isKra7
            ? "KRA 7 — Administrative & HR Support"
            : "KRA 8 — Revenue, Financial & Audit Support Services"
        }
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

          <ReportHeader title={pageTitle} subtitle={pageSubtitle} />

          <div className="space-y-8">
            {subgroupGroups.flatMap(({ subgroup, rows }) => {
              const dataHeading = formatDataSlideHeading(subgroup);
              const titleHeading = formatTitleSlideHeading(subgroup);
              return [
                <div key={`${subgroup}-title`} className="relative overflow-hidden rounded-[44px] border border-itf-rule bg-gradient-to-br from-white via-itf-canvas to-white p-8 shadow-[0_22px_60px_-26px_rgba(0,0,0,0.3)]">
                  <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-itf-green/12 to-transparent" />
                  <div className="relative text-center">
                    <div className="inline-flex items-center rounded-full border border-itf-red/20 bg-itf-red/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-itf-red">{topKraLabel}</div>
                    <h3 className="mt-4 text-3xl font-semibold text-itf-ink sm:text-4xl">{titleHeading}</h3>
                  </div>
                </div>,
                <div key={`${subgroup}-slide`} className="rounded-[44px] border border-itf-rule bg-white p-6 shadow-[0_22px_60px_-26px_rgba(0,0,0,0.25)] sm:p-8">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-itf-red font-semibold">
                    COMPARATIVE ANALYSIS OF 2023/2024 TRAINING ACTIVITIES…
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-itf-ink">{bigHeading}</h3>
                  <h4 className="mt-4 text-xl font-semibold text-itf-ink">{dataHeading}</h4>
                          <div className="mt-8 space-y-6">
                    {isKra8 ? (
                      <>
                        <ComparisonTable title={`${dataHeading} — Core Performance`} currentYear={year} previousYear={prevYear} rows={rows} />
                        <PercentageChart title={`${formatChartTitle(subgroup)} — Overall Achievement`} currentYear={year} previousYear={prevYear} rows={rows} />
                        <ComparisonTable title={`${dataHeading} — Annual Target / Actual / Achievement`} currentYear={year} previousYear={prevYear} rows={rows} targetLabel="Annual Target" actualLabel="Actual" pctLabel="% Achieved" />
                        <PercentageChart title={`${formatChartTitle(subgroup)} — Annual Achievement`} currentYear={year} previousYear={prevYear} rows={rows} />
                      </>
                    ) : (
                      <>
                        <ComparisonTable title={dataHeading} currentYear={year} previousYear={prevYear} rows={rows} />
                        <PercentageChart title={formatChartTitle(subgroup)} currentYear={year} previousYear={prevYear} rows={rows} />
                      </>
                    )}
                  </div>
                </div>,
              ];
            })}
          </div>
        </div>
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
          title={pageTitle}
          subtitle={pageSubtitle}
        />

        <ComparisonTable
          title="KRA 1 — Promoting Training Consciousness"
          currentYear={year}
          previousYear={prevYear}
          rows={comparisonRows}
        />

        {comparisonRows.length > 0 && (
          <PercentageChart
            title="KRA 1 — % Achieved"
            currentYear={year}
            previousYear={prevYear}
            rows={comparisonRows}
          />
        )}

        <CommentaryBlock notes={notes} />
      </div>
    </DashboardLayout>
  );
}
