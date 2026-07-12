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
type KRAImportMode = "comparison" | "metric";
const sb = supabase as any;

type FieldDef = { name: string; label: string; type: "text" | "number" | "textarea"; required?: boolean; nullable?: boolean };
type TableDef = { key: TableKey; label: string; fields: FieldDef[]; order?: string };

const TABLES: TableDef[] = [
  { key: "kra_rows", label: "KRA Rows", order: "sort_order",
    fields: [
      { name: "kra", label: "KRA", type: "text", required: true },
      { name: "subgroup", label: "Subgroup", type: "text", nullable: true },
      { name: "kpi", label: "KPI", type: "text", required: true },
      { name: "target", label: "Target", type: "number", required: true },
      { name: "actual", label: "Actual", type: "number", required: true },
      { name: "pct", label: "% Achieved", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "revenue_rows", label: "Headline Revenue", order: "sort_order",
    fields: [
      { name: "line", label: "Line", type: "text", required: true },
      { name: "target", label: "Target (₦)", type: "number", required: true },
      { name: "actual", label: "Actual (₦)", type: "number", required: true },
      { name: "pct", label: "% Achieved", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "area_revenue", label: "Area-Office Revenue",
    fields: [
      { name: "office", label: "Office", type: "text", required: true },
      { name: "category", label: "Category (A/B/C)", type: "text", required: true },
      { name: "stream", label: "Stream", type: "text", required: true },
      { name: "target", label: "Target (₦)", type: "number", required: true },
      { name: "actual", label: "Actual (₦)", type: "number", required: true },
    ] },
  { key: "training_programmes", label: "Training Programmes",
    fields: [
      { name: "programme", label: "Programme", type: "text", required: true },
      { name: "participants", label: "Participants", type: "number", nullable: true },
    ] },
  { key: "staff_school", label: "Staff School Results",
    fields: [
      { name: "exam", label: "Exam", type: "text", required: true },
      { name: "students", label: "Students", type: "number", required: true },
      { name: "passed", label: "Passed", type: "number", required: true },
      { name: "pct", label: "% Pass", type: "number", required: true },
    ] },
  { key: "hr_metrics", label: "HR Metrics", order: "sort_order",
    fields: [
      { name: "item", label: "Item", type: "text", required: true },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "challenges", label: "Challenges", order: "sort_order",
    fields: [
      { name: "text", label: "Challenge", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "way_forward", label: "Way Forward", order: "sort_order",
    fields: [
      { name: "text", label: "Recommendation", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "wins", label: "Wins / Achievements", order: "sort_order",
    fields: [
      { name: "section", label: "Section (e.g. overview, KRA 1)", type: "text", required: true },
      { name: "text", label: "Achievement", type: "textarea", required: true },
      { name: "tone", label: "Tone (good / warn / bad)", type: "text" },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
  { key: "presenter_notes", label: "Presenter Notes", order: "sort_order",
    fields: [
      { name: "section", label: "Section key (matches page section)", type: "text", required: true },
      { name: "title", label: "Title", type: "text", nullable: true },
      { name: "body", label: "Body / commentary", type: "textarea", required: true },
      { name: "sort_order", label: "Sort", type: "number" },
    ] },
];

function getKraFormFields(def: TableDef, mode?: KRAImportMode): FieldDef[] {
  if (def.key !== "kra_rows") return def.fields;
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
    { name: "pct", label: "% Achieved", type: "number", required: true },
    { name: "sort_order", label: "Sort", type: "number" },
  ];
}

function isKraRowInScope(kra: string | null | undefined, mode?: KRAImportMode) {
  if (!kra || !mode) return true;
  const match = String(kra).match(/KRA\s*(\d+)/i);
  const number = match ? Number(match[1]) : null;
  if (mode === "metric") return number !== null && number >= 5 && number <= 7;
  return number !== null && number >= 1 && number <= 4;
}

function AdminHome() {
  const { year, years, setYear } = useYear();
  const [active, setActive] = useState<TableKey>("kra_rows");
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
      let q = sb.from(def.key).select("*").eq("year", year);
      if (def.order) q = q.order(def.order);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const allRows = query.data ?? [];
  const rows = def.key === "kra_rows"
    ? allRows.filter((row: any) => isKraRowInScope(row.kra, def.key === "kra_rows" ? kraImportMode : undefined))
    : allRows;
  const visibleFields = getKraFormFields(def, def.key === "kra_rows" ? kraImportMode : undefined);

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
    const { error } = await sb.from(def.key).delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidateAll();
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Row deleted");
  };

  const removeSelected = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected row(s)?`)) return;
    const { error } = await sb.from(def.key).delete().in("id", selectedIds);
    if (error) return toast.error(error.message);
    invalidateAll();
    setSelectedIds([]);
    toast.success(`Deleted ${selectedIds.length} row(s)`);
  };

  const downloadTemplate = () => {
    if (def.key !== "kra_rows") return;
    const fields = getKraFormFields(def, kraImportMode);
    const header = fields.map((f) => f.name).join(",");
    const sampleValues = kraImportMode === "metric"
      ? ["KRA 5", "Subgroup example", "Sample KPI", "120", "1"]
      : ["KRA 1", "Subgroup example", "Sample KPI", "100", "120", "120", "1"];
    const rows = [header, sampleValues.join(",")].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = kraImportMode === "metric" ? "kra-5-7-template.csv" : "kra-1-4-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-itf-rule">
      <div className="flex items-center justify-between p-4 border-b border-itf-rule">
        <div>
          <h2 className="font-semibold text-itf-green">{def.label}</h2>
          <p className="text-[11px] text-itf-ink/60">FY {year} · {rows.length} row(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {def.key === "kra_rows" && (
            <div className="flex items-center gap-1 rounded border border-itf-rule bg-itf-canvas px-2 py-1">
              <button onClick={() => setKraImportMode("comparison")} className={`rounded px-2 py-1 text-[11px] font-semibold ${kraImportMode === "comparison" ? "bg-itf-green text-white" : "text-itf-ink/70"}`}>
                KRA 1–4 comparison
              </button>
              <button onClick={() => setKraImportMode("metric")} className={`rounded px-2 py-1 text-[11px] font-semibold ${kraImportMode === "metric" ? "bg-itf-green text-white" : "text-itf-ink/70"}`}>
                KRA 5–7 metric
              </button>
            </div>
          )}
          {def.key === "kra_rows" && (
            <>
              <button onClick={downloadTemplate} className="rounded border border-itf-rule px-3 py-1.5 text-xs font-medium hover:bg-itf-canvas">↓ Download Template</button>
              <button onClick={removeSelected} disabled={!selectedIds.length} className="rounded border border-itf-red/40 px-3 py-1.5 text-xs font-medium text-itf-red hover:bg-itf-red/5 disabled:opacity-50">🗑 Delete Selected</button>
            </>
          )}
          <button onClick={() => setCsvOpen(true)} className="rounded border border-itf-rule px-3 py-1.5 text-xs font-medium hover:bg-itf-canvas">↑ Import CSV</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded bg-itf-green text-white px-3 py-1.5 text-xs font-semibold">+ Add Row</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-itf-canvas text-[11px] uppercase tracking-wider text-itf-ink/60">
            <tr>
              {def.key === "kra_rows" && (
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
                {def.key === "kra_rows" && (
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
              <tr><td colSpan={visibleFields.length + (def.key === "kra_rows" ? 2 : 1)} className="px-3 py-8 text-center text-sm text-itf-ink/50">
                No data for FY {year}. Add rows or clone from a previous year.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RowForm def={def} year={year} mode={def.key === "kra_rows" ? kraImportMode : undefined} initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); invalidateAll(); }} />
      )}
      {csvOpen && (
        <CsvImport def={def} year={year} mode={def.key === "kra_rows" ? kraImportMode : undefined} onClose={() => setCsvOpen(false)} onDone={() => { setCsvOpen(false); invalidateAll(); }} />
      )}
    </div>
  );
}

function RowForm({ def, year, mode, initial, onClose, onSaved }: { def: TableDef; year: number; mode?: KRAImportMode; initial: any | null; onClose: () => void; onSaved: () => void }) {
  const fields = getKraFormFields(def, mode);
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
    if (def.key === "kra_rows" && mode === "metric") {
      payload.target = 0;
      payload.actual = payload.actual ?? 0;
      payload.pct = 0;
    }
    const q = initial
      ? sb.from(def.key).update(payload).eq("id", initial.id)
      : sb.from(def.key).insert(payload);
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

  const importFields = def.key === "kra_rows" && mode === "metric"
    ? [
        { name: "kra", label: "KRA", type: "text" as const, required: true },
        { name: "subgroup", label: "Subgroup", type: "text" as const, nullable: true },
        { name: "kpi", label: "KPI", type: "text" as const, required: true },
        { name: "actual", label: "Value", type: "number" as const, nullable: true },
        { name: "sort_order", label: "Sort", type: "number" as const },
      ]
    : [
        { name: "kra", label: "KRA", type: "text" as const, required: true },
        { name: "subgroup", label: "Subgroup", type: "text" as const, nullable: true },
        { name: "kpi", label: "KPI", type: "text" as const, required: true },
        { name: "target", label: "Target", type: "number" as const, required: true },
        { name: "actual", label: "Actual", type: "number" as const, required: true },
        { name: "pct", label: "% Achieved", type: "number" as const, required: true },
        { name: "sort_order", label: "Sort", type: "number" as const },
      ];

  const templateHeader = importFields.map((f) => f.name).join(",");

  const resolveCsvFieldName = (header: string) => {
    const normalized = header.trim().toLowerCase().replace(/\s+/g, "_");
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
      pct: "pct",
      percent: "pct",
      percentage: "pct",
      sort: "sort_order",
      sort_order: "sort_order",
    };
    return aliases[normalized] ?? null;
  };

  const importCsv = async () => {
    setError(undefined);
    setBusy(true);
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).filter(Boolean).map((line) => {
        const cells = parseCsvLine(line);
        const obj: any = { year };
        headers.forEach((h, i) => {
          const fieldName = resolveCsvFieldName(h);
          if (!fieldName) return;
          const field = importFields.find((f) => f.name === fieldName);
          if (!field) return;
          let v: any = cells[i];
          if (v === undefined || v === "") v = null;
          if (field.type === "number" && v !== null) v = Number(v);
          obj[fieldName] = v;
        });
        if (def.key === "kra_rows" && mode === "metric") {
          obj.target = 0;
          obj.actual = obj.actual ?? 0;
          obj.pct = 0;
        }
        return obj;
      });
      const { error } = await sb.from(def.key).insert(rows);
      if (error) throw error;
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
            {def.key === "kra_rows" && mode === "metric" && (
              <div className="mt-2 rounded border border-itf-rule/70 bg-itf-canvas/60 p-2 text-[11px] text-itf-ink/70">
                Use this mode for KRA 5–7 metric uploads. Enter the value for the selected year and the report will compare it automatically with the previous year.
              </div>
            )}
          </div>
          <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={`${templateHeader}\n...`}
            className="w-full rounded border border-itf-rule px-3 py-2 text-sm font-mono" />
          <input type="file" accept=".csv,text/csv" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setText(await f.text());
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
