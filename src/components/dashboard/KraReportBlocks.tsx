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
    <div className="space-y-3 bg-white border border-itf-rule rounded-[32px] p-6 sm:p-8 shadow-xl">
      <div className="text-[11px] uppercase tracking-[0.32em] text-itf-red font-semibold">KRA Report</div>
      <h2 className="text-3xl sm:text-4xl font-bold text-itf-ink leading-tight">{title}</h2>
      {subtitle && <p className="max-w-3xl text-sm sm:text-base text-itf-ink/75 leading-relaxed">{subtitle}</p>}
    </div>
  );
});

export const ComparisonTable = memo(function ComparisonTable({
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
  const headers = useMemo(
    () =>
      previousYear
        ? [
            "S/N",
            "Key Performance Indicators",
            `${previousYear} Target`,
            `${previousYear} Actual`,
            `${previousYear} % Achieved`,
            `${currentYear} Target`,
            `${currentYear} Actual`,
            `${currentYear} % Achieved`,
          ]
        : ["S/N", "Key Performance Indicators", `${currentYear} Target`, `${currentYear} Actual`, `${currentYear} % Achieved`],
    [currentYear, previousYear]
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
      <div className="rounded-[28px] border border-itf-rule bg-white p-4 shadow-sm sm:p-6">
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
    <ChartCard title={title} kicker="Comparison" defaultKind="bar" allowKinds={["bar"]}>
      {(kind) => <ChartRenderer data={data} xKey="kpi" series={series} kind={kind} unit="%" />}
    </ChartCard>
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
