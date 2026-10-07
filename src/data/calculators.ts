export interface CalculatorInput {
  id: string;
  name: string;
  shortLabel: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  unit?: string;
  hint?: string;
}

interface FormulaStep {
  stepNumber: number;
  title: string;
  description: string;
  formula: string;
  example: string;
}

export interface CutoffCalculator {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: 'Engineering' | 'Medical' | 'Agriculture' | 'State Entrance' | 'College/University Admission';
  categorySlug: string;
  exam: string;
  state: string;
  stateSlug: string;
  targetCourse: string;
  academicYear: string;
  conductingAuthority: string;
  authorityUrl?: string;
  maxScore: number;
  scoreUnit: string;
  summary: string;
  verifiedFormulaText: string;
  formulaDisplay: string;
  inputs: CalculatorInput[];
  formulaSteps: FormulaStep[];
  officialRules: string[];
  tieBreakingRules: string[];
  eligibilityCriteria?: string[];
  faqs: { question: string; answer: string }[];
  calculate: (values: Record<string, number>) => {
    totalCutoff: number;
    breakdown: { label: string; score: number; max: number; note: string }[];
    remarks: string;
    qualifyingStatus?: { isQualified: boolean; label: string; details: string };
  };
}

/**
 * The admission cycle every calculator on this site is published against.
 *
 * This is the single value that has to change when a new cycle opens. It is
 * referenced here once per record, and every page template reads it back out
 * of the registry (`CALCULATORS[0].academicYear`, `calculator.academicYear`),
 * so the hero badge, every page title, every meta description, the disclaimer
 * scope line and the sitemap all move together.
 *
 * Bump this ONE line to move the whole site to the next cycle.
 */
export const ACADEMIC_YEAR = '2025 - 2026';

/**
 * NEET UG marks that landed on the 50th percentile for the General (UR) / EWS
 * category. The NTA qualifying RULE (50th percentile General/EWS, 40th
 * OBC/SC/ST, 45th UR-PwD) is stable, but a percentile is a rank position, so the
 * MARKS that reach it move every year: 137 (2023), 162 (2024), 144 (2025),
 * 213 (2026).
 * Source: https://www.collegedekho.com/exam/neet-ug/cutoff
 *
 * IMPORTANT: every calculate() is serialised with Function.prototype.toString()
 * and rebuilt in the browser (CalculatorWidget.astro / HeroCalculator.astro), so
 * it cannot close over module scope. These values are therefore repeated as
 * literals inside calculate(); the test suite pins the two in sync.
 */
export const NEET_UR_50TH_PERCENTILE_2026 = 213;

/**
 * Approximate All India Quota (15%) General-category MBBS closing mark for the
 * 2025 cycle, used only as a named reference point for admission prospects.
 * Source: https://medicine.careers360.com/articles/neet-2025-cutoff-category-wise-rank-cut-off-mbbs-government-colleges
 */
export const NEET_AIQ_15_GENERAL_CLOSING_2025 = 525;

export const CALCULATORS: CutoffCalculator[] = [
  // 1. TNEA Tamil Nadu Engineering
  {
    id: 'tnea-engineering',
    slug: 'tnea-engineering-cutoff-calculator',
    name: 'TNEA Engineering Cutoff Calculator',
    shortName: 'TNEA Engineering',
    category: 'Engineering',
    categorySlug: 'engineering',
    exam: 'Tamil Nadu Engineering Admissions (TNEA) / TN 12th Board',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    targetCourse: 'B.E. / B.Tech Admissions',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Directorate of Technical Education (DoTE), Tamil Nadu',
    authorityUrl: 'https://www.tneaonline.org',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark engineering cutoff score for Anna University and affiliated engineering colleges in Tamil Nadu based on 12th standard Physics, Chemistry, and Mathematics marks.',
    verifiedFormulaText: 'Cutoff = Mathematics + (Physics / 2) + (Chemistry / 2)',
    formulaDisplay: 'Cutoff (out of 200) = Mathematics + (Physics / 2) + (Chemistry / 2)',
    inputs: [
      { id: 'maths', name: 'Mathematics Marks', shortLabel: 'Maths', min: 0, max: 100, step: 0.5, defaultValue: 90, unit: 'out of 100', hint: 'Enter 12th board marks in Mathematics (max 100)' },
      { id: 'physics', name: 'Physics Marks', shortLabel: 'Physics', min: 0, max: 100, step: 0.5, defaultValue: 85, unit: 'out of 100', hint: 'Enter 12th board marks in Physics (max 100)' },
      { id: 'chemistry', name: 'Chemistry Marks', shortLabel: 'Chemistry', min: 0, max: 100, step: 0.5, defaultValue: 88, unit: 'out of 100', hint: 'Enter 12th board marks in Chemistry (max 100)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Mathematics (100% Weightage)',
        description: 'Mathematics is taken as-is without any division.',
        formula: 'Maths Component = Maths Marks',
        example: 'If Maths = 95, component = 95'
      },
      {
        stepNumber: 2,
        title: 'Physics (50% Weightage)',
        description: 'Physics marks are reduced by half (divided by 2).',
        formula: 'Physics Component = Physics / 2',
        example: 'If Physics = 90, component = 45'
      },
      {
        stepNumber: 3,
        title: 'Chemistry (50% Weightage)',
        description: 'Chemistry marks are reduced by half (divided by 2).',
        formula: 'Chemistry Component = Chemistry / 2',
        example: 'If Chemistry = 88, component = 44'
      },
      {
        stepNumber: 4,
        title: 'Sum to 200',
        description: 'Add all three components together to get the final rank cutoff.',
        formula: 'Total = Maths + (Physics / 2) + (Chemistry / 2)',
        example: '95 + 45 + 44 = 184.00 / 200'
      }
    ],
    officialRules: [
      'Applicable for Tamil Nadu 12th State Board, CBSE, ICSE, and other recognized equivalent boards.',
      'If CBSE or other boards have total marks out of 100 per subject, enter them directly. If any subject was evaluated out of 200 or 50, normalize to 100 before applying.',
      'Minimum qualifying aggregate in PCM: General (OC) 45%, BC/BCM/MBC/DNC/SC/SCA/ST 40%.'
    ],
    tieBreakingRules: [
      '1. Percentage of marks in Mathematics',
      '2. Percentage of marks in Physics',
      '3. Percentage of marks in optional subject (Chemistry / Biology / Computer Science)',
      '4. Percentage of total marks in 12th Board Examination',
      '5. Candidate older in age will be ranked higher',
      '6. Random number assigned by TNEA (higher random number gets precedence)'
    ],
    eligibilityCriteria: [
      'General Category (OC): Minimum 45% average in Physics, Chemistry, and Mathematics.',
      'Reserved Categories (BC / BCM / MBC / DNC / SC / SCA / ST): Minimum 40% average in PCM.'
    ],
    faqs: [
      {
        question: 'What is a good TNEA cutoff for top colleges like CEG, MIT, or SSN?',
        answer: 'For tier-1 colleges like College of Engineering Guindy (CEG), MIT Chromepet, and PSG Tech in high-demand branches like Computer Science or AI&DS, the OC cutoff usually exceeds 195.0 to 198.5.'
      },
      {
        question: 'Are practical marks included in the subject marks?',
        answer: 'Yes, the total mark printed on your Class 12 mark sheet for each subject (Theory + Practical + Internal) out of 100 must be entered.'
      }
    ],
    calculate: (values) => {
      const maths = Math.min(100, Math.max(0, values.maths || 0));
      const physics = Math.min(100, Math.max(0, values.physics || 0));
      const chemistry = Math.min(100, Math.max(0, values.chemistry || 0));

      const pPart = physics / 2;
      const cPart = chemistry / 2;
      const total = Number((maths + pPart + cPart).toFixed(2));
      const pcmAverage = (maths + physics + chemistry) / 3;

      let qualifyingNote = 'Meets general PCM eligibility threshold (45%).';
      let isEligible = true;
      if (pcmAverage < 40) {
        qualifyingNote = 'Aggregate PCM is below the 40% minimum required by DoTE for all categories.';
        isEligible = false;
      } else if (pcmAverage < 45) {
        qualifyingNote = 'Aggregate PCM is between 40% and 45% (eligible for BC/MBC/SC/ST reserved categories in TN).';
      }

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Mathematics', score: maths, max: 100, note: '100% full weightage' },
          { label: 'Physics', score: Number(pPart.toFixed(2)), max: 50, note: 'Scaled to 50 marks (divided by 2)' },
          { label: 'Chemistry', score: Number(cPart.toFixed(2)), max: 50, note: 'Scaled to 50 marks (divided by 2)' }
        ],
        remarks: `Your official TNEA Engineering merit cutoff is ${total} out of 200. PCM average is ${pcmAverage.toFixed(2)}%.`,
        qualifyingStatus: {
          isQualified: isEligible,
          label: isEligible ? 'Eligible for TNEA Counseling' : 'Below Minimum Qualifying Marks',
          details: qualifyingNote
        }
      };
    }
  },

  // 2. TNAU Agriculture Cutoff (Tamil Nadu Agricultural University)
  {
    id: 'tnau-agriculture',
    slug: 'tnau-agriculture-cutoff-calculator',
    name: 'TNAU Agriculture Cutoff Calculator',
    shortName: 'TNAU Agriculture',
    category: 'Agriculture',
    categorySlug: 'agriculture',
    exam: 'Tamil Nadu Agricultural University (TNAU) Admissions / 12th Board',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    targetCourse: 'B.Sc. (Hons.) Agriculture & Allied Degrees',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Tamil Nadu Agricultural University, Coimbatore',
    authorityUrl: 'https://tnau.ac.in',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark agriculture merit cutoff for B.Sc. (Hons.) Agriculture, Horticulture, Forestry, and Food Nutrition admissions in TNAU and affiliated colleges.',
    verifiedFormulaText: 'Cutoff = (Physics / 2) + (Chemistry / 2) + (Biology / 2) + (4th Subject / 2) — Biology may be one 100-mark subject or the SUM of Botany + Zoology (out of 200)',
    formulaDisplay: 'Cutoff (out of 200) = (Physics + Chemistry + Biology (or Botany + Zoology) + Maths (or Computer Science)) / 2',
    inputs: [
      { id: 'physics', name: 'Physics Marks', shortLabel: 'Physics', min: 0, max: 100, step: 0.5, defaultValue: 88, unit: 'out of 100' },
      { id: 'chemistry', name: 'Chemistry Marks', shortLabel: 'Chemistry', min: 0, max: 100, step: 0.5, defaultValue: 86, unit: 'out of 100' },
      { id: 'biology', name: 'Biology Marks (or Botany + Zoology)', shortLabel: 'Biology / Botany+Zoology', min: 0, max: 200, step: 0.5, defaultValue: 92, unit: 'out of 200', hint: 'If Biology was one subject, enter it out of 100. If you studied Botany and Zoology separately, ADD the two marks together and enter the total out of 200 (Botany 90 + Zoology 90 = 180). TNAU sums Botany + Zoology as two separate 50-mark subjects; it never averages them. When you use this 200-mark option, leave the 4th subject field at 0 because Group II(A) then has only Physics, Chemistry, Botany and Zoology.' },
      { id: 'maths', name: '4th Subject (Maths / Computer Science)', shortLabel: 'Maths / CS', min: 0, max: 100, step: 0.5, defaultValue: 90, unit: 'out of 100', hint: 'Mathematics, or Computer Science if Mathematics was not studied. Enter 0 when you have already supplied Botany + Zoology in the Biology field.' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Subject Normalization to 50 Each',
        description: 'Each of the 4 eligible core subjects is evaluated out of 50 marks. A single 100-mark subject is divided by 2; Botany and Zoology are two separate 100-mark subjects, so their SUM out of 200 is divided by 2 and contributes out of 100.',
        formula: 'Subject Component = Subject Marks / 2',
        example: 'Physics 88/2 = 44, Chemistry 86/2 = 43, Biology 92/2 = 46, Maths 90/2 = 45'
      },
      {
        stepNumber: 2,
        title: 'Combine all 4 Subjects',
        description: 'Sum the 50-mark components to get the official aggregate cutoff out of 200.',
        formula: 'Cutoff = 44 + 43 + 46 + 45 = 178.00 / 200',
        example: 'Total = 178.00 / 200'
      }
    ],
    officialRules: [
      'Official guidelines of TNAU Undergraduate Admission Brochure.',
      'Academic Stream: Candidates must have studied Physics, Chemistry, Biology/Botany & Zoology, and Mathematics or Computer Science.',
      'Vocational Stream: 5% seats reserved with vocational subject formula as specified by TNAU.'
    ],
    // Order per G.O. M.S. 191 (AP.6) dt. 16.05.2007, quoted in the TNAU UG brochure.
    tieBreakingRules: [
      '1. Marks out of 50 in Mathematics, or in Biology / Botany + Zoology if Mathematics was not studied',
      '2. Marks out of 50 in Physics',
      '3. Marks out of 50 in Chemistry',
      '4. Date of birth (older candidate ranked higher)',
      '5. Random number allotted by TNAU (higher number ranked higher)'
    ],
    faqs: [
      {
        question: 'What if I am a pure science student with Botany and Zoology?',
        answer: 'For pure science students without Mathematics, Group II(A) has four subjects: Physics, Chemistry, Botany and Zoology, each evaluated out of 50 for a total of 200. Botany and Zoology are SUMMED, not averaged — Botany 90 and Zoology 90 score 45 + 45 = 90, not 45. Enter Botany + Zoology together as one total out of 200 in the Biology field and leave the 4th subject field at 0.'
      },
      {
        question: 'Is NEET required for TNAU Agriculture?',
        answer: 'No, NEET is not required for TNAU B.Sc. (Hons.) Agriculture. Admissions are purely based on 12th standard cutoff marks.'
      }
    ],
    calculate: (values) => {
      const p = Math.min(100, Math.max(0, values.physics || 0));
      const c = Math.min(100, Math.max(0, values.chemistry || 0));
      const b = Math.min(200, Math.max(0, values.biology || 0));
      const m = Math.min(100, Math.max(0, values.maths || 0));

      // b is either one 100-mark Biology subject or the SUM of Botany + Zoology
      // out of 200. Both are official components out of 50 per subject, so /2 is
      // correct for either input and the total stays out of 200.
      const p50 = p / 2;
      const c50 = c / 2;
      const b50 = b / 2;
      const m50 = m / 2;
      const total = Number((p50 + c50 + b50 + m50).toFixed(2));

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Physics (50%)', score: Number(p50.toFixed(2)), max: 50, note: 'Divided by 2' },
          { label: 'Chemistry (50%)', score: Number(c50.toFixed(2)), max: 50, note: 'Divided by 2' },
          b > 100
            ? { label: 'Botany + Zoology (100%)', score: Number(b50.toFixed(2)), max: 100, note: 'Entered as the SUM out of 200, divided by 2' }
            : { label: 'Biology (50%)', score: Number(b50.toFixed(2)), max: 50, note: 'Divided by 2' },
          { label: '4th Subject (50%)', score: Number(m50.toFixed(2)), max: 50, note: 'Maths / Computer Science, divided by 2' }
        ],
        remarks: `Your official TNAU Agriculture cutoff is ${total} out of 200.`,
        qualifyingStatus: {
          // 110 is an INDICATIVE band, not an official rule: TNAU publishes no
          // single minimum aggregate for UG Group II merit, so it must never be
          // presented to students as "required" or "official".
          isQualified: total >= 110,
          label: total >= 110 ? 'Within the Indicative TNAU Range' : 'Below the Indicative TNAU Range',
          details: 'Indicative estimate, not an official rule. TNAU publishes no fixed minimum aggregate for UG Group II merit — the closing mark changes with every course and college. Passing the qualifying examination is what makes you eligible to apply, so use this range only to judge your relative strength.'
        }
      };
    }
  },

  // 3. KCET Engineering Cutoff (KEA Karnataka)
  {
    id: 'kcet-engineering',
    slug: 'kcet-engineering-cutoff-calculator',
    name: 'KCET Engineering Combined Score Calculator',
    shortName: 'KCET Engineering',
    category: 'State Entrance',
    categorySlug: 'state-entrance',
    exam: 'Karnataka Common Entrance Test (KCET) + 2nd PUC / 12th Board',
    state: 'Karnataka',
    stateSlug: 'karnataka',
    targetCourse: 'B.Tech / B.E. Engineering Admissions',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Karnataka Examinations Authority (KEA)',
    authorityUrl: 'https://cetonline.karnataka.gov.in/kea/',
    maxScore: 100,
    scoreUnit: '% / 100',
    summary: 'Calculates the official 50:50 composite merit score for Karnataka Engineering admissions by combining 2nd PUC / 12th Board PCM marks (50% weightage) and KCET entrance exam PCM marks (50% weightage).',
    verifiedFormulaText: 'Combined Score = ((Board PCM / 300) * 50) + ((KCET PCM / 180) * 50)',
    formulaDisplay: 'Composite Score (out of 100) = (Board PCM / 300) * 50 + (KCET PCM / 180) * 50',
    inputs: [
      { id: 'board_pcm', name: '2nd PUC / 12th Board PCM Total', shortLabel: 'Board PCM', min: 0, max: 300, step: 1, defaultValue: 270, unit: 'out of 300', hint: 'Total marks in Physics + Chemistry + Maths in 12th / 2nd PUC (max 300)' },
      { id: 'kcet_pcm', name: 'KCET Entrance Exam PCM Total', shortLabel: 'KCET PCM', min: 0, max: 180, step: 1, defaultValue: 135, unit: 'out of 180', hint: 'Total score in KCET Physics (60) + Chemistry (60) + Maths (60) (max 180)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Class 12 / 2nd PUC Board Weightage (50%)',
        description: 'Your Board PCM marks out of 300 are converted to a 50-point score.',
        formula: 'Board Weight = (Board Marks / 300) * 50',
        example: 'If Board PCM = 270/300 -> (270 / 300) * 50 = 45.00'
      },
      {
        stepNumber: 2,
        title: 'KCET Entrance Exam Weightage (50%)',
        description: 'Your KCET marks out of 180 are converted to a 50-point score.',
        formula: 'KCET Weight = (KCET Marks / 180) * 50',
        example: 'If KCET PCM = 135/180 -> (135 / 180) * 50 = 37.50'
      },
      {
        stepNumber: 3,
        title: 'Composite Merit Score Calculation',
        description: 'Add Board Weight and KCET Weight together to determine your composite merit score.',
        formula: 'Composite Score = Board Weight + KCET Weight',
        example: '45.00 + 37.50 = 82.50 / 100 (82.50%)'
      }
    ],
    officialRules: [
      'Official ranking rule mandated by KEA for Karnataka B.E./B.Tech admissions.',
      'General Category candidates must have scored at least 45% aggregate in PCM in 2nd PUC / Class 12.',
      'SC, ST, Cat-1, 2A, 2B, 3A, and 3B candidates of Karnataka must score at least 40% aggregate in PCM.'
    ],
    tieBreakingRules: [
      '1. Higher marks in KCET Mathematics',
      '2. Higher marks in KCET Physics',
      '3. Higher marks in KCET Chemistry',
      '4. Higher marks in 2nd PUC / 12th Board Mathematics',
      '5. Candidate older in age'
    ],
    faqs: [
      {
        question: 'Does KEA consider 100% KCET marks for engineering?',
        answer: 'No. As per the Karnataka Government & High Court rulings, B.E./B.Tech engineering ranking uses 50% 12th Board PCM marks and 50% KCET entrance marks.'
      },
      {
        question: 'Is KCET composite score used for Architecture or Farm Science?',
        answer: 'For B.Arch, NATA (50%) + Board (50%) is used. For B.Sc Agriculture via practical quota, a separate practical test + CET formula applies.'
      }
    ],
    calculate: (values) => {
      const board = Math.min(300, Math.max(0, values.board_pcm || 0));
      const kcet = Math.min(180, Math.max(0, values.kcet_pcm || 0));

      const boardWeight = (board / 300) * 50;
      const kcetWeight = (kcet / 180) * 50;
      const total = Number((boardWeight + kcetWeight).toFixed(3));
      const boardPct = (board / 300) * 100;

      return {
        totalCutoff: total,
        breakdown: [
          { label: '12th Board / 2nd PUC Weight (50%)', score: Number(boardWeight.toFixed(3)), max: 50, note: `${boardPct.toFixed(2)}% board score scaled to 50` },
          { label: 'KCET Entrance Weight (50%)', score: Number(kcetWeight.toFixed(3)), max: 50, note: `${((kcet / 180) * 100).toFixed(2)}% KCET score scaled to 50` }
        ],
        remarks: `Your official KEA Engineering composite score is ${total.toFixed(2)} out of 100.`,
        qualifyingStatus: {
          isQualified: boardPct >= 45,
          label: boardPct >= 45 ? 'Eligible for KEA Engineering Rank' : 'Board Aggregate Below 45%',
          details: boardPct >= 45 ? 'Candidate fulfills the General Category eligibility criteria.' : 'Eligible for Karnataka reserved categories (minimum 40%) only.'
        }
      };
    }
  },

  // 4. AP EAPCET / TS EAPCET Cutoff Calculator
  {
    id: 'ap-ts-eapcet',
    slug: 'eapcet-cutoff-calculator',
    name: 'AP & TS EAPCET Composite Cutoff Calculator',
    shortName: 'EAPCET Cutoff',
    category: 'State Entrance',
    categorySlug: 'state-entrance',
    exam: 'AP EAPCET (APSCHE) / TS EAPCET (TGCHE)',
    state: 'Andhra Pradesh & Telangana',
    stateSlug: 'andhra-pradesh-telangana',
    targetCourse: 'B.Tech / B.E. / B.Pharmacy / Agriculture',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'APSCHE & TGCHE',
    authorityUrl: 'https://cets.apsche.ap.gov.in',
    maxScore: 100,
    scoreUnit: '/ 100',
    summary: 'Calculates the official 75:25 composite score for AP & TS EAPCET combining 75% weightage for EAPCET entrance exam score (out of 160) and 25% weightage for Class 12 / Intermediate Group subjects.',
    verifiedFormulaText: 'Composite = ((EAPCET Score / 160) * 75) + ((Inter Group % / 100) * 25)',
    formulaDisplay: 'Composite Score (out of 100) = (EAPCET Marks / 160) * 75 + (Inter Group % / 100) * 25',
    inputs: [
      { id: 'eapcet_marks', name: 'EAPCET Entrance Marks', shortLabel: 'EAPCET Score', min: 0, max: 160, step: 0.25, defaultValue: 105, unit: 'out of 160', hint: 'Marks scored in AP/TS EAPCET exam (max 160)' },
      { id: 'inter_group_pct', name: 'Intermediate Group Subjects % (PCM / PCB)', shortLabel: 'Inter Group %', min: 0, max: 100, step: 0.1, defaultValue: 92, unit: '% (out of 100)', hint: 'Percentage of marks in group subjects (Maths/Bio, Physics, Chemistry) in 10+2 / Intermediate' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Entrance Exam Weightage (75%)',
        description: 'EAPCET marks out of 160 are converted to a 75-point score.',
        formula: 'EAPCET Component = (EAPCET Score / 160) * 75',
        example: '105 / 160 * 75 = 49.219'
      },
      {
        stepNumber: 2,
        title: 'Intermediate Group Subject Weightage (25%)',
        description: 'Intermediate group percentage is converted to a 25-point score.',
        formula: 'Intermediate Component = (Group % / 100) * 25',
        example: '92% -> (92 / 100) * 25 = 23.00'
      },
      {
        stepNumber: 3,
        title: 'Combined Merit Score',
        description: 'Add both components together for the 100-mark ranking score.',
        formula: 'Total = 49.219 + 23.00 = 72.219 / 100',
        example: '72.219 / 100'
      }
    ],
    officialRules: [
      'Minimum qualifying marks in EAPCET exam for OC and BC candidates is 40 out of 160 (25%).',
      'No minimum qualifying mark is prescribed for SC and ST candidates.',
      'Intermediate group subjects include Mathematics (or Biology), Physics, and Chemistry.'
    ],
    tieBreakingRules: [
      '1. Total marks secured in EAPCET examination',
      '2. Marks secured in Mathematics / Biology in EAPCET',
      '3. Marks secured in Physics in EAPCET',
      '4. Percentage of marks in the qualifying examination',
      '5. Candidate older in age'
    ],
    faqs: [
      {
        question: 'Does Telangana (TS EAPCET) still use 25% IPE weightage?',
        answer: 'Telangana has waived the 25% intermediate weightage in recent sessions so that ranking is based 100% on the normalized EAPCET entrance score. However, this calculator provides both the 75:25 composite score and raw entrance score metrics for AP and TS aspirants.'
      },
      {
        question: 'What is the qualifying mark in EAPCET?',
        answer: 'Candidates must score at least 40 out of 160 (25%) to qualify for ranking (exempted for SC/ST).'
      }
    ],
    calculate: (values) => {
      const eapcet = Math.min(160, Math.max(0, values.eapcet_marks || 0));
      const interPct = Math.min(100, Math.max(0, values.inter_group_pct || 0));

      const eapcetPart = (eapcet / 160) * 75;
      const interPart = (interPct / 100) * 25;
      const total = Number((eapcetPart + interPart).toFixed(3));
      const isQualified = eapcet >= 40;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'EAPCET Score Weight (75%)', score: Number(eapcetPart.toFixed(3)), max: 75, note: `${eapcet} / 160 converted to 75%` },
          { label: 'Intermediate Group Weight (25%)', score: Number(interPart.toFixed(3)), max: 25, note: `${interPct}% converted to 25%` }
        ],
        remarks: `Composite Score: ${total.toFixed(2)} / 100. Raw EAPCET score: ${eapcet} / 160.`,
        qualifyingStatus: {
          isQualified,
          label: isQualified ? 'Qualified in EAPCET (>= 40 Marks)' : 'Below 40 Marks Minimum (OC/BC)',
          details: isQualified ? 'Meets the 25% (40/160) minimum qualifying mark.' : 'Scored below 40 marks; only SC/ST candidates are eligible without minimum marks.'
        }
      };
    }
  },

  // 5. TN Paramedical Cutoff Calculator
  {
    id: 'tn-paramedical',
    slug: 'tn-paramedical-cutoff-calculator',
    name: 'Tamil Nadu Paramedical Cutoff Calculator',
    shortName: 'TN Paramedical',
    category: 'Medical',
    categorySlug: 'medical',
    exam: 'TN Paramedical Degree Admissions (Selection Committee, DME TN)',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    targetCourse: 'B.Pharm, B.Sc. Nursing, BPT, BASLP, Radiography',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Selection Committee, Directorate of Medical Education & Research, Chennai',
    authorityUrl: 'https://tnmedicalselection.net',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark merit cutoff score for Tamil Nadu Government & Self-Financing Paramedical Degree courses including B.Pharm, B.Sc Nursing, BPT, and Allied Health Sciences.',
    verifiedFormulaText: 'Cutoff = Biology + ((Physics + Chemistry) / 2)',
    formulaDisplay: 'Cutoff (out of 200) = Biology + (Physics + Chemistry) / 2',
    inputs: [
      { id: 'biology', name: 'Biology Marks (or Botany + Zoo avg)', shortLabel: 'Biology', min: 0, max: 100, step: 0.5, defaultValue: 90, unit: 'out of 100', hint: 'If studied Botany & Zoology, enter average of both out of 100' },
      { id: 'physics', name: 'Physics Marks', shortLabel: 'Physics', min: 0, max: 100, step: 0.5, defaultValue: 82, unit: 'out of 100' },
      { id: 'chemistry', name: 'Chemistry Marks', shortLabel: 'Chemistry', min: 0, max: 100, step: 0.5, defaultValue: 86, unit: 'out of 100' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Biology Component (100 Marks)',
        description: 'Biology is taken at 100% full weightage (100 marks).',
        formula: 'Bio Part = Biology Marks',
        example: 'Biology = 90 -> 90.00'
      },
      {
        stepNumber: 2,
        title: 'Physics & Chemistry Combined (100 Marks)',
        description: 'Sum of Physics and Chemistry marks is halved (divided by 2) to scale to 100 marks.',
        formula: 'PC Part = (Physics + Chemistry) / 2',
        example: '(82 + 86) / 2 = 84.00'
      },
      {
        stepNumber: 3,
        title: 'Total Paramedical Cutoff (200 Marks)',
        description: 'Add Biology Component and PC Component together.',
        formula: 'Total = 90.00 + 84.00 = 174.00 / 200',
        example: '174.00 / 200'
      }
    ],
    officialRules: [
      'Published in the Official Prospectus for Admission to Paramedical Degree Courses by DME TN.',
      'For candidates who studied Botany and Zoology separately: (Botany + Zoology) taken together as Biology out of 100.',
      'For B.Pharm, candidates with PCM (Maths instead of Biology) are also eligible with Maths taking 100 marks.'
    ],
    tieBreakingRules: [
      '1. Higher marks in Biology / Botany & Zoology',
      '2. Higher marks in Chemistry',
      '3. Higher marks in Physics',
      '4. Date of birth (seniority in age)'
    ],
    faqs: [
      {
        question: 'Is NEET required for TN Paramedical courses (B.Pharm, B.Sc Nursing)?',
        answer: 'No. Admissions to Government and Government quota seats in private paramedical colleges in Tamil Nadu are conducted purely based on 12th board cutoff marks, not NEET.'
      }
    ],
    calculate: (values) => {
      const bio = Math.min(100, Math.max(0, values.biology || 0));
      const phy = Math.min(100, Math.max(0, values.physics || 0));
      const chem = Math.min(100, Math.max(0, values.chemistry || 0));

      const pcPart = (phy + chem) / 2;
      const total = Number((bio + pcPart).toFixed(2));

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Biology Component', score: bio, max: 100, note: '100% full weightage' },
          { label: 'Physics + Chemistry Component', score: Number(pcPart.toFixed(2)), max: 100, note: '(Physics + Chemistry) / 2' }
        ],
        remarks: `Your official TN Paramedical cutoff is ${total} out of 200.`,
        qualifyingStatus: {
          // 100 is an INDICATIVE band, not an official rule: DME TN publishes no
          // single minimum aggregate for paramedical merit, so it must never be
          // presented to students as "required" or "official".
          isQualified: total >= 100,
          label: total >= 100 ? 'Within the Indicative Competitive Range' : 'Below the Indicative Competitive Range',
          details: 'Indicative estimate, not an official rule. DME TN publishes no fixed minimum aggregate for paramedical merit — the closing mark changes with every course and college. The binding requirement is a pass in all prescribed science subjects, so use this range only to judge your relative strength.'
        }
      };
    }
  },

  // 6. TANUVAS Veterinary Cutoff Calculator
  {
    id: 'tanuvas-veterinary',
    slug: 'tanuvas-veterinary-cutoff-calculator',
    name: 'TANUVAS Veterinary (B.V.Sc & A.H.) Cutoff Calculator',
    shortName: 'TANUVAS Cutoff',
    category: 'Medical',
    categorySlug: 'medical',
    exam: 'TANUVAS Undergraduate Admissions / 12th Board',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    targetCourse: 'B.V.Sc & A.H. (Bachelor of Veterinary Science)',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Tamil Nadu Veterinary and Animal Sciences University, Chennai',
    authorityUrl: 'https://tanuvas.ac.in',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark veterinary merit cutoff score for B.V.Sc & A.H. admissions in TANUVAS veterinary colleges across Tamil Nadu.',
    verifiedFormulaText: 'Cutoff = Biology + ((Physics + Chemistry) / 2)',
    formulaDisplay: 'Cutoff (out of 200) = Biology (out of 100) + (Physics + Chemistry) / 2 (out of 100)',
    inputs: [
      { id: 'biology', name: 'Biology Marks', shortLabel: 'Biology', min: 0, max: 100, step: 0.5, defaultValue: 96, unit: 'out of 100' },
      { id: 'physics', name: 'Physics Marks', shortLabel: 'Physics', min: 0, max: 100, step: 0.5, defaultValue: 92, unit: 'out of 100' },
      { id: 'chemistry', name: 'Chemistry Marks', shortLabel: 'Chemistry', min: 0, max: 100, step: 0.5, defaultValue: 94, unit: 'out of 100' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Biology Weightage (100 Marks)',
        description: 'Biology (or Botany + Zoology average) is weighted at 100 marks.',
        formula: 'Bio Part = Biology Marks',
        example: 'Bio = 96 -> 96.00'
      },
      {
        stepNumber: 2,
        title: 'Physics & Chemistry Half-Weightage (100 Marks)',
        description: 'Physics and Chemistry marks are added and divided by 2.',
        formula: 'PC Part = (Physics + Chemistry) / 2',
        example: '(92 + 94) / 2 = 93.00'
      },
      {
        stepNumber: 3,
        title: 'Sum to 200',
        description: 'Combine Biology and PC components to get the official TANUVAS cutoff.',
        formula: 'Total = 96.00 + 93.00 = 189.00 / 200',
        example: '189.00 / 200'
      }
    ],
    officialRules: [
      'Official regulation of TANUVAS Undergraduate Admissions Committee.',
      'For B.Tech courses (Food Tech, Poultry Tech, Dairy Tech), Mathematics is used instead of Biology.',
      'Open Category minimum: Biology at least 60%, Physics and Chemistry together at least 60%, and an aggregate of at least 70% — that is 140 out of 200.'
    ],
    tieBreakingRules: [
      '1. Percentage of marks in Biology',
      '2. Percentage of marks in Chemistry',
      '3. Percentage of marks in Physics',
      '4. Candidate older in age'
    ],
    faqs: [
      {
        question: 'Is NEET mandatory for Tamil Nadu state quota seats in TANUVAS?',
        answer: 'For 85% Tamil Nadu State Quota seats in TANUVAS, admissions are based on 12th board marks. The 15% All-India Quota (VCI) seats require NEET UG.'
      }
    ],
    calculate: (values) => {
      const bio = Math.min(100, Math.max(0, values.biology || 0));
      const phy = Math.min(100, Math.max(0, values.physics || 0));
      const chem = Math.min(100, Math.max(0, values.chemistry || 0));

      const pcPart = (phy + chem) / 2;
      const total = Number((bio + pcPart).toFixed(2));

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Biology', score: bio, max: 100, note: 'Full weightage out of 100' },
          { label: 'Physics & Chemistry Combined', score: Number(pcPart.toFixed(2)), max: 100, note: '(Physics + Chemistry) / 2' }
        ],
        remarks: `Your official TANUVAS Veterinary cutoff score is ${total} out of 200.`,
        qualifyingStatus: {
          // 140/200 is the Open Category minimum: Biology >= 60%, Physics and
          // Chemistry together >= 60%, aggregate >= 70%.
          isQualified: total >= 140,
          label: total >= 185 ? 'High Chance for B.V.Sc & A.H.' : total >= 150 ? 'Moderate Chance for B.V.Sc & A.H.' : total >= 140 ? 'Meets TANUVAS Open Category Minimum' : 'Below TANUVAS Open Category Minimum',
          details: 'The Open Category minimum is Biology at least 60%, Physics and Chemistry together at least 60%, and an aggregate of at least 70% (140 out of 200). Top veterinary colleges (Madras Veterinary College) typically close around 194-198 for General category.'
        }
      };
    }
  },

  // 7. KEAM Kerala Engineering Cutoff
  {
    id: 'keam-engineering',
    slug: 'keam-engineering-cutoff-calculator',
    name: 'KEAM Engineering Index Mark Calculator',
    shortName: 'KEAM Index',
    category: 'State Entrance',
    categorySlug: 'state-entrance',
    exam: 'Kerala Engineering Architecture Medical (KEAM) + Class 12 Board',
    state: 'Kerala',
    stateSlug: 'kerala',
    targetCourse: 'B.Tech / B.E. Engineering Admissions in Kerala',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Commissioner for Entrance Examinations (CEE), Kerala',
    authorityUrl: 'https://cee.kerala.gov.in',
    maxScore: 600,
    scoreUnit: '/ 600',
    summary: 'Calculates the official 50:50 KEAM engineering rank index mark out of 600, combining the 600-mark entrance paper scaled to 300 with the Class 12 board component scaled to 300 in the mandatory 5:3:2 ratio (Mathematics 150, Physics 90, Chemistry 60).',
    verifiedFormulaText: 'KEAM Index = Entrance Scaled (300) + Board Scaled (300), where Board Scaled = Maths (150) + Physics (90) + Chemistry (60)',
    formulaDisplay: 'Index (out of 600) = (KEAM Score / 600) * 300 + (Maths % / 100) * 150 + (Physics % / 100) * 90 + (Chemistry % / 100) * 60',
    inputs: [
      { id: 'keam_entrance', name: 'KEAM Entrance Score', shortLabel: 'KEAM Entrance', min: 0, max: 600, step: 1, defaultValue: 400, unit: 'out of 600', hint: 'The Engineering Entrance Examination is out of 600 marks: Mathematics 300 + Physics 180 + Chemistry 120' },
      { id: 'board_maths', name: 'Class 12 Mathematics %', shortLabel: 'Board Maths %', min: 0, max: 100, step: 0.1, defaultValue: 92, unit: '% (out of 100)', hint: 'Your Class 12 Mathematics percentage. CEE Kerala weights it out of 150 (5:3:2 ratio)' },
      { id: 'board_physics', name: 'Class 12 Physics %', shortLabel: 'Board Physics %', min: 0, max: 100, step: 0.1, defaultValue: 88, unit: '% (out of 100)', hint: 'Your Class 12 Physics percentage. CEE Kerala weights it out of 90 (5:3:2 ratio)' },
      { id: 'board_chemistry', name: 'Class 12 Chemistry %', shortLabel: 'Board Chemistry %', min: 0, max: 100, step: 0.1, defaultValue: 90, unit: '% (out of 100)', hint: 'Your Class 12 Chemistry percentage. CEE Kerala weights it out of 60 (5:3:2 ratio)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Entrance Score Scaling to 300',
        description: 'The entrance paper is out of 600 marks and is scaled to an index of 300 marks (50% weightage).',
        formula: 'Scaled Entrance = (Entrance Score / 600) * 300',
        example: '400 / 600 * 300 = 200.00'
      },
      {
        stepNumber: 2,
        title: 'Board Subject Scaling to 300 (5:3:2 Ratio)',
        description: 'The three Class 12 subjects are NOT blended. They are scaled separately in the mandatory 5:3:2 ratio: Mathematics out of 150, Physics out of 90, Chemistry out of 60.',
        formula: 'Scaled Board = (Maths % / 100) * 150 + (Physics % / 100) * 90 + (Chemistry % / 100) * 60',
        example: 'Maths 92% -> 138.00, Physics 88% -> 79.20, Chemistry 90% -> 54.00 (total 271.20)'
      },
      {
        stepNumber: 3,
        title: 'Combined KEAM Engineering Index',
        description: 'Add both 300-point components to obtain your total index mark out of 600.',
        formula: 'Total Index = 200.00 + 271.20 = 471.20 / 600',
        example: '471.20 / 600'
      }
    ],
    officialRules: [
      'Official ranking method adopted by Commissioner for Entrance Examinations (CEE), Kerala.',
      'Equal weightage of 50:50 is given to the marks obtained in the Entrance Examination and the marks obtained for Mathematics, Physics, and Chemistry in the qualifying examination.',
      'Board marks undergo statistical standardization across state and national boards.',
      'Class 12 marks enter the index in the fixed 5:3:2 ratio: Mathematics 150, Physics 90 and Chemistry 60, for 300 marks in total.',
      'The Engineering Entrance Examination is out of 600 marks (Mathematics 300, Physics 180, Chemistry 120) and a minimum normalised score of 10 is required to be eligible for ranking.'
    ],
    tieBreakingRules: [
      '1. Higher standardized marks in Mathematics in qualifying examination',
      '2. Higher standardized marks in Physics in qualifying examination',
      '3. Higher standardized marks in Chemistry in qualifying examination',
      '4. Candidate older in age'
    ],
    faqs: [
      {
        question: 'What is the minimum qualification mark in KEAM entrance?',
        answer: 'Candidates must score a minimum of 10 marks in each paper of the entrance examination (relaxation applies to SC/ST candidates). This calculator uses the official 10-mark minimum.'
      },
      {
        question: 'How is the Class 12 board component calculated?',
        answer: 'Not from a single blended percentage. CEE Kerala scales your three Class 12 subjects in a fixed 5:3:2 ratio — Mathematics out of 150, Physics out of 90 and Chemistry out of 60, for 300 marks in total. That is why this calculator asks for the three subjects separately instead of one PCM percentage.'
      }
    ],
    calculate: (values) => {
      const entrance = Math.min(600, Math.max(0, values.keam_entrance || 0));
      const boardMaths = Math.min(100, Math.max(0, values.board_maths || 0));
      const boardPhysics = Math.min(100, Math.max(0, values.board_physics || 0));
      const boardChemistry = Math.min(100, Math.max(0, values.board_chemistry || 0));

      const entranceScaled = (entrance / 600) * 300;
      const mathsScaled = (boardMaths / 100) * 150;
      const physicsScaled = (boardPhysics / 100) * 90;
      const chemistryScaled = (boardChemistry / 100) * 60;
      const boardScaled = mathsScaled + physicsScaled + chemistryScaled;
      const total = Number((entranceScaled + boardScaled).toFixed(2));

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'KEAM Entrance Component (50%)', score: Number(entranceScaled.toFixed(2)), max: 300, note: `Entrance out of 600 scaled to 300` },
          { label: 'Class 12 Board Component (50%)', score: Number(boardScaled.toFixed(2)), max: 300, note: 'Maths 150 + Physics 90 + Chemistry 60 (5:3:2 ratio)' }
        ],
        remarks: `Your total KEAM Engineering Index mark is ${total} out of 600. Board contribution: Maths ${mathsScaled.toFixed(2)}/150 + Physics ${physicsScaled.toFixed(2)}/90 + Chemistry ${chemistryScaled.toFixed(2)}/60.`,
        qualifyingStatus: {
          // Prospectus 9.7.5(i): minimum normalised score of 10 in the entrance.
          isQualified: entrance >= 10,
          label: entrance >= 10 ? 'Qualified for Ranking' : 'Below Minimum Threshold',
          details: entrance >= 10
            ? 'Your entrance score is at or above the official minimum normalised score of 10 required to be included in the engineering rank list.'
            : 'The official minimum normalised score in the Engineering Entrance Examination is 10. Clear that first — the index mark is only used for ranking among qualified candidates.'
        }
      };
    }
  },

  // 8. GUJCET ACPC Cutoff Calculator (Gujarat)
  {
    id: 'gujcet-acpc',
    slug: 'gujcet-acpc-cutoff-calculator',
    name: 'GUJCET ACPC Gujarat Merit Calculator',
    shortName: 'GUJCET ACPC',
    category: 'State Entrance',
    categorySlug: 'state-entrance',
    exam: 'GUJCET + Gujarat Board (GSEB) / CBSE Class 12',
    state: 'Gujarat',
    stateSlug: 'gujarat',
    targetCourse: 'Degree Engineering (B.E. / B.Tech) & Pharmacy',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Admission Committee for Professional Courses (ACPC), Gujarat',
    authorityUrl: 'https://acpc.gujarat.gov.in',
    maxScore: 100,
    scoreUnit: 'Merit Marks / 100',
    summary: 'Calculates the ACPC Gujarat Engineering merit score out of 100: 60% weightage to Class 12 Board PCM theory marks and 40% weightage to the GUJCET entrance score.',
    verifiedFormulaText: 'Merit Marks = ((Board PCM Theory / 300) * 60) + ((GUJCET PCM / 120) * 40)',
    formulaDisplay: 'Merit Marks (out of 100) = (Board PCM Theory / 300) * 60 + (GUJCET PCM / 120) * 40',
    inputs: [
      { id: 'board_pcm', name: '12th Board PCM Theory Marks', shortLabel: 'Board Theory', min: 0, max: 300, step: 0.5, defaultValue: 250, unit: 'out of 300', hint: 'PCM theory marks in the 12th Board (practical marks excluded, max 300). Board weightage is 60 of the 100 merit marks.' },
      { id: 'gujcet_pcm', name: 'GUJCET Entrance Marks', shortLabel: 'GUJCET Score', min: 0, max: 120, step: 0.25, defaultValue: 95, unit: 'out of 120', hint: 'Physics (40) + Chemistry (40) + Maths (40) in GUJCET (max 120). GUJCET weightage is 40 of the 100 merit marks. IMPORTANT: the official ACPC merit ranks on the GUJCET PERCENTILE from the ACPC percentile table, not on the raw score. This calculator scales your raw score linearly as a proxy ((GUJCET / 120) * 40), so this component is an estimate — check your real merit against the ACPC percentile table.' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Board PCM Theory Marks (60% Weightage)',
        description: 'Theory marks scored in Physics, Chemistry and Mathematics (max 300) are converted to a 60-point score.',
        formula: 'Board Component = (Board PCM / 300) * 60',
        example: '(250 / 300) * 60 = 50.00'
      },
      {
        stepNumber: 2,
        title: 'GUJCET Marks (40% Weightage)',
        description: 'GUJCET marks (max 120) are converted to a 40-point score. This raw-score scaling is a proxy for the official GUJCET percentile.',
        formula: 'GUJCET Component = (GUJCET / 120) * 40',
        example: '(95 / 120) * 40 = 31.667'
      },
      {
        stepNumber: 3,
        title: 'ACPC Merit Marks',
        description: 'Sum both components to obtain your merit score out of 100.',
        formula: 'Merit Marks = 50.00 + 31.667 = 81.667 / 100',
        example: '81.667 / 100'
      }
    ],
    officialRules: [
      'Prescribed by Admission Committee for Professional Courses (ACPC), Government of Gujarat.',
      'Only theory marks of Board PCM are considered (practical marks are excluded).',
      'Eligibility: Minimum 45% (135/300) in PCM theory for Open Category; 40% (120/300) for SC/ST/SEBC/EWS.',
      'The official merit list ranks on the GUJCET percentile published in the ACPC percentile table, which is not the same as the raw score out of 120.'
    ],
    tieBreakingRules: [
      '1. Higher marks in GUJCET Mathematics',
      '2. Higher marks in GUJCET Physics',
      '3. Higher marks in Board Theory Mathematics',
      '4. Higher marks in Board Theory Physics',
      '5. Candidate older in age'
    ],
    faqs: [
      {
        question: 'Does ACPC use 50:50 or 60:40 weighting?',
        answer: 'ACPC uses 60% Class 12 Board PCM theory marks and 40% GUJCET, both normalised to a 100-point merit scale. We could not find any published ACPC notification amending this to 50:50, so this calculator applies the documented 60:40 rule.'
      },
      {
        question: 'Why does this calculator use my raw GUJCET score instead of the official percentile?',
        answer: 'The official ACPC merit list ranks on the GUJCET percentile from the ACPC percentile table, and that percentile is not the same as your raw score out of 120. Because the percentile table cannot be evaluated offline, this calculator scales the raw score linearly ((GUJCET / 120) * 40) as a proxy. Treat that component as an estimate and verify your real merit marks against the ACPC percentile table on acpc.gujarat.gov.in.'
      }
    ],
    calculate: (values) => {
      const board = Math.min(300, Math.max(0, values.board_pcm || 0));
      const gujcet = Math.min(120, Math.max(0, values.gujcet_pcm || 0));

      const boardPart = (board / 300) * 60;
      const gujcetPart = (gujcet / 120) * 40;
      const total = Number((boardPart + gujcetPart).toFixed(2));
      const boardPct = (board / 300) * 100;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Board PCM Theory (60%)', score: Number(boardPart.toFixed(2)), max: 60, note: `${boardPct.toFixed(1)}% theory marks scaled to 60` },
          { label: 'GUJCET Raw Score Proxy (40%)', score: Number(gujcetPart.toFixed(2)), max: 40, note: `${((gujcet / 120) * 100).toFixed(1)}% raw marks scaled to 40 — proxy for the official ACPC percentile` }
        ],
        remarks: `Your ACPC Gujarat merit marks are ${total} out of 100 (60% board + 40% GUJCET raw-score proxy). The official merit uses the GUJCET percentile from the ACPC percentile table, so verify there.`,
        qualifyingStatus: {
          isQualified: board >= 135,
          label: board >= 135 ? 'Meets Open Category Eligibility (>= 45%)' : board >= 120 ? 'Eligible for Reserved Categories (40%-45%)' : 'Below Minimum Eligibility',
          details: 'Open: 135/300 theory marks required; Reserved: 120/300 theory marks required.'
        }
      };
    }
  },

  // 9. NEET UG Medical Qualifying & Score Evaluator
  {
    id: 'neet-ug-medical',
    slug: 'neet-ug-cutoff-score-calculator',
    name: 'NEET UG Medical Score & Qualifying Cutoff Evaluator',
    shortName: 'NEET UG Medical',
    category: 'Medical',
    categorySlug: 'medical',
    exam: 'National Eligibility cum Entrance Test (NEET UG)',
    state: 'All India',
    stateSlug: 'all-india',
    targetCourse: 'MBBS / BDS / AYUSH / BVSc',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'National Testing Agency (NTA) & National Medical Commission (NMC)',
    authorityUrl: 'https://exams.nta.ac.in/NEET/',
    maxScore: 720,
    scoreUnit: '/ 720',
    summary: 'Totals your NEET UG score out of 720 from subject marks and compares it against the current cycle\'s published 50th-percentile band and the 2025 All India Quota reference closing mark.',
    verifiedFormulaText: 'NEET Total = Physics (180) + Chemistry (180) + Biology (360)',
    formulaDisplay: 'Total Score (out of 720) = Physics (180) + Chemistry (180) + Biology (360)',
    inputs: [
      { id: 'physics', name: 'Physics Score', shortLabel: 'Physics', min: -45, max: 180, step: 1, defaultValue: 140, unit: 'out of 180', hint: 'Score in Physics (max 180)' },
      { id: 'chemistry', name: 'Chemistry Score', shortLabel: 'Chemistry', min: -45, max: 180, step: 1, defaultValue: 145, unit: 'out of 180', hint: 'Score in Chemistry (max 180)' },
      { id: 'biology', name: 'Biology Score (Botany + Zoology)', shortLabel: 'Biology', min: -90, max: 360, step: 1, defaultValue: 320, unit: 'out of 360', hint: 'Score in Botany + Zoology (max 360)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Physics Marks (180)',
        description: '45 questions attempted with +4 for correct and -1 for incorrect.',
        formula: 'Physics Marks (Max 180)',
        example: '140 / 180'
      },
      {
        stepNumber: 2,
        title: 'Chemistry Marks (180)',
        description: '45 questions attempted with +4 for correct and -1 for incorrect.',
        formula: 'Chemistry Marks (Max 180)',
        example: '145 / 180'
      },
      {
        stepNumber: 3,
        title: 'Biology Marks (360)',
        description: '90 questions attempted in Botany and Zoology.',
        formula: 'Biology Marks (Max 360)',
        example: '320 / 360'
      },
      {
        stepNumber: 4,
        title: 'Aggregate NEET Score',
        description: 'Total marks out of 720 used for All India Quota (15%) and State Quota (85%) counseling.',
        formula: 'Total = 140 + 145 + 320 = 605 / 720',
        example: '605 / 720'
      }
    ],
    officialRules: [
      'Official marking scheme: 4 marks for every correct answer, minus 1 mark for every incorrect answer, 0 for unattempted.',
      'Qualifying criterion (NTA, unchanged year to year): General/EWS candidates must be at or above the 50th percentile, OBC/SC/ST at or above the 40th percentile, UR-PwD at or above the 45th percentile.',
      'A percentile is a rank position, not a fixed score, so the MARKS that reach it change every year: 137 (2023), 162 (2024), 144 (2025) and 213 (2026) for the UR 50th percentile. This calculator uses the 2026 figure of 213.',
      'Only qualified candidates are eligible for MCC AIQ and State Medical counseling.'
    ],
    tieBreakingRules: [
      '1. Higher marks/percentile in Biology (Botany & Zoology)',
      '2. Higher marks/percentile in Chemistry',
      '3. Higher marks/percentile in Physics',
      '4. Proportion of fewer incorrect answers',
      '5. Proportion of fewer incorrect answers in Biology, followed by Chemistry, followed by Physics'
    ],
    faqs: [
      {
        question: 'What score is generally required for a Government Medical College (MBBS)?',
        answer: 'All India Quota (15%) General category closed around 525 marks in 2025. Treat that as a reference point, not a promise — admission depends on your rank and category, not on the raw score. State quota cutoffs are published separately by each state and vary widely by category and domicile, so check your own state board for the figures that actually apply to you.'
      },
      {
        question: 'Is there one fixed NEET qualifying score?',
        answer: 'No. NTA fixes the qualifying PERCENTILE — 50th for General/EWS, 40th for OBC/SC/ST — but the marks that land on that percentile change every year: 137 in 2023, 162 in 2024, 144 in 2025 and 213 in 2026. This calculator compares your score with the 2026 UR 50th-percentile mark of 213.'
      }
    ],
    calculate: (values) => {
      const p = Math.min(180, Math.max(-45, values.physics || 0));
      const c = Math.min(180, Math.max(-45, values.chemistry || 0));
      const b = Math.min(360, Math.max(-90, values.biology || 0));

      const total = p + c + b;
      const isQualifiedUR = total >= 213;

      let estimate = 'Needs a higher score for an MBBS seat.';
      if (total >= 525) {
        estimate = 'At or above the 2025 All India Quota (15%) General reference closing mark of 525 — competitive for Government MBBS seats, though admission still depends on your rank and category.';
      } else if (total >= 450) {
        estimate = 'Competitive for State Quota Government and Semi-Government MBBS seats, and for Private MBBS (check your own state cutoffs).';
      } else if (isQualifiedUR) {
        estimate = 'Qualified in NEET UG. Eligible for Deemed Universities, Management Quota, and Private BDS/AYUSH.';
      }

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Physics', score: p, max: 180, note: 'Out of 180' },
          { label: 'Chemistry', score: c, max: 180, note: 'Out of 180' },
          { label: 'Biology (Botany + Zoology)', score: b, max: 360, note: 'Out of 360' }
        ],
        remarks: `Total NEET Score: ${total} out of 720 (${((total / 720) * 100).toFixed(1)}%). ${estimate}`,
        qualifyingStatus: {
          isQualified: isQualifiedUR,
          label: isQualifiedUR ? 'Qualified - Above the 2026 UR 50th Percentile (213)' : 'Below the 2026 UR 50th Percentile (213)',
          details: isQualifiedUR
            ? 'Your score clears the 2026 UR 50th-percentile mark of 213, so you are in the General/EWS qualifying band for this cycle. The NTA percentile rule is fixed; only the marks behind it move each year (137 in 2023, 162 in 2024, 144 in 2025, 213 in 2026).'
            : 'NTA requires the 50th percentile for General/EWS, which was 213 marks in 2026. The marks behind a given percentile change every year, so confirm against the current-year figure before concluding you are disqualified.'
        }
      };
    }
  },

  // 10. Delhi University (DU) CUET Cutoff Calculator
  {
    id: 'cuet-du-admission',
    slug: 'cuet-du-cutoff-score-calculator',
    name: 'DU CUET UG Course Merit Calculator',
    shortName: 'DU CUET Merit',
    category: 'College/University Admission',
    categorySlug: 'university-admission',
    exam: 'Common University Entrance Test (CUET UG) - NTA',
    state: 'Delhi (Central University)',
    stateSlug: 'delhi',
    targetCourse: 'Delhi University UG Courses (B.Com Hons, B.Sc Hons, BA Hons)',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'University of Delhi (CSAS UG Portal)',
    authorityUrl: 'https://admission.uod.ac.in',
    maxScore: 1000,
    scoreUnit: '/ 1000',
    summary: 'Calculates the official course-specific merit score for Delhi University Common Seat Allocation System (CSAS UG) based on mapped CUET subject combinations. Each CUET UG subject is 50 questions x 5 marks = 250, so a 1 Language + 3 Domain course merit is out of 1000.',
    verifiedFormulaText: 'Merit = Subject 1 + Subject 2 + Subject 3 + Subject 4 (each CUET subject out of 250, total out of 1000)',
    formulaDisplay: 'Merit (out of 1000) = Subject 1 (250) + Subject 2 (250) + Subject 3 (250) + Subject 4 (250)',
    inputs: [
      { id: 'subject_1', name: 'Subject 1 (e.g. Language / English)', shortLabel: 'Sub 1 (Lang)', min: 0, max: 250, step: 0.5, defaultValue: 235, unit: 'out of 250', hint: 'CUET score in Language (e.g. English). A CUET UG subject is 50 questions x 5 marks = 250' },
      { id: 'subject_2', name: 'Subject 2 (Domain 1)', shortLabel: 'Sub 2 (Domain)', min: 0, max: 250, step: 0.5, defaultValue: 240, unit: 'out of 250', hint: 'CUET score in Domain Subject 1' },
      { id: 'subject_3', name: 'Subject 3 (Domain 2)', shortLabel: 'Sub 3 (Domain)', min: 0, max: 250, step: 0.5, defaultValue: 230, unit: 'out of 250', hint: 'CUET score in Domain Subject 2' },
      { id: 'subject_4', name: 'Subject 4 (Domain 3 / Math / General)', shortLabel: 'Sub 4 (Domain/Math)', min: 0, max: 250, step: 0.5, defaultValue: 225, unit: 'out of 250', hint: 'CUET score in Domain Subject 3. For a 3-subject science programme the CSAS sum is out of 750; enter the three mapped subjects plus 0 here and read your result as a percentage of 1000' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Subject Scale Verification',
        description: 'Each CUET UG subject is 50 questions x +5 marks = 250 marks, and DU CSAS only considers subjects appeared in CUET that the candidate passed in Class 12.',
        formula: '4 Subjects x 250 Marks each = 1000 Marks',
        example: '235 + 240 + 230 + 225'
      },
      {
        stepNumber: 2,
        title: 'Aggregate Course Merit Calculation',
        description: 'The sum of the mapped eligible subjects forms your CSAS merit score.',
        formula: 'Merit = Sub1 + Sub2 + Sub3 + Sub4',
        example: '235 + 240 + 230 + 225 = 930.00 / 1000'
      }
    ],
    officialRules: [
      'Mandated by University of Delhi CSAS (UG) Admission Policy.',
      'Candidates must have studied and passed the chosen subjects in Class 12.',
      'Each CUET UG subject carries 250 marks (50 questions x +5).',
      'For B.Com (Hons) and BA (Hons): Merit is calculated from 1 Language + 3 Domain subjects out of 1000 marks.',
      'For B.Sc. (Hons) Physics, Chemistry, Mathematics: the CSAS subject-merit sum is out of 750 (Language requires min 30% qualifying). This calculator always uses the full four-subject /1000 scale, so read your result as a percentage of 1000 and compare it with the percentage published for your course.'
    ],
    tieBreakingRules: [
      '1. Higher percentage of marks aggregate in best 3 subjects in Class 12',
      '2. Higher percentage of marks aggregate in best 4 subjects in Class 12',
      '3. Higher percentage of marks in best 5 subjects in Class 12',
      '4. Age of the candidate (older candidate preferred)'
    ],
    faqs: [
      {
        question: 'Can I include a subject in CUET that I did not take in Class 12?',
        answer: 'No. Delhi University CSAS rules strictly state that only subjects appeared in CUET which match the subjects passed in Class 12 are considered.'
      },
      {
        question: 'Why does this calculator always show a total out of 1000?',
        answer: 'Because the calculator cannot detect a three-subject course from your marks alone — a genuine zero in the fourth subject must not silently rescale your score. So it always uses the official four-subject /1000 scale (4 x 250). If you are applying to a three-subject science programme whose CSAS sum is out of 750, enter your three mapped subjects with 0 in the fourth field and compare the resulting percentage against the percentage published for your course.'
      }
    ],
    calculate: (values) => {
      const s1 = Math.min(250, Math.max(0, values.subject_1 || 0));
      const s2 = Math.min(250, Math.max(0, values.subject_2 || 0));
      const s3 = Math.min(250, Math.max(0, values.subject_3 || 0));
      const s4 = Math.min(250, Math.max(0, values.subject_4 || 0));

      const total = Number((s1 + s2 + s3 + s4).toFixed(2));
      const maxScore = 1000;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Subject 1', score: s1, max: 250, note: 'Out of 250' },
          { label: 'Subject 2', score: s2, max: 250, note: 'Out of 250' },
          { label: 'Subject 3', score: s3, max: 250, note: 'Out of 250' },
          { label: 'Subject 4', score: s4, max: 250, note: 'Out of 250' }
        ],
        remarks: `Your DU CSAS merit score is ${total} out of ${maxScore} (${((total / maxScore) * 100).toFixed(1)}%).`,
        qualifyingStatus: {
          isQualified: total >= (maxScore * 0.4),
          label: total >= (maxScore * 0.88) ? 'High Chance for North Campus / Top Colleges' : total >= (maxScore * 0.75) ? 'Competitive for South Campus / Off Campus' : 'Eligible for Counseling',
          details: 'Final admission depends on course, category cutoffs, and simulated rank lists in CSAS rounds.'
        }
      };
    }
  },

  // 11. MHT CET Engineering Cutoff & PCM Eligibility Evaluator (Maharashtra)
  {
    id: 'mht-cet-engineering',
    slug: 'mht-cet-cutoff-calculator',
    name: 'MHT CET Score & PCM Eligibility Calculator',
    shortName: 'MHT CET',
    category: 'Engineering',
    categorySlug: 'engineering',
    exam: 'Maharashtra Common Entrance Test (MHT CET) + HSC / 12th Board',
    state: 'Maharashtra',
    stateSlug: 'maharashtra',
    targetCourse: 'B.E. / B.Tech Engineering Admissions in Maharashtra',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'State Common Entrance Test Cell, Maharashtra',
    authorityUrl: 'https://cetcell.mahacet.org',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates your MHT CET PCM entrance score (Mathematics 100 + Physics 50 + Chemistry 50 = 200) and verifies the HSC Class 12 PCM minimum eligibility criteria for CAP counseling.',
    verifiedFormulaText: 'MHT CET Score = Mathematics (100) + Physics (50) + Chemistry (50)',
    formulaDisplay: 'Score (out of 200) = Mathematics (out of 100) + Physics (out of 50) + Chemistry (out of 50)',
    inputs: [
      { id: 'maths', name: 'MHT CET Mathematics Score', shortLabel: 'Maths', min: 0, max: 100, step: 1, defaultValue: 76, unit: 'out of 100', hint: 'Maths carries 2 marks per question (max 100)' },
      { id: 'physics', name: 'MHT CET Physics Score', shortLabel: 'Physics', min: 0, max: 50, step: 1, defaultValue: 38, unit: 'out of 50', hint: 'Physics carries 1 mark per question (max 50)' },
      { id: 'chemistry', name: 'MHT CET Chemistry Score', shortLabel: 'Chemistry', min: 0, max: 50, step: 1, defaultValue: 40, unit: 'out of 50', hint: 'Chemistry carries 1 mark per question (max 50)' },
      { id: 'hsc_pcm_marks', name: 'HSC / Class 12 Board PCM Total', shortLabel: 'HSC PCM', min: 0, max: 300, step: 1, defaultValue: 210, unit: 'out of 300', hint: 'Total marks in Physics + Chemistry + Maths in 12th Board (max 300)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'MHT CET Marking Scheme',
        description: 'Mathematics paper consists of 50 questions worth 2 marks each (100 marks). Physics and Chemistry consist of 50 questions each worth 1 mark (50 marks each). No negative marking.',
        formula: 'Total CET = Maths + Physics + Chemistry',
        example: '76 + 38 + 40 = 154 / 200'
      },
      {
        stepNumber: 2,
        title: 'HSC Board PCM Eligibility Check',
        description: 'The State CET Cell requires at least 50% (150/300) in HSC PCM for the Open Category, or at least 40% (120/300) for Reserved categories, EWS and PwD candidates belonging to Maharashtra State only.',
        formula: 'HSC % = (HSC PCM / 300) * 100',
        example: '(210 / 300) * 100 = 70.00%'
      }
    ],
    officialRules: [
      'Governed by State CET Cell, Government of Maharashtra Information Brochure.',
      'There is no negative marking in MHT CET.',
      'CAP Engineering ranks are based on the MHT CET Percentile Score computed across exam shifts.',
      'HSC eligibility: at least 50% (150/300) in PCM for the Open Category; at least 40% (120/300) for Reserved categories, EWS and PwD candidates belonging to Maharashtra State only.'
    ],
    tieBreakingRules: [
      '1. Higher percentile / marks in Mathematics in MHT CET',
      '2. Higher percentile / marks in Physics in MHT CET',
      '3. Higher percentile / marks in Chemistry in MHT CET',
      '4. Higher percentage of marks in Board HSC PCM',
      '5. Candidate older in age'
    ],
    faqs: [
      {
        question: 'Are HSC marks included in the MHT CET engineering rank?',
        answer: 'The Maharashtra Government decided to base CAP engineering admissions on 100% MHT CET entrance percentile scores, while Class 12 PCM marks serve as the mandatory qualifying eligibility gate: at least 50% (150/300) for the Open Category and at least 40% (120/300) for Reserved categories, EWS and PwD candidates belonging to Maharashtra State only.'
      }
    ],
    calculate: (values) => {
      const m = Math.min(100, Math.max(0, values.maths || 0));
      const p = Math.min(50, Math.max(0, values.physics || 0));
      const c = Math.min(50, Math.max(0, values.chemistry || 0));
      const hsc = Math.min(300, Math.max(0, values.hsc_pcm_marks || 0));

      const total = m + p + c;
      const hscPct = (hsc / 300) * 100;
      // Official brochure: at least 50% (150/300) for Open; at least 40%
      // (120/300) for Reserved, EWS and PwD candidates of Maharashtra State.
      const isEligibleOpen = hsc >= 150;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Mathematics', score: m, max: 100, note: '50 questions × 2 marks' },
          { label: 'Physics', score: p, max: 50, note: '50 questions × 1 mark' },
          { label: 'Chemistry', score: c, max: 50, note: '50 questions × 1 mark' },
          { label: 'HSC Board PCM Aggregate', score: hsc, max: 300, note: `${hscPct.toFixed(1)}% (Eligibility Gate)` }
        ],
        remarks: `Your total MHT CET score is ${total} out of 200. HSC PCM percentage is ${hscPct.toFixed(2)}%.`,
        qualifyingStatus: {
          isQualified: isEligibleOpen,
          label: isEligibleOpen ? 'Eligible for CAP Counseling (Open & Reserved)' : hsc >= 120 ? 'Eligible for Reserved Categories Only (40%-50%)' : 'HSC Aggregate Below 40%',
          details: isEligibleOpen ? 'Fulfills the mandatory 50% aggregate in HSC PCM (150 out of 300).' : 'Open Category requires at least 150/300 (50%). Reserved categories, EWS and PwD candidates of Maharashtra State require at least 120/300 (40%).'
        }
      };
    }
  },

  // 12. TNGASA Tamil Nadu Arts & Science Cutoff Calculator
  {
    id: 'tngasa-arts-science',
    slug: 'tngasa-arts-and-science-cutoff-calculator',
    name: 'TNGASA Arts & Science Cutoff Calculator',
    shortName: 'TNGASA Arts & Science',
    category: 'College/University Admission',
    categorySlug: 'university-admission',
    exam: 'Tamil Nadu Government Arts and Science Colleges Admissions (TNGASA)',
    state: 'Tamil Nadu',
    stateSlug: 'tamil-nadu',
    targetCourse: 'B.Com, B.Sc, B.A, BBA, BCA Admissions',
    academicYear: ACADEMIC_YEAR,
    conductingAuthority: 'Directorate of Collegiate Education (DCE), Tamil Nadu',
    authorityUrl: 'https://tngasa.in',
    maxScore: 400,
    scoreUnit: '/ 400',
    summary: 'Calculates the official 400-mark cutoff score for Tamil Nadu Government Arts & Science Colleges (TNGASA) based on the 4 core major subjects in 12th standard (excluding language papers).',
    verifiedFormulaText: 'Cutoff = Core Subject 1 + Core Subject 2 + Core Subject 3 + Core Subject 4',
    formulaDisplay: 'Cutoff (out of 400) = Core Subject 1 (100) + Core Subject 2 (100) + Core Subject 3 (100) + Core Subject 4 (100)',
    inputs: [
      { id: 'sub_1', name: 'Core Subject 1 (e.g. Commerce / Physics / Maths)', shortLabel: 'Subject 1', min: 0, max: 100, step: 0.5, defaultValue: 94, unit: 'out of 100' },
      { id: 'sub_2', name: 'Core Subject 2 (e.g. Accountancy / Chemistry)', shortLabel: 'Subject 2', min: 0, max: 100, step: 0.5, defaultValue: 96, unit: 'out of 100' },
      { id: 'sub_3', name: 'Core Subject 3 (e.g. Economics / Biology / CS)', shortLabel: 'Subject 3', min: 0, max: 100, step: 0.5, defaultValue: 92, unit: 'out of 100' },
      { id: 'sub_4', name: 'Core Subject 4 (e.g. Business Maths / Optional)', shortLabel: 'Subject 4', min: 0, max: 100, step: 0.5, defaultValue: 90, unit: 'out of 100' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Core 4 Subjects Selection',
        description: 'Excludes Tamil/Language 1 and English. Only 4 academic stream domain subjects are selected.',
        formula: '4 Core Subjects out of 100 each',
        example: 'Commerce (94) + Accountancy (96) + Economics (92) + Business Maths (90)'
      },
      {
        stepNumber: 2,
        title: 'Sum to 400 Marks',
        description: 'Add the 4 core subject marks to obtain the official TNGASA admission cutoff out of 400.',
        formula: 'Total Cutoff = Sub1 + Sub2 + Sub3 + Sub4',
        example: '94 + 96 + 92 + 90 = 372.00 / 400'
      }
    ],
    officialRules: [
      'Official method issued by Directorate of Collegiate Education, Chennai.',
      'Language papers (Part 1 Tamil/Language and Part 2 English) are excluded for calculating rank cutoff in major courses (B.Com, B.Sc, BCA, BBA).',
      'For B.A. English or B.A. Tamil admissions, Part 2 English or Part 1 Tamil marks respectively are used for specific ranking.'
    ],
    tieBreakingRules: [
      '1. Higher marks in the specific major subject of the course applied',
      '2. Total marks obtained in 12th standard',
      '3. Date of birth (older candidate ranked higher)'
    ],
    faqs: [
      {
        question: 'Are Tamil and English included for B.Com cutoff in Tamil Nadu?',
        answer: 'No. B.Com and B.Sc admission cutoffs in Tamil Nadu Government Arts & Science colleges are calculated out of 400 marks from the four core commerce or science subjects only.'
      }
    ],
    calculate: (values) => {
      const s1 = Math.min(100, Math.max(0, values.sub_1 || 0));
      const s2 = Math.min(100, Math.max(0, values.sub_2 || 0));
      const s3 = Math.min(100, Math.max(0, values.sub_3 || 0));
      const s4 = Math.min(100, Math.max(0, values.sub_4 || 0));

      const total = Number((s1 + s2 + s3 + s4).toFixed(2));
      const percentage = (total / 400) * 100;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Subject 1', score: s1, max: 100, note: 'Out of 100' },
          { label: 'Subject 2', score: s2, max: 100, note: 'Out of 100' },
          { label: 'Subject 3', score: s3, max: 100, note: 'Out of 100' },
          { label: 'Subject 4', score: s4, max: 100, note: 'Out of 100' }
        ],
        remarks: `Your official TNGASA Arts & Science cutoff score is ${total} out of 400 (${percentage.toFixed(2)}%).`,
        qualifyingStatus: {
          isQualified: percentage >= 35,
          label: percentage >= 90 ? 'Excellent Merit (Top Tier Govt Colleges)' : percentage >= 75 ? 'Good Merit for Preferred Branches' : 'Eligible for Application',
          details: 'High-demand courses like B.Com and BCA in premier government colleges frequently close above 360/400.'
        }
      };
    }
  }
];

/**
 * Category rollups. The exam lists are derived from the registry rather than
 * hand-written, because a hand-written list silently goes stale the moment a
 * calculator is recategorised — the previous copy credited KEAM to both
 * Engineering and State Entrance, and named five exams for a category whose
 * count is four.
 */
const CATEGORY_BLURB: Record<string, string> = {
  engineering: 'Official formula calculators for state and national engineering admissions.',
  medical: 'Cutoff calculators for MBBS, BDS, paramedical and veterinary admissions.',
  agriculture: 'Cutoff calculators for B.Sc. (Hons.) Agriculture and allied degree programmes.',
  'state-entrance': 'Official formula calculators for state-level engineering and pharmacy entrance exams.',
  'university-admission': 'Cutoff calculators for central and state university UG admissions.'
};

const CATEGORY_NAMES: Record<string, string> = {
  engineering: 'Engineering Cutoff',
  medical: 'Medical Cutoff',
  agriculture: 'Agriculture Cutoff',
  'state-entrance': 'State-level Entrance Exam Cutoffs',
  'university-admission': 'College/University Admission Cutoffs'
};

const listExams = (slug: string) => {
  const exams = CALCULATORS.filter(c => c.categorySlug === slug).map(c => c.shortName);
  if (exams.length <= 1) return '';
  return ` Covers ${exams.slice(0, -1).join(', ')} and ${exams[exams.length - 1]}.`;
};

export const CATEGORIES = Object.keys(CATEGORY_NAMES).map((slug) => ({
  name: CATEGORY_NAMES[slug],
  slug,
  count: CALCULATORS.filter(c => c.categorySlug === slug).length,
  description: CATEGORY_BLURB[slug] + listExams(slug)
}));

export const STATES = [
  { name: 'Tamil Nadu', slug: 'tamil-nadu', code: 'TN', count: 5 },
  { name: 'Karnataka', slug: 'karnataka', code: 'KA', count: 1 },
  { name: 'Andhra Pradesh & Telangana', slug: 'andhra-pradesh-telangana', code: 'AP/TS', count: 1 },
  { name: 'Kerala', slug: 'kerala', code: 'KL', count: 1 },
  { name: 'Gujarat', slug: 'gujarat', code: 'GJ', count: 1 },
  { name: 'Maharashtra', slug: 'maharashtra', code: 'MH', count: 1 },
  { name: 'Delhi', slug: 'delhi', code: 'DL', count: 1 },
  { name: 'All India / Central', slug: 'all-india', code: 'IN', count: 1 }
];

export function getCalculatorBySlug(slug: string): CutoffCalculator | undefined {
  return CALCULATORS.find(c => c.slug === slug || c.id === slug);
}

export function getCalculatorsByCategory(categorySlug: string): CutoffCalculator[] {
  return CALCULATORS.filter(c => c.categorySlug === categorySlug);
}

export function getCalculatorsByState(stateSlug: string): CutoffCalculator[] {
  return CALCULATORS.filter(c => c.stateSlug === stateSlug);
}
