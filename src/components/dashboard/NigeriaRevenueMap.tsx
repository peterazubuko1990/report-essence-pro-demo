import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { fmtNaira } from "@/data/itf2024";
import { inferRevenueMode } from "@/lib/revenue-data";
import { NIGERIA_MAP } from "./nigeria-map-data";

type StreamKey = "Training Contribution" | "Course Fee" | "Other Income";

type RevenueRow = {
  office?: string | null;
  category?: string | null;
  revenue_source?: string | null;
  stream?: string | null;
  actual?: number | null;
  target?: number | null;
};

type StateRevenue = {
  state: string;
  actual: number;
  target: number;
  streams: Record<StreamKey, number>;
  officeCount: number;
};

type Band = "none" | "low" | "warn" | "good" | "excellent" | "bad" | "caution";
type HoverInfo = { state: string; x: number; y: number } | null;

const MAP_CANONICAL_STATE: Record<string, string> = {
  "Federal Capital Territory": "FCT",
  Nassarawa: "Nasarawa",
};

const OFFICE_TO_STATE: Record<string, string> = {
  Abuja: "FCT",
  "Gwagwalada": "FCT",
  "Lagos Island": "Lagos",
  Apapa: "Lagos",
  Ikeja: "Lagos",
  Isolo: "Lagos",
  Lekki: "Lagos",
  Ibadan: "Oyo",
  "V/Island": "Lagos",
  "Ikorodu": "Lagos",
  "Badagry": "Lagos",
  "Apapa": "Lagos",
  "Port Harcourt": "Rivers",
  Rumuokuta: "Rivers",
  Benin: "Edo",
  Abeokuta: "Ogun",
  Enugu: "Enugu",
  Kaduna: "Kaduna",
  Kano: "Kano",
  Lafia: "Nasarawa",
  Warri: "Delta",
  Aba: "Abia",
  Abakaliki: "Ebonyi",
  Akure: "Ondo",
  Awka: "Anambra",
  Bauchi: "Bauchi",
  Calabar: "Cross River",
  Gombe: "Gombe",
  Gusau: "Zamfara",
  Ilorin: "Kwara",
  Jos: "Plateau",
  Katsina: "Katsina",
  Lokoja: "Kogi",
  Maiduguri: "Borno",
  Makurdi: "Benue",
  Minna: "Niger",
  Owerri: "Imo",
  Sokoto: "Sokoto",
  Uyo: "Akwa Ibom",
  Yenagoa: "Bayelsa",
  Yola: "Adamawa",
  "MSTC Abuja": "FCT",
  "Staff School": "FCT",
  "Centre for Excellence": "FCT",
  "ISTC Ikeja": "Lagos",
  "ISTC Kano": "Kano",
  "ISTC Lokoja": "Kogi",
};

function canonicalStateName(state: string) {
  const normalized = state.trim();
  return MAP_CANONICAL_STATE[normalized as keyof typeof MAP_CANONICAL_STATE] ?? normalized;
}


const STREAMS: StreamKey[] = ["Training Contribution", "Course Fee", "Other Income"];

function getStateFromOffice(office: string): string | undefined {
  const normalized = office.trim();
  return OFFICE_TO_STATE[normalized] || undefined;
}

function getBand(actual: number, target: number): Band {
  if (target <= 0) return "none";
  const pct = (actual / target) * 100;
  if (pct >= 125) return "excellent";
  if (pct >= 100) return "good";
  if (pct >= 85) return "warn";
  if (pct >= 70) return "caution";
  return "bad";
}

function getFill(band: Band) {
  switch (band) {
    case "excellent":
      return "#064e3b"; // darker emerald
    case "good":
      return "#087f5b"; // strong green
    case "warn":
      return "#b45309"; // darker amber
    case "caution":
      return "#c2410c"; // darker orange
    case "bad":
      return "#7f1d1d"; // darker red
    case "low":
      return "#cbd5e1"; // muted light gray
    default:
      return "#9ca3af"; // neutral slate
  }
}

function getBandByActual(actual: number, thresholds: { q25: number; q50: number; q75: number }) {
  if (!actual || actual <= 0) return "none" as Band;
  if (actual >= thresholds.q75) return "excellent" as Band;
  if (actual >= thresholds.q50) return "good" as Band;
  if (actual >= thresholds.q25) return "warn" as Band;
  return "low" as Band;
}

function getLabelPosition(path: string) {
  const match = path.match(/^m\s*([0-9.\-]+),([0-9.\-]+)/i);
  if (!match) return { x: 0, y: 0 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

export function NigeriaRevenueMap({ rows }: { rows: RevenueRow[] }) {
  const [hoverState, setHoverState] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const stateData = useMemo(() => {
    const data = new Map<string, StateRevenue>();
    const seenOffice = new Map<string, Set<string>>();

    for (const row of rows) {
      const mode = inferRevenueMode(row);
      if (mode === "training-centre") continue;

      const office = String(row.office ?? "").trim();
      if (!office) continue;
      const state = getStateFromOffice(office);
      if (!state) continue;

      const actual = Number(row.actual ?? 0);
      const target = Number(row.target ?? 0);
      const stream = String(row.stream ?? "");

      if (!data.has(state)) {
        data.set(state, {
          state,
          actual: 0,
          target: 0,
          streams: {
            "Training Contribution": 0,
            "Course Fee": 0,
            "Other Income": 0,
          },
          officeCount: 0,
        });
      }

      const current = data.get(state)!;
      current.actual += actual;
      current.target += target;
      if (STREAMS.includes(stream as StreamKey)) {
        current.streams[stream as StreamKey] += actual;
      }

      if (!seenOffice.has(state)) seenOffice.set(state, new Set());
      seenOffice.get(state)!.add(office);
    }

    for (const [state, offices] of seenOffice.entries()) {
      const current = data.get(state);
      if (current) current.officeCount = offices.size;
    }

    return data;
  }, [rows]);

  const maxActual = useMemo(() => {
    const values = Array.from(stateData.values()).map((data) => data.actual);
    return values.length ? Math.max(...values) : 0;
  }, [stateData]);

  const thresholds = useMemo(() => {
    const vals = Array.from(stateData.values()).map((d) => d.actual).filter((v) => v > 0).sort((a, b) => a - b);
    const n = vals.length;
    if (!n) return { q25: 0, q50: 0, q75: 0 };
    const idx = (p: number) => Math.max(0, Math.min(n - 1, Math.floor(p * (n - 1))));
    return { q25: vals[idx(0.25)], q50: vals[idx(0.5)], q75: vals[idx(0.75)] };
  }, [stateData]);

  const topState = useMemo(() => {
    let best: string | null = null;
    let bestVal = 0;
    for (const [state, data] of stateData.entries()) {
      if (data.actual > bestVal) {
        bestVal = data.actual;
        best = state;
      }
    }
    return { state: best, actual: bestVal };
  }, [stateData]);

  const topBand = topState.state ? (stateData.get(topState.state) ? getBandByActual(stateData.get(topState.state)!.actual, thresholds) : "none") : "none";

  const stateRows = useMemo(() => {
    return NIGERIA_MAP.locations
      .map((location) => {
        const state = canonicalStateName(location.name);
        const data = stateData.get(state);
        const actual = data?.actual ?? 0;
        const target = data?.target ?? 0;
        const percent = target > 0 ? Math.round((actual / target) * 100) : null;

        return {
          id: location.id,
          state,
          band: data ? getBandByActual(actual, thresholds) : "none",
          actual,
          target,
          percent,
          officeCount: data?.officeCount ?? 0,
        };
      })
      .sort((a, b) => a.state.localeCompare(b.state));
  }, [stateData, thresholds]);

  const hovered = hoverState ? stateData.get(hoverState) : undefined;

  const handlePointerMove = (state: string, event: ReactMouseEvent<SVGGElement>) => {
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    setHoverState(state);
    setHoverInfo({
      state,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handlePointerLeave = () => {
    setHoverState(null);
    setHoverInfo(null);
  };

  return (
    <div className="relative rounded-lg border border-itf-rule bg-white p-5 shadow-sm">
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-itf-rule bg-[#d1fae5] px-3 py-2 text-sm font-semibold text-[#065f46]">Top — highest revenue</div>
          <div className="rounded-lg border border-itf-rule bg-[#dcfce7] px-3 py-2 text-sm font-semibold text-[#166534]">High — upper quartile</div>
          <div className="rounded-lg border border-itf-rule bg-[#fef9c3] px-3 py-2 text-sm font-semibold text-[#854d0e]">Medium — mid quartiles</div>
          <div className="rounded-lg border border-itf-rule bg-[#f8fafc] px-3 py-2 text-sm font-semibold text-slate-700">Low — lower quartile</div>
          <div className="rounded-lg border border-itf-rule bg-slate-100 px-3 py-2 text-sm text-slate-700">No recorded revenue</div>
        </div>

      <div ref={mapContainerRef} className="relative flex flex-wrap items-start gap-4">
        <div className="overflow-hidden rounded-lg border border-itf-rule bg-slate-50 p-3 flex-1 min-w-0" style={{ minHeight: 520 }}>
          <svg viewBox={NIGERIA_MAP.viewBox} width="100%" height="100%" className="block" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="text-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.6" />
              </filter>
              <pattern id="no-data-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="100%" height="100%" fill="#f3f4f6" />
                <path d="M0 0 L0 6" stroke="#cbd5e1" strokeWidth="1" />
              </pattern>
            </defs>
            {NIGERIA_MAP.locations.map((location) => {
              const state = canonicalStateName(location.name);
              const data = stateData.get(state);
              let band: Band = "none";
              if (data) {
                // If there are offices but revenue is zero, show as 'low' rather than 'none'
                if ((data.officeCount ?? 0) > 0 && data.actual === 0) {
                  band = "low";
                } else {
                  band = getBandByActual(data.actual, thresholds);
                }
              } else {
                band = "none";
              }
              const fill = band === "none" ? "url(#no-data-hatch)" : getFill(band);
              const labelPos = getLabelPosition(location.path);
              const opacity = data && maxActual > 0 ? 0.45 + 0.55 * Math.min(data.actual / maxActual, 1) : 0.25;

              const isTop = topState.state === state;

              return (
                <g
                  key={location.id}
                  onMouseEnter={(event) => handlePointerMove(state, event)}
                  onMouseMove={(event) => handlePointerMove(state, event)}
                  onMouseLeave={handlePointerLeave}
                  className="cursor-pointer"
                >
                  <path
                    d={location.path}
                    fill={fill}
                    fillOpacity={data ? opacity : 0.2}
                    stroke="#334155"
                    strokeWidth={data ? 1.2 : 0.9}
                    pointerEvents="visiblePainted"
                    className={`${isTop ? 'opacity-100' : ''} transition-all`}
                  >
                    <title>{location.name}</title>
                  </path>
                  {isTop ? (
                    <>
                      <path
                        d={location.path}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        strokeOpacity={0.95}
                        className="pointer-events-none"
                      />
                      <circle cx={labelPos.x} cy={labelPos.y - 10} r={7} fill="#f59e0b" stroke="#fff" strokeWidth={1.25} />
                    </>
                  ) : null}
                  {hoverState === state ? (
                    <path
                      d={location.path}
                      fill="none"
                      stroke="#0b1220"
                      strokeWidth={3}
                      strokeOpacity={0.85}
                      className="pointer-events-none"
                    />
                  ) : null}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fontSize={18}
                    fontWeight={800}
                    fill="#ffffff"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    pointerEvents="none"
                    stroke="#0f172a"
                    strokeWidth={2}
                    paintOrder="stroke"
                    filter="url(#text-shadow)"
                  >
                    <tspan x={labelPos.x} dy="0">
                      {location.name}
                    </tspan>
                    {data?.target ? (
                      <tspan x={labelPos.x} dy="1.4em" fontSize={11} fontWeight={700} fill="#f8fafc">
                        {Math.round((data.actual / data.target) * 100)}%
                      </tspan>
                    ) : null}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {hoverInfo && hovered ? (
          <div
            className="pointer-events-none absolute z-20 w-56 rounded-xl border border-itf-rule bg-white/95 p-3 shadow-xl backdrop-blur-sm"
            style={{
              left: Math.min(Math.max(hoverInfo.x + 18, 18), 320),
              top: Math.min(Math.max(hoverInfo.y - 12, 18), 480),
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-itf-green font-semibold mb-2">State detail</div>
            <div className="text-base font-semibold text-itf-green">{hovered.state}</div>
            <div className="mt-2 text-2xl font-bold text-itf-ink">{fmtNaira(hovered.actual)}</div>
            <div className="text-xs text-itf-ink/60">Target: {fmtNaira(hovered.target)}</div>
            <div className="mt-2 text-xs text-itf-ink/60">Offices: {hovered.officeCount}</div>
            <div className="mt-3 rounded-lg border border-itf-rule bg-slate-50 p-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Stream breakdown</div>
              {STREAMS.map((stream) => (
                <div key={stream} className="flex items-center justify-between text-xs mb-1 last:mb-0">
                  <span>{stream}</span>
                  <span className="font-semibold">{fmtNaira(hovered.streams[stream])}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid min-w-[240px] max-w-[320px] gap-4 flex-none">
          <div className="rounded-lg border border-itf-rule bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-itf-ink font-semibold mb-3">Top generator</div>
            {topState.state ? (
              <div className="text-sm">
                <div className="text-lg font-bold text-[#065f46]">{topState.state}</div>
                <div className="text-2xl font-extrabold text-slate-800">{fmtNaira(topState.actual)}</div>
                <div className="text-[11px] text-slate-500">Ranked band: {topBand}</div>
                {stateData.get(topState.state) ? (
                  <div className="text-[11px] text-slate-500">
                    {stateData.get(topState.state)!.target > 0
                      ? `${Math.round((stateData.get(topState.state)!.actual / stateData.get(topState.state)!.target) * 100)}% of target`
                      : "No target set"}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No revenue data</div>
            )}
          </div>
          <div className="rounded-lg border border-itf-rule bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-itf-green font-semibold mb-3">Map legend</div>
              <div className="space-y-3 text-sm">
              {topState.state ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded border border-slate-300" style={{ background: getFill(topBand) }} />
                  <span className="font-semibold">Top: {topState.state} — {fmtNaira(topState.actual)}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: 'url(#no-data-hatch)' }} />
                <span>No reported revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: '#7f1d1d' }} />
                <span>Lowest revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: '#c2410c' }} />
                <span>Lower quartile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: '#b45309' }} />
                <span>Mid quartiles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: '#087f5b' }} />
                <span>Upper quartile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: '#064e3b' }} />
                <span>Top (highest revenue)</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-itf-rule bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-itf-ink font-semibold mb-3">All states</div>
            <div className="max-h-48 overflow-auto text-sm">
              <ul className="space-y-1">
                {stateRows.map((stateRow) => (
                  <li key={stateRow.id} className="flex items-center justify-between gap-3 rounded px-2 py-1 hover:bg-slate-50">
                    <div>
                      <button
                        type="button"
                        className="text-left text-sm font-semibold text-slate-800 hover:text-itf-green"
                        onMouseEnter={() => setHoverState(stateRow.state)}
                        onMouseLeave={() => setHoverState(null)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {stateRow.state}
                          {stateRow.state === topState.state ? (
                            <span className="text-yellow-500 ml-1" aria-hidden>
                              ★
                            </span>
                          ) : null}
                        </span>
                      </button>
                      <div className="text-[11px] text-slate-500">
                        {stateRow.target > 0
                          ? `${stateRow.percent}% of target • ${fmtNaira(stateRow.actual)}`
                          : "No revenue data"}
                      </div>
                    </div>
                    <span
                      className="inline-flex h-3 w-3 rounded-full border border-slate-300"
                      style={{ background: getFill(stateRow.band) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
