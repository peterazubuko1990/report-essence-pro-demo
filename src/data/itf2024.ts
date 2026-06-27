// All datasets extracted from "2024 END OF YEAR" Corporate Scorecard PPTX.
// Source: Industrial Training Fund (ITF) – Corporate Planning Department.
// Numbers are reproduced verbatim from the original report.

export type YearPair<T = number> = { y2023: T; y2024: T };

export interface KraRow {
  kra: string;
  subgroup?: string;
  kpi: string;
  target23: number;
  actual23: number;
  pct23: number;
  target24: number;
  actual24: number;
  pct24: number;
}

// KRA 1 – Promoting Training Consciousness
export const kra1: KraRow[] = [
  { kra: "KRA 1", kpi: "Organizations Engaged in Training", target23: 19800, actual23: 10150, pct23: 51.26, target24: 19800, actual24: 9667, pct24: 48.82 },
  { kra: "KRA 1", kpi: "Requests for Tailor-made Programmes", target23: 467, actual23: 496, pct23: 106.21, target24: 467, actual24: 493, pct24: 105.57 },
  { kra: "KRA 1", kpi: "Training Claims Received & Processed", target23: 19800, actual23: 652, pct23: 3.29, target24: 19800, actual24: 321, pct24: 1.62 },
  { kra: "KRA 1", kpi: "Employers' Training Programmes Approved", target23: 39600, actual23: 4055, pct23: 10.24, target24: 39600, actual24: 9314, pct24: 23.52 },
  { kra: "KRA 1", kpi: "Employers' Training Programmes Monitored", target23: 1217, actual23: 2085, pct23: 171.32, target24: 1217, actual24: 3781, pct24: 310.69 },
];

// KRA 2 – Encouraging / Providing Training (multiple subgroups)
export const kra2: KraRow[] = [
  // 2.1 TNA
  { kra: "KRA 2", subgroup: "Training Needs Assessment (TNA)", kpi: "Surveys conducted", target23: 149, actual23: 140, pct23: 93.96, target24: 149, actual24: 132, pct24: 88.60 },
  { kra: "KRA 2", subgroup: "Training Needs Assessment (TNA)", kpi: "Packages Developed", target23: 149, actual23: 69, pct23: 46.30, target24: 149, actual24: 75, pct24: 50.34 },
  { kra: "KRA 2", subgroup: "Training Needs Assessment (TNA)", kpi: "Interventions Implemented", target23: 109, actual23: 60, pct23: 55.05, target24: 109, actual24: 67, pct24: 61.47 },
  // 2.2 New Programmes
  { kra: "KRA 2", subgroup: "New Programmes Developed", kpi: "New Programmes Proposed", target23: 69, actual23: 46, pct23: 66.67, target24: 69, actual24: 30, pct24: 43.48 },
  { kra: "KRA 2", subgroup: "New Programmes Developed", kpi: "Packages Developed", target23: 69, actual23: 23, pct23: 33.33, target24: 69, actual24: 27, pct24: 39.13 },
  { kra: "KRA 2", subgroup: "New Programmes Developed", kpi: "Programmes Test-Run", target23: 69, actual23: 17, pct23: 24.64, target24: 69, actual24: 19, pct24: 27.54 },
  // 2.3 MSME
  { kra: "KRA 2", subgroup: "In-depth Diagnostic Study of MSMEs", kpi: "Surveys conducted", target23: 99, actual23: 96, pct23: 96.97, target24: 99, actual24: 97, pct24: 97.98 },
  { kra: "KRA 2", subgroup: "In-depth Diagnostic Study of MSMEs", kpi: "Packages Developed", target23: 99, actual23: 53, pct23: 53.54, target24: 99, actual24: 48, pct24: 48.48 },
  { kra: "KRA 2", subgroup: "In-depth Diagnostic Study of MSMEs", kpi: "Interventions Implemented", target23: 99, actual23: 52, pct23: 52.53, target24: 99, actual24: 51, pct24: 51.52 },
  // 2.4 In-Company Safety
  { kra: "KRA 2", subgroup: "In-Company Safety", kpi: "Surveys conducted", target23: 59, actual23: 58, pct23: 98.31, target24: 59, actual24: 71, pct24: 120.34 },
  { kra: "KRA 2", subgroup: "In-Company Safety", kpi: "Packages Developed", target23: 59, actual23: 32, pct23: 54.24, target24: 59, actual24: 46, pct24: 77.97 },
  { kra: "KRA 2", subgroup: "In-Company Safety", kpi: "Interventions Implemented", target23: 59, actual23: 22, pct23: 37.29, target24: 59, actual24: 38, pct24: 64.41 },
  // 2.5 Resource Consultancy
  { kra: "KRA 2", subgroup: "Resource Consultancy", kpi: "Surveys conducted", target23: 149, actual23: 73, pct23: 48.99, target24: 149, actual24: 69, pct24: 46.31 },
  { kra: "KRA 2", subgroup: "Resource Consultancy", kpi: "Packages Developed", target23: 69, actual23: 38, pct23: 55.07, target24: 69, actual24: 40, pct24: 57.97 },
  { kra: "KRA 2", subgroup: "Resource Consultancy", kpi: "Interventions Implemented", target23: 69, actual23: 39, pct23: 56.52, target24: 69, actual24: 37, pct24: 53.62 },
  { kra: "KRA 2", subgroup: "Resource Consultancy", kpi: "Evaluation and Termination", target23: 69, actual23: 23, pct23: 33.33, target24: 69, actual24: 24, pct24: 34.78 },
  // 2.6 PPIT
  { kra: "KRA 2", subgroup: "PPIT", kpi: "PPIT Surveys conducted", target23: 59, actual23: 46, pct23: 77.97, target24: 59, actual24: 61, pct24: 103.39 },
  { kra: "KRA 2", subgroup: "PPIT", kpi: "Packages Developed", target23: 59, actual23: 34, pct23: 57.63, target24: 59, actual24: 34, pct24: 57.63 },
  { kra: "KRA 2", subgroup: "PPIT", kpi: "Interventions Implemented", target23: 59, actual23: 23, pct23: 38.98, target24: 59, actual24: 28, pct24: 47.46 },
  { kra: "KRA 2", subgroup: "PPIT", kpi: "Follow-Up", target23: 59, actual23: 8, pct23: 13.56, target24: 59, actual24: 16, pct24: 27.12 },
];

// KRA 6 – Special Interventions / Training Programmes (participants count)
export interface TrainingProgramme {
  programme: string;
  p2023: number | null;
  p2024: number | null;
}
export const trainingProgrammes: TrainingProgramme[] = [
  { programme: "Agric Skills Empowerment Programme (AgSEP)", p2023: 580, p2024: null },
  { programme: "N-Power (N-Build)", p2023: 19200, p2024: null },
  { programme: "Modular Skills Development Programme", p2023: 976, p2024: null },
  { programme: "Summer Boot Camp", p2023: 195, p2024: null },
  { programme: "Special Skills Intervention Programme (SSIP)", p2023: 1301, p2024: 1495 },
  { programme: "ITF-National Economy Recovery Growth Programme", p2023: null, p2024: 4000 },
];
export const trainingTotals = { p2023: 21672, p2024: 39032 };

// KRA 7 – Administrative & HR Support
export const adminSupport = [
  { item: "Staff Strength (Senior)", y2023: 2535, y2024: 2671 },
  { item: "Staff Strength (Junior)", y2023: 133, y2024: 107 },
  { item: "Staff Recruitment (Junior & Senior)", y2023: 0, y2024: 196 },
  { item: "Staff Promotion", y2023: 799, y2024: 750 },
  { item: "Statutory Retirement", y2023: 50, y2024: 56 },
  { item: "Termination/Dismissal", y2023: 2, y2024: 1 },
  { item: "Resignation", y2023: 30, y2024: 14 },
  { item: "Death", y2023: 8, y2024: 11 },
  { item: "Capacity Building – Short Term", y2023: 1394, y2024: 1056 },
  { item: "Capacity Building – Long Term", y2023: 117, y2024: 142 },
  { item: "Capacity Building – International", y2023: 31, y2024: 9 },
  { item: "Capacity Building – Professional Bodies", y2023: 58, y2024: 100 },
  { item: "Housing Loan (Staff Welfare)", y2023: 25, y2024: 0 },
  { item: "Motor Vehicle Loan (Staff Welfare)", y2023: 74, y2024: 0 },
];

// KRA 8 – Revenue Generation Activities
export const revenueActivity: KraRow[] = [
  { kra: "KRA 8", kpi: "Employers Registered to Date", target23: 73158, actual23: 100422, pct23: 137.27, target24: 73158, actual24: 114391, pct24: 156.36 },
  { kra: "KRA 8", kpi: "Employers Contributing", target23: 93185, actual23: 39600, pct23: 42.50, target24: 93185, actual24: 58563, pct24: 62.84 },
  { kra: "KRA 8", kpi: "Employers Defaulting", target23: 0, actual23: 7614, pct23: 0, target24: 0, actual24: 7614, pct24: 0 },
  { kra: "KRA 8", kpi: "Employers Accounts Verified", target23: 19700, actual23: 1002, pct23: 5.09, target24: 19700, actual24: 654, pct24: 3.32 },
  { kra: "KRA 8", kpi: "Discovery of New Companies", target23: 2380, actual23: 9893, pct23: 415.67, target24: 2380, actual24: 10833, pct24: 455.17 },
  { kra: "KRA 8", kpi: "New Companies Registered", target23: 2380, actual23: 9893, pct23: 415.67, target24: 2380, actual24: 10833, pct24: 455.17 },
];

// Headline revenue lines (₦)
export const headlineRevenue = [
  { line: "Training Contribution", target23: 46_077_025_000, actual23: 58_042_432_002.87, pct23: 125.97, target24: 58_298_300_000, actual24: 64_531_248_612.64, pct24: 110.69 },
  { line: "Course Fee", target23: 1_312_600_000, actual23: 1_063_145_518.92, pct23: 81.00, target24: 2_139_600_000, actual24: 1_119_054_665.76, pct24: 52.30 },
  { line: "Other Income", target23: 213_620_000, actual23: 155_680_613.74, pct23: 72.88, target24: 856_120_000, actual24: 46_606_040.70, pct24: 5.44 },
];

// Area-office revenue per category (₦)
export interface AreaRow {
  office: string;
  category: "A" | "B" | "C";
  stream: "Training Contribution" | "Course Fee" | "Other Income";
  target23: number;
  actual23: number;
  target24: number;
  actual24: number;
}
const A_TC: [string, number, number, number, number][] = [
  ["Abuja", 6_900_000_000, 8_985_428_329.06, 9_000_000_000, 9_569_441_953.79],
  ["Apapa", 2_500_000_000, 3_013_297_375.65, 3_100_000_000, 3_192_176_033.96],
  ["Benin", 1_000_000_000, 1_259_840_226.65, 1_050_000_000, 936_904_753.70],
  ["Ikeja", 3_300_000_000, 4_068_653_963.82, 3_900_000_000, 4_762_389_958.01],
  ["Isolo", 1_400_000_000, 1_729_622_269.50, 1_850_000_000, 2_060_340_866.19],
  ["Lagos Island", 6_800_000_000, 8_191_123_532.50, 8_500_000_000, 9_441_068_833.99],
  ["Lekki", 3_300_000_000, 3_747_893_816.85, 3_600_000_000, 5_119_259_519.64],
  ["Port Harcourt", 5_500_000_000, 6_823_357_472.18, 7_100_000_000, 6_681_115_433.02],
  ["Rumuokuta", 1_700_000_000, 1_432_147_273.19, 1_800_000_000, 1_932_079_532.36],
  ["V/Island", 9_000_000_000, 12_153_351_728.94, 12_000_000_000, 13_608_457_884.68],
];
const A_CF: [string, number, number, number, number][] = [
  ["Abuja",51_000_000,122_821_290.70,81_000_000,47_880_929.50],
  ["Apapa",51_000_000,76_259_000,81_000_000,54_476_000],
  ["Benin",41_000_000,27_550_000,71_000_000,44_581_000],
  ["Ikeja",55_000_000,68_164_422.60,65_000_000,70_825_000],
  ["Isolo",32_500_000,38_750_000,62_500_000,39_245_522.50],
  ["Lagos Island",51_000_000,59_557_478.56,61_000_000,106_050_000],
  ["Lekki",45_000_000,13_535_000,75_000_000,33_655_000],
  ["Port Harcourt",51_000_000,19_310_161.25,61_000_000,43_795_000],
  ["Rumuokuta",21_000_000,6_875_000,51_000_000,16_340_000],
  ["V/Island",50_000_000,75_580_534.88,80_000_000,80_347_765],
];
const A_OI: [string, number, number, number, number][] = [
  ["Abuja",1_000_000,240_000,100_000_000,580_000],
  ["Apapa",300_000,1_228_000,20_300_000,237_500],
  ["Benin",250_000,777_600,20_250_000,45_000],
  ["Ikeja",1_000_000,7_818_965.62,100_000_000,3_845_335],
  ["Isolo",200_000,384_000,20_200_000,69_000],
  ["Lagos Island",75_000_000,57_517_000,100_000_000,7_168_927.36],
  ["Lekki",400_000,511_000,20_400_000,22_000],
  ["Port Harcourt",150_000,234_460,20_150_000,46_000],
  ["Rumuokuta",100_000,170_000,20_100_000,165_000],
  ["V/Island",400_000,1_619_000,20_400_000,88_000],
];
const B_TC: [string, number, number, number, number][] = [
  ["Abeokuta",475_000_000,760_199_807.09,700_000_000,1_032_960_460.58],
  ["Badagry",150_000_000,158_300_658.52,150_000_000,165_629_039.40],
  ["Enugu",100_000_000,179_764_187.88,150_000_000,148_148_767.31],
  ["Gwagwalada",300_000_000,654_231_463.13,600_000_000,439_219_152.09],
  ["Ibadan",500_000_000,697_657_960.94,660_000_000,865_459_676.19],
  ["Kaduna",450_000_000,622_470_250.59,650_000_000,499_315_994.33],
  ["Kano",320_000_000,485_636_266.64,450_000_000,414_641_028.05],
  ["Lafia",380_000_000,552_950_948.44,640_000_000,638_544_478.40],
  ["Warri",500_000_000,446_863_639.73,600_000_000,546_583_304.99],
];
const B_CF: [string, number, number, number, number][] = [
  ["Abeokuta",17_500_000,22_443_536.25,37_500_000,63_256_279.02],
  ["Badagry",41_000_000,3_310_361.25,51_000_000,3_465_000],
  ["Enugu",22_500_000,3_155_000,32_500_000,3_550_000],
  ["Gwagwalada",22_500_000,30_659_400,42_500_000,25_526_510],
  ["Ibadan",30_000_000,17_408_000,50_000_000,31_340_465.12],
  ["Kaduna",22_500_000,28_392_322.50,22_500_000,26_029_987.50],
  ["Kano",15_000_000,15_449_000,35_000_000,20_115_000],
  ["Lafia",12_500_000,60_904_100,32_500_000,38_440_000],
  ["Warri",12_500_000,7_110_000,42_500_000,14_562_906.98],
];
const C_TC: [string, number, number, number, number][] = [
  ["Aba",37_000_000,42_568_370.71,40_000_000,52_085_680.88],
  ["Abakaliki",17_512_500,23_626_326.63,20_500_000,25_235_976.40],
  ["Akure",50_000_000,59_777_006.61,50_000_000,101_249_554.93],
  ["Awka",70_000_000,91_256_289.01,70_000_000,81_066_759.65],
  ["Bauchi",50_000_000,90_550_578.14,80_000_000,175_317_432.86],
  ["Calabar",70_000_000,91_689_490.61,100_000_000,100_251_915.79],
  ["Gombe",70_000_000,90_185_539.25,80_000_000,194_528_901.84],
  ["Gusau",10_512_500,11_356_980.42,12_800_000,16_624_562.10],
  ["Ilorin",68_000_000,71_982_730.93,70_000_000,101_731_862.25],
  ["Ikorodu",200_000_000,221_242_653.06,250_000_000,240_614_719.50],
  ["Jos",150_000_000,182_726_626.51,160_000_000,177_910_863.74],
  ["Katsina",27_000_000,32_604_561.55,30_000_000,36_622_660.51],
  ["Lokoja",200_000_000,272_895_653.62,250_000_000,385_297_966.14],
  ["Maiduguri",30_000_000,31_117_169.50,30_000_000,43_363_244.71],
  ["Makurdi",50_000_000,77_200_365.40,60_000_000,106_210_535.88],
  ["Minna",80_000_000,83_660_697.55,70_000_000,102_000_629.84],
  ["Owerri",42_000_000,71_204_827.90,50_000_000,118_735_488.34],
  ["Sokoto",55_000_000,85_745_638.86,75_000_000,118_548_189.24],
  ["Uyo",85_000_000,210_174_814.30,120_000_000,96_028_295.76],
  ["Yenagoa",30_000_000,89_588_348.09,60_000_000,44_521_687.15],
  ["Yola",110_000_000,148_486_162.92,120_000_000,159_565_014.46],
];

function build(rows: [string, number, number, number, number][], category: "A"|"B"|"C", stream: AreaRow["stream"]): AreaRow[] {
  return rows.map(([office, t23, a23, t24, a24]) => ({ office, category, stream, target23:t23, actual23:a23, target24:t24, actual24:a24 }));
}

export const areaRevenue: AreaRow[] = [
  ...build(A_TC, "A", "Training Contribution"),
  ...build(A_CF, "A", "Course Fee"),
  ...build(A_OI, "A", "Other Income"),
  ...build(B_TC, "B", "Training Contribution"),
  ...build(B_CF, "B", "Course Fee"),
  ...build(C_TC, "C", "Training Contribution"),
];

// Training centres
export const trainingCentres = [
  { centre: "Centre for Excellence", cfTarget23: 35_000_000, cfActual23: 8_965_000, cfTarget24: 85_000_000, cfActual24: 0, oiTarget23: 15_000_000, oiActual23: 2_714_400, oiTarget24: 25_000_000, oiActual24: 1_385_000 },
  { centre: "ISTC Ikeja", cfTarget23: 46_000_000, cfActual23: 30_610_290.70, cfTarget24: 106_000_000, cfActual24: 45_196_000, oiTarget23: 2_000_000, oiActual23: 2_089_961.46, oiTarget24: 50_000_000, oiActual24: 1_979_322.99 },
  { centre: "ISTC Kano", cfTarget23: 35_000_000, cfActual23: 7_948_620, cfTarget24: 85_000_000, cfActual24: 10_650_000, oiTarget23: 4_000_000, oiActual23: 1_226_000, oiTarget24: 50_000_000, oiActual24: 2_211_000 },
  { centre: "ISTC Lokoja", cfTarget23: 16_000_000, cfActual23: 8_037_500, cfTarget24: 56_000_000, cfActual24: 8_035_000, oiTarget23: 2_500_000, oiActual23: 1_017_800, oiTarget24: 50_000_000, oiActual24: 520_000 },
  { centre: "MSTC Abuja", cfTarget23: 181_100_000, cfActual23: 79_180_813.95, cfTarget24: 248_100_000, cfActual24: 28_300_000, oiTarget23: 5_000_000, oiActual23: 2_601_038.75, oiTarget24: 50_000_000, oiActual24: 722_000 },
  { centre: "Staff School", cfTarget23: 0, cfActual23: 78_036_000, cfTarget24: 0, cfActual24: 80_570_900, oiTarget23: 2_000_000, oiActual23: 1_819_800, oiTarget24: 0, oiActual24: 1_383_800 },
];

// Staff School certificate exams
export const staffSchool = [
  { exam: "WASSCE",      students23: 89, students24: 72, pass23: 88, pass24: 72, pct23: 98, pct24: 100 },
  { exam: "NECO",        students23: 61, students24: 62, pass23: 56, pass24: 58, pct23: 91, pct24: 93 },
  { exam: "NECO BECE",   students23: 56, students24: 62, pass23: 50, pass24: 60, pct23: 89, pct24: 96 },
  { exam: "JUNIOR BECE", students23: 56, students24: 73, pass23: 50, pass24: 65, pct23: 89, pct24: 89 },
];

export const challenges = [
  "Inadequate office equipment and furniture.",
  "Few operational vehicles.",
  "Lack of a modern library and computer laboratory in ITF Staff School.",
  "Inadequate capacity building programmes for staff.",
  "Companies shutting down due to unconducive business environment.",
  "Inadequate budgetary provisions.",
];

export const wayForward = [
  "Procurement of additional project vehicles to enhance the Fund's operations.",
  "ITF should give premium to internal capacity building of staff.",
  "Upgrade school library and computer laboratory to enhance quality learning.",
  "Budgetary provisions should be in line with the work-plan.",
  "Provision of quality office equipment and furniture.",
  "Area Managers should innovate by collaborating with state government within their jurisdiction to enhance the Fund's activities.",
];

// Helpers
export const fmtNaira = (n: number) => {
  if (Math.abs(n) >= 1_000_000_000) return `₦${(n/1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n/1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
};
export const fmtNum = (n: number) => n.toLocaleString("en-NG");
export const growth = (curr: number, prev: number) => prev === 0 ? 0 : ((curr - prev) / prev) * 100;
export const achievement = (actual: number, target: number) => target === 0 ? 0 : (actual / target) * 100;

// Validation report – corrections applied to source values
export const validationNotes = [
  {
    page: "Slide 14, KRA 1, Row 3",
    issue: "Training Claims % Achieved shown as 0.02 for 2024 (321 / 19,800).",
    correction: "Recomputed as 1.62 % using Actual / Target × 100. Likely a typo in the source deck.",
  },
  {
    page: "Slide 47, Category A Training Contribution",
    issue: "Total % Achieved column sums individual percentages (1,200.93 and 1,100.12).",
    correction: "Replaced with weighted achievement Σ Actual / Σ Target × 100 → 124.17 % (2023), 110.41 % (2024).",
  },
  {
    page: "Slide 48 & 49, Category A Course Fee / Other Income totals",
    issue: "Totals shown as sum of percentages (1,069.35; 783.89; 2,653.77; 14.92).",
    correction: "Recomputed weighted achievement per stream (see Revenue page).",
  },
  {
    page: "Slide 62, Course Fee Training Centres 2024 Total",
    issue: "Total Actual shown as 1,727,519.00 — does not equal sum of line items (172,751,900).",
    correction: "Recomputed sum = ₦172,751,900. Original figure assumed to be a typographical error.",
  },
  {
    page: "Slide 63, Other Income Training Centres",
    issue: "MSTC Abuja 2024 value contains stray '-' character ('1.44-').",
    correction: "Treated as 1.44 % for the percentage column.",
  },
];
