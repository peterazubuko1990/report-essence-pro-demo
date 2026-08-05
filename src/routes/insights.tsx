import { createFileRoute, Link } from "@tanstack/react-router";
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
        <Section kicker="Bottleneck" title="Bottleneck / Constraints" titleClassName="text-3xl sm:text-4xl">
          {(challenges.data?.length ?? 0) === 0
            ? <div className="text-base font-bold text-black">No bottleneck recorded.</div>
            : <ul className="list-disc pl-5 space-y-3 text-base font-bold text-black">{(challenges.data ?? []).map((c) => <li key={c.id}>{c.text}</li>)}</ul>}
        </Section>
        <Section kicker="Way Forward" title="Recommendations" titleClassName="text-3xl sm:text-4xl">
          {(wf.data?.length ?? 0) === 0
            ? <div className="text-base font-bold text-black">No recommendations recorded.</div>
            : <ul className="list-disc pl-5 space-y-3 text-base font-bold text-black">{(wf.data ?? []).map((r) => <li key={r.id}>{r.text}</li>)}</ul>}
        </Section>
      </div>

      <section className="bg-white border border-itf-rule rounded-lg shadow-sm p-6 mt-6">
        <div className="flex justify-center mb-4">
          <img src="/itf-logo.jpeg" alt="ITF logo" className="h-20 w-20 rounded-full bg-white p-2 shadow" />
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.12em] text-itf-ink mb-4">Conclusion</div>
          <div className="text-left text-base sm:text-lg leading-relaxed text-itf-ink/80 space-y-4 max-w-none">
            <p className="font-semibold">
              {year} was a year of resilience and measured progress especially in Revenue generation, this was made possible via commitment, loyalty, teamwork and professionalism which is highly commendable.
            </p>
            <p>
              The Fund has reaffirmed its commitment to excellence in human capital development with sustained focus on efficiency and is poised to achieve even greater impact in building a skilled, competitive workforce for national development.
            </p>
            <p>
              The Corporate Planning Department on behalf of the Staff of the Fund, wishes to appreciate the Director-General/Chief Executive, for his kind approval for the implementation of this programme and the support of the Management team.
            </p>
            <p>
              We pray that God graciously grant all of us, as individuals and teams, the ability and capacity to do more in the years to come.
            </p>
          </div>
          <div className="mt-6 text-5xl sm:text-6xl font-black text-itf-red">Thank you</div>
        </div>
      </section>

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

      <Section kicker="Projection" title="Projected Performance Module">
        <div className="text-sm text-itf-ink/80 leading-relaxed space-y-3">
          <p>
            The projection module forecasts future KPI and revenue performance using historical trends. It is the final planning tool and should be reviewed after Management Insights.
          </p>
          <Link
            to="/projections"
            className="inline-flex items-center rounded-full bg-itf-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-itf-green/90"
          >
            Go to Projections
          </Link>
        </div>
      </Section>
    </DashboardLayout>
  );
}
