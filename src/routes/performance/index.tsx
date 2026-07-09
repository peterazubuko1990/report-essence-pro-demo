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

type RawKraRow = { kra: string; year: number; sort_order: number };
type KraCard = {
  kra: string;
  number: string;
  title: string;
  description?: string;
  years: number[];
  sortOrder: number;
};

function parseKraNumber(kra: string) {
  const match = kra.match(/^(KRA\s*\d+)/i);
  return match ? match[1].toUpperCase() : kra;
}

function parseKraTitle(kra: string) {
  const match = kra.match(/^(KRA\s*\d+)\s*[:–-]\s*(.+)$/i);
  return match ? `${match[1]}: ${match[2]}` : kra;
}

function parseKraDescription(kra: string) {
  const match = kra.match(/^(?:KRA\s*\d+)\s*[:–-]\s*(.+)$/i);
  return match ? match[2] : undefined;
}

function useKraOverview() {
  return useQuery<KraCard[]>({
    queryKey: ["performance.kra_overview"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("kra_rows")
        .select("kra, year, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;

      const map = new Map<string, { years: Set<number>; sortOrder: number }>();
      (data ?? []).forEach((row: RawKraRow) => {
        const existing = map.get(row.kra);
        if (existing) {
          existing.years.add(row.year);
          if (row.sort_order < existing.sortOrder) existing.sortOrder = row.sort_order;
        } else {
          map.set(row.kra, { years: new Set([row.year]), sortOrder: row.sort_order });
        }
      });

      return Array.from(map.entries())
        .map(([kra, entry]) => ({
          kra,
          number: parseKraNumber(kra),
          title: parseKraTitle(kra),
          description: parseKraDescription(kra),
          years: Array.from(entry.years).sort((a, b) => a - b),
          sortOrder: entry.sortOrder,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });
}

const CardLabel = ({ label }: { label: string }) => (
  <div className="text-[10px] uppercase tracking-[0.22em] text-itf-red font-semibold">{label}</div>
);

function Performance() {
  const { year } = useYear();
  const overviewQuery = useKraOverview();

  const cards = useMemo(() => {
    return (overviewQuery.data ?? []).filter((item) => item.years.includes(year));
  }, [overviewQuery.data, year]);

  return (
    <DashboardLayout
      title="Corporate Performance"
      subtitle={`Choose a parent KRA report for FY ${year}`}
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
                  <div className="font-semibold text-itf-ink">Reporting years available</div>
                  <div className="mt-1 text-sm">{item.years.join(", ")}</div>
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
