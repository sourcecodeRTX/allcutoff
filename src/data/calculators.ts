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

export interface FormulaStep {
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Directorate of Technical Education (DoTE), Tamil Nadu',
    authorityUrl: 'https://www.tneaonline.org',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark engineering cutoff score for Anna University and affiliated engineering colleges in Tamil Nadu based on 12th standard Physics, Chemistry, and Mathematics marks.',
    verifiedFormulaText: 'Cutoff = Mathematics + (Physics / 2) + (Chemistry / 2)',
    formulaDisplay: 'Cutoff (200) = Maths + \\frac{Physics}{2} + \\frac{Chemistry}{2}',
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Tamil Nadu Agricultural University, Coimbatore',
    authorityUrl: 'https://tnau.ac.in',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark agriculture merit cutoff for B.Sc. (Hons.) Agriculture, Horticulture, Forestry, and Food Nutrition admissions in TNAU and affiliated colleges.',
    verifiedFormulaText: 'Cutoff = (Physics / 2) + (Chemistry / 2) + (Biology / 2) + (Mathematics / 2) [or Botany + Zoology]',
    formulaDisplay: 'Cutoff (200) = \\frac{Physics + Chemistry + Biology (or Botany + Zoology) + Maths (or Computer Science)}{2}',
    inputs: [
      { id: 'physics', name: 'Physics Marks', shortLabel: 'Physics', min: 0, max: 100, step: 0.5, defaultValue: 88, unit: 'out of 100' },
      { id: 'chemistry', name: 'Chemistry Marks', shortLabel: 'Chemistry', min: 0, max: 100, step: 0.5, defaultValue: 86, unit: 'out of 100' },
      { id: 'biology', name: 'Biology Marks', shortLabel: 'Biology / (Botany+Zoo avg)', min: 0, max: 100, step: 0.5, defaultValue: 92, unit: 'out of 100', hint: 'If you took Botany & Zoology separately, enter their combined average out of 100' },
      { id: 'maths', name: '4th Subject (Maths / Computer Science)', shortLabel: 'Maths / CS', min: 0, max: 100, step: 0.5, defaultValue: 90, unit: 'out of 100' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Subject Normalization to 50 Each',
        description: 'Each of the 4 eligible core subjects is evaluated out of 50 marks by dividing the mark out of 100 by 2.',
        formula: 'Subject Component = Subject Marks / 2',
        example: 'Physics 88/2 = 44, Chemistry 86/2 = 43, Biology 92/2 = 46, Maths 90/2 = 45'
      },
      {
        stepNumber: 2,
        title: 'Combine all 4 Subjects',
        description: 'Sum the four 50-mark components to get the official aggregate cutoff out of 200.',
        formula: 'Cutoff = 44 + 43 + 46 + 45 = 178.00 / 200',
        example: 'Total = 178.00 / 200'
      }
    ],
    officialRules: [
      'Official guidelines of TNAU Undergraduate Admission Brochure.',
      'Academic Stream: Candidates must have studied Physics, Chemistry, Biology/Botany & Zoology, and Mathematics or Computer Science.',
      'Vocational Stream: 5% seats reserved with vocational subject formula as specified by TNAU.'
    ],
    tieBreakingRules: [
      '1. Percentage of marks in Biology (or Botany & Zoology taken together)',
      '2. Percentage of marks in Physics & Chemistry taken together',
      '3. Percentage of marks in 4th core subject (Maths/Computer Science)',
      '4. Date of birth (seniority in age)'
    ],
    faqs: [
      {
        question: 'What if I am a pure science student with Botany and Zoology?',
        answer: 'For pure science students without Mathematics, the four subjects are Physics (50), Chemistry (50), Botany (50), and Zoology (50), adding up to 200. You can enter Botany & Zoology marks accordingly.'
      },
      {
        question: 'Is NEET required for TNAU Agriculture?',
        answer: 'No, NEET is not required for TNAU B.Sc. (Hons.) Agriculture. Admissions are purely based on 12th standard cutoff marks.'
      }
    ],
    calculate: (values) => {
      const p = Math.min(100, Math.max(0, values.physics || 0));
      const c = Math.min(100, Math.max(0, values.chemistry || 0));
      const b = Math.min(100, Math.max(0, values.biology || 0));
      const m = Math.min(100, Math.max(0, values.maths || 0));

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
          { label: 'Biology (50%)', score: Number(b50.toFixed(2)), max: 50, note: 'Divided by 2' },
          { label: '4th Subject (50%)', score: Number(m50.toFixed(2)), max: 50, note: 'Divided by 2' }
        ],
        remarks: `Your official TNAU Agriculture cutoff is ${total} out of 200.`,
        qualifyingStatus: {
          isQualified: total >= 110,
          label: total >= 110 ? 'Eligible for TNAU General Counseling' : 'Below Typical TNAU Merit Cutoff',
          details: 'Official minimum eligibility requires passing with prescribed category aggregate.'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Karnataka Examinations Authority (KEA)',
    authorityUrl: 'https://cetonline.karnataka.gov.in/kea/',
    maxScore: 100,
    scoreUnit: '% / 100',
    summary: 'Calculates the official 50:50 composite merit score for Karnataka Engineering admissions by combining 2nd PUC / 12th Board PCM marks (50% weightage) and KCET entrance exam PCM marks (50% weightage).',
    verifiedFormulaText: 'Combined Score = ((Board PCM / 300) * 50) + ((KCET PCM / 180) * 50)',
    formulaDisplay: 'Merit\\ Score\\ (100) = \\left(\\frac{Board\\ PCM}{300} \\times 50\\right) + \\left(\\frac{KCET\\ PCM}{180} \\times 50\\right)',
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'APSCHE & TGCHE',
    authorityUrl: 'https://cets.apsche.ap.gov.in',
    maxScore: 100,
    scoreUnit: '/ 100',
    summary: 'Calculates the official 75:25 composite score for AP & TS EAPCET combining 75% weightage for EAPCET entrance exam score (out of 160) and 25% weightage for Class 12 / Intermediate Group subjects.',
    verifiedFormulaText: 'Composite = ((EAPCET Score / 160) * 75) + ((Inter Group % / 100) * 25)',
    formulaDisplay: 'Composite\\ Score\\ (100) = \\left(\\frac{EAPCET\\ Marks}{160} \\times 75\\right) + \\left(\\frac{Inter\\ Group\\ Marks}{Total\\ Group\\ Marks} \\times 25\\right)',
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Selection Committee, Directorate of Medical Education & Research, Chennai',
    authorityUrl: 'https://tnmedicalselection.net',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark merit cutoff score for Tamil Nadu Government & Self-Financing Paramedical Degree courses including B.Pharm, B.Sc Nursing, BPT, and Allied Health Sciences.',
    verifiedFormulaText: 'Cutoff = Biology + ((Physics + Chemistry) / 2)',
    formulaDisplay: 'Cutoff (200) = Biology + \\frac{Physics + Chemistry}{2}',
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
          isQualified: total >= 100,
          label: total >= 100 ? 'Eligible for Paramedical Counseling' : 'Below Typical Competitive Score',
          details: 'Official minimum criteria requires passing all prescribed science subjects.'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Tamil Nadu Veterinary and Animal Sciences University, Chennai',
    authorityUrl: 'https://tanuvas.ac.in',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates the official 200-mark veterinary merit cutoff score for B.V.Sc & A.H. admissions in TANUVAS veterinary colleges across Tamil Nadu.',
    verifiedFormulaText: 'Cutoff = Biology + ((Physics + Chemistry) / 2)',
    formulaDisplay: 'Cutoff (200) = Biology\\ (100) + \\frac{Physics + Chemistry}{2}\\ (100)',
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
      'Strict minimum aggregate marks as per Veterinary Council of India (VCI) regulations.'
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
          isQualified: total >= 120,
          label: total >= 185 ? 'High Chance for B.V.Sc & A.H.' : total >= 150 ? 'Moderate Chance' : 'Competitive for B.Tech Tech Courses',
          details: 'Top veterinary colleges (Madras Veterinary College) typically close around 194-198 for General category.'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Commissioner for Entrance Examinations (CEE), Kerala',
    authorityUrl: 'https://cee.kerala.gov.in',
    maxScore: 600,
    scoreUnit: '/ 600',
    summary: 'Calculates the official 50:50 normalized KEAM engineering rank index mark combining KEAM entrance exam score and standardized Class 12 PCM Board score.',
    verifiedFormulaText: 'KEAM Index = Standardized KEAM Entrance Score (300) + Standardized Board PCM Score (300)',
    formulaDisplay: 'Index\\ (600) = Entrance\\ Scaled\\ (300) + Board\\ PCM\\ Scaled\\ (300)',
    inputs: [
      { id: 'keam_entrance', name: 'KEAM Entrance Score', shortLabel: 'KEAM Entrance', min: 0, max: 480, step: 1, defaultValue: 320, unit: 'out of 480 (or total exam marks)', hint: 'Score obtained in KEAM Entrance Examination' },
      { id: 'board_pcm_pct', name: 'Standardized Class 12 Board PCM %', shortLabel: 'Board PCM %', min: 0, max: 100, step: 0.1, defaultValue: 92, unit: '% (out of 100)', hint: 'Normalized / Standardized Class 12 PCM percentage' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Entrance Score Scaling to 300',
        description: 'Your entrance exam score is scaled to an index of 300 marks (50% weightage).',
        formula: 'Scaled Entrance = (Entrance Score / 480) * 300',
        example: '320 / 480 * 300 = 200.00'
      },
      {
        stepNumber: 2,
        title: 'Board PCM Scaling to 300',
        description: 'Normalized 12th Board PCM percentage is scaled to 300 marks (50% weightage).',
        formula: 'Scaled Board = (Board % / 100) * 300',
        example: '92% -> (92 / 100) * 300 = 276.00'
      },
      {
        stepNumber: 3,
        title: 'Combined KEAM Engineering Index',
        description: 'Add both 300-point components to obtain your total index mark out of 600.',
        formula: 'Total Index = 200.00 + 276.00 = 476.00 / 600',
        example: '476.00 / 600'
      }
    ],
    officialRules: [
      'Official ranking method adopted by Commissioner for Entrance Examinations (CEE), Kerala.',
      'Equal weightage of 50:50 is given to the marks obtained in the Entrance Examination and the marks obtained for Mathematics, Physics, and Chemistry in the qualifying examination.',
      'Board marks undergo statistical standardization across state and national boards.'
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
        answer: 'Candidates must score a minimum of 10 marks in each paper of the entrance examination (relaxation applies to SC/ST candidates).'
      }
    ],
    calculate: (values) => {
      const entrance = Math.min(480, Math.max(0, values.keam_entrance || 0));
      const boardPct = Math.min(100, Math.max(0, values.board_pcm_pct || 0));

      const entranceScaled = (entrance / 480) * 300;
      const boardScaled = (boardPct / 100) * 300;
      const total = Number((entranceScaled + boardScaled).toFixed(2));

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'KEAM Entrance Component (50%)', score: Number(entranceScaled.toFixed(2)), max: 300, note: 'Scaled to 300' },
          { label: 'Class 12 Board PCM Component (50%)', score: Number(boardScaled.toFixed(2)), max: 300, note: 'Scaled to 300' }
        ],
        remarks: `Your total KEAM Engineering Index mark is ${total} out of 600.`,
        qualifyingStatus: {
          isQualified: entrance >= 20,
          label: entrance >= 20 ? 'Qualified for Ranking' : 'Below Minimum Threshold',
          details: 'Meets paper qualification criteria.'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Admission Committee for Professional Courses (ACPC), Gujarat',
    authorityUrl: 'https://acpc.gujarat.gov.in',
    maxScore: 100,
    scoreUnit: 'Merit Marks / 100',
    summary: 'Calculates the official 50:50 ACPC Gujarat Engineering merit score combining Class 12 Board PCM theory marks (50% weightage) and GUJCET entrance exam marks (50% weightage).',
    verifiedFormulaText: 'Merit Score = ((Board PCM Theory / 300) * 50) + ((GUJCET PCM / 120) * 50)',
    formulaDisplay: 'Merit\\ Marks\\ (100) = \\left(\\frac{Board\\ PCM\\ Theory}{300} \\times 50\\right) + \\left(\\frac{GUJCET\\ Marks}{120} \\times 50\\right)',
    inputs: [
      { id: 'board_pcm', name: '12th Board PCM Theory Marks', shortLabel: 'Board Theory', min: 0, max: 300, step: 0.5, defaultValue: 250, unit: 'out of 300', hint: 'PCM Theory marks in 12th Board exam (excluding practicals, max 300)' },
      { id: 'gujcet_pcm', name: 'GUJCET Entrance Marks', shortLabel: 'GUJCET Score', min: 0, max: 120, step: 0.25, defaultValue: 95, unit: 'out of 120', hint: 'Physics (40) + Chemistry (40) + Maths (40) in GUJCET (max 120)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Board PCM Theory Marks (50% Weightage)',
        description: 'Theory marks scored in Physics, Chemistry, and Mathematics (max 300) converted to 50.',
        formula: 'Board Component = (Board PCM / 300) * 50',
        example: '(250 / 300) * 50 = 41.67'
      },
      {
        stepNumber: 2,
        title: 'GUJCET Marks (50% Weightage)',
        description: 'GUJCET marks (max 120) converted to 50.',
        formula: 'GUJCET Component = (GUJCET / 120) * 50',
        example: '(95 / 120) * 50 = 39.58'
      },
      {
        stepNumber: 3,
        title: 'ACPC Merit Marks',
        description: 'Sum both components to obtain your official merit score out of 100.',
        formula: 'Merit Marks = 41.67 + 39.58 = 81.25 / 100',
        example: '81.25 / 100'
      }
    ],
    officialRules: [
      'Prescribed by Admission Committee for Professional Courses (ACPC), Government of Gujarat.',
      'Only theory marks of Board PCM are considered (practical marks are excluded).',
      'Eligibility: Minimum 45% (135/300) in PCM theory for Open Category; 40% (120/300) for SC/ST/SEBC/EWS.'
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
        question: 'Does ACPC use 50:50 or 60:40 formula?',
        answer: 'ACPC Gujarat officially amended the merit formula to 50% Board PCM Theory marks + 50% GUJCET marks for fair parity.'
      }
    ],
    calculate: (values) => {
      const board = Math.min(300, Math.max(0, values.board_pcm || 0));
      const gujcet = Math.min(120, Math.max(0, values.gujcet_pcm || 0));

      const boardPart = (board / 300) * 50;
      const gujcetPart = (gujcet / 120) * 50;
      const total = Number((boardPart + gujcetPart).toFixed(2));
      const boardPct = (board / 300) * 100;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Board PCM Theory (50%)', score: Number(boardPart.toFixed(2)), max: 50, note: `${boardPct.toFixed(1)}% theory marks` },
          { label: 'GUJCET Entrance (50%)', score: Number(gujcetPart.toFixed(2)), max: 50, note: `${((gujcet / 120) * 100).toFixed(1)}% entrance marks` }
        ],
        remarks: `Your official ACPC Gujarat merit marks: ${total} out of 100.`,
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'National Testing Agency (NTA) & National Medical Commission (NMC)',
    authorityUrl: 'https://exams.nta.ac.in/NEET/',
    maxScore: 720,
    scoreUnit: '/ 720',
    summary: 'Calculates your NEET UG total score out of 720 from subject marks and evaluates qualifying cutoff percentile status and MBBS admission prospects.',
    verifiedFormulaText: 'NEET Total = Physics (180) + Chemistry (180) + Biology (360)',
    formulaDisplay: 'Score\\ (720) = Physics\\ (180) + Chemistry\\ (180) + Biology\\ (360)',
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
      'Qualifying Cutoff: UR/EWS: 50th percentile (typically ~135 - 164 marks); OBC/SC/ST: 40th percentile (typically ~107 - 129 marks); UR-PwD: 45th percentile.',
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
        answer: 'For All India Quota (15%) General category, a score of 620-655+ is generally required. For state quota seats, cutoffs vary by state, category, and domicile.'
      }
    ],
    calculate: (values) => {
      const p = Math.min(180, Math.max(-45, values.physics || 0));
      const c = Math.min(180, Math.max(-45, values.chemistry || 0));
      const b = Math.min(360, Math.max(-90, values.biology || 0));

      const total = p + c + b;
      const isQualifiedUR = total >= 140;

      let estimate = 'Needs higher score for MBBS seat.';
      if (total >= 620) {
        estimate = 'Strong prospect for Government Medical College (AIQ 15% / Top State Quota).';
      } else if (total >= 540) {
        estimate = 'Good chance for State Quota Govt / Semi-Govt MBBS seats (depending on state/category).';
      } else if (total >= 450) {
        estimate = 'Competitive for Private Medical MBBS / Government BDS & AYUSH courses.';
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
          label: isQualifiedUR ? 'Qualified (Above UR 50th Percentile Cutoff Band)' : 'Below Typical Qualifying Threshold',
          details: isQualifiedUR ? 'Eligible for MCC All India Quota & State Medical Counseling.' : 'Marks below typical qualifying cutoff range for General category.'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'University of Delhi (CSAS UG Portal)',
    authorityUrl: 'https://admission.uod.ac.in',
    maxScore: 800,
    scoreUnit: '/ 800 (or / 600 for B.Sc)',
    summary: 'Calculates the official course-specific merit score for Delhi University Common Seat Allocation System (CSAS UG) based on mapped CUET subject combinations (out of 800 for Commerce/Arts or 600 for B.Sc Science).',
    verifiedFormulaText: 'Merit = Sum of NTA Normalized/Raw Scores of 4 mapped subjects (or 3 mapped subjects for B.Sc)',
    formulaDisplay: 'Merit\\ (800) = Subject\\ 1\\ (200) + Subject\\ 2\\ (200) + Subject\\ 3\\ (200) + Subject\\ 4\\ (200)',
    inputs: [
      { id: 'subject_1', name: 'Subject 1 (e.g. Language / English)', shortLabel: 'Sub 1 (Lang)', min: 0, max: 200, step: 0.5, defaultValue: 185, unit: 'out of 200', hint: 'CUET score in Language (e.g. English)' },
      { id: 'subject_2', name: 'Subject 2 (Domain 1)', shortLabel: 'Sub 2 (Domain)', min: 0, max: 200, step: 0.5, defaultValue: 190, unit: 'out of 200', hint: 'CUET score in Domain Subject 1' },
      { id: 'subject_3', name: 'Subject 3 (Domain 2)', shortLabel: 'Sub 3 (Domain)', min: 0, max: 200, step: 0.5, defaultValue: 180, unit: 'out of 200', hint: 'CUET score in Domain Subject 2' },
      { id: 'subject_4', name: 'Subject 4 (Domain 3 / Math / General)', shortLabel: 'Sub 4 (Domain/Math)', min: 0, max: 200, step: 0.5, defaultValue: 175, unit: 'out of 200', hint: 'CUET score in Domain Subject 3 (enter 0 if calculating 3-subject B.Sc 600-mark merit)' }
    ],
    formulaSteps: [
      {
        stepNumber: 1,
        title: 'Subject Mapping Verification',
        description: 'DU CSAS only considers subjects appeared in CUET that candidate passed in Class 12.',
        formula: '4 Subjects * 200 Marks each = 800 Marks',
        example: '185 + 190 + 180 + 175'
      },
      {
        stepNumber: 2,
        title: 'Aggregate Course Merit Calculation',
        description: 'Sum of selected eligible subjects forms your CSAS merit score.',
        formula: 'Merit = Sub1 + Sub2 + Sub3 + Sub4',
        example: '185 + 190 + 180 + 175 = 730.00 / 800'
      }
    ],
    officialRules: [
      'Mandated by University of Delhi CSAS (UG) Admission Policy.',
      'Candidates must have studied and passed the chosen subjects in Class 12.',
      'For B.Sc. (Hons) Physics, Chemistry, Mathematics: Merit is calculated from PCM out of 600 marks (Language requires min 30% qualifying).',
      'For B.Com (Hons) and BA (Hons): Merit is calculated from 1 Language + 3 Domain subjects out of 800 marks.'
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
      }
    ],
    calculate: (values) => {
      const s1 = Math.min(200, Math.max(0, values.subject_1 || 0));
      const s2 = Math.min(200, Math.max(0, values.subject_2 || 0));
      const s3 = Math.min(200, Math.max(0, values.subject_3 || 0));
      const s4 = Math.min(200, Math.max(0, values.subject_4 || 0));

      const isThreeSubject = s4 === 0;
      const total = Number((s1 + s2 + s3 + s4).toFixed(2));
      const maxScore = isThreeSubject ? 600 : 800;

      return {
        totalCutoff: total,
        breakdown: [
          { label: 'Subject 1', score: s1, max: 200, note: 'Out of 200' },
          { label: 'Subject 2', score: s2, max: 200, note: 'Out of 200' },
          { label: 'Subject 3', score: s3, max: 200, note: 'Out of 200' },
          ...(isThreeSubject ? [] : [{ label: 'Subject 4', score: s4, max: 200, note: 'Out of 200' }])
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'State Common Entrance Test Cell, Maharashtra',
    authorityUrl: 'https://cetcell.mahacet.org',
    maxScore: 200,
    scoreUnit: '/ 200',
    summary: 'Calculates your MHT CET PCM entrance score (Mathematics 100 + Physics 50 + Chemistry 50 = 200) and verifies HSC Class 12 PCM minimum eligibility criteria for CAP counseling.',
    verifiedFormulaText: 'MHT CET Score = Mathematics (100) + Physics (50) + Chemistry (50)',
    formulaDisplay: 'Score\\ (200) = Mathematics\\ (100) + Physics\\ (50) + Chemistry\\ (50)',
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
        description: 'State CET Cell requires candidates to pass HSC with PCM and score minimum 45% (135/300) for Open or 40% (120/300) for Reserved categories.',
        formula: 'HSC % = (HSC PCM / 300) * 100',
        example: '(210 / 300) * 100 = 70.00%'
      }
    ],
    officialRules: [
      'Governed by State CET Cell, Government of Maharashtra Information Brochure.',
      'There is no negative marking in MHT CET.',
      'CAP Engineering ranks are based on the MHT CET Percentile Score computed across exam shifts.'
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
        answer: 'The Maharashtra Government decided to base CAP engineering admissions on 100% MHT CET entrance percentile scores, while Class 12 PCM marks serve as the mandatory qualifying eligibility gate (45% for Open, 40% for Reserved).'
      }
    ],
    calculate: (values) => {
      const m = Math.min(100, Math.max(0, values.maths || 0));
      const p = Math.min(50, Math.max(0, values.physics || 0));
      const c = Math.min(50, Math.max(0, values.chemistry || 0));
      const hsc = Math.min(300, Math.max(0, values.hsc_pcm_marks || 0));

      const total = m + p + c;
      const hscPct = (hsc / 300) * 100;
      const isEligibleOpen = hsc >= 135;

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
          label: isEligibleOpen ? 'Eligible for CAP Counseling (Open & Reserved)' : hsc >= 120 ? 'Eligible for Reserved Categories Only (40%-45%)' : 'HSC Aggregate Below 40%',
          details: isEligibleOpen ? 'Fulfills the mandatory 45% aggregate in HSC PCM.' : 'Open category requires at least 135/300 (45%).'
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
    academicYear: '2025 - 2026',
    conductingAuthority: 'Directorate of Collegiate Education (DCE), Tamil Nadu',
    authorityUrl: 'https://tngasa.in',
    maxScore: 400,
    scoreUnit: '/ 400',
    summary: 'Calculates the official 400-mark cutoff score for Tamil Nadu Government Arts & Science Colleges (TNGASA) based on the 4 core major subjects in 12th standard (excluding language papers).',
    verifiedFormulaText: 'Cutoff = Core Subject 1 + Core Subject 2 + Core Subject 3 + Core Subject 4',
    formulaDisplay: 'Cutoff\\ (400) = Subject\\ 1 + Subject\\ 2 + Subject\\ 3 + Subject\\ 4',
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

export const CATEGORIES = [
  { name: 'Engineering Cutoff', slug: 'engineering', count: 2, description: 'Calculators for state & national engineering admissions including TNEA, MHT CET, and KEAM.' },
  { name: 'Medical Cutoff', slug: 'medical', count: 3, description: 'Cutoff tools for MBBS, BDS, Paramedical, and Veterinary admissions like NEET UG, TN Paramedical, and TANUVAS.' },
  { name: 'Agriculture Cutoff', slug: 'agriculture', count: 1, description: 'Specialized calculators for B.Sc. (Hons.) Agriculture & allied courses including TNAU.' },
  { name: 'State-level Entrance Exam Cutoffs', slug: 'state-entrance', count: 4, description: 'Official formula calculators for KCET, AP EAPCET, TS EAPCET, GUJCET ACPC, and KEAM.' },
  { name: 'College/University Admission Cutoffs', slug: 'university-admission', count: 2, description: 'Calculators for central and state university admissions including DU CSAS CUET and TNGASA.' }
];

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
