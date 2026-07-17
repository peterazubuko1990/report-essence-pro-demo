import { memo, useMemo, type ReactNode } from "react";
import { ChartCard, ChartRenderer } from "./ChartKit";
import { DataTable, Note, Section } from "./widgets";

export type ComparisonRow = {
  kpi: string;
  previousTarget?: number | null;
  previousActual?: number | null;
  previousPct?: number | null;
  currentTarget?: number | null;
  currentActual?: number | null;
  currentPct?: number | null;
};

const formatNumber = (value: number | null | undefined) =>
  value === undefined || value === null ? "—" : new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number | null | undefined) =>
  value === undefined || value === null ? "—" : `${value.toFixed(2)}%`;

export const ReportHeader = memo(function ReportHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[36px] border border-itf-rule bg-gradient-to-br from-white via-itf-canvas to-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] sm:p-8">
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-itf-green/10 to-transparent" />
      <div className="relative space-y-3">
        <div className="inline-flex items-center rounded-full border border-itf-red/20 bg-itf-red/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.3em] text-itf-red">
          KRA Report
        </div>
        <h2 className="max-w-4xl text-4xl font-bold leading-tight text-itf-ink sm:text-5xl">{title}</h2>
        {subtitle && <p className="max-w-3xl text-base leading-relaxed text-itf-ink/75 sm:text-lg">{subtitle}</p>}
      </div>
    </div>
  );
});

export const ComparisonTable = memo(function ComparisonTable({
  title,
  currentYear,
  previousYear,
  rows,
  targetLabel = "Target",
  actualLabel = "Actual",
  pctLabel = "% Achieved",
}: {
  title: string;
  currentYear: number;
  previousYear: number | null;
  rows: ComparisonRow[];
  targetLabel?: string;
  actualLabel?: string;
  pctLabel?: string;
}) {
  const headers = useMemo(
    () =>
      previousYear
        ? [
            "S/N",
            "Key Performance Indicators",
            `${previousYear} ${targetLabel}`,
            `${previousYear} ${actualLabel}`,
            `${previousYear} ${pctLabel}`,
            `${currentYear} ${targetLabel}`,
            `${currentYear} ${actualLabel}`,
            `${currentYear} ${pctLabel}`,
          ]
        : ["S/N", "Key Performance Indicators", `${currentYear} ${targetLabel}`, `${currentYear} ${actualLabel}`, `${currentYear} ${pctLabel}`],
    [actualLabel, currentYear, pctLabel, previousYear, targetLabel]
  );

  const tableRows = useMemo(
    () =>
      rows.map((row, index) =>
        previousYear
          ? [
              index + 1,
              row.kpi,
              formatNumber(row.previousTarget),
              formatNumber(row.previousActual),
              formatPercent(row.previousPct),
              formatNumber(row.currentTarget),
              formatNumber(row.currentActual),
              formatPercent(row.currentPct),
            ]
          : [
              index + 1,
              row.kpi,
              formatNumber(row.currentTarget),
              formatNumber(row.currentActual),
              formatPercent(row.currentPct),
            ]
      ),
    [previousYear, rows]
  );

  return (
    <Section kicker="Performance" title={title}>
      <div className="rounded-[30px] border border-itf-rule bg-gradient-to-br from-white via-itf-canvas/50 to-white p-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:p-5">
        <DataTable headers={headers} rows={tableRows} className="rounded-[24px] bg-white" />
      </div>
    </Section>
  );
});

export const PercentageChart = memo(function PercentageChart({
  title,
  currentYear,
  previousYear,
  rows,
}: {
  title: string;
  currentYear: number;
  previousYear: number | null;
  rows: ComparisonRow[];
}) {
  const series = useMemo(
    () => (previousYear ? [String(previousYear), String(currentYear)] : [String(currentYear)]),
    [currentYear, previousYear]
  );

  const data = useMemo(
    () =>
      rows.map((row) => ({
        kpi: row.kpi,
        ...(previousYear ? { [String(previousYear)]: row.previousPct ?? 0 } : {}),
        [String(currentYear)]: row.currentPct ?? 0,
      })),
    [currentYear, previousYear, rows]
  );

  return (
    <div className="overflow-hidden rounded-[30px] border border-itf-rule bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]">
      <ChartCard title={title} kicker="Comparison" defaultKind="bar" allowKinds={["bar"]}>
        {(kind) => <ChartRenderer data={data} xKey="kpi" series={series} kind={kind} unit="%" />}
      </ChartCard>
    </div>
  );
});

export const MetricComparisonSection = memo(function MetricComparisonSection({
  title,
  currentYear,
  previousYear,
  rows,
}: {
  title: string;
  currentYear: number;
  previousYear: number | null;
  rows: Array<{ kpi: string; previousValue?: number | null; currentValue?: number | null }>;
}) {
  const series = useMemo(
    () => (previousYear ? [String(previousYear), String(currentYear)] : [String(currentYear)]),
    [currentYear, previousYear]
  );

  const data = useMemo(
    () =>
      rows.map((row) => ({
        kpi: row.kpi,
        ...(previousYear ? { [String(previousYear)]: row.previousValue ?? 0 } : {}),
        [String(currentYear)]: row.currentValue ?? 0,
      })),
    [currentYear, previousYear, rows]
  );

  const headers = useMemo(
    () => (previousYear ? ["S/N", "KPI", `${previousYear} Value`, `${currentYear} Value`] : ["S/N", "KPI", `${currentYear} Value`]),
    [currentYear, previousYear]
  );

  const tableRows = useMemo(
    () =>
      rows.map((row, index) =>
        previousYear
          ? [index + 1, row.kpi, formatNumber(row.previousValue ?? null), formatNumber(row.currentValue ?? null)]
          : [index + 1, row.kpi, formatNumber(row.currentValue ?? null)]
      ),
    [previousYear, rows]
  );

  return (
    <Section kicker="Performance" title={title}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="rounded-[30px] border border-itf-rule bg-gradient-to-br from-white via-itf-canvas/50 to-white p-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:p-5">
          <DataTable headers={headers} rows={tableRows} className="rounded-[24px] bg-white" />
        </div>
        <div className="overflow-hidden rounded-[30px] border border-itf-rule bg-white shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)]">
          <ChartCard title={`${title} — Values`} kicker="Year-on-Year" defaultKind="bar" allowKinds={["bar"]}>
            {(kind) => <ChartRenderer data={data} xKey="kpi" series={series} kind={kind} unit="" />}
          </ChartCard>
        </div>
      </div>
    </Section>
  );
});

export const SubgroupComparisonSection = memo(function SubgroupComparisonSection({
  subgroup,
  currentYear,
  previousYear,
  rows,
}: {
  subgroup: string;
  currentYear: number;
  previousYear: number | null;
  rows: ComparisonRow[];
}) {
  return (
    <div className="rounded-[36px] border border-itf-rule bg-gradient-to-br from-white via-itf-canvas/60 to-white p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="mb-5 border-b border-itf-rule/70 pb-4">
        <div className="text-sm uppercase tracking-[0.24em] text-itf-red font-semibold">Subgroup</div>
        <h3 className="mt-2 text-3xl font-semibold text-itf-ink">{subgroup}</h3>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <ComparisonTable title={subgroup} currentYear={currentYear} previousYear={previousYear} rows={rows} />
        <PercentageChart title={`${subgroup} — % Achieved`} currentYear={currentYear} previousYear={previousYear} rows={rows} />
      </div>
    </div>
  );
});

export const CommentaryBlock = memo(function CommentaryBlock({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <Section kicker="Commentary" title="Presenter Notes">
      <div className="space-y-3">
        {notes.map((note, index) => (
          <Note key={index}>{note}</Note>
        ))}
      </div>
    </Section>
  );
});
