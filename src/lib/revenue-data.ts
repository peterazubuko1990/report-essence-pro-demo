export type RevenueStream = "Training Contribution" | "Course Fee" | "Other Income";

export interface RevenueRowLike {
  office?: string | null;
  category?: string | null;
  stream?: string | null;
  target?: number | null;
  actual?: number | null;
  year?: number | null;
  revenue_source?: string | null;
}

export interface RevenueStreamSummary {
  stream: RevenueStream;
  actual: number;
  target: number;
  pct: number;
  previousActual: number;
  previousTarget: number;
  previousPct: number;
}

export interface RevenueOfficeBreakdown {
  office: string;
  currentActual: number;
  currentTarget: number;
  previousActual: number;
  previousTarget: number;
  streams: RevenueStreamSummary[];
}

export interface RevenueSectionSummary {
  id: string;
  title: string;
  kind: "category" | "training-centre";
  rows: RevenueStreamSummary[];
  breakdown: RevenueOfficeBreakdown[];
}

export interface RevenueAggregation {
  totals: RevenueStreamSummary[];
  sections: RevenueSectionSummary[];
}

const STREAMS: RevenueStream[] = ["Training Contribution", "Course Fee", "Other Income"];
const CATEGORY_ORDER = ["A", "B", "C"] as const;

function normalizeStream(value?: string | null): RevenueStream | null {
  const text = String(value ?? "").trim().toLowerCase();
  if (text.includes("training")) return "Training Contribution";
  if (text.includes("course")) return "Course Fee";
  if (text.includes("other")) return "Other Income";
  return null;
}

function normalizeCategory(value?: string | null) {
  return String(value ?? "").trim().toUpperCase();
}

export function inferRevenueMode(row: RevenueRowLike): "area-office" | "training-centre" | null {
  const source = String(row.revenue_source ?? "").trim().toLowerCase();
  if (source === "training-centre") return "training-centre";
  if (source === "area-office") return "area-office";
  const category = normalizeCategory(row.category);
  if (category === "TRAINING CENTRE") return "training-centre";
  if (CATEGORY_ORDER.includes(category as (typeof CATEGORY_ORDER)[number])) return "area-office";
  const office = String(row.office ?? "").trim();
  if (office === "Centre for Excellence" || office === "ISTC Ikeja" || office === "ISTC Kano" || office === "ISTC Lokoja" || office === "MSTC Abuja" || office === "Staff School" || office === "Corporate Office Abuja") return "training-centre";
  return null;
}

function isTrainingCentre(row: RevenueRowLike) {
  return inferRevenueMode(row) === "training-centre";
}

function buildStreamSummary(rows: RevenueRowLike[], previousRows: RevenueRowLike[], stream: RevenueStream): RevenueStreamSummary {
  const currentActual = rows.reduce((sum, row) => sum + Number(normalizeStream(row.stream) === stream ? row.actual ?? 0 : 0), 0);
  const currentTarget = rows.reduce((sum, row) => sum + Number(normalizeStream(row.stream) === stream ? row.target ?? 0 : 0), 0);
  const previousActual = previousRows.reduce((sum, row) => sum + Number(normalizeStream(row.stream) === stream ? row.actual ?? 0 : 0), 0);
  const previousTarget = previousRows.reduce((sum, row) => sum + Number(normalizeStream(row.stream) === stream ? row.target ?? 0 : 0), 0);
  const pct = currentTarget > 0 ? (currentActual / currentTarget) * 100 : 0;
  const previousPct = previousTarget > 0 ? (previousActual / previousTarget) * 100 : 0;

  return {
    stream,
    actual: currentActual,
    target: currentTarget,
    pct,
    previousActual,
    previousTarget,
    previousPct,
  };
}

function buildSectionForCategory(category: string, currentRows: RevenueRowLike[], previousRows: RevenueRowLike[]): RevenueSectionSummary {
  const areaOfficeCurrentRows = currentRows.filter((row) => inferRevenueMode(row) === "area-office");
  const areaOfficePreviousRows = previousRows.filter((row) => inferRevenueMode(row) === "area-office");

  const rows = STREAMS.map((stream) => buildStreamSummary(
    areaOfficeCurrentRows.filter((row) => normalizeCategory(row.category) === category && normalizeStream(row.stream) === stream),
    areaOfficePreviousRows.filter((row) => normalizeCategory(row.category) === category && normalizeStream(row.stream) === stream),
    stream,
  )).filter((row) => row.actual > 0 || row.target > 0 || row.previousActual > 0 || row.previousTarget > 0);

  const offices = Array.from(new Map(
    areaOfficeCurrentRows.filter((row) => normalizeCategory(row.category) === category && Boolean(row.office)).map((row) => [String(row.office ?? "").trim(), [] as RevenueRowLike[]]),
  ).keys());

  const breakdown = offices.map((office) => {
    const officeCurrentRows = areaOfficeCurrentRows.filter((row) => normalizeCategory(row.category) === category && String(row.office ?? "").trim() === office);
    const officePreviousRows = areaOfficePreviousRows.filter((row) => normalizeCategory(row.category) === category && String(row.office ?? "").trim() === office);
    const streams = STREAMS.map((stream) => buildStreamSummary(
      officeCurrentRows.filter((row) => normalizeStream(row.stream) === stream),
      officePreviousRows.filter((row) => normalizeStream(row.stream) === stream),
      stream,
    )).filter((row) => row.actual > 0 || row.target > 0 || row.previousActual > 0 || row.previousTarget > 0);

    return {
      office,
      currentActual: streams.reduce((sum, row) => sum + row.actual, 0),
      currentTarget: streams.reduce((sum, row) => sum + row.target, 0),
      previousActual: streams.reduce((sum, row) => sum + row.previousActual, 0),
      previousTarget: streams.reduce((sum, row) => sum + row.previousTarget, 0),
      streams,
    };
  });

  return {
    id: `category-${category}`,
    title: `Category ${category}`,
    kind: "category",
    rows,
    breakdown,
  };
}

function buildTrainingCentreSections(currentRows: RevenueRowLike[], previousRows: RevenueRowLike[]): RevenueSectionSummary[] {
  return [];
}

export function buildRevenueAggregation(currentRows: RevenueRowLike[], previousRows: RevenueRowLike[] = []): RevenueAggregation {
  const totals = STREAMS.map((stream) => buildStreamSummary(currentRows, previousRows, stream));
  const sections = [
    ...CATEGORY_ORDER.map((category) => buildSectionForCategory(category, currentRows, previousRows)),
  ];

  return { totals, sections };
}
