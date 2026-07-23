import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/widgets";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/performance/")({
  head: () => ({ meta: [{ title: "Corporate Performance · ITF Scorecard" }] }),
  component: Performance,
});

type RawKraRow = { kra: string; year: number; sort_order: number; target: number | null; actual: number | null; pct: number | null };
type TrendPreview = {
  previousValue: number | null;
  currentValue: number | null;
  previousPercent: number;
  currentPercent: number;
  trendLabel: string;
  trendTone: string;
  barColor: string;
};
type KraCard = {
  kra: string;
  number: string;
  title: string;
  description?: string;
  years: number[];
  sortOrder: number;
  rank: number;
  preview?: TrendPreview;
  previewLabel: string;
};

function parseKraLabel(kra: string) {
  const match = kra.match(/^(KRA\s*\d+)/i);
  return match ? match[1].toUpperCase() : kra;
}

function parseKraNumber(kra: string) {
  const match = kra.match(/KRA\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function getKraDisplayMeta(kra: string) {
  const number = parseKraNumber(kra);
  if (number === Number.MAX_SAFE_INTEGER) {
    return { title: kra, description: undefined };
  }

  const titleByNumber: Record<number, string> = {
    1: "Promoting Training Consciousness",
    2: "Encouraging / Providing Training",
    3: "Providing Training in Management, Technical, Vocational & Entrepreneurial Skills",
    4: "Setting Training Standards and Certification",
    5: "Managing & Administering SIWES",
    6: "Standards, Accreditation & Apprenticeship Activities",
    7: "Administrative & HR Support",
    8: "Revenue, Financial & Audit Support Services",
  };

  const descriptionByNumber: Record<number, string> = {
    1: "Performance overview for promoting training consciousness and awareness.",
    2: "Performance overview for encouraging and providing training across the training value chain.",
    3: "Performance overview for delivering management, technical, vocational and entrepreneurial training.",
    4: "Performance overview for setting training standards and certification.",
    5: "Performance overview for managing and administering SIWES activities.",
    6: "Performance overview for standards, accreditation and apprenticeship activities.",
    7: "Performance overview for administrative and HR support activities.",
    8: "Performance overview for revenue, financial and audit support services.",
  };

  const title = titleByNumber[number] ?? kra;
  const description = descriptionByNumber[number];
  return { title: `KRA ${number} — ${title}`, description };
}

function parseKraTitle(kra: string) {
  return getKraDisplayMeta(kra).title;
}

function getPreviewLabel(rank: number) {
  return rank >= 1 && rank <= 4 ? "Avg. % achieved" : "Current value";
}

function parseKraDescription(kra: string) {
  return getKraDisplayMeta(kra).description;
}

function summarizeKraValue(rows: RawKraRow[]) {
  if (!rows.length) return null;
  const values = rows
    .map((row) => Number(row.pct ?? 0))
    .filter((value) => Number.isFinite(value));
  if (values.some((value) => value !== 0)) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  const actualValues = rows
    .map((row) => Number(row.actual ?? 0))
    .filter((value) => Number.isFinite(value));
  return actualValues.reduce((sum, value) => sum + value, 0);
}

function buildTrendPreview(currentValue: number | null, previousValue: number | null) {
  if (currentValue == null && previousValue == null) {
    return {
      previousValue: null,
      currentValue: null,
      previousPercent: 0,
      currentPercent: 0,
      trendLabel: "No data",
      trendTone: "text-itf-ink/60",
      barColor: "bg-itf-rule",
    } satisfies TrendPreview;
  }

  const scale = Math.max(1, Math.abs(previousValue ?? 0), Math.abs(currentValue ?? 0));
  const previousPercent = previousValue == null ? 0 : Math.min(100, (Math.abs(previousValue) / scale) * 100);
  const currentPercent = currentValue == null ? 0 : Math.min(100, (Math.abs(currentValue) / scale) * 100);

  let trendLabel = "Stable";
  let trendTone = "text-itf-ink/60";
  let barColor = "bg-itf-rule";

  if (previousValue != null && currentValue != null) {
    if (currentValue > previousValue) {
      trendLabel = "Improved";
      trendTone = "text-itf-green";
      barColor = "bg-itf-green";
    } else if (currentValue < previousValue) {
      trendLabel = "Declined";
      trendTone = "text-itf-red";
      barColor = "bg-itf-red";
    }
  }

  return {
    previousValue,
    currentValue,
    previousPercent,
    currentPercent,
    trendLabel,
    trendTone,
    barColor,
  } satisfies TrendPreview;
}

function formatTrendValue(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function useKraOverview(selectedYear: number, previousYear: number | null) {
  return useQuery<KraCard[]>({
    queryKey: ["performance.kra_overview", selectedYear, previousYear],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const yearsToLoad = previousYear ? [selectedYear, previousYear] : [selectedYear];
      const { data, error } = await (supabase.from as any)("kra_rows")
        .select("kra, year, sort_order, target, actual, pct")
        .in("year", yearsToLoad)
        .order("sort_order", { ascending: true });
      if (error) throw error;

      const map = new Map<string, { years: Set<number>; sortOrder: number; rowsByYear: Map<number, RawKraRow[]> }>();
      (data ?? []).forEach((row: RawKraRow) => {
        const existing = map.get(row.kra);
        if (existing) {
          existing.years.add(row.year);
          if (row.sort_order < existing.sortOrder) existing.sortOrder = row.sort_order;
          const bucket = existing.rowsByYear.get(row.year) ?? [];
          bucket.push(row);
          existing.rowsByYear.set(row.year, bucket);
        } else {
          const rowsByYear = new Map<number, RawKraRow[]>();
          rowsByYear.set(row.year, [row]);
          map.set(row.kra, { years: new Set([row.year]), sortOrder: row.sort_order, rowsByYear });
        }
      });

      return Array.from(map.entries())
        .map(([kra, entry]) => {
          const currentRows = entry.rowsByYear.get(selectedYear) ?? [];
          const previousRows = previousYear ? (entry.rowsByYear.get(previousYear) ?? []) : [];
          const currentValue = summarizeKraValue(currentRows);
          const previousValue = summarizeKraValue(previousRows);
          return {
            kra,
            number: parseKraLabel(kra),
            title: parseKraTitle(kra),
            description: parseKraDescription(kra),
            years: Array.from(entry.years).sort((a, b) => a - b),
            sortOrder: entry.sortOrder,
            rank: parseKraNumber(kra),
            preview: buildTrendPreview(currentValue, previousValue),
            previewLabel: getPreviewLabel(parseKraNumber(kra)),
          } satisfies KraCard;
        })
        .sort((a, b) => a.rank - b.rank || a.sortOrder - b.sortOrder);
    },
  });
}

const CardLabel = ({ label }: { label: string }) => (
  <div className="text-[10px] uppercase tracking-[0.22em] text-itf-red font-semibold">{label}</div>
);

function Performance() {
  const { year, yearsWithData } = useYear();
  const previousYear = useMemo(() => [...yearsWithData].filter((y) => y < year).pop() ?? null, [year, yearsWithData]);
  const overviewQuery = useKraOverview(year, previousYear);

  const cards = useMemo(() => {
    return (overviewQuery.data ?? []).filter((item) => item.years.includes(year));
  }, [overviewQuery.data, year]);

  return (
    <DashboardLayout
      title="Corporate Performance"
      subtitle={`Choose a parent KRA report for TY ${year}`}
    >
      {overviewQuery.isLoading ? (
        <div className="text-sm text-itf-ink/60 p-8 text-center">Loading KRA report cards…</div>
      ) : cards.length === 0 ? (
        <EmptyState
          year={year}
          hint="No parent KRA data exists for this year. Use the admin panel to add KRA rows or clone from a previous year."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((item) => (
            <Link
              key={item.kra}
              to={`/performance/${encodeURIComponent(item.kra)}`}
              className="group relative overflow-hidden rounded-[32px] border border-itf-rule bg-white p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl hover:border-itf-green"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-itf-green to-itf-red" />
              <div className="relative z-10 flex flex-col h-full">
                <CardLabel label={item.number} />
                <h2 className="mt-3 text-xl font-semibold text-itf-ink leading-tight">{item.title}</h2>
                {item.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-itf-ink/70 line-clamp-3">{item.description}</p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-itf-ink/70">Executive summary of KRA performance and progress.</p>
                )}

                <div className="mt-5 rounded-3xl border border-itf-rule bg-itf-canvas/70 p-4 text-sm text-itf-ink/80">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-itf-ink/60">
                    <span>Previous TY</span>
                    <span>Current TY</span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-white/80">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-itf-gold/80" style={{ width: `${item.preview?.previousPercent ?? 0}%` }} />
                    <div className={`absolute inset-y-0 left-0 rounded-full ${item.preview?.barColor ?? "bg-itf-rule"}`} style={{ width: `${Math.max(6, item.preview?.currentPercent ?? 0)}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-itf-ink/60">
                    <span>{formatTrendValue(item.preview?.previousValue ?? null)}</span>
                    <span>{formatTrendValue(item.preview?.currentValue ?? null)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-itf-ink/60">
                    <span>{item.previewLabel}</span>
                    <span className={item.preview?.trendTone ?? "text-itf-ink/60"}>{item.preview?.trendLabel ?? "No data"}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-itf-green">
                  <span>Open Report</span>
                  <span className="text-2xl transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
