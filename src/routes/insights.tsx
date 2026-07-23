import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section, EmptyState } from "@/components/dashboard/widgets";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Management Insights · ITF Scorecard" }] }),
  component: Insights,
});

type Row = { id: string; text?: string; body?: string; title?: string | null; section?: string; tone?: string; sort_order: number };

function useYearTable(table: string, year: number) {
  return useQuery<Row[]>({
    queryKey: [table, year],
    enabled: year > 0,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)(table).select("*").eq("year", year).order("sort_order");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

function Insights() {
  const { year, hasData } = useYear();
  const challenges = useYearTable("challenges", year);
  const wf = useYearTable("way_forward", year);
  const wins = useYearTable("wins", year);
  const notes = useYearTable("presenter_notes", year);

  const anyData =
    (challenges.data?.length ?? 0) + (wf.data?.length ?? 0) + (wins.data?.length ?? 0) + (notes.data?.length ?? 0) > 0;

  if (!hasData(year) && !anyData) {
    return (
      <DashboardLayout title="Management Insights" subtitle={`TY ${year}`}>
        <EmptyState year={year} hint="No insights, wins, challenges or recommendations exist for this year yet." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Management Insights" subtitle={`Findings, wins and recommendations for TY ${year}.`}>
      {(wins.data?.length ?? 0) > 0 && (
        <Section kicker="Wins" title="Achievements & Highlights">
          <ul className="space-y-3">
            {(wins.data ?? []).map((w) => (
              <li key={w.id} className="flex gap-3 text-sm">
                <span className={`shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  w.tone === "bad" ? "bg-itf-red text-white" :
                  w.tone === "warn" ? "bg-itf-gold text-itf-ink" :
                  "bg-itf-green text-white"
                }`}>{w.tone === "bad" ? "Risk" : w.tone === "warn" ? "Watch" : "Win"}</span>
                <span className="leading-relaxed">{w.text}{w.section ? <span className="text-[10px] text-itf-ink/50 ml-2">· {w.section}</span> : null}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Section kicker="Challenges" title="Challenges / Constraints">
          {(challenges.data?.length ?? 0) === 0
            ? <div className="text-sm text-itf-ink/60">No challenges recorded.</div>
            : <ul className="list-disc pl-5 space-y-2 text-sm">{(challenges.data ?? []).map((c) => <li key={c.id}>{c.text}</li>)}</ul>}
        </Section>
        <Section kicker="Way Forward" title="Recommendations">
          {(wf.data?.length ?? 0) === 0
            ? <div className="text-sm text-itf-ink/60">No recommendations recorded.</div>
            : <ul className="list-disc pl-5 space-y-2 text-sm">{(wf.data ?? []).map((r) => <li key={r.id}>{r.text}</li>)}</ul>}
        </Section>
      </div>

      {(notes.data?.length ?? 0) > 0 && (
        <Section kicker="Commentary" title="Presenter Notes">
          <div className="space-y-3">
            {(notes.data ?? []).map((n) => (
              <Note key={n.id}>
                {n.title && <b>{n.title}. </b>}
                {n.body}
              </Note>
            ))}
          </div>
        </Section>
      )}
    </DashboardLayout>
  );
}
