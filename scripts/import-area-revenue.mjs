#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const MASTER_OFFICES = [
  'Abuja','Apapa','Benin','Ikeja','Isolo','Lagos Island','Lekki','Port Harcourt','Rumuokuta','V/Island',
  'Abeokuta','Badagry','Enugu','Gwagwalada','Ibadan','Kaduna','Kano','Lafia','Warri',
  'Aba','Abakaliki','Akure','Awka','Bauchi','Calabar','Gombe','Gusau','Ilorin','Ikorodu','Jos','Katsina','Lokoja','Maiduguri','Makurdi','Minna','Owerri','Sokoto','Uyo','Yenagoa','Yola'
];

const USAGE = `Usage: node scripts/import-area-revenue.mjs <file.csv|file.xlsx> --year=2024 [--dry-run]

Environment variables:
  SUPABASE_URL        - your Supabase project URL
  SUPABASE_KEY        - service role key (required to write)

Options:
  --dry-run           - validate and print rows without writing
`;

function parseArgs() {
  const args = process.argv.slice(2);
  if (!args[0]) { console.error(USAGE); process.exit(1); }
  const file = args[0];
  const opts = { year: null, dryRun: false };
  for (const a of args.slice(1)) {
    if (a.startsWith('--year=')) opts.year = a.split('=')[1];
    if (a === '--dry-run') opts.dryRun = true;
  }
  if (!opts.year) { console.error('Missing --year'); console.error(USAGE); process.exit(1); }
  return { file, ...opts };
}

function normalizeHeader(h) {
  if (!h) return '';
  return h.toString().trim().toLowerCase().replace(/\s+/g,'_');
}

function mapRow(raw) {
  const obj = {};
  for (const k of Object.keys(raw)) {
    const hk = normalizeHeader(k);
    const v = raw[k];
    if (['office','office_name'].includes(hk)) obj.office = String(v).trim();
    else if (['category'].includes(hk)) obj.category = String(v).trim();
    else if (['stream'].includes(hk)) obj.stream = String(v).trim();
    else if (['target'].includes(hk)) obj.target = Number(v || 0);
    else if (['actual','value','current_value'].includes(hk)) obj.actual = Number(v || 0);
    else if (['pct','pct_achieved','percentage','percent'].includes(hk)) obj.pct = Number(v || 0);
  }
  // compute pct if missing
  if ((!obj.pct || obj.pct === 0) && obj.target && obj.target !== 0) {
    obj.pct = (obj.actual || 0) / obj.target * 100;
  }
  return obj;
}

async function readFileToRows(file) {
  const ext = path.extname(file).toLowerCase();
  const buf = await fs.readFile(file);
  if (ext === '.csv') {
    const wb = XLSX.read(buf.toString(), { type: 'string' });
    const first = wb.SheetNames[0];
    return XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: '' });
  }
  const wb = XLSX.read(buf, { type: 'buffer' });
  const first = wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: '' });
}

async function main() {
  const { file, year, dryRun } = parseArgs();
  if (!file) { console.error(USAGE); process.exit(1); }
  if (!file.toLowerCase().endsWith('.csv') && !file.toLowerCase().endsWith('.xlsx') && !file.toLowerCase().endsWith('.xls')) {
    console.error('Input must be .csv or .xlsx'); process.exit(1); }
  const rows = await readFileToRows(file);
  const mapped = rows.map(mapRow);
  const errors = [];
  const out = [];
  for (let i=0;i<mapped.length;i++) {
    const r = mapped[i];
    if (!r.office || !r.stream) {
      errors.push(`Row ${i+2}: missing office or stream`);
      continue;
    }
    // validate office exists in master list
    if (!MASTER_OFFICES.includes(r.office)) {
      errors.push(`Row ${i+2}: unknown office "${r.office}"`);
      continue;
    }
    // ensure category exists; if empty set default A
    if (!r.category) r.category = 'A';
    out.push({ year: Number(year), office: r.office, category: r.category, stream: r.stream, target: Number(r.target||0), actual: Number(r.actual||0) });
  }
  console.log(`Parsed ${rows.length} rows -> ${out.length} valid rows, ${errors.length} errors`);
  if (errors.length) { console.error(errors.join('\n')); }
  if (dryRun) { console.log('Dry run; not writing to DB'); console.table(out.slice(0,20)); process.exit(errors.length?2:0); }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('SUPABASE_URL and SUPABASE_KEY environment variables are required to write to Supabase');
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  // delete existing for year
  console.log(`Deleting existing area_revenue rows for year ${year}...`);
  const del = await supabase.from('area_revenue').delete().eq('year', Number(year));
  if (del.error) { console.error('Delete error', del.error); process.exit(1); }
  console.log('Insert rows...');
  const chunkSize = 500;
  for (let i=0;i<out.length;i+=chunkSize) {
    const chunk = out.slice(i, i+chunkSize);
    const res = await supabase.from('area_revenue').insert(chunk);
    if (res.error) { console.error('Insert error', res.error); process.exit(1); }
    console.log(`Inserted rows ${i+1}-${i+chunk.length}`);
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
