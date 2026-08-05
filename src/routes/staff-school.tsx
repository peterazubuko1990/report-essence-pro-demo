import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EnhancedKpi, Kpi, Note, Section, DataTable, EmptyState } from "@/components/dashboard/widgets";
import { fmtNaira, staffSchool } from "@/data/itf2024";
import { useYear } from "@/lib/year-context";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

function RevenueTooltip({ active, payload, label, prevYearLabel, currentYearLabel }: { active?: boolean; payload?: Array<any>; label?: string | number; prevYearLabel: string; currentYearLabel: string }) {
  if (!active || !payload?.length) return null;
  const firstEntry = payload[0] as any;
  const row = firstEntry?.payload as Record<string, any> | undefined;
  if (!row) return null;
  const previousValue = Number(row.prev ?? 0);
  const currentValue = Number(row.current ?? 0);
  const delta = currentValue - previousValue;
  const pct = previousValue === 0 ? 0 : (delta / previousValue) * 100;

  return (
    <div className="rounded-lg border border-itf-rule bg-white/95 px-3 py-2 text-sm shadow-lg">
      <div className="mb-2 font-semibold text-itf-ink">{String(label ?? "Staff School")}</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-itf-red">{prevYearLabel}</span>
          <span className="font-semibold text-itf-red">{fmtNaira(previousValue * 1_000_000)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-itf-green">{currentYearLabel}</span>
          <span className="font-semibold text-itf-green">{fmtNaira(currentValue * 1_000_000)}</span>
        </div>
        <div className={`flex items-center justify-between gap-3 ${delta >= 0 ? "text-itf-green" : "text-itf-red"}`}>
          <span className="font-medium">Difference</span>
          <span className="font-semibold">{delta >= 0 ? "+" : ""}{fmtNaira(Math.abs(delta) * 1_000_000)}</span>
        </div>
        <div className={`flex items-center justify-between gap-3 ${pct >= 0 ? "text-itf-green" : "text-itf-red"}`}>
          <span className="font-medium">YoY</span>
          <span className="font-semibold inline-flex items-center gap-1">
            <span>{pct >= 0 ? "▲" : "▼"}</span>
            <span>{pct >= 0 ? "+" : ""}{pct.toFixed(1)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

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

  const { data: staffRevenueCurrent = [] } = useQuery({
    queryKey: ["area_revenue", "staff_school", year],
    enabled: year > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("area_revenue").select("*").eq("year", year).eq("office", "Staff School");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: staffRevenuePrevious = [] } = useQuery({
    queryKey: ["area_revenue", "staff_school", prevYear],
    enabled: !!prevYear,
    queryFn: async () => {
      const { data, error } = await supabase.from("area_revenue").select("*").eq("year", prevYear as number).eq("office", "Staff School");
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
  const avgPassPrev = staffExamData.length > 0 ? staffExamData.reduce((sum, row) => sum + row.pctPrev, 0) / staffExamData.length : 0;

  const staffRevenueTotals = staffRevenueCurrent.reduce(
    (acc, row) => ({
      target: acc.target + Number(row.target ?? 0),
      actual: acc.actual + Number(row.actual ?? 0),
    }),
    { target: 0, actual: 0 },
  );

  const previousRevenueTotals = staffRevenuePrevious.reduce(
    (acc, row) => ({
      target: acc.target + Number(row.target ?? 0),
      actual: acc.actual + Number(row.actual ?? 0),
    }),
    { target: 0, actual: 0 },
  );

  const prevYearLabel = prevYear ? String(prevYear) : "Previous";
  const currentYearLabel = String(year);

  const staffRevenueCurrentActual = staffRevenueTotals.actual;
  const staffRevenuePreviousActual = previousRevenueTotals.actual;

  const staffChart = staffExamData.map((entry) => ({
    exam: entry.exam,
    [staffPrevLabel]: entry.pctPrev,
    [staffCurrentLabel]: entry.pctCur,
  }));

  const staffRevenueComparisonData = [
    {
      office: "Staff School",
      prev: previousRevenueTotals.actual / 1_000_000,
      current: staffRevenueTotals.actual / 1_000_000,
    },
  ];

  return (
    <DashboardLayout title="Staff School" subtitle="Staff School certificate exam performance and live results from the admin module.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EnhancedKpi
          label="Total Students"
          currentValue={totalStudentsCur}
          previousValue={prevYear ? totalStudentsPrev : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(value) => value.toLocaleString()}
          tone={totalStudentsCur >= totalStudentsPrev ? "good" : "warn"}
          noteText={hasLiveStaffSchoolData ? "Based on live admin data and previous year exam results." : "Based on sample fallback data."}
        />
        <EnhancedKpi
          label="Number passed with 5 credits and above including English and Maths"
          currentValue={totalPassedCur}
          previousValue={prevYear ? totalPassedPrev : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(value) => value.toLocaleString()}
          tone={totalPassedCur >= totalPassedPrev ? "good" : "warn"}
          noteText={hasLiveStaffSchoolData ? "Based on live admin data and previous year exam results." : "Based on sample fallback data."}
        />
        <EnhancedKpi
          label="Average Pass Rate"
          currentValue={avgPassCur}
          previousValue={prevYear ? avgPassPrev : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={(value) => `${value.toFixed(1)}%`}
          tone={avgPassCur >= avgPassPrev ? "good" : "warn"}
          noteText={hasLiveStaffSchoolData ? "Based on live admin data and previous year exam results." : "Based on sample fallback data."}
        />
        <EnhancedKpi
          label="Staff School Revenue"
          currentValue={staffRevenueCurrentActual}
          previousValue={prevYear ? staffRevenuePreviousActual : undefined}
          currentYear={year}
          previousYear={prevYear}
          formatValue={fmtNaira}
          tone={staffRevenueCurrentActual >= staffRevenuePreviousActual ? "good" : "warn"}
          noteText="This card reflects the live Staff School revenue generated for the selected year, compared to the prior year."
        />
      </div>

      <Section kicker="Exam Performance" title="Certificate Exam Pass Rates by Exam">
        <DataTable
          headers={["Exam", `Students ${prevYear ?? "Prev"}`, `Students ${year}`, `Number passed with 5 credits and above including English and Maths ${prevYear ?? "Prev"}`, `Number passed with 5 credits and above including English and Maths ${year}`, `% Achieved ${prevYear ?? "Prev"}`, `% Achieved ${year}`]}
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
      <Section kicker="Exam Performance" title="Exam Performance Chart">
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
      </Section>
      <Section kicker="Staff School Revenue" title="Staff School — Revenue Comparison">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-itf-rule p-4">
            <div className="text-sm text-itf-ink/60">Current year actual</div>
            <div className="mt-4 text-3xl font-semibold text-itf-green">₦{staffRevenueTotals.actual.toLocaleString()}</div>
            <div className="text-sm text-itf-ink/70">Current year target: ₦{staffRevenueTotals.target.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-itf-rule p-4">
            <div className="text-sm text-itf-ink/60">Previous year actual</div>
            <div className="mt-4 text-3xl font-semibold text-itf-ink">₦{previousRevenueTotals.actual.toLocaleString()}</div>
            <div className="text-sm text-itf-ink/70">Previous year target: ₦{previousRevenueTotals.target.toLocaleString()}</div>
          </div>
        </div>
        <div className="overflow-x-auto mb-6">
          <DataTable
            headers={[
              "Stream",
              `${prevYearLabel} Target`,
              `${prevYearLabel} Actual`,
              `${prevYearLabel} % Achieved`,
              `${currentYearLabel} Target`,
              `${currentYearLabel} Actual`,
              `${currentYearLabel} % Achieved`,
            ]}
            rows={[
              [
                "Course Fee",
                staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.target ?? 0), 0).toLocaleString(),
                staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.actual ?? 0), 0).toLocaleString(),
                `${(staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.actual ?? 0), 0) / Math.max(1, staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.target ?? 0), 0)) * 100).toFixed(1)}%`,
                staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.target ?? 0), 0).toLocaleString(),
                staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.actual ?? 0), 0).toLocaleString(),
                `${(staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.actual ?? 0), 0) / Math.max(1, staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Course Fee").reduce((sum, row) => sum + Number(row.target ?? 0), 0)) * 100).toFixed(1)}%`,
              ],
              [
                "Other Income",
                staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.target ?? 0), 0).toLocaleString(),
                staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.actual ?? 0), 0).toLocaleString(),
                `${(staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.actual ?? 0), 0) / Math.max(1, staffRevenuePrevious.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.target ?? 0), 0)) * 100).toFixed(1)}%`,
                staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.target ?? 0), 0).toLocaleString(),
                staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.actual ?? 0), 0).toLocaleString(),
                `${(staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.actual ?? 0), 0) / Math.max(1, staffRevenueCurrent.filter((row) => String(row.stream ?? "").trim() === "Other Income").reduce((sum, row) => sum + Number(row.target ?? 0), 0)) * 100).toFixed(1)}%`,
              ],
            ]}
          />
        </div>
        <div className="h-[420px]">
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={staffRevenueComparisonData}
              margin={{ top: 12, right: 16, left: 160, bottom: 12 }}
            >
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value: number) => `${value.toFixed(1)}M`} />
              <YAxis dataKey="office" type="category" width={160} tick={{ fontSize: 12 }} />
              <Tooltip content={<RevenueTooltip prevYearLabel={prevYearLabel} currentYearLabel={currentYearLabel} />} />
              <Legend />
              <Bar dataKey="prev" name={prevYearLabel} fill="#C8102E" />
              <Bar dataKey="current" name={currentYearLabel} fill="#00723F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </DashboardLayout>
  );
}
