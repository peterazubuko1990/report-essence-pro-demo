import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/widgets";
import { ChartCard, ChartRenderer } from "@/components/dashboard/ChartKit";
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

function buildMetricChartData(rows: Array<{ kpi: string; previousValue?: number | null; currentValue?: number | null }>, currentYear: number, previousYear: number | null) {
  return rows.map((row) => ({
    kpi: row.kpi,
    ...(previousYear ? { [String(previousYear)]: Number(row.previousValue ?? 0) } : {}),
    [String(currentYear)]: Number(row.currentValue ?? 0),
  }));
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

function getKraNameByNumber(num: number) {
  return num === 1
    ? "Promoting Training Consciousness"
    : num === 2
    ? "Encouraging / Providing Training"
    : num === 3
    ? "Providing Training in Management, Technical, Vocational & Entrepreneurial Skills"
    : num === 4
    ? "Setting Training Standards and Certification"
    : num === 5
    ? "Managing & Administering SIWES"
    : num === 6
    ? "Standards, Accreditation & Apprenticeship Activities"
    : num === 7
    ? "Administrative & HR Support"
    : num === 8
    ? "Revenue, Financial & Audit Support Services"
    : "KRA";
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
  const kraNumber = Number(title.match(/KRA\s*(\d+)/i)?.[1] ?? 0);
  const isKra1 = kraNumber === 1;
  const isKra2 = kraNumber === 2;
  const isKra3 = kraNumber === 3;
  const isKra4 = kraNumber === 4;
  const isKra5 = kraNumber === 5;
  const isKra6 = kraNumber === 6;
  const isKra7 = kraNumber === 7;
  const isKra8 = kraNumber === 8;
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
  const isMetricKra = isKra5 || isKra6 || isKra7 || isKra8;

  const metricGroups = useMemo(() => {
    if (!isMetricKra) return [];

    if (isKra5) {
      return [{ subgroup: "Overall", rows: buildMetricRows(currentRows, previousRows) }];
    }

    const groups = new Map<string, KraRow[]>();
    currentRows
      .filter((row) => !(isKra6 && row.kpi === "Total Number Trained"))
      .forEach((row) => {
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
          rows: buildMetricRows(rows.filter((row) => !(isKra6 && row.kpi === "Total Number Trained")), previousSubgroupRows),
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

  const nextKraNumber = kraNumber >= 1 && kraNumber < 8 ? kraNumber + 1 : null;
  const nextKraTitle = nextKraNumber ? getKraNameByNumber(nextKraNumber) : null;
  const nextKraLink = nextKraNumber ? `/performance/${encodeURIComponent(`KRA ${nextKraNumber}`)}` : undefined;
  const nextKraButton = nextKraLink ? (
    <div className="mt-6">
      <Link
        to={nextKraLink}
        className="inline-flex w-full items-center justify-between rounded-[32px] bg-gradient-to-r from-itf-green via-itf-green/95 to-itf-emerald text-white px-6 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] transition hover:from-itf-green/90 hover:to-itf-emerald/90"
      >
        <div className="space-y-1 text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-white/70">Next KRA</div>
          <div className="text-base font-black tracking-tight">KRA {nextKraNumber}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-white">{nextKraTitle}</div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/80">Continue</div>
        </div>
      </Link>
    </div>
  ) : null;

  if (!year || !hasData(year)) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle={year ? `TY ${year}` : "Loading…"}>
        <EmptyState year={year} hint={isKra1 ? "No KRA 1 data exists for this year. Use the admin panel to add or clone KRA rows for this year." : isKra5 ? "No KRA 5 data exists for this year. Use the admin panel to add or clone KRA rows for this year." : "No KRA data exists for this year. Use the admin panel to add or clone KRA rows for this year."} />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle={`TY ${year} vs ${prevYear ?? year}`}>
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
            : isKra8
            ? "KRA 8 — Revenue, Financial & Audit Support Services"
            : "KRA 7 — Administrative & HR Support"
        }
        subtitle={prevYear ? `TY ${year} vs TY ${prevYear}` : `TY ${year}`}
      >
        <div className="space-y-8 w-full">
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
            {metricGroups.map(({ subgroup, rows }) => {
              const chartRows = isKra6
                ? rows.filter((row) => {
                    const current = Number(row.currentValue ?? 0);
                    const previous = Number(row.previousValue ?? 0);
                    return current !== 0 || previous !== 0;
                  })
                : rows;

              const maxValue = chartRows.reduce((largest, row) => {
                const current = Number(row.currentValue ?? 0);
                const previous = Number(row.previousValue ?? 0);
                return Math.max(largest, current, previous);
              }, 0);

              const focusedRows = chartRows.filter((row) => {
                const current = Number(row.currentValue ?? 0);
                const previous = Number(row.previousValue ?? 0);
                const largestSeen = Math.max(current, previous);
                return maxValue > 0 && largestSeen > 0 && largestSeen <= maxValue * 0.35;
              });

              const focusRows = focusedRows.length >= 2 ? focusedRows : chartRows.slice(0, Math.min(3, chartRows.length));
              const fullChartData = buildMetricChartData(chartRows, year, prevYear);
              const focusChartData = buildMetricChartData(focusRows, year, prevYear);

              return (
                <div key={`${subgroup}-metric`} className="rounded-[44px] border border-itf-rule bg-white p-6 shadow-[0_22px_60px_-26px_rgba(0,0,0,0.25)] sm:p-8">
                  <div className="mb-6 border-b border-itf-rule/70 pb-4">
                    <div className="text-[11px] uppercase tracking-[0.32em] text-itf-red font-semibold">Metric values</div>
                    <h3 className="mt-3 text-2xl font-semibold text-itf-ink">{subgroup === "Overall" ? "Overall KPI Values" : subgroup}</h3>
                  </div>
                  <MetricComparisonSection title={subgroup === "Overall" ? `${pageTitle} — KPI values` : `${subgroup} — KPI values`} currentYear={year} previousYear={prevYear} rows={rows} />

                  {(isKra5 || isKra6 || isKra8) && focusRows.length > 0 && focusRows.length < chartRows.length ? (
                    <div className="mt-8 space-y-4">
                      <div className="rounded-[24px] border border-itf-rule bg-itf-canvas/40 p-4">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-itf-gold font-semibold">Focused view</div>
                        <h4 className="mt-2 text-xl font-semibold text-itf-ink">Smaller KPI values</h4>
                        <p className="mt-2 text-sm text-itf-ink/70">
                          Two charts are shown because the first uses a full-scale view for the larger KPIs, while this second chart magnifies the smaller values so they remain readable and comparable.
                        </p>
                      </div>
                      <div className="grid gap-6 xl:grid-cols-2">
                        <div className="overflow-hidden rounded-[30px] border border-itf-rule bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]">
                          <ChartCard title={`${subgroup === "Overall" ? pageTitle : subgroup} — full view`} kicker="Overview" defaultKind="bar" allowKinds={["bar", "line", "area"]}>
                            {(kind) => <ChartRenderer data={fullChartData} xKey="kpi" series={prevYear ? [String(prevYear), String(year)] : [String(year)]} kind={kind} unit="" />}
                          </ChartCard>
                        </div>
                        <div className="overflow-hidden rounded-[30px] border border-itf-rule bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]">
                          <ChartCard title={`${subgroup === "Overall" ? pageTitle : subgroup} — smaller KPI values`} kicker="Focused comparison" defaultKind="bar" allowKinds={["bar", "line", "area"]}>
                            {(kind) => <ChartRenderer data={focusChartData} xKey="kpi" series={prevYear ? [String(prevYear), String(year)] : [String(year)]} kind={kind} unit="" />}
                          </ChartCard>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 overflow-hidden rounded-[30px] border border-itf-rule bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]">
                      <ChartCard title={`${subgroup === "Overall" ? pageTitle : subgroup} — full view`} kicker="Overview" defaultKind="bar" allowKinds={["bar", "line", "area"]}>
                        {(kind) => <ChartRenderer data={fullChartData} xKey="kpi" series={prevYear ? [String(prevYear), String(year)] : [String(year)]} kind={kind} unit="" />}
                      </ChartCard>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {nextKraButton}
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
        subtitle={prevYear ? `TY ${year} vs TY ${prevYear}` : `TY ${year}`}
      >
        <div className="space-y-8 w-full">
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
                    <>
                      <ComparisonTable title={`${dataHeading} — Core Performance`} currentYear={year} previousYear={prevYear} rows={rows} />
                      <PercentageChart title={`${formatChartTitle(subgroup)} — Overall Achievement`} currentYear={year} previousYear={prevYear} rows={rows} deltaMode="difference" />
                    </>
                  </div>
                </div>,
              ];
            })}
          </div>
          {nextKraButton}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="KRA 1 — Promoting Training Consciousness"
      subtitle={prevYear ? `TY ${year} vs TY ${prevYear}` : `TY ${year}`}
    >
      <div className="space-y-8 w-full">
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
            deltaMode="difference"
          />
        )}

        <CommentaryBlock notes={notes} />
        {nextKraButton}
      </div>
    </DashboardLayout>
  );
}
