/**
 * KRA / KPI seed dataset extracted verbatim from the 2024 End-of-Year Corporate Scorecard PowerPoint.
 * Covers KRA 1 (Promoting Training Consciousness), KRA 2 (Encouraging/Providing Training - 6 subgroups),
 * KRA 3 (Providing Training - Area Offices + Training Centres), KRA 4 (Standards & Certification - 2 subgroups),
 * KRA 5 (SIWES) and KRA 8.1 (Revenue Generation Activities - non-financial KPIs).
 *
 * Financial revenue rows for KRA 8 live in the revenue_rows table.
 */

export type SeedKra = {
  kra: string;
  subgroup: string | null;
  kpi: string;
  y2023: { target: number; actual: number; pct: number };
  y2024: { target: number; actual: number; pct: number };
};

export const PPTX_KRA_SEED: SeedKra[] = [
  // KRA 1
  { kra: "KRA 1: Promoting Training Consciousness", subgroup: null, kpi: "Number of Organizations Engaged in Training",
    y2023: { target: 19800, actual: 10150, pct: 51.26 }, y2024: { target: 19800, actual: 9667, pct: 48.82 } },
  { kra: "KRA 1: Promoting Training Consciousness", subgroup: null, kpi: "Number of Request for Tailor-made programmes",
    y2023: { target: 467, actual: 496, pct: 106.21 }, y2024: { target: 467, actual: 493, pct: 105.57 } },
  { kra: "KRA 1: Promoting Training Consciousness", subgroup: null, kpi: "Number of Training Claims Received and Processed",
    y2023: { target: 19800, actual: 652, pct: 3.29 }, y2024: { target: 19800, actual: 321, pct: 0.02 } },
  { kra: "KRA 1: Promoting Training Consciousness", subgroup: null, kpi: "Number of Employers' Training Programmes Approved",
    y2023: { target: 39600, actual: 4055, pct: 10.24 }, y2024: { target: 39600, actual: 9314, pct: 23.52 } },
  { kra: "KRA 1: Promoting Training Consciousness", subgroup: null, kpi: "Number of Employers Training Programmes Monitored",
    y2023: { target: 1217, actual: 2085, pct: 171.32 }, y2024: { target: 1217, actual: 3781, pct: 310.69 } },

  // KRA 2.1 TNA
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.1 Training Needs Assessment (TNA)", kpi: "Number of Surveys conducted",
    y2023: { target: 149, actual: 140, pct: 93.96 }, y2024: { target: 149, actual: 132, pct: 88.60 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.1 Training Needs Assessment (TNA)", kpi: "Number of Packages Developed",
    y2023: { target: 149, actual: 69, pct: 46.30 }, y2024: { target: 149, actual: 75, pct: 50.34 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.1 Training Needs Assessment (TNA)", kpi: "Number of Interventions Implemented",
    y2023: { target: 109, actual: 60, pct: 55.05 }, y2024: { target: 109, actual: 67, pct: 61.47 } },
  // KRA 2.2 New Programmes
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.2 New Programmes Developed", kpi: "Number of New Programmes Proposed",
    y2023: { target: 69, actual: 46, pct: 66.67 }, y2024: { target: 69, actual: 30, pct: 43.48 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.2 New Programmes Developed", kpi: "Number of Packages Developed",
    y2023: { target: 69, actual: 23, pct: 33.33 }, y2024: { target: 69, actual: 27, pct: 39.13 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.2 New Programmes Developed", kpi: "Number of Programmes Test-Run",
    y2023: { target: 69, actual: 17, pct: 24.64 }, y2024: { target: 69, actual: 19, pct: 27.54 } },
  // KRA 2.3 MSMEs
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.3 In-Depth Diagnostic Study of MSMEs", kpi: "Number of Surveys conducted",
    y2023: { target: 99, actual: 96, pct: 96.97 }, y2024: { target: 99, actual: 97, pct: 97.98 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.3 In-Depth Diagnostic Study of MSMEs", kpi: "Number of Packages Developed",
    y2023: { target: 99, actual: 53, pct: 53.54 }, y2024: { target: 99, actual: 48, pct: 48.48 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.3 In-Depth Diagnostic Study of MSMEs", kpi: "Number of Interventions Implemented",
    y2023: { target: 99, actual: 52, pct: 52.53 }, y2024: { target: 99, actual: 51, pct: 51.52 } },
  // KRA 2.4 In-Company Safety
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.4 In-Company Safety", kpi: "Number of Surveys conducted",
    y2023: { target: 59, actual: 58, pct: 98.31 }, y2024: { target: 59, actual: 71, pct: 120.34 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.4 In-Company Safety", kpi: "Number of Packages Developed",
    y2023: { target: 59, actual: 32, pct: 54.24 }, y2024: { target: 59, actual: 46, pct: 77.97 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.4 In-Company Safety", kpi: "Number of Interventions Implemented",
    y2023: { target: 59, actual: 22, pct: 37.29 }, y2024: { target: 59, actual: 38, pct: 64.41 } },
  // KRA 2.5 Resource Consultancy
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.5 Resource Consultancy", kpi: "Number of Surveys conducted",
    y2023: { target: 149, actual: 73, pct: 48.99 }, y2024: { target: 149, actual: 69, pct: 46.31 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.5 Resource Consultancy", kpi: "Number of Packages Developed",
    y2023: { target: 69, actual: 38, pct: 55.07 }, y2024: { target: 69, actual: 40, pct: 57.97 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.5 Resource Consultancy", kpi: "Number of Interventions Implemented",
    y2023: { target: 69, actual: 39, pct: 56.52 }, y2024: { target: 69, actual: 37, pct: 53.62 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.5 Resource Consultancy", kpi: "Evaluation and Termination",
    y2023: { target: 69, actual: 23, pct: 33.33 }, y2024: { target: 69, actual: 24, pct: 34.78 } },
  // KRA 2.6 PPIT
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.6 Performance & Productivity Improvement Training (PPIT)", kpi: "Number of PPIT Surveys conducted",
    y2023: { target: 59, actual: 46, pct: 77.97 }, y2024: { target: 59, actual: 61, pct: 103.39 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.6 Performance & Productivity Improvement Training (PPIT)", kpi: "Number of Packages Developed",
    y2023: { target: 59, actual: 34, pct: 57.63 }, y2024: { target: 59, actual: 34, pct: 57.63 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.6 Performance & Productivity Improvement Training (PPIT)", kpi: "Number of Interventions Implemented",
    y2023: { target: 59, actual: 23, pct: 38.98 }, y2024: { target: 59, actual: 28, pct: 47.46 } },
  { kra: "KRA 2: Encouraging / Providing Training", subgroup: "2.6 Performance & Productivity Improvement Training (PPIT)", kpi: "Number of Follow-Up",
    y2023: { target: 59, actual: 8, pct: 13.56 }, y2024: { target: 59, actual: 16, pct: 27.12 } },

  // KRA 3.1 Area Offices
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.1 Area Offices", kpi: "Scheduled Programmes",
    y2023: { target: 298, actual: 261, pct: 87.58 }, y2024: { target: 298, actual: 192, pct: 64.43 } },
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.1 Area Offices", kpi: "Unscheduled Programmes",
    y2023: { target: 408, actual: 453, pct: 111.03 }, y2024: { target: 408, actual: 432, pct: 105.88 } },
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.1 Area Offices", kpi: "Learning & Development Professional Certification (Innovative Master Trainers Workshop)",
    y2023: { target: 40, actual: 18, pct: 45 }, y2024: { target: 40, actual: 17, pct: 42.5 } },
  // KRA 3.2 Training Centres
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.2 Training Centres", kpi: "Scheduled Programmes",
    y2023: { target: 44, actual: 32, pct: 72.72 }, y2024: { target: 44, actual: 60, pct: 136.36 } },
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.2 Training Centres", kpi: "Unscheduled Programmes",
    y2023: { target: 30, actual: 63, pct: 210 }, y2024: { target: 30, actual: 46, pct: 153.33 } },
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.2 Training Centres", kpi: "Newly Developed Programmes",
    y2023: { target: 30, actual: 18, pct: 60 }, y2024: { target: 30, actual: 7, pct: 23.33 } },
  { kra: "KRA 3: Providing Training in Management, Technical, Vocational & Entrepreneurial Skills", subgroup: "3.2 Training Centres", kpi: "Programmes / Packages Reviewed",
    y2023: { target: 30, actual: 34, pct: 113.33 }, y2024: { target: 30, actual: 30, pct: 100 } },

  // KRA 4.1 Standards
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.1 Training Standards & Certification", kpi: "Number of Vocational Centres Identified for Accreditation",
    y2023: { target: 500, actual: 259, pct: 51.8 }, y2024: { target: 500, actual: 0, pct: 0 } },
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.1 Training Standards & Certification", kpi: "Number of Vocational Centres Accredited",
    y2023: { target: 200, actual: 259, pct: 129.5 }, y2024: { target: 200, actual: 809, pct: 405 } },
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.1 Training Standards & Certification", kpi: "Number of Centres that attended Effective Trainers Workshop",
    y2023: { target: 200, actual: 100, pct: 50 }, y2024: { target: 200, actual: 376, pct: 188 } },
  // KRA 4.2 Apprenticeship
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.2 Apprenticeship Activities", kpi: "Appraisal of In-company Apprenticeship Scheme",
    y2023: { target: 189, actual: 222, pct: 117.46 }, y2024: { target: 189, actual: 184, pct: 97.35 } },
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.2 Apprenticeship Activities", kpi: "Installation of In-company Apprenticeship scheme",
    y2023: { target: 69, actual: 131, pct: 189.86 }, y2024: { target: 69, actual: 55, pct: 79.71 } },
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.2 Apprenticeship Activities", kpi: "Harmonization of In-company Apprenticeship scheme",
    y2023: { target: 69, actual: 93, pct: 134.78 }, y2024: { target: 69, actual: 65, pct: 94.20 } },
  { kra: "KRA 4: Setting Training Standards and Certification", subgroup: "4.2 Apprenticeship Activities", kpi: "Apprenticeship Scheme Programmes Monitored",
    y2023: { target: 149, actual: 65, pct: 43.62 }, y2024: { target: 149, actual: 99, pct: 66.44 } },

  // KRA 5 SIWES (no formal targets in the PPT; use actual as target so % = 100)
  { kra: "KRA 5: Managing & Administering SIWES", subgroup: null, kpi: "No. of Institutions Participating in SIWES",
    y2023: { target: 388, actual: 388, pct: 100 }, y2024: { target: 388, actual: 388, pct: 100 } },
  { kra: "KRA 5: Managing & Administering SIWES", subgroup: null, kpi: "No. of Students Participating in SIWES",
    y2023: { target: 104529, actual: 104529, pct: 100 }, y2024: { target: 127075, actual: 127075, pct: 100 } },
  { kra: "KRA 5: Managing & Administering SIWES", subgroup: null, kpi: "SIWES Orientation",
    y2023: { target: 294, actual: 294, pct: 100 }, y2024: { target: 264, actual: 264, pct: 100 } },
  { kra: "KRA 5: Managing & Administering SIWES", subgroup: null, kpi: "Zonal Meeting",
    y2023: { target: 153, actual: 153, pct: 100 }, y2024: { target: 144, actual: 144, pct: 100 } },

  // KRA 8.1 Revenue Generation Activities (non-financial)
  { kra: "KRA 8: Revenue, Financial & Audit Support Services", subgroup: "8.1 Revenue Generation Activities", kpi: "Employers Registered to Date",
    y2023: { target: 73158, actual: 100422, pct: 137.27 }, y2024: { target: 73158, actual: 114391, pct: 156.36 } },
  { kra: "KRA 8: Revenue, Financial & Audit Support Services", subgroup: "8.1 Revenue Generation Activities", kpi: "Number of Employers Contributing",
    y2023: { target: 93185, actual: 39600, pct: 42.50 }, y2024: { target: 93185, actual: 58563, pct: 62.84 } },
  { kra: "KRA 8: Revenue, Financial & Audit Support Services", subgroup: "8.1 Revenue Generation Activities", kpi: "Number of Employers Accounts Verified",
    y2023: { target: 19700, actual: 1002, pct: 5.09 }, y2024: { target: 19700, actual: 654, pct: 3.32 } },
  { kra: "KRA 8: Revenue, Financial & Audit Support Services", subgroup: "8.1 Revenue Generation Activities", kpi: "Discovery of New Companies",
    y2023: { target: 2380, actual: 9893, pct: 415.67 }, y2024: { target: 2380, actual: 10833, pct: 455.17 } },
  { kra: "KRA 8: Revenue, Financial & Audit Support Services", subgroup: "8.1 Revenue Generation Activities", kpi: "Number of New Companies Registered",
    y2023: { target: 2380, actual: 9893, pct: 415.67 }, y2024: { target: 2380, actual: 10833, pct: 455.17 } },
];

/** Flatten for a specific year to the shape kra_rows expects. */
export function pptxRowsForYear(year: 2023 | 2024) {
  return PPTX_KRA_SEED.map((r, i) => {
    const y = year === 2023 ? r.y2023 : r.y2024;
    return {
      year,
      kra: r.kra,
      subgroup: r.subgroup,
      kpi: r.kpi,
      target: y.target,
      actual: y.actual,
      pct: y.pct,
      sort_order: i + 1,
    };
  });
}
