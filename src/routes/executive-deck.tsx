import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Note, Section } from "@/components/dashboard/widgets";
import { headlineRevenue, fmtNaira, growth, trainingTotals, challenges, wayForward, staffSchool } from "@/data/itf2024";
import { useYear } from "@/lib/year-context";
import { useState } from "react";

export const Route = createFileRoute("/executive-deck")({
  head: () => ({
    meta: [
      { title: "Executive Presentation · ITF 2024 Scorecard" },
      { name: "description", content: "A condensed 10-slide executive deck of the ITF 2024 Corporate Scorecard, preserving the corporate identity for Director-level briefing." },
      { property: "og:title", content: "ITF 2024 – Executive Presentation" },
      { property: "og:description", content: "Shorter management deck distilled from the 69-slide 2024 Corporate Scorecard." },
    ],
  }),
  component: ExecutiveDeck,
});

interface SlideDef { kicker: string; title: string; body: React.ReactNode; notes: string }

function ExecutiveDeck() {
  const { year } = useYear();
  const prevYear = year > 0 ? year - 1 : new Date().getFullYear() - 1;
  const tc = headlineRevenue[0]; const cf = headlineRevenue[1]; const oi = headlineRevenue[2];
  const slides: SlideDef[] = [
    {
      kicker: "Cover",
      title: `${year} Corporate Scorecard`,
      body: (
        <div className="text-center">
          <img src='/itf-logo.jpeg' alt="ITF logo" className="h-32 w-32 mx-auto rounded-full bg-white p-1 shadow" />
          <div className="mt-6 text-3xl font-bold text-itf-green">Industrial Training Fund</div>
          <div className="text-sm uppercase tracking-[0.25em] text-itf-red mt-2">Federal Government of Nigeria</div>
          <div className="mt-8 text-lg">{year} End-of-Year Corporate Scorecard — Executive Briefing</div>
          <div className="mt-2 text-sm text-itf-ink/70">Presented by: Mr. Udeme V. Akpabio, Director, Corporate Planning Department</div>
          <div className="mt-1 text-sm text-itf-ink/70">January – December {year}</div>
        </div>
      ),
      notes: "Open with the Fund's mandate and the reporting period. This deck is a 10-slide condensation of the 69-slide end-of-year report.",
    },
    {
      kicker: "Vision & Mission",
      title: "Why we exist",
      body: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-itf-rule rounded p-5 bg-itf-canvas">
            <div className="text-itf-red text-xs uppercase font-semibold tracking-widest">Vision</div>
            <p className="mt-2 text-base leading-relaxed">To be the leading Skills Development Organisation in Nigeria and one of the best in the World.</p>
          </div>
          <div className="border border-itf-rule rounded p-5 bg-itf-canvas">
            <div className="text-itf-red text-xs uppercase font-semibold tracking-widest">Mission</div>
            <p className="mt-2 text-base leading-relaxed">To set, regulate training standards and provide human capital development interventions using a corps of highly competent professionals.</p>
          </div>
        </div>
      ),
      notes: "Re-anchor the audience on Vision & Mission before showing performance numbers.",
    },
    {
      kicker: "Executive Summary",
      title: `${year} in one minute`,
      body: (
        <ul className="space-y-3 text-base leading-relaxed">
          <li><b className="text-itf-green">Revenue:</b> Total generated revenue rose to <b>{fmtNaira(tc.actual24 + cf.actual24 + oi.actual24)}</b>, driven by Training Contribution of <b>{fmtNaira(tc.actual24)}</b> (110.7% of target).</li>
          <li><b className="text-itf-green">Training:</b> Participants nearly doubled to <b>{trainingTotals.p2024.toLocaleString()}</b> (+{growth(trainingTotals.p2024, trainingTotals.p2023).toFixed(1)}%), led by SSIP and the new ITF-NERG programme.</li>
          <li><b className="text-itf-green">Field activity:</b> Employer programme monitoring at <b>310.7%</b> of target; 10,833 new companies discovered.</li>
          <li><b className="text-itf-red">Concerns:</b> Other Income at 5.4% of target; only 62.8% of registered employers contributing.</li>
        </ul>
      ),
      notes: "Director's TL;DR — covers wins and concerns in four bullets.",
    },
    {
      kicker: "Performance Overview",
      title: `Revenue — ${prevYear} vs ${year}`,
      body: (
        <div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[tc, cf, oi].map((r) => (
              <div key={r.line} className="border border-itf-rule rounded p-5 bg-white">
                <div className="text-xs uppercase tracking-widest text-itf-red">{r.line}</div>
                <div className="mt-2 text-2xl font-bold">{fmtNaira(r.actual24)}</div>
                <div className="text-xs text-itf-ink/60">2023: {fmtNaira(r.actual23)}</div>
                <div className={`mt-1 text-sm font-semibold ${growth(r.actual24, r.actual23) >= 0 ? "text-itf-green" : "text-itf-red"}`}>
                  {growth(r.actual24, r.actual23) >= 0 ? "▲" : "▼"} {growth(r.actual24, r.actual23).toFixed(1)}% YoY
                </div>
                <div className="text-[11px] text-itf-ink/60 mt-1">{r.pct24.toFixed(1)}% of target</div>
              </div>
            ))}
          </div>
          <Note>Training Contribution remains the dominant revenue stream and the only one to clearly exceed target.</Note>
        </div>
      ),
      notes: "Headline revenue snapshot. Use to set up the deeper Revenue page in the dashboard.",
    },
    {
      kicker: "Comparative Analysis",
      title: "Where revenue grew — and where it fell",
      body: (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="border border-itf-rule rounded p-4 bg-white">
            <div className="text-itf-green font-semibold mb-2">Top Growth Offices (Training Contribution)</div>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Lekki — +36.6%</li><li>Rumuokuta — +34.9%</li><li>Isolo — +19.1%</li><li>Ikeja — +17.1%</li><li>Lagos Island — +15.3%</li>
            </ol>
          </div>
          <div className="border border-itf-rule rounded p-4 bg-white">
            <div className="text-itf-red font-semibold mb-2">Largest Declines (Training Contribution)</div>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Benin — −25.6%</li><li>Gwagwalada — −32.9%</li><li>Kaduna — −19.8%</li><li>Kano — −14.6%</li><li>Port Harcourt — −2.1%</li>
            </ol>
          </div>
        </div>
      ),
      notes: "Highlight that growth is happening in coastal/Lagos centres while inland Cat-B offices regressed.",
    },
    {
      kicker: "Training Delivery",
      title: "Participants & Interventions",
      body: (
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="border border-itf-rule rounded p-5 bg-white"><div className="text-3xl font-bold text-itf-green">{trainingTotals.p2024.toLocaleString()}</div><div className="text-xs uppercase mt-1 text-itf-ink/70">Participants 2024</div></div>
          <div className="border border-itf-rule rounded p-5 bg-white"><div className="text-3xl font-bold text-itf-green">+80.1%</div><div className="text-xs uppercase mt-1 text-itf-ink/70">YoY Growth</div></div>
          <div className="border border-itf-rule rounded p-5 bg-white"><div className="text-3xl font-bold text-itf-green">100%</div><div className="text-xs uppercase mt-1 text-itf-ink/70">Staff School WASSCE Pass</div></div>
          <div className="md:col-span-3 text-sm text-itf-ink/80 mt-2 leading-relaxed">
            SSIP grew from 1,301 to 1,495 participants. The new ITF-NERG programme delivered 4,000 participants in its first year. WASSCE: {staffSchool[0].pass24}/{staffSchool[0].students24} students passed with credits including Mathematics and English.
          </div>
        </div>
      ),
      notes: "Use to motivate continued investment in Staff School and SSIP.",
    },
    {
      kicker: "Major Achievements",
      title: `What worked in ${year}`,
      body: (
        <ul className="space-y-2 list-disc pl-5 text-base">
          <li>Training Contribution exceeded target by ₦6.23 B.</li>
          <li>Employer programme monitoring tripled (171% → 311% of target).</li>
          <li>Discovery & registration of new companies at 455% of target.</li>
          <li>Staff School: 100% WASSCE, 96% NECO BECE pass rate.</li>
          <li>Senior staff strength +136; 196 new staff recruited.</li>
        </ul>
      ),
      notes: "Celebrate the wins before raising the challenges.",
    },
    {
      kicker: "Challenges",
      title: "Constraints flagged by the Fund",
      body: (
        <ul className="space-y-2 list-disc pl-5 text-base">
          {challenges.map((c) => <li key={c}>{c}</li>)}
        </ul>
      ),
      notes: "Reproduced verbatim from the source report (Slide 66).",
    },
    {
      kicker: "Way Forward",
      title: `Recommendations for ${year + 1}`,
      body: (
        <ul className="space-y-2 list-disc pl-5 text-base">
          {wayForward.map((w) => <li key={w}>{w}</li>)}
        </ul>
      ),
      notes: "Reproduced verbatim from the source report (Slide 67).",
    },
    {
      kicker: "Conclusion",
      title: "Thank you",
      body: (
        <div className="text-center mt-6">
          <img src='/itf-logo.jpeg' alt="ITF logo" className="h-24 w-24 mx-auto rounded-full bg-white p-1 shadow" />
          <p className="mt-6 text-base max-w-2xl mx-auto leading-relaxed">
            {year} was a challenging year for the Fund, but field officers recorded an impressive performance. Their resilience, commitment, loyalty, teamwork and professionalism is highly commendable.
          </p>
          <div className="mt-8 text-itf-red text-3xl font-bold tracking-wider">THANK YOU</div>
        </div>
      ),
      notes: "Close on the same conclusion slide used in the original report.",
    },
  ];

  const [i, setI] = useState(0);
  const s = slides[i];

  return (
    <DashboardLayout title={`Executive Presentation · ${year} Corporate Scorecard`} subtitle={`A 10-slide condensation of the ${year} End-of-Year report, preserving ITF corporate identity. Navigate with the buttons below — every slide has its presenter note.`}>
      <div className="bg-white border border-itf-rule rounded shadow-sm overflow-hidden">
        <div className="bg-itf-green text-white px-5 py-3 flex items-center gap-4">
          <img src='/itf-logo.jpeg' alt="" className="h-9 w-9 rounded-full bg-white p-0.5" />
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-itf-gold">{s.kicker}</div>
            <div className="text-base font-semibold">{s.title}</div>
          </div>
          <div className="text-xs text-white/80">Slide {i+1} / {slides.length}</div>
        </div>
        <div className="p-8 min-h-[420px]">{s.body}</div>
        <div className="px-5 py-3 border-t border-itf-rule bg-itf-canvas flex items-center justify-between gap-3">
          <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i===0} className="px-3 py-1.5 text-sm rounded border border-itf-rule bg-white disabled:opacity-40">← Previous</button>
          <div className="flex gap-1">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} className={`w-2 h-2 rounded-full ${k===i ? "bg-itf-red" : "bg-itf-rule"}`} aria-label={`Go to slide ${k+1}`} />
            ))}
          </div>
          <button onClick={() => setI((x) => Math.min(slides.length-1, x + 1))} disabled={i===slides.length-1} className="px-3 py-1.5 text-sm rounded border border-itf-rule bg-white disabled:opacity-40">Next →</button>
        </div>
      </div>

      <div className="bg-white border-l-4 border-itf-green border border-itf-rule rounded p-4">
        <div className="text-[10px] uppercase tracking-widest text-itf-green font-bold">Presenter note for this slide</div>
        <p className="mt-1 text-sm leading-relaxed">{s.notes}</p>
      </div>
    </DashboardLayout>
  );
}
