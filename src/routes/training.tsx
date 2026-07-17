import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, Note, Section, DataTable, PctBar, EmptyState } from "@/components/dashboard/widgets";
import { staffSchool, adminSupport, growth } from "@/data/itf2024";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from "recharts";
import { useYear } from "@/lib/year-context";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training Analysis · ITF 2024 Scorecard" },
      { name: "description", content: "Training programmes, participants, certifications and Staff School performance for ITF 2024." },
      { property: "og:title", content: "ITF 2024 – Training Analysis" },
      { property: "og:description", content: "Special interventions, SSIP, NERG programme, capacity building and Staff School certificate exam results." },
    ],
  }),
  component: Training,
});

function Training() {
  const { year, hasData, yearsWithData } = useYear();
  const prevYear = useMemo(() => [...yearsWithData].filter((y) => y < year).pop() ?? null, [year, yearsWithData]);

  if (!hasData(year)) {
    return (
      <DashboardLayout title="Training Analysis" subtitle={`FY ${year}`}>
        <EmptyState year={year} hint="No training data for this year. Add training programmes and staff-school results via the admin panel." />
      </DashboardLayout>
    );
  }

  const { data: kra6Rows = [] } = useQuery({
    queryKey: ["kra_rows_kra6", [2023, 2024]],
    queryFn: async () => (await supabase.from("kra_rows").select("*").eq("kra", "KRA 6").in("year", [2023, 2024]).order("sort_order")).data ?? [],
  });

  const { data: staffRowsCurrent = [] } = useQuery({
    queryKey: ["staff_school", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_school").select("*").eq("year", year).order("exam");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: staffRowsPrevious = [] } = useQuery({
    queryKey: ["staff_school", prevYear],
    enabled: !!prevYear,
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_school").select("*").eq("year", prevYear as number).order("exam");
      if (error) throw error;
      return data ?? [];
    },
  });

  const staffExamData = useMemo(() => {
    const exams = new Map<string, {
      exam: string;
      studentsPrev: number;
      passedPrev: number;
      pctPrev: number;
      studentsCur: number;
      passedCur: number;
      pctCur: number;
    }>();

    const normalizeExam = (raw: any) => String(raw ?? "").trim();

    for (const row of staffRowsPrevious) {
      const exam = normalizeExam(row.exam);
      if (!exam) continue;
      if (!exams.has(exam)) {
        exams.set(exam, { exam, studentsPrev: 0, passedPrev: 0, pctPrev: 0, studentsCur: 0, passedCur: 0, pctCur: 0 });
      }
      const entry = exams.get(exam)!;
      entry.studentsPrev = Number(row.students ?? 0);
      entry.passedPrev = Number(row.passed ?? 0);
      entry.pctPrev = Number(row.pct ?? (row.students ? (Number(row.passed ?? 0) / Number(row.students ?? 0)) * 100 : 0));
    }

    for (const row of staffRowsCurrent) {
      const exam = normalizeExam(row.exam);
      if (!exam) continue;
      if (!exams.has(exam)) {
        exams.set(exam, { exam, studentsPrev: 0, passedPrev: 0, pctPrev: 0, studentsCur: 0, passedCur: 0, pctCur: 0 });
      }
      const entry = exams.get(exam)!;
      entry.studentsCur = Number(row.students ?? 0);
      entry.passedCur = Number(row.passed ?? 0);
      entry.pctCur = Number(row.pct ?? (row.students ? (Number(row.passed ?? 0) / Number(row.students ?? 0)) * 100 : 0));
    }

    if (exams.size > 0) {
      return Array.from(exams.values()).sort((a, b) => a.exam.localeCompare(b.exam));
    }

    return staffSchool.map((s) => ({
      exam: s.exam,
      studentsPrev: s.students23,
      passedPrev: s.pass23,
      pctPrev: s.pct23,
      studentsCur: s.students24,
      passedCur: s.pass24,
      pctCur: s.pct24,
    }));
  }, [staffRowsCurrent, staffRowsPrevious]);

  const hasStaffSchoolLiveData = staffRowsCurrent.length > 0 || staffRowsPrevious.length > 0;

  const programmeRows = Object.values(
    kra6Rows.reduce<Record<string, { programme: string; sort_order: number; p2023: number | null; p2024: number | null }>>((acc, row: any) => {
      if (row.kpi === "Total Number Trained") return acc;
      if (!acc[row.kpi]) {
        acc[row.kpi] = { programme: row.kpi, sort_order: row.sort_order ?? 0, p2023: null, p2024: null };
      }
      if (row.year === 2023) acc[row.kpi].p2023 = Number(row.actual || 0);
      if (row.year === 2024) acc[row.kpi].p2024 = Number(row.actual || 0);
      return acc;
    }, {}),
  ).sort((a, b) => a.sort_order - b.sort_order);

  const trainingTotals = programmeRows.reduce(
    (totals, row) => ({ p2023: totals.p2023 + (row.p2023 ?? 0), p2024: totals.p2024 + (row.p2024 ?? 0) }),
    { p2023: 0, p2024: 0 },
  );

  const progChart = programmeRows.map((p) => ({ name: p.programme.replace(/\s*\(.*\)/, "").slice(0,22), "2023": p.p2023 ?? 0, "2024": p.p2024 ?? 0 }));
  const capacity = adminSupport.filter((r) => r.item.startsWith("Capacity Building"));
  const staffChart = staffExamData.map((s) => ({ exam: s.exam, [`${prevYear ?? "Prev"} %`]: s.pctPrev, [`${year} %`]: s.pctCur }));
  const staffTableHeaders = [
    "Exam",
    `Students ${prevYear ?? "Prev"}`,
    `Students ${year}`,
    `Passed ${prevYear ?? "Prev"}`,
    `Passed ${year}`,
    `% ${prevYear ?? "Prev"}`,
    `% ${year}`,
  ];

  return (
    <DashboardLayout title="Training Analysis" subtitle="Programmes, participants and certification outcomes — KRA 3 to KRA 6 plus Staff School.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Participants Trained 2024" value={trainingTotals.p2024.toLocaleString()} sub={`+${growth(trainingTotals.p2024, trainingTotals.p2023).toFixed(1)}% vs 2023`} tone="good" />
        <Kpi label="Active Programmes" value="2" sub="SSIP & ITF-NERG carried into 2024" tone="warn" />
        <Kpi label="Discontinued 2023" value="4" sub="AgSEP · N-Power · MSDP · Boot Camp" tone="bad" />
        <Kpi label="Staff Capacity Trainings" value="1,307" sub="Short, long, intl & professional" tone="neutral" />
      </div>

      <Section kicker="KRA 6" title="Special Interventions & Training Programmes — participants per programme">
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={progChart} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="2023" fill="#7a8a99" />
              <Bar dataKey="2024" fill="#00723F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <DataTable
          headers={["Programme", "2023 Participants", "2024 Participants", "Status"]}
          rows={programmeRows.map((p) => [
            p.programme,
            p.p2023?.toLocaleString() ?? "—",
            p.p2024?.toLocaleString() ?? "—",
            p.p2024 == null ? <span key="x" className="text-itf-red font-semibold">Not implemented in 2024</span> :
            p.p2023 == null ? <span key="x" className="text-itf-gold font-semibold">New programme in 2024</span> :
            <span key="x" className="text-itf-green font-semibold">Continued</span>,
          ])}
        />
        <Note>
          Despite four major programmes (AgSEP, N-Power, MSDP, Summer Boot Camp) being discontinued, total participants nearly doubled to 39,032 — driven almost entirely by the new <b>ITF-NERG</b> programme (4,000 participants) and an expanded <b>SSIP</b> roll-out.
        </Note>
      </Section>

      <Section kicker="Staff School" title="Certificate Exam Performance — % Passed with 5 credits (incl. Maths & English)">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={staffChart} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={staffPrevLabel} stroke="#7a8a99" strokeWidth={2} />
              <Line type="monotone" dataKey={staffCurrentLabel} stroke="#00723F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <DataTable
          headers={staffTableHeaders}
          rows={staffExamData.map((s) => [
            s.exam,
            s.studentsPrev.toLocaleString(),
            s.studentsCur.toLocaleString(),
            s.passedPrev.toLocaleString(),
            s.passedCur.toLocaleString(),
            `${s.pctPrev.toFixed(1)}%`,
            <b key={`${s.exam}-pct`} className="text-itf-green">{`${s.pctCur.toFixed(1)}%`}</b>,
          ])}
        />
        <Note>
          Staff School outcomes improved across every exam — live data is shown when available, otherwise the 2023/2024 sample dataset is displayed. WASSCE reached a perfect 100% pass rate on the sample data.
        </Note>
      </Section>

      <Section kicker="KRA 7" title="Staff Capacity-Building Activities">
        <DataTable
          headers={["Programme Type", "2023", "2024", "Change"]}
          rows={capacity.map((r) => [r.item.replace("Capacity Building – ", ""), r.y2023, r.y2024, <span key={r.item} className={r.y2024 - r.y2023 >= 0 ? "text-itf-green" : "text-itf-red"}>{r.y2024 - r.y2023}</span>])}
        />
        <Note>
          Long-term and professional-body trainings rose, but short-term capacity sessions dropped 24% and international programmes fell from 31 to 9 — reflecting tighter budgetary provisions flagged under Challenges.
        </Note>
      </Section>
    </DashboardLayout>
  );
}
