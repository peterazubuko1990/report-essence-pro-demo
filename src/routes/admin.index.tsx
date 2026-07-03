import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useYear } from "@/lib/year-context";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type TableKey = "kra_rows" | "revenue_rows" | "area_revenue" | "training_programmes" | "staff_school" | "hr_metrics" | "challenges" | "way_forward" | "wins" | "presenter_notes";
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

function AdminHome() {
  const { year, years, setYear } = useYear();
  const [active, setActive] = useState<TableKey>("kra_rows");
  const [newYear, setNewYear] = useState<string>("");
  const qc = useQueryClient();
  const def = TABLES.find((t) => t.key === active)!;

  const addYear = async () => {
    const y = parseInt(newYear, 10);
    if (!y) return;
    const { error } = await supabase.from("years").insert({ year: y, label: `FY ${y}` });
    if (error) return alert(error.message);
    setNewYear("");
    qc.invalidateQueries({ queryKey: ["years"] });
    qc.invalidateQueries({ queryKey: ["years_with_data"] });
    setYear(y);
  };

  const cloneFromPrevious = async () => {
    const prev = years[years.indexOf(year) - 1] ?? years[0];
    if (prev === year) return alert("Select a target year different from the source.");
    if (!confirm(`Clone all data from ${prev} into ${year}? (Existing ${year} rows are kept)`)) return;
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
    alert("Clone complete.");
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
        <div className="flex items-center gap-2 ml-auto">
          <input type="number" placeholder="Add year (e.g. 2025)" value={newYear} onChange={(e) => setNewYear(e.target.value)}
            className="rounded border border-itf-rule px-3 py-1.5 text-sm w-40" />
          <button onClick={addYear} className="rounded bg-itf-gold px-3 py-1.5 text-xs font-semibold">+ Add Year</button>
          <button onClick={cloneFromPrevious} className="rounded bg-itf-green text-white px-3 py-1.5 text-xs font-semibold">Clone from Previous</button>
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

  const rows = query.data ?? [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: [def.key, year] });
    qc.invalidateQueries({ queryKey: [def.key] });
    qc.invalidateQueries({ queryKey: ["years_with_data"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this row?")) return;
    const { error } = await sb.from(def.key).delete().eq("id", id);
    if (error) return alert(error.message);
    invalidateAll();
  };

  return (
    <div className="bg-white rounded-lg border border-itf-rule">
      <div className="flex items-center justify-between p-4 border-b border-itf-rule">
        <div>
          <h2 className="font-semibold text-itf-green">{def.label}</h2>
          <p className="text-[11px] text-itf-ink/60">FY {year} · {rows.length} row(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCsvOpen(true)} className="rounded border border-itf-rule px-3 py-1.5 text-xs font-medium hover:bg-itf-canvas">↑ Import CSV</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded bg-itf-green text-white px-3 py-1.5 text-xs font-semibold">+ Add Row</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-itf-canvas text-[11px] uppercase tracking-wider text-itf-ink/60">
            <tr>
              {def.fields.map((f) => <th key={f.name} className="px-3 py-2 text-left font-medium">{f.label}</th>)}
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-itf-rule/60">
                {def.fields.map((f) => (
                  <td key={f.name} className="px-3 py-2 text-itf-ink">{r[f.name] === null ? <span className="text-itf-ink/30">—</span> : String(r[f.name])}</td>
                ))}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-xs text-itf-green font-semibold hover:underline">Edit</button>
                  <button onClick={() => remove(r.id)} className="ml-3 text-xs text-itf-red font-semibold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={def.fields.length + 1} className="px-3 py-8 text-center text-sm text-itf-ink/50">
                No data for FY {year}. Add rows or clone from a previous year.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <RowForm def={def} year={year} initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); invalidateAll(); }} />
      )}
      {csvOpen && (
        <CsvImport def={def} year={year} onClose={() => setCsvOpen(false)} onDone={() => { setCsvOpen(false); invalidateAll(); }} />
      )}
    </div>
  );
}

function RowForm({ def, year, initial, onClose, onSaved }: { def: TableDef; year: number; initial: any | null; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    def.fields.forEach((f) => { v[f.name] = initial?.[f.name] ?? (f.type === "number" ? 0 : ""); });
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async () => {
    setSaving(true);
    setError(undefined);
    const payload: any = { year };
    def.fields.forEach((f) => {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v === null ? null : Number(v);
      if (f.nullable && (v === "" || v === undefined)) v = null;
      payload[f.name] = v;
    });
    const q = initial
      ? sb.from(def.key).update(payload).eq("id", initial.id)
      : sb.from(def.key).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return setError(error.message);
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
          {def.fields.map((f) => (
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

function CsvImport({ def, year, onClose, onDone }: { def: TableDef; year: number; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const templateHeader = def.fields.map((f) => f.name).join(",");

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
          const field = def.fields.find((f) => f.name === h);
          if (!field) return;
          let v: any = cells[i];
          if (v === undefined || v === "") v = null;
          if (field.type === "number" && v !== null) v = Number(v);
          obj[h] = v;
        });
        return obj;
      });
      const { error } = await sb.from(def.key).insert(rows);
      if (error) throw error;
      onDone();
    } catch (e: any) {
      setError(e.message);
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
