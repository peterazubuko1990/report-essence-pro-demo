import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section } from "@/components/dashboard/widgets";
import { challenges, wayForward } from "@/data/itf2024";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Management Insights · ITF 2024 Scorecard" },
      { name: "description", content: "Automatically generated key findings, risks and recommendations from the ITF 2024 corporate scorecard." },
      { property: "og:title", content: "ITF 2024 – Management Insights" },
      { property: "og:description", content: "Director-level findings, risks and way-forward statements derived from the 2024 Corporate Scorecard." },
    ],
  }),
  component: Insights,
});

const findings = [
  { tag: "Strength", tone: "good", text: "Training Contribution rose ₦6.49 B year-on-year (+11.2%), exceeding target by ₦6.23 B." },
  { tag: "Strength", tone: "good", text: "Field monitoring activity tripled — Employer Programmes Monitored hit 310.7% of target." },
  { tag: "Strength", tone: "good", text: "Participants trained jumped from 21,672 to 39,032 (+80.1%) driven by SSIP and the new ITF-NERG programme." },
  { tag: "Risk", tone: "bad", text: "Other Income collapsed to ₦46.6 M against a ₦856.1 M target — only 5.4% delivered." },
  { tag: "Risk", tone: "bad", text: "Training-claims processing dropped 50.8% (652 → 321). Operational capacity in claims management needs urgent reinforcement." },
  { tag: "Risk", tone: "bad", text: "Only 62.8% of registered employers are actively contributing — a leakage of nearly 56,000 employers." },
  { tag: "Observation", tone: "warn", text: "Four major programmes from 2023 (AgSEP, N-Power, MSDP, Summer Boot Camp) were not implemented in 2024 — programme portfolio narrowed." },
  { tag: "Observation", tone: "warn", text: "Staff welfare loans (Housing, Motor Vehicle) were not extended in 2024, and short-term capacity building dropped 24%." },
  { tag: "Observation", tone: "warn", text: "MSTC Abuja and Centre for Excellence under-delivered Course Fee dramatically — 11.4% and 0% respectively." },
];

function Insights() {
  return (
    <DashboardLayout title="Management Insights" subtitle="Automatically generated findings, risks and recommendations — supplements the Director's reading of the data.">
      <Section kicker="Findings" title="Key Findings & Risks">
        <ul className="space-y-3">
          {findings.map((f, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`shrink-0 mt-0.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                f.tone === "good" ? "bg-itf-green text-white" :
                f.tone === "bad" ? "bg-itf-red text-white" :
                "bg-itf-gold text-itf-ink"
              }`}>{f.tag}</span>
              <span className="leading-relaxed">{f.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section kicker="Challenges" title="Challenges / Constraints of the Fund (verbatim)">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            {challenges.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <Note>Reproduced from Slide 66 of the source report. These are the constraints recognised by the Corporate Planning Department.</Note>
        </Section>
        <Section kicker="Way Forward" title="Recommendations / Way Forward (verbatim)">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            {wayForward.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <Note>Reproduced from Slide 67 of the source report. These recommendations were tabled to Management for 2025 planning.</Note>
        </Section>
      </div>

      <Section kicker="Director's Briefing" title="Suggested Talking Points">
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
          <li>Open with the Training Contribution result — the headline win and proof that the core mandate continues to deliver above target.</li>
          <li>Frame the Other Income / Course Fee shortfalls as <i>commercialisation gaps</i> rather than collection failures — they point to a need to revisit pricing and demand at Training Centres.</li>
          <li>Use the Employers Registered vs Contributing gap (114,391 vs 58,563) to justify additional resources for verification, audit and collection.</li>
          <li>Highlight Staff School outcomes (WASSCE 100% pass) when motivating the library and ICT-lab investment listed in the Way Forward.</li>
          <li>Close with the YoY participant growth (+80.1%) to position 2024 as a <i>year of operational scaling</i> despite budget constraints.</li>
        </ol>
      </Section>
    </DashboardLayout>
  );
}
