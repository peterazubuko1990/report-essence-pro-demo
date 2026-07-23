import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";
import { toast } from "sonner";
import { pptxRowsForYear } from "@/data/pptx-seed";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type TableKey = "kra_rows" | "revenue_rows" | "area_revenue" | "training_programmes" | "staff_school" | "hr_metrics" | "challenges" | "way_forward" | "wins" | "presenter_notes";
type KRAImportMode = "comparison" | "metric" | "kra8";
type RevenueUploadMode = "area-office" | "training-centre";
type ViewKey = TableKey | "area-office-revenue" | "training-centre-revenue";
const sb = supabase as any;

const AREA_OFFICE_OPTIONS = [
  { name: "Abuja", category: "A" },
  { name: "Apapa", category: "A" },
  { name: "Benin", category: "A" },
  { name: "Ikeja", category: "A" },
  { name: "Isolo", category: "A" },
  { name: "Lagos Island", category: "A" },
  { name: "Lekki", category: "A" },
  { name: "Port Harcourt", category: "A" },
  { name: "Rumuokuta", category: "A" },
  { name: "V/Island", category: "A" },
  { name: "Abeokuta", category: "B" },
  { name: "Badagry", category: "B" },
  { name: "Enugu", category: "B" },
  { name: "Gwagwalada", category: "B" },
  { name: "Ibadan", category: "B" },
  { name: "Kaduna", category: "B" },
  { name: "Kano", category: "B" },
  { name: "Lafia", category: "B" },
  { name: "Warri", category: "B" },
  { name: "Aba", category: "C" },
  { name: "Abakaliki", category: "C" },
  { name: "Akure", category: "C" },
  { name: "Awka", category: "C" },
  { name: "Bauchi", category: "C" },
  { name: "Calabar", category: "C" },
  { name: "Gombe", category: "C" },
  { name: "Gusau", category: "C" },
  { name: "Ilorin", category: "C" },
  { name: "Ikorodu", category: "C" },
  { name: "Jos", category: "C" },
  { name: "Katsina", category: "C" },
  { name: "Lokoja", category: "C" },
  { name: "Maiduguri", category: "C" },
  { name: "Makurdi", category: "C" },
  { name: "Minna", category: "C" },
  { name: "Owerri", category: "C" },
  { name: "Sokoto", category: "C" },
  { name: "Uyo", category: "C" },
  { name: "Yenagoa", category: "C" },
  { name: "Yola", category: "C" },
] as const;

const TRAINING_CENTRE_OPTIONS = [
  "Centre for Excellence",
  "ISTC Ikeja",
  "ISTC Kano",
  "ISTC Lokoja",
  "MSTC Abuja",
  "Staff School",
  "Corporate Office Abuja",
] as const;

const REVENUE_STREAM_OPTIONS = ["Training Contribution", "Course Fee", "Other Income"] as const;
const TRAINING_CENTRE_OFFICES = [
  "Centre for Excellence",
  "ISTC Ikeja",
  "ISTC Kano",
  "ISTC Lokoja",
  "MSTC Abuja",
  "Staff School",
  "Corporate Office Abuja",
] as const;

function normalizeOfficeName(value?: string | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const lowered = text.toLowerCase();
  if (lowered.includes("rumuokwuta") || lowered.includes("rumuokuta")) return "Rumuokuta";
  if (lowered.includes("c.f.e") || lowered.includes("centre for excellence") || lowered.includes("center for excellence")) return "Centre for Excellence";
  return text;
}

type FieldDef = { name: string; label: string; type: "text" | "number" | "textarea"; required?: boolean; nullable?: boolean };
type TableDef = { key: ViewKey; label: string; tableKey: TableKey; fields: FieldDef[]; order?: string; mode?: RevenueUploadMode };

const TABLES: TableDef[] = [
  { key: "kra_rows", label: "KRA Rows", tableKey: "kra_rows", order: "sort_order",
    fields: [
      { name: "kra", label: "KRA", type: "text", required: true },
      { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
      { name: "kpi", label: "KPI", type: "text", required: true },
      { name: "target", label: "Target", type: "number", required: true },
      { name: "actual", label: "Actual", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "revenue_rows", label: "Headline Revenue", tableKey: "revenue_rows", order: "sort_order",
    fields: [
      { name: "line", label: "Line", type: "text", required: true },
      { name: "target", label: "Target (₦)", type: "number", required: true },
      { name: "actual", label: "Actual (₦)", type: "number", required: true },
      { name: "pct", label: "% Achieved", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "area-office-revenue", label: "Area Office Revenue", tableKey: "area_revenue", mode: "area-office",
    fields: [
      { name: "office", label: "Office", type: "text", required: true },
      { name: "category", label: "Category (A / B / C)", type: "text", required: true },
      { name: "stream", label: "Stream", type: "text", required: true },
      { name: "target", label: "Target (₦)", type: "number", required: true },
      { name: "actual", label: "Actual (₦)", type: "number", required: true },
    ] },
  { key: "training-centre-revenue", label: "Training Centre Revenue", tableKey: "area_revenue", mode: "training-centre",
    fields: [
      { name: "office", label: "Office", type: "text", required: true },
      { name: "stream", label: "Stream", type: "text", required: true },
      { name: "target", label: "Target (₦)", type: "number", required: true },
      { name: "actual", label: "Actual (₦)", type: "number", required: true },
    ] },
  { key: "training_programmes", label: "Training Programmes", tableKey: "training_programmes",
    fields: [
      { name: "programme", label: "Programme", type: "text", required: true },
      { name: "participants", label: "Participants", type: "number", nullable: true },
    ] },
  { key: "staff_school", label: "Staff School Results", tableKey: "staff_school",
    fields: [
      { name: "exam", label: "Exam", type: "text", required: true },
      { name: "students", label: "Students", type: "number", required: true },
      { name: "passed", label: "Passed", type: "number", required: true },
      { name: "pct", label: "% Pass", type: "number", required: true },
    ] },
  { key: "hr_metrics", label: "HR Metrics", tableKey: "hr_metrics", order: "sort_order",
    fields: [
      { name: "item", label: "Item", type: "text", required: true },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "challenges", label: "Challenges", tableKey: "challenges", order: "sort_order",
    fields: [
      { name: "text", label: "Challenge", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "way_forward", label: "Way Forward", tableKey: "way_forward", order: "sort_order",
    fields: [
      { name: "text", label: "Recommendation", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "wins", label: "Wins / Achievements", tableKey: "wins", order: "sort_order",
    fields: [
      { name: "section", label: "Section (e.g. overview, KRA 1)", type: "text", required: true },
      { name: "text", label: "Achievement", type: "textarea", required: true },
      { name: "tone", label: "Tone (good / warn / bad)", type: "text" },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "presenter_notes", label: "Presenter Notes", tableKey: "presenter_notes", order: "sort_order",
    fields: [
      { name: "section", label: "Section key (matches page section)", type: "text", required: true },
      { name: "title", label: "Title", type: "text", nullable: true },
      { name: "body", label: "Body / commentary", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
];

function getKraFormFields(def: TableDef, mode?: KRAImportMode): FieldDef[] {
  if (def.tableKey !== "kra_rows") return def.fields;
  if (mode === "metric") {
    return [
      { name: "kra", label: "KRA", type: "text", required: true },
      { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
      { name: "kpi", label: "KPI", type: "text", required: true },
      { name: "actual", label: "Value", type: "number", nullable: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ];
  }
  return [
    { name: "kra", label: "KRA", type: "text", required: true },
    { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
    { name: "kpi", label: "KPI", type: "text", required: true },
    { name: "target", label: "Target", type: "number", required: true },
    { name: "actual", label: "Actual", type: "number", required: true },
    { name: "sort_order", label: "Sort", type: "number" },
  ];
}

function getKraTemplateFields(mode?: KRAImportMode): FieldDef[] {
  if (mode === "metric") {
    return [
      { name: "kra", label: "KRA", type: "text", required: true },
      { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
      { name: "kpi", label: "KPI", type: "text", required: true },
      { name: "actual", label: "Value", type: "number", nullable: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ];
  }
  return [
    { name: "kra", label: "KRA", type: "text", required: true },
    { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
    { name: "kpi", label: "KPI", type: "text", required: true },
    { name: "target", label: "Target", type: "number", required: true },
    { name: "actual", label: "Actual", type: "number", required: true },
    { name: "sort_order", label: "Sort", type: "number" },
  ];
}

function getFormFields(def: TableDef, mode?: KRAImportMode): FieldDef[] {
  if (def.tableKey === "kra_rows") return getKraFormFields(def, mode);
  return def.fields;
}

function normalizeRevenueStream(value?: string | null, mode?: RevenueUploadMode): string | null {
  const text = String(value ?? "").trim().toLowerCase();
  if (text.includes("training")) return "Training Contribution";
  if (text.includes("course")) return "Course Fee";
  if (text.includes("other")) return "Other Income";
  return null;
}

function normalizeRevenueCategory(value?: string | null, mode?: RevenueUploadMode): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const upper = text.toUpperCase();
  const compact = upper.replace(/[^A-Z]/g, "");
  if (mode === "area-office") {
    if (["A", "B", "C"].includes(compact)) return compact;
    if (compact === "CATEGORYA") return "A";
    if (compact === "CATEGORYB") return "B";
    if (compact === "CATEGORYC") return "C";
    return null;
  }
  return "Training Centre";
}

function inferRevenueRowSource(row: Record<string, any>): RevenueUploadMode | null {
  const source = String(row?.revenue_source ?? "").trim().toLowerCase();
  if (source === "training-centre") return "training-centre";
  if (source === "area-office") return "area-office";
  const category = String(row?.category ?? "").trim();
  if (category.toLowerCase() === "training centre") return "training-centre";
  if (["A", "B", "C"].includes(category.toUpperCase())) return "area-office";
  const office = String(row?.office ?? "").trim();
  if (TRAINING_CENTRE_OFFICES.includes(office as (typeof TRAINING_CENTRE_OFFICES)[number])) return "training-centre";
  return null;
}

function filterRevenueRowsByMode(rows: Record<string, any>[], mode?: RevenueUploadMode) {
  if (!mode) return rows;
  return rows.filter((row) => inferRevenueRowSource(row) === mode);
}

function buildRevenueTemplateCsv(def: TableDef): string {
  const fields = def.fields;
  const header = fields.map((f) => f.name).join(",");

  const lines: string[] = [header];

  if (def.tableKey === "area_revenue") {
    if (def.mode === "area-office") {
      for (const office of AREA_OFFICE_OPTIONS) {
        for (const stream of REVENUE_STREAM_OPTIONS) {
          const exampleRow: Record<string, any> = {
            office: office.name,
            category: office.category,
            stream,
            target: 0,
            actual: 0,
          };
          const row = fields.map((f) => escapeCsv(exampleRow[f.name] ?? "")).join(",");
          lines.push(row);
        }
      }
    } else if (def.mode === "training-centre") {
      for (const centre of TRAINING_CENTRE_OPTIONS) {
        const streams = centre === "Corporate Office Abuja" ? ["Other Income"] : ["Course Fee", "Other Income"];
        for (const stream of streams) {
          const exampleRow: Record<string, any> = {
            office: centre,
            stream,
            target: 0,
            actual: 0,
          };
          const row = fields.map((f) => escapeCsv(exampleRow[f.name] ?? "")).join(",");
          lines.push(row);
        }
      }
    }
  }

  return lines.join("\n");
}

function isKraRowInScope(kra: string | null | undefined, mode?: KRAImportMode) {
  if (!kra || !mode) return true;
  const match = String(kra).match(/KRA\s*(\d+)/i);
  const number = match ? Number(match[1]) : null;
  if (mode === "metric") return number !== null && number >= 5 && number <= 7;
  if (mode === "kra8") return number === 8;
  return number !== null && number >= 1 && number <= 4;
}

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function isMeaningfulCsvRow(cells: string[]) {
  return cells.some((cell) => cell.trim() !== "");
}

async function fetchLatestKraRowsForMode(mode: KRAImportMode) {
  const { data, error } = await sb.from("kra_rows")
    .select("year,kra,subgroup,kpi,sort_order")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const byYear = new Map<number, Array<{ year: number; kra: string | null; subgroup: string | null; kpi: string | null; sort_order: number | null }>>();
  for (const row of data ?? []) {
    if (!isKraRowInScope(row.kra, mode)) continue;
    const rows = byYear.get(row.year) ?? [];
    rows.push(row);
    byYear.set(row.year, rows);
  }

  let bestYear: number | null = null;
  let bestCount = 0;
  for (const [year, rows] of byYear.entries()) {
    if (rows.length > bestCount || (rows.length === bestCount && year > (bestYear ?? 0))) {
      bestCount = rows.length;
      bestYear = year;
    }
  }

  const rows = bestYear != null ? byYear.get(bestYear)! : [];
  rows.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return { year: bestYear, rows };
}

function AdminHome() {
  const { year, years, setYear } = useYear();
  const [active, setActive] = useState<ViewKey>("kra_rows");
  const [newYear, setNewYear] = useState<string>("");
  const qc = useQueryClient();
  const def = TABLES.find((t) => t.key === active)!;

  const addYear = async () => {
    const y = parseInt(newYear, 10);
    if (!y) return toast.error("Enter a valid year");
    const { error } = await supabase.from("years").insert({ year: y, label: `FY ${y}` });
    if (error) return toast.error(error.message);
    setNewYear("");
    qc.invalidateQueries({ queryKey: ["years"] });
    qc.invalidateQueries({ queryKey: ["years_with_data"] });
    setYear(y);
    toast.success(`FY ${y} created`);
  };

  const cloneFromPrevious = async () => {
    const prev = years[years.indexOf(year) - 1] ?? years[0];
    if (prev === year) return toast.warning("Select a target year different from the source.");
    if (!confirm(`Clone all data from ${prev} into ${year}? (Existing ${year} rows are kept)`)) return;
    try {
      for (const t of TABLES) {
        const { data } = await sb.from(t.key).select("*").eq("year", prev);
        if (!data || !data.length) continue;
        const rows = data.map((r: any) => {
          const { id, created_at, updated_at, ...rest } = r;
          return { ...rest, year };
        });
        await sb.from(t.key).insert(rows);
      }
      qc.invalidateQueries();
      toast.success(`Cloned data from FY ${prev} to FY ${year}`);
    } catch (e: any) {
      toast.error(`Clone failed: ${e.message}`);
    }
  };

  const loadPptxSample = async () => {
    if (year !== 2023 && year !== 2024) {
      return toast.error("Sample data only available for FY 2023 and FY 2024. Switch year first.");
    }
    if (!confirm(`Load the full PowerPoint KRA/KPI dataset into FY ${year}?\n\nThis REPLACES existing kra_rows for FY ${year} only.`)) return;
    try {
      await sb.from("kra_rows").delete().eq("year", year);
      const rows = pptxRowsForYear(year as 2023 | 2024);
      const { error } = await sb.from("kra_rows").insert(rows);
      if (error) throw error;
      qc.invalidateQueries();
      toast.success(`Loaded ${rows.length} KPI rows from PowerPoint for FY ${year}`);
    } catch (e: any) {
      toast.error(`Seed failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Year manager */}
      <div className="bg-white rounded-lg border border-itf-rule p-4 flex flex-wrap items-center gap-3">
        <div className="text-xs font-semibold text-itf-ink/60 uppercase tracking-wider">Working Year</div>
        <div className="flex gap-1">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${y === year ? "bg-itf-green text-white" : "bg-itf-canvas text-itf-ink hover:bg-itf-green/10"}`}>
              FY {y}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <input type="number" placeholder="Add year (e.g. 2025)" value={newYear} onChange={(e) => setNewYear(e.target.value)}
            className="rounded border border-itf-rule px-3 py-1.5 text-sm w-40" />
          <button onClick={addYear} className="rounded bg-itf-gold px-3 py-1.5 text-xs font-semibold">+ Add Year</button>
          <button onClick={cloneFromPrevious} className="rounded bg-itf-green text-white px-3 py-1.5 text-xs font-semibold">Clone from Previous</button>
          <button onClick={loadPptxSample} className="rounded bg-itf-red text-white px-3 py-1.5 text-xs font-semibold" title="Load full PowerPoint KRA dataset into current FY (2023/2024 only)">
            ⤓ Load PPT KRA Data
          </button>
        </div>
      </div>

      {/* Table nav */}
      <div className="bg-white rounded-lg border border-itf-rule p-2 flex flex-wrap gap-1">
        {TABLES.map((t) => (
          <button key={t.key} onClick={() => setActive(t.key)}
            className={`px-3 py-1.5 rounded text-xs font-medium ${active === t.key ? "bg-itf-green text-white" : "text-itf-ink/70 hover:bg-itf-canvas"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <TableEditor def={def} year={year} />
    </div>
  );
}

function TableEditor({ def, year }: { def: TableDef; year: number }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [kraImportMode, setKraImportMode] = useState<KRAImportMode>("comparison");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const query = useQuery({
    queryKey: [def.key, year],
    queryFn: async () => {
      let q = sb.from(def.tableKey).select("*").eq("year", year);
      if (def.order) q = q.order(def.order);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const allRows = query.data ?? [];
  const rows = def.tableKey === "kra_rows"
    ? allRows.filter((row: any) => isKraRowInScope(row.kra, def.tableKey === "kra_rows" ? kraImportMode : undefined))
    : filterRevenueRowsByMode(allRows, def.mode);
  const visibleFields = getFormFields(def, def.tableKey === "kra_rows" ? kraImportMode : undefined);
  const allowMultiSelect = def.tableKey === "kra_rows" || def.tableKey === "area_revenue";

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: [def.key, year] });
    qc.invalidateQueries({ queryKey: [def.key] });
    qc.invalidateQueries({ queryKey: ["years_with_data"] });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const remove = async (id: string) => {
    if (!confirm("Delete this row?")) return;
    const { error } = await sb.from(def.tableKey).delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidateAll();
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Row deleted");
  };

  const removeSelected = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected row(s)?`)) return;
    const { error } = await sb.from(def.tableKey).delete().in("id", selectedIds);
    if (error) return toast.error(error.message);
    invalidateAll();
    setSelectedIds([]);
    toast.success(`Deleted ${selectedIds.length} row(s)`);
  };

  const downloadTemplate = async () => {
    if (def.tableKey === "kra_rows") {
      const fields = getKraTemplateFields(kraImportMode);
      const header = fields.map((f) => f.name).join(",");

      let templateRows: Array<Record<string, unknown>> = [];
      try {
        if (kraImportMode === "kra8") {
          // Explicit KRA 8 Revenue Generation Activities KPIs template
          templateRows = [
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Employers' Registered to Date", sort_order: 10 },
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Number of Employers Contributing", sort_order: 20 },
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Number of Employers Defaulting", sort_order: 30 },
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Number of Employers Accounts Verified", sort_order: 40 },
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Discovery of New Companies", sort_order: 50 },
            { kra: "KRA 8", subgroup: "Revenue Generation Activities", kpi: "Number of New Companies Registered", sort_order: 60 },
          ];
        } else {
          const result = await fetchLatestKraRowsForMode(kraImportMode);
          templateRows = result.rows;
        }
      } catch (error: any) {
        console.error("Failed to fetch previous KRA rows for template", error);
        templateRows = [];
      }

      const csvLines = [header];
      for (const row of templateRows) {
        const values = fields.map((f) => {
          if (f.name === "kra") return escapeCsv(row.kra);
          if (f.name === "subgroup") return escapeCsv(row.subgroup);
          if (f.name === "kpi") return escapeCsv(row.kpi);
          if (f.name === "target") return "";
          if (f.name === "actual") return "";
          if (f.name === "sort_order") return escapeCsv(row.sort_order);
          return "";
        });
        csvLines.push(values.join(","));
      }

      const csv = csvLines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = kraImportMode === "metric" ? "kra-5-7-template.csv" : kraImportMode === "kra8" ? "kra-8-template.csv" : "kra-1-4-template.csv";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (def.tableKey === "area_revenue") {
      const csv = buildRevenueTemplateCsv(def);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = def.mode === "training-centre" ? "training-centre-revenue-template.csv" : "area-office-revenue-template.csv";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-itf-rule">
      <div className="flex items-center justify-between p-4 border-b border-itf-rule">
        <div>
          <h2 className="font-semibold text-itf-green">{def.label}</h2>
          <p className="text-[11px] text-itf-ink/60">FY {year} · {rows.length} row(s)</p>
          {def.tableKey === "presenter_notes" && (
            <p className="mt-1 text-[11px] text-itf-ink/60">Use section key <code className="rounded bg-slate-100 px-1 py-0.5">management_attention</code> to manage the Executive Overview attention items.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {def.tableKey === "kra_rows" && (
            <div className="flex items-center gap-1 rounded border border-itf-rule bg-itf-canvas px-2 py-1">
              <button onClick={() => setKraImportMode("comparison")} className={`rounded px-2 py-1 text-[11px] font-semibold ${kraImportMode === "comparison" ? "bg-itf-green text-white" : "text-itf-ink/70"}`}>
                KRA 1–4 comparison
              </button>
              <button onClick={() => setKraImportMode("metric")} className={`rounded px-2 py-1 text-[11px] font-semibold ${kraImportMode === "metric" ? "bg-itf-green text-white" : "text-itf-ink/70"}`}>
                KRA 5–7 metric
              </button>
              <button onClick={() => setKraImportMode("kra8")} className={`rounded px-2 py-1 text-[11px] font-semibold ${kraImportMode === "kra8" ? "bg-itf-green text-white" : "text-itf-ink/70"}`}>
                KRA 8
              </button>
            </div>
          )}
          {(def.tableKey === "kra_rows" || def.tableKey === "area_revenue") && (
            <button onClick={downloadTemplate} className="rounded border border-itf-rule px-3 py-1.5 text-xs font-medium hover:bg-itf-canvas">↓ Download Template</button>
          )}
          {allowMultiSelect && (
            <button onClick={removeSelected} disabled={!selectedIds.length} className="rounded border border-itf-red/40 px-3 py-1.5 text-xs font-medium text-itf-red hover:bg-itf-red/5 disabled:opacity-50">🗑 Delete Selected</button>
          )}
          <button onClick={() => setCsvOpen(true)} className="rounded border border-itf-rule px-3 py-1.5 text-xs font-medium hover:bg-itf-canvas">↑ Import CSV</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded bg-itf-green text-white px-3 py-1.5 text-xs font-semibold">+ Add Row</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-itf-canvas text-[11px] uppercase tracking-wider text-itf-ink/60">
            <tr>
              {allowMultiSelect && (
                <th className="px-3 py-2 w-10">
                  <input type="checkbox" checked={selectedIds.length > 0 && rows.length > 0 && selectedIds.length === rows.length} onChange={() => {
                    if (selectedIds.length === rows.length) setSelectedIds([]);
                    else setSelectedIds(rows.map((r: any) => r.id));
                  }} className="h-4 w-4 rounded border-itf-rule" />
                </th>
              )}
              {visibleFields.map((f) => <th key={f.name} className="px-3 py-2 text-left font-medium">{f.label}</th>)}
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-itf-rule/60">
                {allowMultiSelect && (
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="h-4 w-4 rounded border-itf-rule" />
                  </td>
                )}
                {visibleFields.map((f) => (
                  <td key={f.name} className="px-3 py-2 text-itf-ink">{r[f.name] == null || r[f.name] === undefined ? <span className="text-itf-ink/30">—</span> : String(r[f.name])}</td>
                ))}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-xs text-itf-green font-semibold hover:underline">Edit</button>
                  <button onClick={() => remove(r.id)} className="ml-3 text-xs text-itf-red font-semibold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={visibleFields.length + (def.tableKey === "kra_rows" ? 2 : 1)} className="px-3 py-8 text-center text-sm text-itf-ink/50">
                No data for FY {year}. Add rows or clone from a previous year.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RowForm def={def} year={year} mode={def.tableKey === "kra_rows" ? kraImportMode : undefined} initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); invalidateAll(); }} />
      )}
      {csvOpen && (
        <CsvImport def={def} year={year} mode={def.tableKey === "kra_rows" ? kraImportMode : undefined} onClose={() => setCsvOpen(false)} onDone={() => { setCsvOpen(false); invalidateAll(); }} />
      )}
    </div>
  );
}

function RowForm({ def, year, mode, initial, onClose, onSaved }: { def: TableDef; year: number; mode?: KRAImportMode; initial: any | null; onClose: () => void; onSaved: () => void }) {
  const fields = getFormFields(def, mode);
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach((f) => { v[f.name] = initial?.[f.name] ?? (f.type === "number" ? 0 : ""); });
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async () => {
    setSaving(true);
    setError(undefined);
    const payload: any = { year };
    fields.forEach((f) => {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v === null ? null : Number(v);
      if (f.nullable && (v === "" || v === undefined)) v = null;
      payload[f.name] = v;
    });
    if (def.tableKey === "kra_rows") {
      if (payload.target != null && payload.actual != null) {
        payload.pct = payload.target > 0 ? (payload.actual / payload.target) * 100 : 0;
      } else {
        payload.pct = 0;
      }
    }
    if (def.tableKey === "kra_rows" && mode === "metric") {
      payload.target = 0;
      payload.actual = payload.actual ?? 0;
    }
    if (def.tableKey === "area_revenue") {
      const normalizedStream = normalizeRevenueStream(values.stream, def.mode);
      const normalizedCategory = normalizeRevenueCategory(values.category, def.mode);
      if (!values.office) {
        setError("Office is required.");
        setSaving(false);
        return;
      }
      if (!normalizedStream) {
        setError("Stream must be Training Contribution, Course Fee or Other Income.");
        setSaving(false);
        return;
      }
      if (def.mode === "area-office" && !normalizedCategory) {
        setError("Category must be A, B or C.");
        setSaving(false);
        return;
      }
      if (def.mode === "training-centre" && normalizedStream === "Training Contribution") {
        setError("Training centres should use Course Fee or Other Income only.");
        setSaving(false);
        return;
      }
      payload.office = String(values.office).trim();
      if (def.mode === "area-office") {
        payload.category = normalizedCategory;
      } else {
        payload.category = "Training Centre";
      }
      payload.stream = normalizedStream;
      payload.target = Number(values.target ?? 0);
      payload.actual = Number(values.actual ?? 0);
    }
    const q = initial
      ? sb.from(def.tableKey).update(payload).eq("id", initial.id)
      : sb.from(def.tableKey).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) { setError(error.message); toast.error(error.message); return; }
    toast.success(initial ? "Row updated" : "Row added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-itf-rule flex justify-between items-center">
          <h3 className="font-semibold text-itf-green">{initial ? "Edit" : "Add"} — {def.label}</h3>
          <button onClick={onClose} className="text-itf-ink/50 hover:text-itf-ink">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-xs font-medium text-itf-ink/70">{f.label}{f.required ? " *" : ""}</label>
              {f.type === "textarea" ? (
                <textarea rows={3} value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  className="mt-1 w-full rounded border border-itf-rule px-3 py-2 text-sm" />
              ) : (
                <input type={f.type === "number" ? "number" : "text"} step="any" value={values[f.name] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  className="mt-1 w-full rounded border border-itf-rule px-3 py-2 text-sm" />
              )}
            </div>
          ))}
          {error && <div className="text-xs text-itf-red">{error}</div>}
        </div>
        <div className="p-4 border-t border-itf-rule flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded border border-itf-rule">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-1.5 text-sm rounded bg-itf-green text-white font-semibold disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CsvImport({ def, year, mode, onClose, onDone }: { def: TableDef; year: number; mode?: KRAImportMode; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const importFields = def.tableKey === "kra_rows" && mode === "metric"
    ? [
        { name: "kra", label: "KRA", type: "text" as const, required: true },
        { name: "subgroup", label: "Subgroup", type: "text" as const, nullable: true },
        { name: "kpi", label: "KPI", type: "text" as const, required: true },
        { name: "actual", label: "Value", type: "number" as const, nullable: true },
        { name: "sort_order", label: "Sort", type: "number" as const },
      ]
    : def.tableKey === "kra_rows"
      ? [
          { name: "kra", label: "KRA", type: "text" as const, required: true },
          { name: "subgroup", label: "Subgroup", type: "text" as const, nullable: true },
          { name: "kpi", label: "KPI", type: "text" as const, required: true },
          { name: "target", label: "Target", type: "number" as const, required: true },
          { name: "actual", label: "Actual", type: "number" as const, required: true },
          { name: "sort_order", label: "Sort", type: "number" as const },
        ]
      : def.fields;

  const templateHeader = importFields.map((f) => f.name).join(",");

  const resolveCsvFieldName = (header: string) => {
    const normalized = header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const aliases: Record<string, string> = {
      kra: "kra",
      subgroup: "subgroup",
      kpi: "kpi",
      target: "target",
      actual: "actual",
      value: "actual",
      current_value: "actual",
      current: "actual",
      metric_value: "actual",
      office: "office",
      office_name: "office",
      category: "category",
      stream: "stream",
      sort: "sort_order",
      sort_order: "sort_order",
    };
    return aliases[normalized] ?? null;
  };

  const importCsv = async () => {
    setError(undefined);
    setBusy(true);
    try {
      const normalizedText = text.replace(/^\uFEFF/, "").trim();
      const lines = normalizedText.split(/\r?\n/).filter((line, index) => index === 0 || line.trim() !== "");
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
      const headers = parseCsvLine(lines[0]).map((h) => h.trim().replace(/^\uFEFF/, ""));
      const rows: any[] = [];
      lines.slice(1).forEach((line, index) => {
        const cells = parseCsvLine(line);
        if (!isMeaningfulCsvRow(cells)) return;
        const obj: any = { year };
        headers.forEach((h, i) => {
          const fieldName = resolveCsvFieldName(h);
          if (!fieldName) return;
          const field = importFields.find((f) => f.name === fieldName);
          if (!field) return;
          let v: any = cells[i] ?? "";
          if (v === undefined || v === "") v = null;
          if (field.type === "number" && v !== null) v = Number(v);
          obj[fieldName] = v;
        });
        if (def.tableKey === "kra_rows") {
          if (obj.target != null && obj.actual != null) {
            obj.pct = obj.target > 0 ? (obj.actual / obj.target) * 100 : 0;
          } else {
            obj.pct = 0;
          }
        }
        if (def.tableKey === "kra_rows" && mode === "metric") {
          obj.target = 0;
          obj.actual = obj.actual ?? 0;
        }
        if (def.tableKey === "area_revenue") {
          const normalizedStream = normalizeRevenueStream(obj.stream, def.mode);
          const normalizedCategory = normalizeRevenueCategory(obj.category, def.mode);
          const normalizedOffice = normalizeOfficeName(obj.office);
          if (!normalizedOffice && !obj.stream && !obj.target && !obj.actual) return;
          if (!normalizedOffice) throw new Error(`Row ${index + 2} is missing office.`);
          if (!normalizedStream) throw new Error(`Row ${index + 2} has an invalid stream.`);
          if (def.mode === "area-office") {
            const areaOption = AREA_OFFICE_OPTIONS.find((item) => item.name === normalizedOffice);
            if (!areaOption) throw new Error(`Row ${index + 2} uses an unapproved office name.`);
            if (normalizedCategory !== areaOption.category) throw new Error(`Row ${index + 2} must use category ${areaOption.category}.`);
          } else {
            if (!TRAINING_CENTRE_OPTIONS.includes(normalizedOffice as (typeof TRAINING_CENTRE_OPTIONS)[number])) throw new Error(`Row ${index + 2} uses an unapproved training centre name.`);
            if (normalizedStream === "Training Contribution") throw new Error(`Row ${index + 2} should use Course Fee or Other Income only.`);
          }
          obj.office = normalizedOffice;
          obj.stream = normalizedStream;
          obj.category = def.mode === "area-office" ? normalizedCategory : "Training Centre";
          obj.target = Number(obj.target ?? 0);
          obj.actual = Number(obj.actual ?? 0);
        }
        rows.push(obj);
      });
      // Prevent duplicate KRA rows when importing: update existing rows (match year/kra/kpi), insert new ones.
      if (def.tableKey === "kra_rows") {
        const kraValues = Array.from(new Set(rows.map((r: any) => r.kra)));
        const { data: existing = [], error: fetchErr } = await sb.from("kra_rows").select("kra,kpi,id").eq("year", year).in("kra", kraValues);
        if (fetchErr) throw fetchErr;
        const existingMap = new Map<string, any>();
        (existing as any[]).forEach((e: any) => existingMap.set(`${e.kra}||${e.kpi}`, e));

        const toInsert: any[] = [];
        const toUpdate: any[] = [];
        for (const r of rows) {
          const key = `${r.kra}||${r.kpi}`;
          if (existingMap.has(key)) toUpdate.push(r);
          else toInsert.push(r);
        }

        // Run updates sequentially to avoid conflicts
        for (const u of toUpdate) {
          const { error: updErr } = await sb.from("kra_rows").update(u).match({ year: u.year, kra: u.kra, kpi: u.kpi });
          if (updErr) throw updErr;
        }

        if (toInsert.length) {
          const { error: insErr } = await sb.from("kra_rows").insert(toInsert);
          if (insErr) throw insErr;
        }
      } else {
        const { error } = await sb.from(def.tableKey).insert(rows);
        if (error) throw error;
      }
      toast.success(`Imported ${rows.length} row(s)`);
      onDone();
    } catch (e: any) {
      setError(e.message);
      toast.error(`Import failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b border-itf-rule flex justify-between items-center">
          <h3 className="font-semibold text-itf-green">Import CSV — {def.label} (FY {year})</h3>
          <button onClick={onClose} className="text-itf-ink/50 hover:text-itf-ink">✕</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-xs text-itf-ink/70">
            Paste CSV rows below. First line must be a header with column names.
            <div className="mt-1 text-[11px] font-mono bg-itf-canvas rounded p-2 select-all">{templateHeader}</div>
            {def.tableKey === "kra_rows" && mode === "metric" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this mode for KRA 5–7 metric uploads. Enter the value for the selected year and the report will compare it automatically with the previous year.
              </div>
            )}
            {def.tableKey === "kra_rows" && mode === "kra8" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this mode for KRA 8 uploads. It uses a plain KRA-row structure with KRA, subgroup, KPI, target, actual and sort order only. No revenue stream fields are used. The template lists the Revenue Generation Activities KPIs — please fill only the Target and Actual columns.
              </div>
            )}
            {def.tableKey === "kra_rows" && mode === "kra8" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this mode for KRA 8 uploads. It uses a plain KRA-row structure with KRA, subgroup, KPI, target, actual and sort order only. No revenue stream fields are used.
              </div>
            )}
            {def.tableKey === "area_revenue" && def.mode === "training-centre" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this tab for training-centre revenue only. Allowed streams are Course Fee and Other Income.
              </div>
            )}
            {def.tableKey === "area_revenue" && def.mode === "area-office" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this tab for area-office revenue. Categories should be A, B or C.
              </div>
            )}
          </div>
          <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={`${templateHeader}\n...`}
            className="w-full rounded border border-itf-rule px-3 py-2 text-sm font-mono" />
          <input type="file" accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const name = (f.name || "").toLowerCase();
            if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
              try {
                const ab = await f.arrayBuffer();
                const XLSX = await import('xlsx');
                const wb = XLSX.read(ab, { type: 'array' });
                const first = wb.SheetNames[0];
                const csv = XLSX.utils.sheet_to_csv(wb.Sheets[first]);
                setText(csv);
              } catch (err: any) {
                setError(`Failed to parse Excel file: ${err?.message ?? String(err)}`);
              }
            } else {
              setText(await f.text());
            }
          }} className="text-xs" />
          {error && <div className="text-xs text-itf-red">{error}</div>}
        </div>
        <div className="p-4 border-t border-itf-rule flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded border border-itf-rule">Cancel</button>
          <button onClick={importCsv} disabled={busy || !text} className="px-4 py-1.5 text-sm rounded bg-itf-green text-white font-semibold disabled:opacity-60">
            {busy ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ""; }
      else if (ch === '"' && cur === "") { inQ = true; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
