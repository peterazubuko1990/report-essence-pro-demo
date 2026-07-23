import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Kpi, Note, Section, DataTable, EmptyState } from "@/components/dashboard/widgets";
import { staffSchool } from "@/data/itf2024";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/staff-school")({
  head: () => ({
    meta: [
      { title: "Staff School · ITF 2024 Scorecard" },
      { name: "description", content: "Staff School certificate exam performance and student outcomes for ITF 2024." },
      { property: "og:title", content: "ITF 2024 – Staff School" },
      { property: "og:description", content: "Live Staff School exam results and pass rates, managed through the admin panel." },
    ],
  }),
  component: StaffSchool,
});

function StaffSchool() {
  const { year, yearsWithData } = useYear();
  const prevYear = useMemo(() => [...yearsWithData].filter((y) => y < year).pop() ?? null, [year, yearsWithData]);

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

  const staffPrevLabel = `${prevYear ?? "Prev"} %`;
  const staffCurrentLabel = `${year} %`;

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

    const normalizeExam = (value: any) => String(value ?? "").trim();

    for (const row of staffRowsPrevious) {
      const exam = normalizeExam(row.exam);
      if (!exam) continue;
      if (!exams.has(exam)) {
        exams.set(exam, { exam, studentsPrev: 0, passedPrev: 0, pctPrev: 0, studentsCur: 0, passedCur: 0, pctCur: 0 });
      }
      const entry = exams.get(exam)!;
      entry.studentsPrev = Number(row.students ?? 0);
      entry.passedPrev = Number(row.passed ?? 0);
      entry.pctPrev = Number(row.pct ?? (entry.studentsPrev ? (entry.passedPrev / entry.studentsPrev) * 100 : 0));
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
      entry.pctCur = Number(row.pct ?? (entry.studentsCur ? (entry.passedCur / entry.studentsCur) * 100 : 0));
    }

    if (exams.size > 0) {
      return Array.from(exams.values()).sort((a, b) => a.exam.localeCompare(b.exam));
    }

    return staffSchool.map((row) => ({
      exam: row.exam,
      studentsPrev: row.students23,
      passedPrev: row.pass23,
      pctPrev: row.pct23,
      studentsCur: row.students24,
      passedCur: row.pass24,
      pctCur: row.pct24,
    }));
  }, [staffRowsCurrent, staffRowsPrevious]);

  const hasLiveStaffSchoolData = staffRowsCurrent.length > 0 || staffRowsPrevious.length > 0;

  const totalStudentsCur = staffExamData.reduce((sum, row) => sum + row.studentsCur, 0);
  const totalPassedCur = staffExamData.reduce((sum, row) => sum + row.passedCur, 0);
  const avgPassCur = staffExamData.length > 0 ? staffExamData.reduce((sum, row) => sum + row.pctCur, 0) / staffExamData.length : 0;
  const totalStudentsPrev = staffExamData.reduce((sum, row) => sum + row.studentsPrev, 0);
  const totalPassedPrev = staffExamData.reduce((sum, row) => sum + row.passedPrev, 0);

  const staffChart = staffExamData.map((entry) => ({
    exam: entry.exam,
    [staffPrevLabel]: entry.pctPrev,
    [staffCurrentLabel]: entry.pctCur,
  }));

  return (
    <DashboardLayout title="Staff School" subtitle="Staff School certificate exam performance and live results from the admin module.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi
          label={`Total Students ${year}`}
          value={totalStudentsCur.toLocaleString()}
          sub={prevYear ? `vs ${totalStudentsPrev.toLocaleString()} in TY ${prevYear}` : "Live student headcount"}
          tone="good"
        />
        <Kpi
          label={`Total Passed ${year}`}
          value={totalPassedCur.toLocaleString()}
          sub={prevYear ? `vs ${totalPassedPrev.toLocaleString()} in TY ${prevYear}` : "Live pass totals"}
          tone="good"
        />
        <Kpi
          label={`Average Pass Rate ${year}`}
          value={`${avgPassCur.toFixed(1)}%`}
          sub={hasLiveStaffSchoolData ? "Based on live admin data" : "Based on sample fallback data"}
          tone={avgPassCur >= 90 ? "good" : avgPassCur >= 70 ? "warn" : "neutral"}
        />
        <Kpi
          label="Staff School Data Source"
          value={hasLiveStaffSchoolData ? "Live admin data" : "Sample dataset"}
          sub="Use Admin > Staff School Results to add or edit live rows."
          tone={hasLiveStaffSchoolData ? "good" : "warn"}
        />
      </div>

      <Section kicker="Exam Performance" title="Certificate Exam Pass Rates by Exam">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={staffChart} margin={{ top: 16, right: 16, left: 0, bottom: 20 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="exam" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey={staffPrevLabel} fill="#C8102E" />
              <Bar dataKey={staffCurrentLabel} fill="#00723F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <DataTable
          headers={["Exam", `Students ${prevYear ?? "Prev"}`, `Students ${year}`, `Passed ${prevYear ?? "Prev"}`, `Passed ${year}`, `% ${prevYear ?? "Prev"}`, `% ${year}`]}
          rows={staffExamData.map((row) => [
            row.exam,
            row.studentsPrev.toLocaleString(),
            row.studentsCur.toLocaleString(),
            row.passedPrev.toLocaleString(),
            row.passedCur.toLocaleString(),
            `${row.pctPrev.toFixed(1)}%`,
            <b key={`${row.exam}-pct`} className="text-itf-green">{`${row.pctCur.toFixed(1)}%`}</b>,
          ])}
        />
        <Note>
          {hasLiveStaffSchoolData
            ? "Live Staff School exam rows are displayed from the admin panel. Update the Staff School Results table in Admin to refresh this page."
            : "No live staff school rows were found for the selected year. This page is showing the sample 2023/2024 dataset until live data is entered in Admin."}
        </Note>
      </Section>
    </DashboardLayout>
  );
}
