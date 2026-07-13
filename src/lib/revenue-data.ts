export type RevenueStream = "Training Contribution" | "Course Fee" | "Other Income";

export interface RevenueRowLike {
  office?: string | null;
  category?: string | null;
  stream?: string | null;
  target?: number | null;
  actual?: number | null;
  year?: number | null;
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

function isTrainingCentre(row: RevenueRowLike) {
  const cat = normalizeCategory(row.category);
  return !CATEGORY_ORDER.includes(cat as (typeof CATEGORY_ORDER)[number]) && Boolean(row.office);
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
  const rows = STREAMS.map((stream) => buildStreamSummary(
    currentRows.filter((row) => normalizeCategory(row.category) === category && normalizeStream(row.stream) === stream),
    previousRows.filter((row) => normalizeCategory(row.category) === category && normalizeStream(row.stream) === stream),
    stream,
  )).filter((row) => row.actual > 0 || row.target > 0 || row.previousActual > 0 || row.previousTarget > 0);

  const offices = Array.from(new Map(
    currentRows.filter((row) => normalizeCategory(row.category) === category && Boolean(row.office)).map((row) => [String(row.office ?? "").trim(), [] as RevenueRowLike[]]),
  ).keys());

  const breakdown = offices.map((office) => {
    const officeCurrentRows = currentRows.filter((row) => normalizeCategory(row.category) === category && String(row.office ?? "").trim() === office);
    const officePreviousRows = previousRows.filter((row) => normalizeCategory(row.category) === category && String(row.office ?? "").trim() === office);
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
  const centres = new Map<string, RevenueRowLike[]>();
  for (const row of currentRows.filter(isTrainingCentre)) {
    const office = String(row.office ?? "Training Centre").trim();
    const items = centres.get(office) ?? [];
    items.push(row);
    centres.set(office, items);
  }

  return Array.from(centres.entries()).map(([office, rows]) => {
    const prevRows = previousRows.filter((row) => isTrainingCentre(row) && String(row.office ?? "Training Centre").trim() === office);
    const streamRows = STREAMS.map((stream) => buildStreamSummary(rows.filter((row) => normalizeStream(row.stream) === stream), prevRows.filter((row) => normalizeStream(row.stream) === stream), stream))
      .filter((row) => row.actual > 0 || row.target > 0 || row.previousActual > 0 || row.previousTarget > 0);

    return {
      id: `training-centre-${office}`,
      title: office,
      kind: "training-centre",
      rows: streamRows,
      breakdown: [{
        office,
        currentActual: streamRows.reduce((sum, row) => sum + row.actual, 0),
        currentTarget: streamRows.reduce((sum, row) => sum + row.target, 0),
        previousActual: streamRows.reduce((sum, row) => sum + row.previousActual, 0),
        previousTarget: streamRows.reduce((sum, row) => sum + row.previousTarget, 0),
        streams: streamRows,
      }],
    };
  });
}

export function buildRevenueAggregation(currentRows: RevenueRowLike[], previousRows: RevenueRowLike[] = []): RevenueAggregation {
  const totals = STREAMS.map((stream) => buildStreamSummary(currentRows, previousRows, stream));
  const sections = [
    ...CATEGORY_ORDER.map((category) => buildSectionForCategory(category, currentRows, previousRows)),
    ...buildTrainingCentreSections(currentRows, previousRows),
  ];

  return { totals, sections };
}
