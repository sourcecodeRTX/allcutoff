/**
 * Academic & Entrance Exam Calculators Data Architecture
 *
 * Provides metadata, university grading configs, conversion formulas,
 * attendance rules, percentile predictors, and comprehensive FAQ data for:
 * 1. CGPA Calculator (Universal, VIT, KTU, VTU, Anna University)
 * 2. SGPA Calculator (Universal, KTU, VTU, AKTU)
 * 3. SGPA to CGPA Calculator
 * 4. CGPA to Percentage (and Percentage to CGPA) Converter
 * 5. Marks Percentage Calculator & Target Score Planner
 * 6. Attendance Percentage & Bunk Calculator
 * 7. Percentile Calculator (Universal, JEE Main, CAT, MHT CET)
 */

export type AcademicToolType =
  | 'cgpa'
  | 'sgpa'
  | 'sgpa-to-cgpa'
  | 'cgpa-to-percentage'
  | 'marks-percentage'
  | 'attendance'
  | 'percentile';

export type UniversityKey =
  | 'universal'
  | 'vit'
  | 'ktu'
  | 'vtu'
  | 'anna-university'
  | 'aktu'
  | 'cbse';

export type ExamKey =
  | 'universal'
  | 'jee-main'
  | 'cat'
  | 'mht-cet-pcm'
  | 'mht-cet-pcb';

/* ==========================================================================
   Grading & University Configurations
   ========================================================================== */

export interface GradeOption {
  grade: string;
  points: number;
  description: string;
}

export interface UniversityConfig {
  id: UniversityKey;
  name: string;
  shortName: string;
  state?: string;
  gradingScale: number;
  grades: GradeOption[];
  percentageFormulaText: string;
  cgpaFormulaText: string;
  toPercentage: (cgpa: number) => number;
  toCgpa: (percentage: number) => number;
  notes: string;
}

export const UNIVERSITY_CONFIGS: Record<UniversityKey, UniversityConfig> = {
  universal: {
    id: 'universal',
    name: 'Universal CBCS (Standard 10-Point)',
    shortName: 'Standard 10-Pt CBCS',
    gradingScale: 10,
    grades: [
      { grade: 'O', points: 10, description: 'Outstanding (90-100%)' },
      { grade: 'A+', points: 9, description: 'Excellent (80-89%)' },
      { grade: 'A', points: 8, description: 'Very Good (70-79%)' },
      { grade: 'B+', points: 7, description: 'Good (60-69%)' },
      { grade: 'B', points: 6, description: 'Above Average (55-59%)' },
      { grade: 'C', points: 5, description: 'Average (50-54%)' },
      { grade: 'P', points: 4, description: 'Pass (40-49%)' },
      { grade: 'F', points: 0, description: 'Fail (<40%)' }
    ],
    percentageFormulaText: 'Percentage = CGPA × 9.5 (AICTE Standard) or CGPA × 10',
    cgpaFormulaText: 'CGPA = Percentage / 9.5',
    toPercentage: (cgpa: number) => Math.min(100, Math.max(0, Math.round(cgpa * 9.5 * 100) / 100)),
    toCgpa: (percentage: number) => Math.min(10, Math.max(0, Math.round((percentage / 9.5) * 100) / 100)),
    notes: 'Standard UGC / AICTE guidelines recommend multiplying CGPA by 9.5 for percentage conversion.'
  },
  vit: {
    id: 'vit',
    name: 'Vellore Institute of Technology (VIT)',
    shortName: 'VIT',
    state: 'Tamil Nadu',
    gradingScale: 10,
    grades: [
      { grade: 'S', points: 10, description: 'Super / Outstanding' },
      { grade: 'A', points: 9, description: 'Excellent' },
      { grade: 'B', points: 8, description: 'Very Good' },
      { grade: 'C', points: 7, description: 'Good' },
      { grade: 'D', points: 6, description: 'Average' },
      { grade: 'E', points: 4, description: 'Poor / Marginal Pass' },
      { grade: 'F', points: 0, description: 'Fail' },
      { grade: 'N', points: 0, description: 'Shortage of Attendance (Not Eligible)' }
    ],
    percentageFormulaText: 'Percentage = CGPA × 10',
    cgpaFormulaText: 'CGPA = Percentage / 10',
    toPercentage: (cgpa: number) => Math.min(100, Math.max(0, Math.round(cgpa * 10 * 100) / 100)),
    toCgpa: (percentage: number) => Math.min(10, Math.max(0, Math.round((percentage / 10) * 100) / 100)),
    notes: 'VIT follows an absolute/relative 10-point scale where Percentage is simply CGPA multiplied by 10.'
  },
  ktu: {
    id: 'ktu',
    name: 'APJ Abdul Kalam Technological University (KTU)',
    shortName: 'KTU Kerala',
    state: 'Kerala',
    gradingScale: 10,
    grades: [
      { grade: 'O', points: 10, description: 'Outstanding (90% and above)' },
      { grade: 'A+', points: 9, description: 'Excellent (85% to <90%)' },
      { grade: 'A', points: 8.5, description: 'Very Good (80% to <85%)' },
      { grade: 'B+', points: 8, description: 'Good (70% to <80%)' },
      { grade: 'B', points: 7, description: 'Above Average (60% to <70%)' },
      { grade: 'C', points: 6, description: 'Average (50% to <60%)' },
      { grade: 'P', points: 5, description: 'Pass (45% to <50%)' },
      { grade: 'F', points: 0, description: 'Fail (<45%)' }
    ],
    percentageFormulaText: 'Percentage = (10 × CGPA) - 3.75',
    cgpaFormulaText: 'CGPA = (Percentage + 3.75) / 10',
    toPercentage: (cgpa: number) => {
      if (cgpa <= 0) return 0;
      const pct = 10 * cgpa - 3.75;
      return Math.min(100, Math.max(0, Math.round(pct * 100) / 100));
    },
    toCgpa: (percentage: number) => {
      if (percentage <= 0) return 0;
      const cgpa = (percentage + 3.75) / 10;
      return Math.min(10, Math.max(0, Math.round(cgpa * 100) / 100));
    },
    notes: 'KTU uses the official notification formula: Equivalent Percentage = 10 × CGPA - 3.75.'
  },
  vtu: {
    id: 'vtu',
    name: 'Visvesvaraya Technological University (VTU)',
    shortName: 'VTU Belagavi',
    state: 'Karnataka',
    gradingScale: 10,
    grades: [
      { grade: 'O', points: 10, description: 'Outstanding (90-100%)' },
      { grade: 'A+', points: 9, description: 'Excellent (80-89%)' },
      { grade: 'A', points: 8, description: 'Very Good (70-79%)' },
      { grade: 'B+', points: 7, description: 'Good (60-69%)' },
      { grade: 'B', points: 6, description: 'Above Average (55-59%)' },
      { grade: 'C', points: 5, description: 'Average (50-54%)' },
      { grade: 'P', points: 4, description: 'Pass (40-49%)' },
      { grade: 'F', points: 0, description: 'Fail (<40%)' }
    ],
    percentageFormulaText: 'Percentage = (CGPA - 0.75) × 10',
    cgpaFormulaText: 'CGPA = (Percentage / 10) + 0.75',
    toPercentage: (cgpa: number) => {
      if (cgpa <= 0.75) return 0;
      const pct = (cgpa - 0.75) * 10;
      return Math.min(100, Math.max(0, Math.round(pct * 100) / 100));
    },
    toCgpa: (percentage: number) => {
      if (percentage <= 0) return 0.75;
      const cgpa = percentage / 10 + 0.75;
      return Math.min(10, Math.max(0, Math.round(cgpa * 100) / 100));
    },
    notes: 'VTU CBCS conversion formula officially certified on degree certificates: Percentage = (CGPA - 0.75) × 10.'
  },
  'anna-university': {
    id: 'anna-university',
    name: 'Anna University Chennai',
    shortName: 'Anna University',
    state: 'Tamil Nadu',
    gradingScale: 10,
    grades: [
      { grade: 'O', points: 10, description: 'Outstanding (91-100%)' },
      { grade: 'A+', points: 9, description: 'Excellent (81-90%)' },
      { grade: 'A', points: 8, description: 'Very Good (71-80%)' },
      { grade: 'B+', points: 7, description: 'Good (61-70%)' },
      { grade: 'B', points: 6, description: 'Average (50-60%)' },
      { grade: 'C', points: 5, description: 'Satisfactory (45-49%)' },
      { grade: 'RA', points: 0, description: 'Re-Appearance / Fail (<45% / <50%)' },
      { grade: 'SA', points: 0, description: 'Shortage of Attendance' },
      { grade: 'W', points: 0, description: 'Withdrawal' }
    ],
    percentageFormulaText: 'Percentage = CGPA × 10',
    cgpaFormulaText: 'CGPA = Percentage / 10',
    toPercentage: (cgpa: number) => Math.min(100, Math.max(0, Math.round(cgpa * 10 * 100) / 100)),
    toCgpa: (percentage: number) => Math.min(10, Math.max(0, Math.round((percentage / 10) * 100) / 100)),
    notes: 'Anna University Regulation 2021 & 2017 state that Equivalent Percentage = CGPA × 10.'
  },
  aktu: {
    id: 'aktu',
    name: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU / UPTU)',
    shortName: 'AKTU Lucknow',
    state: 'Uttar Pradesh',
    gradingScale: 10,
    grades: [
      { grade: 'A+', points: 10, description: 'Outstanding (90% & above)' },
      { grade: 'A', points: 9, description: 'Excellent (80% to <90%)' },
      { grade: 'B+', points: 8, description: 'Very Good (70% to <80%)' },
      { grade: 'B', points: 7, description: 'Good (60% to <70%)' },
      { grade: 'C+', points: 6, description: 'Fair (50% to <60%)' },
      { grade: 'C', points: 5, description: 'Average (45% to <50%)' },
      { grade: 'D', points: 4, description: 'Pass (40% to <45%)' },
      { grade: 'F', points: 0, description: 'Fail (<40%)' }
    ],
    percentageFormulaText: 'Percentage = (SGPA or CGPA - 0.75) × 10',
    cgpaFormulaText: 'CGPA = (Percentage / 10) + 0.75',
    toPercentage: (cgpa: number) => {
      if (cgpa <= 0.75) return 0;
      const pct = (cgpa - 0.75) * 10;
      return Math.min(100, Math.max(0, Math.round(pct * 100) / 100));
    },
    toCgpa: (percentage: number) => {
      if (percentage <= 0) return 0.75;
      const cgpa = percentage / 10 + 0.75;
      return Math.min(10, Math.max(0, Math.round(cgpa * 100) / 100));
    },
    notes: 'AKTU circular prescribes: Equivalent Percentage = (CGPA - 0.75) × 10.'
  },
  cbse: {
    id: 'cbse',
    name: 'Central Board of Secondary Education (CBSE 10th)',
    shortName: 'CBSE',
    gradingScale: 10,
    grades: [
      { grade: 'A1', points: 10, description: 'Top 1/8th of passed candidates (91-100)' },
      { grade: 'A2', points: 9, description: 'Next 1/8th (81-90)' },
      { grade: 'B1', points: 8, description: 'Next 1/8th (71-80)' },
      { grade: 'B2', points: 7, description: 'Next 1/8th (61-70)' },
      { grade: 'C1', points: 6, description: 'Next 1/8th (51-60)' },
      { grade: 'C2', points: 5, description: 'Next 1/8th (41-50)' },
      { grade: 'D', points: 4, description: 'Next 1/8th (33-40)' },
      { grade: 'E', points: 0, description: 'Failed / Essential Repeat (<33)' }
    ],
    percentageFormulaText: 'Percentage = CGPA × 9.5',
    cgpaFormulaText: 'CGPA = Percentage / 9.5',
    toPercentage: (cgpa: number) => Math.min(100, Math.max(0, Math.round(cgpa * 9.5 * 100) / 100)),
    toCgpa: (percentage: number) => Math.min(10, Math.max(0, Math.round((percentage / 9.5) * 100) / 100)),
    notes: 'CBSE established the 9.5 multiplier based on the statistical average marks of past 5-year board cohorts.'
  }
};

/* ==========================================================================
   Competitive Exam Benchmark Data (JEE Main, CAT, MHT CET)
   ========================================================================== */

export interface ExamBenchmarkRow {
  scoreMin: number;
  scoreMax: number;
  percentileMin: number;
  percentileMax: number;
  rankMin: number;
  rankMax: number;
  description: string;
}

export interface ExamConfig {
  id: ExamKey;
  name: string;
  conductingBody: string;
  totalMarks: number;
  totalCandidates: number;
  academicYear: string;
  scoreUnit: string;
  benchmarks: ExamBenchmarkRow[];
  notes: string;
}

export const EXAM_CONFIGS: Record<ExamKey, ExamConfig> = {
  universal: {
    id: 'universal',
    name: 'Universal Rank to Percentile Calculator',
    conductingBody: 'National / State Examination Authorities',
    totalMarks: 100,
    totalCandidates: 100000,
    academicYear: '2025 - 2026',
    scoreUnit: 'Marks',
    benchmarks: [],
    notes: 'Calculates exact percentile rank based on Rank (R) and total appearing candidates (N).'
  },
  'jee-main': {
    id: 'jee-main',
    name: 'JEE Main Marks vs Percentile (NTA)',
    conductingBody: 'National Testing Agency (NTA)',
    totalMarks: 300,
    totalCandidates: 1450000,
    academicYear: '2025 - 2026',
    scoreUnit: 'out of 300',
    benchmarks: [
      { scoreMin: 280, scoreMax: 300, percentileMin: 99.99, percentileMax: 100.0, rankMin: 1, rankMax: 150, description: 'Top Tier 1 NIT Trichy / Surathkal / Warangal CSE' },
      { scoreMin: 250, scoreMax: 279, percentileMin: 99.85, percentileMax: 99.98, rankMin: 151, rankMax: 1600, description: 'Top NITs / IIIT Allahabad / IIIT Hyderabad CSE' },
      { scoreMin: 220, scoreMax: 249, percentileMin: 99.40, percentileMax: 99.84, rankMin: 1601, rankMax: 7000, description: 'Core branches in top NITs & CSE in newer NITs' },
      { scoreMin: 190, scoreMax: 219, percentileMin: 98.70, percentileMax: 99.39, rankMin: 7001, rankMax: 16000, description: 'Top NITs ECE / Mech / Electrical' },
      { scoreMin: 160, scoreMax: 189, percentileMin: 97.40, percentileMax: 98.69, rankMin: 16001, rankMax: 32000, description: 'Good NITs / DTU / NSUT' },
      { scoreMin: 130, scoreMax: 159, percentileMin: 95.00, percentileMax: 97.39, rankMin: 32001, rankMax: 65000, description: 'Mid-tier NITs / State Government Colleges' },
      { scoreMin: 100, scoreMax: 129, percentileMin: 90.00, percentileMax: 94.99, rankMin: 65001, rankMax: 135000, description: 'JEE Advanced Qualified Cutoff (~90+ percentile General)' },
      { scoreMin: 80, scoreMax: 99, percentileMin: 82.00, percentileMax: 89.99, rankMin: 135001, rankMax: 240000, description: 'OBC / EWS qualifying tier' },
      { scoreMin: 60, scoreMax: 79, percentileMin: 72.00, percentileMax: 81.99, rankMin: 240001, rankMax: 380000, description: 'SC qualifying range' },
      { scoreMin: 40, scoreMax: 59, percentileMin: 55.00, percentileMax: 71.99, rankMin: 380001, rankMax: 600000, description: 'ST qualifying range' },
      { scoreMin: 0, scoreMax: 39, percentileMin: 0.0, percentileMax: 54.99, rankMin: 600001, rankMax: 1450000, description: 'Low percentile' }
    ],
    notes: 'Based on official NTA Session 1 & Session 2 normalized trends across ~14.5 lakh registered candidates.'
  },
  cat: {
    id: 'cat',
    name: 'CAT Score vs Percentile (IIMs)',
    conductingBody: 'Indian Institutes of Management (IIM)',
    totalMarks: 198,
    totalCandidates: 330000,
    academicYear: '2025 - 2026',
    scoreUnit: 'out of 198',
    benchmarks: [
      { scoreMin: 110, scoreMax: 198, percentileMin: 99.90, percentileMax: 99.99, rankMin: 1, rankMax: 330, description: 'IIM Ahmedabad, Bangalore, Calcutta (BLACKI Calls)' },
      { scoreMin: 95, scoreMax: 109, percentileMin: 99.50, percentileMax: 99.89, rankMin: 331, rankMax: 1650, description: 'IIM Lucknow, Kozhikode, Indore, FMS Delhi' },
      { scoreMin: 82, scoreMax: 94, percentileMin: 99.00, percentileMax: 99.49, rankMin: 1651, rankMax: 3300, description: 'SPJIMR, MDI Gurgaon, IIT Bombay (SJMSOM)' },
      { scoreMin: 70, scoreMax: 81, percentileMin: 97.50, percentileMax: 98.99, rankMin: 3301, rankMax: 8250, description: 'New IIMs (Udaipur, Trichy, Ranchi, Raipur)' },
      { scoreMin: 58, scoreMax: 69, percentileMin: 95.00, percentileMax: 97.49, rankMin: 8251, rankMax: 16500, description: 'Baby IIMs (Bodhgaya, Sirmaur, Sambalpur) / IMT Ghaziabad' },
      { scoreMin: 46, scoreMax: 57, percentileMin: 90.00, percentileMax: 94.99, rankMin: 16501, rankMax: 33000, description: 'GIM Goa, FORE, TAPMI, Great Lakes' },
      { scoreMin: 35, scoreMax: 45, percentileMin: 80.00, percentileMax: 89.99, rankMin: 33001, rankMax: 66000, description: 'Tier 3 MBA Colleges / Reserved category cutoff' },
      { scoreMin: 25, scoreMax: 34, percentileMin: 70.00, percentileMax: 79.99, rankMin: 66001, rankMax: 99000, description: 'Private universities & state colleges' },
      { scoreMin: 0, scoreMax: 24, percentileMin: 0.0, percentileMax: 69.99, rankMin: 99001, rankMax: 330000, description: 'Below 70 percentile' }
    ],
    notes: 'CAT tests VARC, DILR, and QA across 66 questions with +3/-1 marking (Total: 198 marks).'
  },
  'mht-cet-pcm': {
    id: 'mht-cet-pcm',
    name: 'MHT CET PCM Score vs Percentile',
    conductingBody: 'State Common Entrance Test Cell, Maharashtra',
    totalMarks: 200,
    totalCandidates: 410000,
    academicYear: '2025 - 2026',
    scoreUnit: 'out of 200',
    benchmarks: [
      { scoreMin: 165, scoreMax: 200, percentileMin: 99.70, percentileMax: 99.99, rankMin: 1, rankMax: 1200, description: 'COEP Pune / VJTI Mumbai CSE & IT' },
      { scoreMin: 150, scoreMax: 164, percentileMin: 99.00, percentileMax: 99.69, rankMin: 1201, rankMax: 4100, description: 'COEP, VJTI, SPIT Mumbai, PICT Pune' },
      { scoreMin: 135, scoreMax: 149, percentileMin: 97.50, percentileMax: 98.99, rankMin: 4101, rankMax: 10250, description: 'Walchand Sangli, VIT Pune, Cummins' },
      { scoreMin: 120, scoreMax: 134, percentileMin: 95.00, percentileMax: 97.49, rankMin: 10251, rankMax: 20500, description: 'D.J. Sanghvi, Thadomal Shahani, PCCOE Pune' },
      { scoreMin: 105, scoreMax: 119, percentileMin: 91.00, percentileMax: 94.99, rankMin: 20501, rankMax: 36900, description: 'Good Autonomous Engineering Colleges in Maharashtra' },
      { scoreMin: 90, scoreMax: 104, percentileMin: 85.00, percentileMax: 90.99, rankMin: 36901, rankMax: 61500, description: 'Mumbai / Pune University Affiliated Colleges' },
      { scoreMin: 75, scoreMax: 89, percentileMin: 75.00, percentileMax: 84.99, rankMin: 61501, rankMax: 102500, description: 'State Level Government Aided / Private Colleges' },
      { scoreMin: 60, scoreMax: 74, percentileMin: 60.00, percentileMax: 74.99, rankMin: 102501, rankMax: 164000, description: 'Average Percentile' },
      { scoreMin: 0, scoreMax: 59, percentileMin: 0.0, percentileMax: 59.99, rankMin: 164001, rankMax: 410000, description: 'Low percentile' }
    ],
    notes: 'PCM comprises Physics (50), Chemistry (50), and Mathematics (100). No negative marking.'
  },
  'mht-cet-pcb': {
    id: 'mht-cet-pcb',
    name: 'MHT CET PCB Score vs Percentile',
    conductingBody: 'State Common Entrance Test Cell, Maharashtra',
    totalMarks: 200,
    totalCandidates: 330000,
    academicYear: '2025 - 2026',
    scoreUnit: 'out of 200',
    benchmarks: [
      { scoreMin: 165, scoreMax: 200, percentileMin: 99.60, percentileMax: 99.99, rankMin: 1, rankMax: 1300, description: 'Top Government B.Pharm / Agriculture Colleges (ICT Mumbai)' },
      { scoreMin: 145, scoreMax: 164, percentileMin: 98.50, percentileMax: 99.59, rankMin: 1301, rankMax: 4950, description: 'Government College of Pharmacy, Amravati / Karad' },
      { scoreMin: 130, scoreMax: 144, percentileMin: 96.00, percentileMax: 98.49, rankMin: 4951, rankMax: 13200, description: 'Top Private Pharmacy & Agriculture Institutes' },
      { scoreMin: 110, scoreMax: 129, percentileMin: 90.00, percentileMax: 95.99, rankMin: 13201, rankMax: 33000, description: 'Good Pharmacy Colleges in Pune / Mumbai' },
      { scoreMin: 90, scoreMax: 109, percentileMin: 80.00, percentileMax: 89.99, rankMin: 33001, rankMax: 66000, description: 'Standard B.Pharmacy / B.Sc Agri' },
      { scoreMin: 70, scoreMax: 89, percentileMin: 65.00, percentileMax: 79.99, rankMin: 66001, rankMax: 115500, description: 'State Private Institutes' },
      { scoreMin: 0, scoreMax: 69, percentileMin: 0.0, percentileMax: 64.99, rankMin: 115501, rankMax: 330000, description: 'Lower percentiles' }
    ],
    notes: 'PCB comprises Physics (50), Chemistry (50), and Biology (Botany 50 + Zoology 50). Total 200 marks.'
  }
};

/* ==========================================================================
   Division Classification Helper
   ========================================================================== */

export interface DivisionResult {
  division: string;
  badgeColor: string; // Tailwind color class or hex token
  description: string;
}

export function classifyDivision(percentageOrCgpa: number, isCgpa: boolean = false): DivisionResult {
  const percentage = isCgpa ? percentageOrCgpa * 10 : percentageOrCgpa;

  if (percentage >= 75) {
    return {
      division: 'First Class with Distinction',
      badgeColor: 'emerald',
      description: 'Outstanding academic performance (Honours / Distinction level).'
    };
  }
  if (percentage >= 60) {
    return {
      division: 'First Class',
      badgeColor: 'blue',
      description: 'Commendable academic performance meeting standard master’s and placement criteria.'
    };
  }
  if (percentage >= 50) {
    return {
      division: 'Second Class',
      badgeColor: 'amber',
      description: 'Satisfactory academic performance.'
    };
  }
  if (percentage >= 35) {
    return {
      division: 'Third Class / Pass Division',
      badgeColor: 'orange',
      description: 'Minimum passing division.'
    };
  }
  return {
    division: 'Fail / Essential Repeat',
    badgeColor: 'rose',
    description: 'Score is below the required minimum passing threshold.'
  };
}

/* ==========================================================================
   Core Mathematical Calculation Functions
   ========================================================================== */

export interface AcademicSubjectInput {
  name?: string;
  gradePoint: number;
  credit: number;
}

export interface SgpaCalculationResult {
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  percentage: number;
  division: DivisionResult;
  breakdown: Array<{
    subject: string;
    gradePoint: number;
    credit: number;
    weightedPoints: number;
  }>;
}

/**
 * Calculates SGPA from an array of subjects with grade points and credits.
 * SGPA = Sum(GradePoint × Credit) / Sum(Credit)
 */
export function calculateSgpa(
  subjects: AcademicSubjectInput[],
  universityKey: UniversityKey = 'universal'
): SgpaCalculationResult {
  if (!subjects || subjects.length === 0) {
    return {
      sgpa: 0,
      totalCredits: 0,
      earnedCredits: 0,
      percentage: 0,
      division: classifyDivision(0),
      breakdown: []
    };
  }

  let totalWeighted = 0;
  let totalCredits = 0;
  let earnedCredits = 0;
  const breakdown: SgpaCalculationResult['breakdown'] = [];

  subjects.forEach((sub, idx) => {
    const credit = Math.max(0, Number(sub.credit) || 0);
    const gp = Math.max(0, Math.min(10, Number(sub.gradePoint) || 0));
    const weighted = Math.round(gp * credit * 100) / 100;

    totalWeighted += gp * credit;
    totalCredits += credit;
    if (gp > 0) earnedCredits += credit;

    breakdown.push({
      subject: sub.name?.trim() || `Subject ${idx + 1}`,
      gradePoint: gp,
      credit: credit,
      weightedPoints: weighted
    });
  });

  const sgpa = totalCredits > 0 ? Math.round((totalWeighted / totalCredits) * 100) / 100 : 0;
  const config = UNIVERSITY_CONFIGS[universityKey] || UNIVERSITY_CONFIGS.universal;
  const percentage = config.toPercentage(sgpa);

  return {
    sgpa,
    totalCredits,
    earnedCredits,
    percentage,
    division: classifyDivision(percentage),
    breakdown
  };
}

export interface SemesterInput {
  semesterNumber: number;
  sgpa: number;
  credit: number;
}

export interface CgpaCalculationResult {
  cgpa: number;
  totalCredits: number;
  percentage: number;
  division: DivisionResult;
  semesters: Array<{
    semester: number;
    sgpa: number;
    credit: number;
    cumulativeCgpa: number;
  }>;
}

/**
 * Calculates cumulative CGPA from semester SGPAs and credit weights.
 * CGPA = Sum(SGPA_k × Credit_k) / Sum(Credit_k)
 */
export function calculateCgpaFromSemesters(
  semesters: SemesterInput[],
  universityKey: UniversityKey = 'universal'
): CgpaCalculationResult {
  if (!semesters || semesters.length === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      percentage: 0,
      division: classifyDivision(0),
      semesters: []
    };
  }

  let runningWeighted = 0;
  let runningCredits = 0;
  const progression: CgpaCalculationResult['semesters'] = [];

  semesters.forEach((sem, idx) => {
    const credit = Math.max(0, Number(sem.credit) || 0);
    const sgpa = Math.max(0, Math.min(10, Number(sem.sgpa) || 0));

    runningWeighted += sgpa * credit;
    runningCredits += credit;

    const cumulativeCgpa = runningCredits > 0
      ? Math.round((runningWeighted / runningCredits) * 100) / 100
      : 0;

    progression.push({
      semester: sem.semesterNumber || idx + 1,
      sgpa,
      credit,
      cumulativeCgpa
    });
  });

  const finalCgpa = runningCredits > 0
    ? Math.round((runningWeighted / runningCredits) * 100) / 100
    : 0;

  const config = UNIVERSITY_CONFIGS[universityKey] || UNIVERSITY_CONFIGS.universal;
  const percentage = config.toPercentage(finalCgpa);

  return {
    cgpa: finalCgpa,
    totalCredits: runningCredits,
    percentage,
    division: classifyDivision(percentage),
    semesters: progression
  };
}

/**
 * Converts CGPA to percentage using university-specific official formula.
 */
export function calculateCgpaToPercentage(
  cgpa: number,
  universityKey: UniversityKey = 'universal'
): { cgpa: number; percentage: number; formulaText: string; universityName: string; division: DivisionResult } {
  const sanitizedCgpa = Math.max(0, Math.min(10, Number(cgpa) || 0));
  const config = UNIVERSITY_CONFIGS[universityKey] || UNIVERSITY_CONFIGS.universal;
  const percentage = config.toPercentage(sanitizedCgpa);

  return {
    cgpa: sanitizedCgpa,
    percentage,
    formulaText: config.percentageFormulaText,
    universityName: config.name,
    division: classifyDivision(percentage)
  };
}

/**
 * Converts Percentage to CGPA using official inverse university formula.
 */
export function calculatePercentageToCgpa(
  percentage: number,
  universityKey: UniversityKey = 'universal'
): { percentage: number; cgpa: number; formulaText: string; universityName: string; division: DivisionResult } {
  const sanitizedPct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const config = UNIVERSITY_CONFIGS[universityKey] || UNIVERSITY_CONFIGS.universal;
  const cgpa = config.toCgpa(sanitizedPct);

  return {
    percentage: sanitizedPct,
    cgpa,
    formulaText: config.cgpaFormulaText,
    universityName: config.name,
    division: classifyDivision(sanitizedPct)
  };
}

/* ==========================================================================
   Marks Percentage & Target Planner
   ========================================================================== */

export interface SubjectMarksInput {
  name?: string;
  obtained: number;
  maxMarks: number;
  passingMarks?: number;
}

export interface MarksCalculationResult {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  division: DivisionResult;
  isPassing: boolean;
  subjects: Array<{
    name: string;
    obtained: number;
    maxMarks: number;
    percentage: number;
    isPass: boolean;
  }>;
}

/**
 * Calculates overall percentage from subject-wise marks or simple total.
 */
export function calculateMarksPercentage(subjects: SubjectMarksInput[]): MarksCalculationResult {
  if (!subjects || subjects.length === 0) {
    return {
      totalObtained: 0,
      totalMax: 0,
      percentage: 0,
      division: classifyDivision(0),
      isPassing: false,
      subjects: []
    };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let allSubjectsPassed = true;

  const rows = subjects.map((sub, idx) => {
    const maxMarks = Math.max(1, Number(sub.maxMarks) || 100);
    const obtained = Math.max(0, Math.min(maxMarks, Number(sub.obtained) || 0));
    const passThreshold = sub.passingMarks !== undefined ? sub.passingMarks : maxMarks * 0.35;
    const isPass = obtained >= passThreshold;

    if (!isPass) allSubjectsPassed = false;
    totalObtained += obtained;
    totalMax += maxMarks;

    const pct = Math.round((obtained / maxMarks) * 10000) / 100;

    return {
      name: sub.name?.trim() || `Subject ${idx + 1}`,
      obtained,
      maxMarks,
      percentage: pct,
      isPass
    };
  });

  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
  const isPassing = allSubjectsPassed && percentage >= 35;
  const division = isPassing ? classifyDivision(percentage) : classifyDivision(0);

  return {
    totalObtained: Math.round(totalObtained * 100) / 100,
    totalMax: Math.round(totalMax * 100) / 100,
    percentage,
    division,
    isPassing,
    subjects: rows
  };
}

export interface TargetScorePlanResult {
  currentObtained: number;
  currentMax: number;
  targetPercentage: number;
  remainingMax: number;
  totalFinalMax: number;
  neededTotal: number;
  neededInRemaining: number;
  neededPercentageInRemaining: number;
  status: 'achievable' | 'impossible' | 'already_achieved';
  remarks: string;
}

/**
 * Calculates target marks needed in upcoming tests/exams to reach a goal percentage.
 */
export function calculateTargetScorePlan(
  currentObtained: number,
  currentMax: number,
  targetPercentage: number,
  remainingMax: number
): TargetScorePlanResult {
  const cObt = Math.max(0, Number(currentObtained) || 0);
  const cMax = Math.max(0, Number(currentMax) || 0);
  const tPct = Math.max(0, Math.min(100, Number(targetPercentage) || 0));
  const rMax = Math.max(0, Number(remainingMax) || 0);

  const totalFinalMax = cMax + rMax;
  const neededTotal = Math.round((tPct / 100) * totalFinalMax * 100) / 100;
  const neededInRemaining = Math.round((neededTotal - cObt) * 100) / 100;

  if (rMax === 0) {
    const currPct = cMax > 0 ? (cObt / cMax) * 100 : 0;
    const achieved = currPct >= tPct;
    return {
      currentObtained: cObt,
      currentMax: cMax,
      targetPercentage: tPct,
      remainingMax: 0,
      totalFinalMax,
      neededTotal,
      neededInRemaining: 0,
      neededPercentageInRemaining: 0,
      status: achieved ? 'already_achieved' : 'impossible',
      remarks: achieved
        ? 'Target already met with current marks.'
        : 'No remaining assessments available to improve score.'
    };
  }

  if (neededInRemaining <= 0) {
    return {
      currentObtained: cObt,
      currentMax: cMax,
      targetPercentage: tPct,
      remainingMax: rMax,
      totalFinalMax,
      neededTotal,
      neededInRemaining: 0,
      neededPercentageInRemaining: 0,
      status: 'already_achieved',
      remarks: `Target met! Even with 0/${rMax} in remaining exams, your final score will be above ${tPct}%.`
    };
  }

  if (neededInRemaining > rMax) {
    const maxPossiblePct = Math.round(((cObt + rMax) / totalFinalMax) * 10000) / 100;
    return {
      currentObtained: cObt,
      currentMax: cMax,
      targetPercentage: tPct,
      remainingMax: rMax,
      totalFinalMax,
      neededTotal,
      neededInRemaining,
      neededPercentageInRemaining: Math.round((neededInRemaining / rMax) * 10000) / 100,
      status: 'impossible',
      remarks: `Mathematically unreachable. You would need ${neededInRemaining} marks out of ${rMax} (max possible is ${maxPossiblePct}%).`
    };
  }

  const neededPct = Math.round((neededInRemaining / rMax) * 10000) / 100;
  return {
    currentObtained: cObt,
    currentMax: cMax,
    targetPercentage: tPct,
    remainingMax: rMax,
    totalFinalMax,
    neededTotal,
    neededInRemaining,
    neededPercentageInRemaining: neededPct,
    status: 'achievable',
    remarks: `Achievable! You need to score at least ${neededInRemaining} out of ${rMax} (${neededPct}%) in remaining assessments.`
  };
}

/* ==========================================================================
   Attendance & Safe Bunk Calculator
   ========================================================================== */

export interface AttendanceCalculationResult {
  attendedClasses: number;
  totalClasses: number;
  currentPercentage: number;
  targetPercentage: number;
  status: 'safe' | 'shortage' | 'on_track';
  safeBunks: number;
  consecutiveNeeded: number;
  threshold75: { safeBunks: number; consecutiveNeeded: number; meets: boolean };
  threshold80: { safeBunks: number; consecutiveNeeded: number; meets: boolean };
  threshold85: { safeBunks: number; consecutiveNeeded: number; meets: boolean };
  remarks: string;
}

function calculateAttendanceForThreshold(
  attended: number,
  total: number,
  target: number
): { safeBunks: number; consecutiveNeeded: number; meets: boolean } {
  if (total <= 0) {
    return { safeBunks: 0, consecutiveNeeded: 0, meets: true };
  }
  const currentPct = (attended / total) * 100;
  if (target >= 100) {
    if (attended < total) {
      return { safeBunks: 0, consecutiveNeeded: Infinity, meets: false };
    }
    return { safeBunks: 0, consecutiveNeeded: 0, meets: true };
  }

  if (currentPct >= target) {
    const bunks = Math.floor((100 * attended - target * total) / target);
    return { safeBunks: Math.max(0, bunks), consecutiveNeeded: 0, meets: true };
  } else {
    const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
    return { safeBunks: 0, consecutiveNeeded: Math.max(0, needed), meets: false };
  }
}

/**
 * Calculates current attendance %, safe bunks, or consecutive classes needed for 75%/80%/85% or custom target.
 */
export function calculateAttendance(
  attendedClasses: number,
  totalClasses: number,
  targetPercentage: number = 75
): AttendanceCalculationResult {
  const attended = Math.max(0, Number(attendedClasses) || 0);
  const total = Math.max(attended, Number(totalClasses) || 0);
  const target = Math.max(1, Math.min(99.9, Number(targetPercentage) || 75));

  const currentPct = total > 0 ? Math.round((attended / total) * 10000) / 100 : 0;
  const primary = calculateAttendanceForThreshold(attended, total, target);
  const t75 = calculateAttendanceForThreshold(attended, total, 75);
  const t80 = calculateAttendanceForThreshold(attended, total, 80);
  const t85 = calculateAttendanceForThreshold(attended, total, 85);

  let status: AttendanceCalculationResult['status'] = 'on_track';
  let remarks = '';

  if (currentPct >= target) {
    status = primary.safeBunks > 0 ? 'safe' : 'on_track';
    remarks = primary.safeBunks > 0
      ? `You can safely miss ${primary.safeBunks} class${primary.safeBunks > 1 ? 'es' : ''} while maintaining at least ${target}% attendance.`
      : `You are exactly on track at ${currentPct}%. Do not miss any upcoming classes to stay above ${target}%.`;
  } else {
    status = 'shortage';
    remarks = `Attendance shortage (${currentPct}%). You must attend the next ${primary.consecutiveNeeded} consecutive class${primary.consecutiveNeeded > 1 ? 'es' : ''} to reach ${target}%.`;
  }

  return {
    attendedClasses: attended,
    totalClasses: total,
    currentPercentage: currentPct,
    targetPercentage: target,
    status,
    safeBunks: primary.safeBunks,
    consecutiveNeeded: primary.consecutiveNeeded,
    threshold75: t75,
    threshold80: t80,
    threshold85: t85,
    remarks
  };
}

/* ==========================================================================
   Percentile & Rank Formulas
   ========================================================================== */

/**
 * Calculates exact percentile from Rank and total appearing candidates.
 * Formula: Percentile = (1 - (Rank - 1) / TotalCandidates) * 100
 */
export function calculateRankToPercentile(
  rank: number,
  totalCandidates: number
): { rank: number; totalCandidates: number; percentile: number; remarks: string } {
  const n = Math.max(1, Number(totalCandidates) || 100000);
  const r = Math.max(1, Math.min(n, Number(rank) || 1));

  const pct = (1 - (r - 1) / n) * 100;
  const formattedPct = Math.round(pct * 10000) / 10000;

  return {
    rank: r,
    totalCandidates: n,
    percentile: formattedPct,
    remarks: `Rank ${r.toLocaleString('en-IN')} out of ${n.toLocaleString('en-IN')} candidates lands on the ${formattedPct} percentile.`
  };
}

/**
 * Calculates estimated Rank from Percentile and total appearing candidates.
 * Formula: Rank = round((1 - (Percentile / 100)) * TotalCandidates + 1)
 */
export function calculatePercentileToRank(
  percentile: number,
  totalCandidates: number
): { percentile: number; totalCandidates: number; estimatedRank: number; remarks: string } {
  const n = Math.max(1, Number(totalCandidates) || 100000);
  const p = Math.max(0, Math.min(100, Number(percentile) || 0));

  const rawRank = (1 - p / 100) * n + 1;
  const estimatedRank = Math.max(1, Math.min(n, Math.round(rawRank)));

  return {
    percentile: p,
    totalCandidates: n,
    estimatedRank,
    remarks: `A ${p} percentile represents an estimated All India Rank of approximately ${estimatedRank.toLocaleString('en-IN')} out of ${n.toLocaleString('en-IN')} candidates.`
  };
}

export interface ExamPredictionResult {
  examKey: ExamKey;
  examName: string;
  score: number;
  maxScore: number;
  estimatedPercentileMin: number;
  estimatedPercentileMax: number;
  estimatedRankMin: number;
  estimatedRankMax: number;
  percentileDisplay: string;
  rankDisplay: string;
  benchmarks: ExamBenchmarkRow[];
  remarks: string;
}

/**
 * Predicts estimated percentile and rank range based on exam benchmark data.
 */
export function predictExamPercentile(examKey: ExamKey, score: number): ExamPredictionResult {
  const config = EXAM_CONFIGS[examKey] || EXAM_CONFIGS['jee-main'];
  const sanitizedScore = Math.max(0, Math.min(config.totalMarks, Number(score) || 0));

  const matched = config.benchmarks.find(
    (b) => sanitizedScore >= b.scoreMin && sanitizedScore <= b.scoreMax
  );

  if (matched) {
    return {
      examKey,
      examName: config.name,
      score: sanitizedScore,
      maxScore: config.totalMarks,
      estimatedPercentileMin: matched.percentileMin,
      estimatedPercentileMax: matched.percentileMax,
      estimatedRankMin: matched.rankMin,
      estimatedRankMax: matched.rankMax,
      percentileDisplay: matched.percentileMin === matched.percentileMax
        ? `${matched.percentileMin}%`
        : `${matched.percentileMin}% - ${matched.percentileMax}%`,
      rankDisplay: `${matched.rankMin.toLocaleString('en-IN')} - ${matched.rankMax.toLocaleString('en-IN')}`,
      benchmarks: config.benchmarks,
      remarks: matched.description
    };
  }

  // Fallback if no benchmark table
  const fallbackPct = Math.round((sanitizedScore / config.totalMarks) * 10000) / 100;
  const rankObj = calculatePercentileToRank(fallbackPct, config.totalCandidates);
  return {
    examKey,
    examName: config.name,
    score: sanitizedScore,
    maxScore: config.totalMarks,
    estimatedPercentileMin: fallbackPct,
    estimatedPercentileMax: fallbackPct,
    estimatedRankMin: rankObj.estimatedRank,
    estimatedRankMax: rankObj.estimatedRank,
    percentileDisplay: `~${fallbackPct}%`,
    rankDisplay: `~${rankObj.estimatedRank.toLocaleString('en-IN')}`,
    benchmarks: config.benchmarks,
    remarks: 'Estimated via linear score distribution.'
  };
}

/* ==========================================================================
   Tool Metadata Registry & SEO Content Models
   ========================================================================== */

export interface AcademicFaq {
  question: string;
  answer: string;
}

export interface HowToUseStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface AcademicCalculatorMeta {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  toolType: AcademicToolType;
  universityKey?: UniversityKey;
  examKey?: ExamKey;
  badge: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  summary: string;
  formulaDisplay: string;
  verifiedFormulaText: string;
  howToUse: HowToUseStep[];
  faqs: AcademicFaq[];
  relatedSlugs: string[];
}

export const ACADEMIC_CALCULATORS: AcademicCalculatorMeta[] = [
  // 1. CGPA Calculator (Master)
  {
    id: 'cgpa-calculator',
    slug: 'cgpa-calculator',
    name: 'CGPA Calculator (Semester & Subject-wise)',
    shortName: 'CGPA Calculator',
    toolType: 'cgpa',
    universityKey: 'universal',
    badge: 'Universal 10-Point CBCS',
    title: 'CGPA Calculator - Calculate College & University CGPA Online',
    metaDescription: 'Free online CGPA calculator. Calculate cumulative grade point average semester-wise or subject-wise with live division and percentage converter.',
    keywords: ['cgpa calculator', 'calculate cgpa', 'cgpa to percentage', 'semester cgpa calculator', 'college cgpa calculator'],
    summary: 'Calculates cumulative grade point average (CGPA) across college semesters or subject credits based on UGC Choice Based Credit System (CBCS). Includes live percentage equivalence and honors division.',
    formulaDisplay: 'CGPA = \\frac{\\sum (\\text{SGPA}_i \\times \\text{Credits}_i)}{\\sum \\text{Credits}_i}',
    verifiedFormulaText: 'CGPA = Sum of (SGPA × Semester Credits) / Total Credits',
    howToUse: [
      { stepNumber: 1, title: 'Choose Mode', description: 'Select semester-wise SGPA input or individual subject grade point input.' },
      { stepNumber: 2, title: 'Enter Credits & Grades', description: 'Enter the credits earned and SGPA or letter grade for each semester.' },
      { stepNumber: 3, title: 'Instant Result', description: 'View your cumulative CGPA, equivalent percentage, and degree division classification.' }
    ],
    faqs: [
      { question: 'What is the standard formula for calculating CGPA?', answer: 'The official UGC CBCS formula calculates CGPA as the weighted sum of SGPA multiplied by credits for all semesters, divided by total credits completed.' },
      { question: 'What is the difference between SGPA and CGPA?', answer: 'SGPA (Semester Grade Point Average) measures academic performance in a single semester, whereas CGPA (Cumulative Grade Point Average) aggregates performance across all completed semesters.' },
      { question: 'How is CGPA converted to percentage?', answer: 'Under standard AICTE guidelines, Percentage = CGPA × 9.5. However, universities like VTU, KTU, and Anna University have dedicated official conversion formulas.' },
      { question: 'What CGPA is required for First Class with Distinction?', answer: 'Most universities award First Class with Distinction for CGPA >= 7.5 or 8.0, provided all examinations were passed in the first attempt without history of arrears.' }
    ],
    relatedSlugs: ['sgpa-calculator', 'sgpa-to-cgpa-calculator', 'cgpa-to-percentage-calculator', 'attendance-percentage-calculator']
  },

  // 2. VIT CGPA Calculator
  {
    id: 'vit-cgpa-calculator',
    slug: 'vit-cgpa-calculator',
    name: 'VIT CGPA Calculator (Vellore Institute of Technology)',
    shortName: 'VIT CGPA Calculator',
    toolType: 'cgpa',
    universityKey: 'vit',
    badge: 'VIT Vellore / Chennai / AP / Bhopal',
    title: 'VIT CGPA Calculator - Calculate VIT SGPA & CGPA Online',
    metaDescription: 'Official VIT CGPA calculator for Vellore Institute of Technology students. Enter S, A, B, C, D, E grades and credits for instant CGPA and percentage.',
    keywords: ['vit cgpa calculator', 'cgpa calculator vit', 'vit sgpa calculator', 'vit grade points', 'vit percentage calculator'],
    summary: 'Dedicated VIT grading calculator tailored to Vellore Institute of Technology FFCS (Fully Flexible Credit System) 10-point scale: S (10), A (9), B (8), C (7), D (6), E (4), F (0).',
    formulaDisplay: '\\text{CGPA} = \\frac{\\sum (\\text{Grade Point}_i \\times C_i)}{\\sum C_i}, \\quad \\% = \\text{CGPA} \\times 10',
    verifiedFormulaText: 'CGPA = Sum(GP × Credits) / Total Credits | Percentage = CGPA × 10',
    howToUse: [
      { stepNumber: 1, title: 'Select Courses', description: 'Add your registered FFCS courses for the semester.' },
      { stepNumber: 2, title: 'Assign VIT Letter Grades', description: 'Select S, A, B, C, D, or E letter grades and subject credit weights (e.g., 3 or 4 credits).' },
      { stepNumber: 3, title: 'Get VIT CGPA', description: 'Instantly view your VIT SGPA, cumulative CGPA, and equivalent percentage (CGPA × 10).' }
    ],
    faqs: [
      { question: 'What grade points are assigned to S and A grades in VIT?', answer: 'In VIT, S grade equals 10 grade points, A grade equals 9, B equals 8, C equals 7, D equals 6, E equals 4, and F/N equals 0.' },
      { question: 'What is the official VIT formula for percentage from CGPA?', answer: 'VIT degree certificates certify that Equivalent Percentage = CGPA × 10.' },
      { question: 'What is the minimum CGPA required for 9-pointers in VIT?', answer: 'A CGPA of 9.00 and above gives students "9-pointer" privileges at VIT, including 100% attendance flexibility for classes.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'cgpa-to-percentage-calculator', 'attendance-percentage-calculator']
  },

  // 3. KTU CGPA Calculator
  {
    id: 'ktu-cgpa-calculator',
    slug: 'ktu-cgpa-calculator',
    name: 'KTU CGPA Calculator (APJ Abdul Kalam Technological University)',
    shortName: 'KTU CGPA Calculator',
    toolType: 'cgpa',
    universityKey: 'ktu',
    badge: 'KTU Kerala B.Tech',
    title: 'KTU CGPA Calculator - Kerala Technological University SGPA & CGPA',
    metaDescription: 'KTU CGPA calculator with official KTU Kerala B.Tech grading scale (O, A+, A=8.5, B+, B, C, P). Accurate percentage conversion with KTU formula.',
    keywords: ['ktu cgpa calculator', 'cgpa calculator ktu', 'ktu sgpa calculator', 'ktu percentage calculator', 'ktu grade points'],
    summary: 'Official KTU B.Tech CGPA and SGPA calculator incorporating the 8.5 grade point for grade A and the verified Kerala Technological University percentage formula: (10 × CGPA) - 3.75.',
    formulaDisplay: '\\text{Percentage} = (10 \\times \\text{CGPA}) - 3.75',
    verifiedFormulaText: 'Percentage = (10 × CGPA) - 3.75 | KTU Grade Scale: O:10, A+:9, A:8.5, B+:8, B:7, C:6, P:5, F:0',
    howToUse: [
      { stepNumber: 1, title: 'Add KTU Subjects', description: 'Add your semester subjects with KTU credit values (e.g. 4 for core math, 3 for departmental courses).' },
      { stepNumber: 2, title: 'Select KTU Grades', description: 'Choose O, A+, A, B+, B, C, or P grades.' },
      { stepNumber: 3, title: 'Calculate', description: 'View your accurate KTU SGPA and official percentage based on the university formula.' }
    ],
    faqs: [
      { question: 'Why does KTU award 8.5 points for Grade A?', answer: 'Under the KTU B.Tech academic ordinance, Grade A (80% to <85%) carries 8.5 grade points, while Grade A+ carries 9.0 points and Grade O carries 10.0 points.' },
      { question: 'What is the official KTU percentage conversion formula?', answer: 'The official KTU formula certified on grade cards is: Equivalent Percentage (%) = (10 × CGPA) - 3.75.' },
      { question: 'What is the minimum CGPA for KTU First Class with Distinction?', answer: 'Students who acquire a CGPA of 8.0 and above without any history of backlogs or supplementary exams graduate with First Class with Distinction.' }
    ],
    relatedSlugs: ['ktu-sgpa-calculator', 'cgpa-to-percentage-calculator', 'cgpa-calculator']
  },

  // 4. VTU CGPA Calculator
  {
    id: 'vtu-cgpa-calculator',
    slug: 'vtu-cgpa-calculator',
    name: 'VTU CGPA Calculator (Visvesvaraya Technological University)',
    shortName: 'VTU CGPA Calculator',
    toolType: 'cgpa',
    universityKey: 'vtu',
    badge: 'VTU Belagavi CBCS',
    title: 'VTU CGPA Calculator - Calculate VTU SGPA & Percentage Online',
    metaDescription: 'VTU CGPA calculator for CBCS engineering schemes. Features VTU grade points, semester credits, and official VTU percentage formula (CGPA - 0.75) × 10.',
    keywords: ['vtu cgpa calculator', 'cgpa calculator vtu', 'vtu sgpa calculator', 'vtu cgpa to percentage', 'vtu grading system'],
    summary: 'Designed for VTU Belagavi engineering students. Complies with VTU 2018, 2021, and 2022 CBCS regulations and the official degree certificate percentage formula: (CGPA - 0.75) × 10.',
    formulaDisplay: '\\text{Percentage} = (\\text{CGPA} - 0.75) \\times 10',
    verifiedFormulaText: 'Percentage = (CGPA - 0.75) × 10 | VTU Scale: O:10, A+:9, A:8, B+:7, B:6, C:5, P:4, F:0',
    howToUse: [
      { stepNumber: 1, title: 'Enter VTU Scheme', description: 'Input your semester-wise credits or individual subject grade points.' },
      { stepNumber: 2, title: 'Select Grades', description: 'Pick grades from O (10) down to P (4) or F (0).' },
      { stepNumber: 3, title: 'Instant Calculation', description: 'See your exact VTU CGPA, equivalent percentage, and class classification.' }
    ],
    faqs: [
      { question: 'What is the official VTU formula for converting CGPA to percentage?', answer: 'The official VTU Belagavi formula printed on CBCS transcripts is: Percentage = (CGPA - 0.75) × 10.' },
      { question: 'What is the passing grade in VTU CBCS?', answer: 'The passing grade in VTU CBCS is P (4 grade points). Any score below 40 marks yields an F grade (0 points).' },
      { question: 'What CGPA is required for First Class in VTU?', answer: 'VTU classifies CGPA >= 7.75 as First Class with Distinction, and 6.75 to 7.74 as First Class.' }
    ],
    relatedSlugs: ['vtu-sgpa-calculator', 'cgpa-to-percentage-calculator', 'cgpa-calculator']
  },

  // 5. Anna University CGPA Calculator
  {
    id: 'anna-university-cgpa-calculator',
    slug: 'anna-university-cgpa-calculator',
    name: 'Anna University CGPA Calculator (Regulation 2021 / 2017)',
    shortName: 'Anna University CGPA',
    toolType: 'cgpa',
    universityKey: 'anna-university',
    badge: 'Anna University Regulation 2021',
    title: 'Anna University CGPA Calculator - Regulation 2021 / 2017',
    metaDescription: 'Anna University CGPA & GPA calculator for Regulation 2021 & 2017 B.E. / B.Tech courses. Supports O, A+, A, B+, B, C grades and live percentage.',
    keywords: ['cgpa calculator anna university', 'anna university cgpa calculator', 'anna university gpa calculator', 'anna university percentage calculator'],
    summary: 'Tailored for Anna University affiliated colleges under Regulation 2021 and 2017. Supports O (10), A+ (9), A (8), B+ (7), B (6), C (5), RA (0) and calculates percentage as CGPA × 10.',
    formulaDisplay: '\\text{CGPA} = \\frac{\\sum (GP_i \\times C_i)}{\\sum C_i}, \\quad \\% = \\text{CGPA} \\times 10',
    verifiedFormulaText: 'CGPA = Sum(GP × Credits) / Total Credits | Percentage = CGPA × 10',
    howToUse: [
      { stepNumber: 1, title: 'Enter Subjects', description: 'Enter credits for each theory and lab course (typically 3 or 4 for theory, 2 for labs).' },
      { stepNumber: 2, title: 'Select Letter Grade', description: 'Select Anna University grades O, A+, A, B+, B, or C.' },
      { stepNumber: 3, title: 'View GPA / CGPA', description: 'Get verified Anna University GPA and overall degree percentage instantly.' }
    ],
    faqs: [
      { question: 'What do RA and SA stand for in Anna University grade sheets?', answer: 'RA stands for Re-Appearance (failed), while SA stands for Shortage of Attendance (prevented from taking the semester exam).' },
      { question: 'How is percentage calculated from CGPA in Anna University?', answer: 'Under Anna University Regulation 2021, the percentage of marks is calculated as: Percentage = CGPA × 10.' },
      { question: 'What are the credit requirements for Anna University B.E./B.Tech?', answer: 'Under Regulation 2021, students must earn approximately 160 to 165 total credits over 8 semesters to qualify for the engineering degree.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'cgpa-to-percentage-calculator', 'attendance-percentage-calculator']
  },

  // 6. SGPA Calculator (Master)
  {
    id: 'sgpa-calculator',
    slug: 'sgpa-calculator',
    name: 'SGPA Calculator (Semester Grade Point Average)',
    shortName: 'SGPA Calculator',
    toolType: 'sgpa',
    universityKey: 'universal',
    badge: 'Semester GPA CBCS',
    title: 'SGPA Calculator - Calculate Semester GPA with Credits & Grades',
    metaDescription: 'Free online SGPA calculator. Enter course credits and letter grades to calculate semester grade point average instantly with percentage equivalence.',
    keywords: ['sgpa calculator', 'calculate sgpa', 'sgpa to percentage', 'semester gpa calculator', 'sgpa formula'],
    summary: 'Calculate your Semester Grade Point Average (SGPA) for any degree course. Add your subjects, select letter grades and course credits, and view weighted grade point breakdown.',
    formulaDisplay: '\\text{SGPA} = \\frac{\\sum (\\text{Grade Point}_i \\times \\text{Credit}_i)}{\\sum \\text{Credit}_i}',
    verifiedFormulaText: 'SGPA = Sum of (Grade Point × Credit) / Total Semester Credits',
    howToUse: [
      { stepNumber: 1, title: 'Add Courses', description: 'Add all subjects taken during the current semester.' },
      { stepNumber: 2, title: 'Input Credits & Grades', description: 'Set course credit weights and earned letter grades or points.' },
      { stepNumber: 3, title: 'View Results', description: 'View total credits registered, earned credits, SGPA, and semester percentage.' }
    ],
    faqs: [
      { question: 'How is SGPA calculated?', answer: 'Multiply the grade point obtained in each subject by its credit value, sum all these products, and divide by the total number of credits for the semester.' },
      { question: 'Do failed subjects count towards SGPA?', answer: 'Yes. The credits for failed subjects (0 points) are included in the denominator (total registered credits), which lowers your SGPA.' },
      { question: 'Can SGPA be converted into CGPA?', answer: 'Yes. By taking the credit-weighted average of all your semester SGPAs, you can calculate your overall CGPA.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'sgpa-to-cgpa-calculator', 'cgpa-to-percentage-calculator']
  },

  // 7. KTU SGPA Calculator
  {
    id: 'ktu-sgpa-calculator',
    slug: 'ktu-sgpa-calculator',
    name: 'KTU SGPA Calculator (Semester GPA for KTU Kerala)',
    shortName: 'KTU SGPA Calculator',
    toolType: 'sgpa',
    universityKey: 'ktu',
    badge: 'KTU Kerala Semester GPA',
    title: 'KTU SGPA Calculator - APJ Abdul Kalam Tech University GPA',
    metaDescription: 'Calculate KTU SGPA online with official KTU Kerala B.Tech grading system. Add subjects, credits, and grades (O, A+, A=8.5, B+, B, C, P).',
    keywords: ['ktu sgpa calculator', 'sgpa calculator ktu', 'ktu semester calculator', 'ktu gpa calculator'],
    summary: 'Tailored for KTU B.Tech students. Uses official KTU credit structures and grade points including the specific 8.5 weighting for grade A.',
    formulaDisplay: '\\text{SGPA} = \\frac{\\sum (GP_i \\times C_i)}{\\sum C_i}, \\quad \\text{where } A = 8.5',
    verifiedFormulaText: 'SGPA = Sum(GP × Credits) / Total Credits with KTU Grade Scale',
    howToUse: [
      { stepNumber: 1, title: 'Add Semester Subjects', description: 'Add your theory subjects and practical labs.' },
      { stepNumber: 2, title: 'Enter KTU Grades', description: 'Choose O (10), A+ (9), A (8.5), B+ (8), B (7), C (6), or P (5).' },
      { stepNumber: 3, title: 'Calculate SGPA', description: 'Get your exact KTU semester grade point average and equivalent percentage.' }
    ],
    faqs: [
      { question: 'What is a good SGPA in KTU?', answer: 'An SGPA of 8.0 and above is considered very good in KTU and puts students on track for First Class with Distinction.' },
      { question: 'How does a P grade affect KTU SGPA?', answer: 'A P grade awards 5 grade points (passing marks between 45% and 50%), which satisfies course requirements but lowers overall SGPA compared to higher letter grades.' }
    ],
    relatedSlugs: ['ktu-cgpa-calculator', 'sgpa-calculator', 'sgpa-to-cgpa-calculator']
  },

  // 8. VTU SGPA Calculator
  {
    id: 'vtu-sgpa-calculator',
    slug: 'vtu-sgpa-calculator',
    name: 'VTU SGPA Calculator (VTU Belagavi Semester GPA)',
    shortName: 'VTU SGPA Calculator',
    toolType: 'sgpa',
    universityKey: 'vtu',
    badge: 'VTU CBCS Semester GPA',
    title: 'VTU SGPA Calculator - Calculate VTU Semester GPA Online',
    metaDescription: 'Free VTU SGPA calculator for VTU engineering students. Calculate semester GPA with VTU CBCS credit weights and letter grades.',
    keywords: ['vtu sgpa calculator', 'sgpa calculator vtu', 'vtu semester gpa', 'vtu gpa calculator'],
    summary: 'Calculate semester GPA for Visvesvaraya Technological University (VTU) CBCS curriculum. Accurately factors in course credits, labs, and internships.',
    formulaDisplay: '\\text{SGPA} = \\frac{\\sum (GP_i \\times C_i)}{\\sum C_i}',
    verifiedFormulaText: 'VTU SGPA = Sum(Grade Point × Credit) / Total Registered Credits',
    howToUse: [
      { stepNumber: 1, title: 'Select Courses', description: 'Add your semester subjects and assign their credit weights (typically 3, 4, or 1.5).' },
      { stepNumber: 2, title: 'Pick VTU Grades', description: 'Select O, A+, A, B+, B, C, or P.' },
      { stepNumber: 3, title: 'Compute', description: 'Instantly view VTU SGPA and semester percentage.' }
    ],
    faqs: [
      { question: 'How is VTU SGPA converted to percentage?', answer: 'The official VTU percentage formula for CBCS is: Percentage = (SGPA - 0.75) × 10.' },
      { question: 'What is the credit weight for VTU labs and mini-projects?', answer: 'In VTU CBCS schemes, laboratory courses usually carry 1.5 or 2 credits, while major projects carry 8 to 10 credits.' }
    ],
    relatedSlugs: ['vtu-cgpa-calculator', 'sgpa-calculator', 'sgpa-to-cgpa-calculator']
  },

  // 9. AKTU SGPA Calculator
  {
    id: 'aktu-sgpa-calculator',
    slug: 'aktu-sgpa-calculator',
    name: 'AKTU SGPA Calculator (Dr. APJ Abdul Kalam Technical University)',
    shortName: 'AKTU SGPA Calculator',
    toolType: 'sgpa',
    universityKey: 'aktu',
    badge: 'AKTU Lucknow CBCS',
    title: 'AKTU SGPA Calculator - Calculate UPTU / AKTU Semester GPA',
    metaDescription: 'AKTU SGPA calculator for Dr. APJ Abdul Kalam Technical University (UPTU) B.Tech students. Features AKTU grading scale and official percentage formula.',
    keywords: ['aktu sgpa calculator', 'sgpa calculator aktu', 'aktu gpa calculator', 'aktu cgpa calculator', 'uptu sgpa calculator'],
    summary: 'Calculates Semester Grade Point Average for AKTU (formerly UPTU) engineering and management colleges using the official 10-point scale: A+ (10), A (9), B+ (8), B (7), C+ (6), C (5), D (4), F (0).',
    formulaDisplay: '\\text{SGPA} = \\frac{\\sum (GP_i \\times C_i)}{\\sum C_i}, \\quad \\% = (\\text{SGPA} - 0.75) \\times 10',
    verifiedFormulaText: 'AKTU SGPA = Sum(GP × Credit) / Total Credits | % = (SGPA - 0.75) × 10',
    howToUse: [
      { stepNumber: 1, title: 'Add Semester Papers', description: 'Enter credits for each theory and practical subject.' },
      { stepNumber: 2, title: 'Choose AKTU Grades', description: 'Select A+, A, B+, B, C+, C, D, or F.' },
      { stepNumber: 3, title: 'Get Result', description: 'View AKTU SGPA, earned credits, and equivalent marks percentage.' }
    ],
    faqs: [
      { question: 'What is the minimum grade to pass in AKTU?', answer: 'Grade D (4 grade points) is the minimum passing grade in AKTU examinations.' },
      { question: 'What is the AKTU percentage formula?', answer: 'According to AKTU notifications, Percentage = (SGPA or CGPA - 0.75) × 10.' }
    ],
    relatedSlugs: ['sgpa-calculator', 'sgpa-to-cgpa-calculator', 'cgpa-to-percentage-calculator']
  },

  // 10. SGPA to CGPA Calculator
  {
    id: 'sgpa-to-cgpa-calculator',
    slug: 'sgpa-to-cgpa-calculator',
    name: 'SGPA to CGPA Calculator (Multi-Semester Converter)',
    shortName: 'SGPA to CGPA',
    toolType: 'sgpa-to-cgpa',
    universityKey: 'universal',
    badge: 'Semester Aggregator',
    title: 'SGPA to CGPA Calculator - Convert Semester SGPA to CGPA Online',
    metaDescription: 'Free online SGPA to CGPA calculator. Convert semester-wise SGPA into cumulative CGPA with equal credits or custom credit weights per semester.',
    keywords: ['sgpa to cgpa calculator', 'convert sgpa to cgpa', 'semester sgpa to cgpa', 'sgpa into cgpa', 'how to convert sgpa to cgpa'],
    summary: 'Converts semester-wise SGPA scores into overall cumulative CGPA. Supports standard equal-credit weighting or customized credit hours per semester for exact academic transcripts.',
    formulaDisplay: '\\text{CGPA} = \\frac{\\sum (\\text{SGPA}_k \\times C_k)}{\\sum C_k}',
    verifiedFormulaText: 'CGPA = Sum of (SGPA × Semester Credits) / Total Credits of all semesters',
    howToUse: [
      { stepNumber: 1, title: 'Choose Number of Semesters', description: 'Select how many semesters (from 1 to 8 or 10) you have completed.' },
      { stepNumber: 2, title: 'Enter Semester SGPAs', description: 'Input your SGPA for each semester. Optionally adjust credit weights if semesters have different total credits.' },
      { stepNumber: 3, title: 'View Cumulative CGPA', description: 'See your cumulative CGPA trajectory semester-by-semester and final degree classification.' }
    ],
    faqs: [
      { question: 'Can I simply average my SGPAs to find CGPA?', answer: 'If all semesters have the exact same number of total credits, a simple average will match CGPA. However, if semesters have different credit counts, you must use weighted credit summation.' },
      { question: 'How do I convert SGPA to CGPA for 4 semesters?', answer: 'Multiply each of the 4 semester SGPAs by their respective semester credits, add them together, and divide by the sum of credits across the 4 semesters.' },
      { question: 'What is a 8.5 CGPA in percentage?', answer: 'Under the standard AICTE formula (× 9.5), 8.5 CGPA equals 80.75%. Under universities with 10× multiplier, it equals 85.0%.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'sgpa-calculator', 'cgpa-to-percentage-calculator']
  },

  // 11. CGPA to Percentage Calculator
  {
    id: 'cgpa-to-percentage-calculator',
    slug: 'cgpa-to-percentage-calculator',
    name: 'CGPA to Percentage Calculator (All Indian Universities)',
    shortName: 'CGPA to Percentage',
    toolType: 'cgpa-to-percentage',
    universityKey: 'universal',
    badge: 'CBSE, VTU, KTU, Anna Uni & AICTE',
    title: 'CGPA to Percentage Calculator - Convert CGPA to % Online',
    metaDescription: 'Accurate CGPA to Percentage converter for CBSE, AICTE, VTU, KTU, Anna University, and Mumbai University. Two-way conversion with official formulas.',
    keywords: ['cgpa to percentage calculator', 'vtu cgpa to percentage', 'ktu cgpa to percentage', 'anna university cgpa to percentage', 'cbse cgpa to percentage', 'percentage to cgpa'],
    summary: 'Two-way calculator to convert CGPA to Percentage and Percentage to CGPA using official university-specific conversion formulas certified on degree transcripts.',
    formulaDisplay: '\\text{AICTE: } \\% = \\text{CGPA} \\times 9.5, \\quad \\text{VTU: } \\% = (\\text{CGPA} - 0.75) \\times 10, \\quad \\text{KTU: } \\% = 10 \\times \\text{CGPA} - 3.75',
    verifiedFormulaText: 'Multiple certified formulas: AICTE (×9.5), VTU ((CGPA-0.75)×10), KTU (10×CGPA-3.75), Anna Uni (×10)',
    howToUse: [
      { stepNumber: 1, title: 'Select University / Board', description: 'Pick CBSE/AICTE, VTU, KTU, Anna University, AKTU, or standard 10-point scale.' },
      { stepNumber: 2, title: 'Enter Value', description: 'Enter your CGPA (0 to 10) or switch to reverse mode to enter percentage (0 to 100%).' },
      { stepNumber: 3, title: 'Instant Conversion', description: 'View equivalent score, formula steps, and honours division status.' }
    ],
    faqs: [
      { question: 'Why does CBSE multiply CGPA by 9.5?', answer: 'CBSE analyzed the average percentage of marks obtained by the top 500 candidates scoring grade points 10, 9, 8, etc., over multiple board exam years and arrived at 9.5 as the statistically closest linear multiplier.' },
      { question: 'How to convert KTU CGPA to percentage?', answer: 'Multiply your KTU CGPA by 10 and subtract 3.75. For example, a CGPA of 8.0 = (10 × 8.0) - 3.75 = 76.25%.' },
      { question: 'How to convert VTU CGPA to percentage?', answer: 'Subtract 0.75 from your VTU CGPA and multiply by 10. For example, a CGPA of 8.0 = (8.0 - 0.75) × 10 = 72.5%.' },
      { question: 'Can I convert Percentage back to CGPA?', answer: 'Yes! Use the reverse converter on this page to calculate your equivalent CGPA from your board or degree percentage.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'marks-percentage-calculator', 'sgpa-to-cgpa-calculator']
  },

  // 12. Marks Percentage Calculator
  {
    id: 'marks-percentage-calculator',
    slug: 'marks-percentage-calculator',
    name: 'Marks Percentage Calculator & Target Score Planner',
    shortName: 'Marks Percentage',
    toolType: 'marks-percentage',
    badge: '10th, 12th & College Marks',
    title: 'Marks Percentage Calculator - Calculate % & Target Marks Planner',
    metaDescription: 'Free online marks percentage calculator for 10th, 12th board exams and college. Includes multi-subject table, division classifier, and target score planner.',
    keywords: ['marks percentage calculator', '12th marks percentage calculator', 'percentage calculator for marks', 'target score planner', 'calculate marks percentage'],
    summary: 'Calculate overall marks percentage for school boards (CBSE, ICSE, State Boards) and college exams. Features a multi-subject breakdown, division classifier, and an interactive Target Score Planner to find marks needed on upcoming tests.',
    formulaDisplay: '\\text{Percentage} = \\left(\\frac{\\text{Obtained Marks}}{\\text{Total Maximum Marks}}\\right) \\times 100',
    verifiedFormulaText: 'Percentage = (Total Marks Obtained / Total Maximum Marks) × 100',
    howToUse: [
      { stepNumber: 1, title: 'Simple or Subject-Wise', description: 'Enter your total obtained and maximum marks, or add individual subjects with custom names and passing marks.' },
      { stepNumber: 2, title: 'View Academic Standing', description: 'Instantly view overall percentage, division (Distinction, 1st, 2nd, 3rd), and subject pass/fail status.' },
      { stepNumber: 3, title: 'Plan Future Target', description: 'Enter a desired target percentage and remaining exam marks to find exactly what marks you need to score.' }
    ],
    faqs: [
      { question: 'How is marks percentage calculated?', answer: 'Divide the total marks you obtained by the total maximum possible marks, and multiply the result by 100.' },
      { question: 'What is the cutoff percentage for First Division?', answer: 'In Indian educational boards and universities, 60% and above is classified as First Division, while 75% and above is Distinction.' },
      { question: 'How does the Target Score Planner work?', answer: 'It calculates the total marks required across your entire course to reach your target percentage, subtracts your current obtained marks, and shows the exact score needed in remaining assessments.' }
    ],
    relatedSlugs: ['cgpa-to-percentage-calculator', 'attendance-percentage-calculator', 'cgpa-calculator']
  },

  // 13. Attendance Calculator
  {
    id: 'attendance-percentage-calculator',
    slug: 'attendance-percentage-calculator',
    name: 'Attendance Percentage & Safe Bunk Calculator',
    shortName: 'Attendance Calculator',
    toolType: 'attendance',
    badge: 'Bunk & Shortage Planner',
    title: 'Attendance Calculator - Safe Bunks & 75% Attendance Planner',
    metaDescription: 'Calculate attendance percentage, safe bunks available, and consecutive classes required to reach 75%, 80%, or 85% attendance criteria online.',
    keywords: ['attendance percentage calculator', 'attendance calculator', 'bunk calculator', '75 attendance calculator', 'safe bunk calculator'],
    summary: 'College attendance and safe bunk planner. Determines your exact attendance percentage, how many classes you can safely skip without falling below 75%, or how many consecutive classes you must attend to cure attendance shortage.',
    formulaDisplay: '\\text{Current } \\% = \\left(\\frac{\\text{Attended}}{\\text{Total}}\\right) \\times 100, \\quad \\text{Bunks} = \\left\\lfloor \\frac{100 \\times A - T \\times \\text{Total}}{T} \\right\\rfloor',
    verifiedFormulaText: 'Classes to attend = ceil((Target × Total - 100 × Attended) / (100 - Target)) | Safe Bunks = floor((100 × Attended - Target × Total) / Target)',
    howToUse: [
      { stepNumber: 1, title: 'Enter Attendance Figures', description: 'Enter the number of classes attended and total classes conducted so far.' },
      { stepNumber: 2, title: 'Select Minimum Requirement', description: 'Choose your college requirement: 75% (standard UGC), 80%, 85%, or a custom percentage.' },
      { stepNumber: 3, title: 'View Action Plan', description: 'See how many safe bunks you have left, or the exact number of consecutive classes required to reach eligibility.' }
    ],
    faqs: [
      { question: 'How is attendance percentage calculated?', answer: 'Attendance % = (Classes Attended / Total Classes Conducted) × 100.' },
      { question: 'How do I calculate how many classes I can bunk?', answer: 'If your current attendance is above the required percentage (e.g. 75%), Safe Bunks = floor((100 × Attended - 75 × Total) / 75).' },
      { question: 'How do I recover from an attendance shortage below 75%?', answer: 'To reach 75%, the number of consecutive classes you must attend without missing any is: ceil((75 × Total - 100 × Attended) / (100 - 75)).' },
      { question: 'What is the mandatory attendance rule in Indian engineering colleges?', answer: 'Most universities (including Anna University, VTU, KTU, and Mumbai University) mandate a minimum of 75% attendance to be eligible for end-semester examinations.' }
    ],
    relatedSlugs: ['cgpa-calculator', 'marks-percentage-calculator', 'sgpa-calculator']
  },

  // 14. Percentile Calculator (Universal)
  {
    id: 'percentile-calculator',
    slug: 'percentile-calculator',
    name: 'Percentile & Rank Calculator (Two-Way Converter)',
    shortName: 'Percentile Calculator',
    toolType: 'percentile',
    examKey: 'universal',
    badge: 'Universal Rank & Percentile',
    title: 'Percentile Calculator - Convert Rank to Percentile & Rank Online',
    metaDescription: 'Free online Percentile Calculator. Convert Rank to Percentile or Percentile to All India Rank for competitive exams like JEE, NEET, CAT, and CET.',
    keywords: ['percentile calculator', 'rank to percentile', 'percentile to rank', 'calculate percentile', 'percentile formula'],
    summary: 'Two-way rank and percentile calculator. Enter your rank and total candidates to compute your exact percentile, or input your percentile to calculate your estimated All India Rank.',
    formulaDisplay: '\\text{Percentile} = \\left(1 - \\frac{\\text{Rank} - 1}{N}\\right) \\times 100, \\quad \\text{Rank} = \\left(1 - \\frac{\\text{Percentile}}{100}\\right) \\times N + 1',
    verifiedFormulaText: 'Percentile = (1 - (Rank - 1) / N) × 100 | Rank = round((1 - Percentile / 100) × N + 1)',
    howToUse: [
      { stepNumber: 1, title: 'Choose Mode', description: 'Select Rank to Percentile or Percentile to Rank conversion.' },
      { stepNumber: 2, title: 'Input Candidate Count', description: 'Enter the total number of appearing candidates in your exam (e.g. 14,50,000 for JEE Main, 3,30,000 for CAT).' },
      { stepNumber: 3, title: 'Get Result', description: 'Instantly view your 4-decimal precision percentile or estimated All India Rank.' }
    ],
    faqs: [
      { question: 'What does a 99 percentile mean?', answer: 'A 99 percentile means you scored equal to or higher than 99% of all candidates who appeared for that examination.' },
      { question: 'How is rank calculated from percentile?', answer: 'Rank = (1 - (Percentile / 100)) × Total Candidates + 1. For example, in an exam with 10,00,000 candidates, a 99 percentile yields Rank = 10,001.' },
      { question: 'What is the difference between percentage and percentile?', answer: 'Percentage indicates the proportion of marks you scored out of total marks, whereas percentile indicates your relative position among all examinees.' }
    ],
    relatedSlugs: ['jee-main-percentile-calculator', 'cat-percentile-calculator', 'mht-cet-percentile-calculator']
  },

  // 15. JEE Main Percentile Calculator
  {
    id: 'jee-main-percentile-calculator',
    slug: 'jee-main-percentile-calculator',
    name: 'JEE Main Marks vs Percentile & Rank Calculator',
    shortName: 'JEE Main Percentile',
    toolType: 'percentile',
    examKey: 'jee-main',
    badge: 'NTA JEE Main 2026/2025',
    title: 'JEE Main Marks vs Percentile Calculator - Rank Predictor',
    metaDescription: 'Predict your JEE Main 2026 / 2025 percentile and All India Rank from expected marks out of 300. Based on official NTA score normalization data.',
    keywords: ['jee main percentile calculator', 'jee percentile calculator', 'jee marks vs percentile', 'jee rank predictor', 'jee main 2026 percentile'],
    summary: 'Predict your JEE Main percentile and All India Rank based on your expected raw score out of 300. Calibrated using official NTA Session 1 & Session 2 normalized distributions over 14.5 lakh candidates.',
    formulaDisplay: '\\text{Score out of 300} \\longrightarrow \\text{Normalized Percentile} \\longrightarrow \\text{Estimated AIR}',
    verifiedFormulaText: 'Calibrated against 14.5L candidates across NTA shift difficulties',
    howToUse: [
      { stepNumber: 1, title: 'Enter Expected Score', description: 'Input your raw score out of 300 marks calculated from the official answer key.' },
      { stepNumber: 2, title: 'Inspect Percentile Range', description: 'View your projected percentile range (e.g. 99.2% to 99.6%) and estimated All India Rank bracket.' },
      { stepNumber: 3, title: 'Check College Prospects', description: 'See potential eligibility for Top NITs, IIITs, GFTIs, and JEE Advanced qualification.' }
    ],
    faqs: [
      { question: 'How many marks are needed for 99 percentile in JEE Main?', answer: 'Historically, a score between 185 and 215 marks (depending on session shift difficulty) secures a 99+ percentile in JEE Main.' },
      { question: 'What is the qualifying percentile for JEE Advanced?', answer: 'For the General (UR) category, the JEE Advanced cutoff is typically around 90.5 to 93.2 percentile, representing approximately 135 to 140 marks.' },
      { question: 'How does NTA normalize JEE Main percentiles across shifts?', answer: 'NTA calculates percentile separately for each exam shift based on candidate counts scoring equal to or less than a given raw mark, ensuring fair comparison across easy and tough sessions.' }
    ],
    relatedSlugs: ['percentile-calculator', 'cat-percentile-calculator', 'mht-cet-percentile-calculator']
  },

  // 16. CAT Percentile Calculator
  {
    id: 'cat-percentile-calculator',
    slug: 'cat-percentile-calculator',
    name: 'CAT Score vs Percentile Calculator (IIM Predictor)',
    shortName: 'CAT Percentile',
    toolType: 'percentile',
    examKey: 'cat',
    badge: 'IIM CAT 2025/2026',
    title: 'CAT Percentile Calculator - Score vs Percentile & IIM Predictor',
    metaDescription: 'CAT score vs percentile calculator for MBA aspirants. Enter your raw score out of 198 to predict your CAT percentile and IIM call eligibility.',
    keywords: ['cat percentile calculator', 'cat score vs percentile', 'cat marks vs percentile', 'iim call predictor', 'cat 2025 percentile'],
    summary: 'Calculate your estimated CAT percentile from your raw score across VARC, DILR, and QA (total 198 marks). Calibrated against 3.3 lakh test-takers and IIM interview call cutoffs.',
    formulaDisplay: '\\text{Raw Score (out of 198)} \\longrightarrow \\text{Sectional & Overall Percentile} \\longrightarrow \\text{IIM Calls}',
    verifiedFormulaText: 'Calibrated against 3.3L test takers across slots 1, 2, and 3',
    howToUse: [
      { stepNumber: 1, title: 'Input CAT Score', description: 'Enter your overall raw score out of 198 marks (or sectional sums).' },
      { stepNumber: 2, title: 'Calculate Percentile', description: 'Review estimated percentile range and All India rank bracket.' },
      { stepNumber: 3, title: 'Explore B-School Calls', description: 'Check indicative eligibility for IIM Ahmedabad, Bangalore, Calcutta, Lucknow, and top non-IIMs like FMS, SPJIMR, and MDI.' }
    ],
    faqs: [
      { question: 'What score is required for 99 percentile in CAT?', answer: 'Generally, an overall raw score of 76 to 82 marks out of 198 (around 40% of total marks) yields a 99+ percentile in CAT.' },
      { question: 'What score is needed for 95 percentile in CAT?', answer: 'A score of around 54 to 58 marks typically secures a 95 percentile in CAT, opening calls for new and baby IIMs.' },
      { question: 'How is CAT scaled score calculated from raw score?', answer: 'IIMs apply slot-wise psychometric normalization to raw marks to equalize difficulty variances across morning, afternoon, and evening slots.' }
    ],
    relatedSlugs: ['percentile-calculator', 'jee-main-percentile-calculator', 'mht-cet-percentile-calculator']
  },

  // 17. MHT CET Percentile Calculator
  {
    id: 'mht-cet-percentile-calculator',
    slug: 'mht-cet-percentile-calculator',
    name: 'MHT CET Percentile Calculator (PCM & PCB)',
    shortName: 'MHT CET Percentile',
    toolType: 'percentile',
    examKey: 'mht-cet-pcm',
    badge: 'Maharashtra CET Cell 2026',
    title: 'MHT CET Percentile Calculator - Score vs Percentile & Rank',
    metaDescription: 'MHT CET marks vs percentile calculator for engineering (PCM) and pharmacy (PCB). Predict your MHT CET percentile and rank out of 200 marks.',
    keywords: ['mht cet percentile calculator', 'cet percentile calculator', 'mht cet marks vs percentile', 'mht cet rank predictor', 'cet score vs percentile'],
    summary: 'Predict your MHT CET percentile and state general merit rank for Engineering (PCM) or Pharmacy/Agriculture (PCB) from your raw score out of 200.',
    formulaDisplay: '\\text{MHT CET Score (out of 200)} \\longrightarrow \\text{Normalized Percentile} \\longrightarrow \\text{State Merit Rank}',
    verifiedFormulaText: 'Calibrated for PCM (4.1L candidates) & PCB (3.3L candidates)',
    howToUse: [
      { stepNumber: 1, title: 'Select Stream', description: 'Choose PCM group (Engineering) or PCB group (Pharmacy / Agriculture).' },
      { stepNumber: 2, title: 'Enter Marks', description: 'Enter your total marks out of 200.' },
      { stepNumber: 3, title: 'View Rank & Percentile', description: 'See your projected state percentile and target colleges like COEP, VJTI, SPIT, and PICT.' }
    ],
    faqs: [
      { question: 'What score is needed for 99 percentile in MHT CET PCM?', answer: 'A score of 150+ out of 200 marks usually secures a 99+ percentile in MHT CET PCM, qualifying for top branches in COEP and VJTI.' },
      { question: 'Does MHT CET have negative marking?', answer: 'No. MHT CET has no negative marking. In Mathematics, each question carries 2 marks, while Physics and Chemistry carry 1 mark per question.' },
      { question: 'How is MHT CET percentile calculated?', answer: 'The State CET Cell normalizes scores using the formula: Percentile = (100 × Candidates with score <= Raw Score) / Total Candidates in session.' }
    ],
    relatedSlugs: ['percentile-calculator', 'jee-main-percentile-calculator', 'marks-percentage-calculator']
  }
];

/* ==========================================================================
   Helper Lookup Functions
   ========================================================================== */

export function getAcademicCalculatorBySlug(slug: string): AcademicCalculatorMeta | undefined {
  return ACADEMIC_CALCULATORS.find((calc) => calc.slug === slug);
}

export function getAcademicCalculatorsByType(type: AcademicToolType): AcademicCalculatorMeta[] {
  return ACADEMIC_CALCULATORS.filter((calc) => calc.toolType === type);
}

export function getAllAcademicCalculatorSlugs(): string[] {
  return ACADEMIC_CALCULATORS.map((calc) => calc.slug);
}
