import { describe, it, expect } from 'vitest';
import {
  UNIVERSITY_CONFIGS,
  EXAM_CONFIGS,
  ACADEMIC_CALCULATORS,
  classifyDivision,
  calculateSgpa,
  calculateCgpaFromSemesters,
  calculateCgpaToPercentage,
  calculatePercentageToCgpa,
  calculateMarksPercentage,
  calculateTargetScorePlan,
  calculateAttendance,
  calculateRankToPercentile,
  calculatePercentileToRank,
  predictExamPercentile,
  getAcademicCalculatorBySlug,
  getAcademicCalculatorsByType,
  getAllAcademicCalculatorSlugs,
} from './academicCalculators';

describe('University Grading Configurations', () => {
  it('defines all required universities with valid grade scales', () => {
    const requiredKeys = ['universal', 'vit', 'ktu', 'vtu', 'anna-university', 'aktu', 'cbse'] as const;
    for (const key of requiredKeys) {
      const config = UNIVERSITY_CONFIGS[key];
      expect(config, `Config for ${key} must exist`).toBeDefined();
      expect(config.gradingScale).toBe(10);
      expect(config.grades.length).toBeGreaterThanOrEqual(6);
      expect(typeof config.toPercentage).toBe('function');
      expect(typeof config.toCgpa).toBe('function');
    }
  });

  it('verifies KTU grade scale contains 8.5 for grade A', () => {
    const ktu = UNIVERSITY_CONFIGS.ktu;
    const gradeA = ktu.grades.find((g) => g.grade === 'A');
    expect(gradeA).toBeDefined();
    expect(gradeA?.points).toBe(8.5);
  });

  it('verifies VIT grade scale contains S grade with 10 points', () => {
    const vit = UNIVERSITY_CONFIGS.vit;
    const gradeS = vit.grades.find((g) => g.grade === 'S');
    expect(gradeS).toBeDefined();
    expect(gradeS?.points).toBe(10);
  });
});

describe('Division Classification', () => {
  it('correctly classifies percentages into academic divisions', () => {
    expect(classifyDivision(82).division).toBe('First Class with Distinction');
    expect(classifyDivision(75).division).toBe('First Class with Distinction');
    expect(classifyDivision(68).division).toBe('First Class');
    expect(classifyDivision(60).division).toBe('First Class');
    expect(classifyDivision(55).division).toBe('Second Class');
    expect(classifyDivision(50).division).toBe('Second Class');
    expect(classifyDivision(42).division).toBe('Third Class / Pass Division');
    expect(classifyDivision(35).division).toBe('Third Class / Pass Division');
    expect(classifyDivision(30).division).toBe('Fail / Essential Repeat');
  });

  it('handles CGPA inputs when isCgpa is true', () => {
    expect(classifyDivision(8.5, true).division).toBe('First Class with Distinction');
    expect(classifyDivision(6.8, true).division).toBe('First Class');
    expect(classifyDivision(5.2, true).division).toBe('Second Class');
    expect(classifyDivision(3.0, true).division).toBe('Fail / Essential Repeat');
  });
});

describe('SGPA Calculation', () => {
  it('calculates weighted SGPA correctly', () => {
    const subjects = [
      { name: 'Mathematics', gradePoint: 10, credit: 4 }, // 40
      { name: 'Physics', gradePoint: 9, credit: 3 },      // 27
      { name: 'Chemistry', gradePoint: 8, credit: 3 },    // 24
      { name: 'Computer Science', gradePoint: 9, credit: 4 }, // 36
      { name: 'Physics Lab', gradePoint: 10, credit: 1.5 },   // 15
      { name: 'Workshop', gradePoint: 8, credit: 1.5 }       // 12
    ];
    // Total weighted: 40 + 27 + 24 + 36 + 15 + 12 = 154
    // Total credits: 4 + 3 + 3 + 4 + 1.5 + 1.5 = 17
    // SGPA = 154 / 17 = 9.0588... -> 9.06
    const result = calculateSgpa(subjects);
    expect(result.sgpa).toBe(9.06);
    expect(result.totalCredits).toBe(17);
    expect(result.earnedCredits).toBe(17);
    expect(result.division.division).toBe('First Class with Distinction');
    expect(result.breakdown.length).toBe(6);
  });

  it('handles zero or empty subjects gracefully without crashing', () => {
    const resultEmpty = calculateSgpa([]);
    expect(resultEmpty.sgpa).toBe(0);
    expect(resultEmpty.totalCredits).toBe(0);
    expect(resultEmpty.earnedCredits).toBe(0);
    expect(resultEmpty.breakdown).toEqual([]);
  });

  it('factors in failed subjects (0 points) reducing SGPA while counting total credits', () => {
    const subjects = [
      { name: 'Course 1', gradePoint: 10, credit: 4 }, // 40
      { name: 'Course 2', gradePoint: 0, credit: 4 }   // 0 (Fail)
    ];
    // 40 / 8 = 5.0
    const result = calculateSgpa(subjects);
    expect(result.sgpa).toBe(5.0);
    expect(result.totalCredits).toBe(8);
    expect(result.earnedCredits).toBe(4);
  });
});

describe('CGPA Multi-Semester Calculation', () => {
  it('calculates weighted cumulative CGPA across semesters', () => {
    const semesters = [
      { semesterNumber: 1, sgpa: 8.5, credit: 20 }, // 170
      { semesterNumber: 2, sgpa: 9.0, credit: 22 }, // 198
      { semesterNumber: 3, sgpa: 8.0, credit: 21 }, // 168
      { semesterNumber: 4, sgpa: 9.5, credit: 23 }  // 218.5
    ];
    // Total weighted: 170 + 198 + 168 + 218.5 = 754.5
    // Total credits: 20 + 22 + 21 + 23 = 86
    // CGPA = 754.5 / 86 = 8.7732... -> 8.77
    const result = calculateCgpaFromSemesters(semesters);
    expect(result.cgpa).toBe(8.77);
    expect(result.totalCredits).toBe(86);
    expect(result.semesters.length).toBe(4);
    expect(result.semesters[0].cumulativeCgpa).toBe(8.5);
    expect(result.semesters[1].cumulativeCgpa).toBe(8.76); // (170+198)/42 = 8.7619 -> 8.76
  });

  it('handles equal semester credits identical to simple average', () => {
    const semesters = [
      { semesterNumber: 1, sgpa: 8.0, credit: 20 },
      { semesterNumber: 2, sgpa: 9.0, credit: 20 }
    ];
    const result = calculateCgpaFromSemesters(semesters);
    expect(result.cgpa).toBe(8.5);
    expect(result.totalCredits).toBe(40);
  });

  it('handles empty semesters array safely', () => {
    const result = calculateCgpaFromSemesters([]);
    expect(result.cgpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });
});

describe('CGPA to Percentage & Reverse Formulas', () => {
  it('accurately converts CBSE / AICTE (multiplier 9.5)', () => {
    const res = calculateCgpaToPercentage(9.0, 'cbse');
    expect(res.percentage).toBe(85.5);

    const rev = calculatePercentageToCgpa(85.5, 'cbse');
    expect(rev.cgpa).toBe(9.0);
  });

  it('accurately converts VTU official CBCS formula: (CGPA - 0.75) * 10', () => {
    // 8.0 CGPA -> (8.0 - 0.75) * 10 = 7.25 * 10 = 72.5%
    const res = calculateCgpaToPercentage(8.0, 'vtu');
    expect(res.percentage).toBe(72.5);

    // Reverse: 72.5% -> (72.5 / 10) + 0.75 = 7.25 + 0.75 = 8.0
    const rev = calculatePercentageToCgpa(72.5, 'vtu');
    expect(rev.cgpa).toBe(8.0);

    // Below 0.75 should clamp to 0
    expect(calculateCgpaToPercentage(0.5, 'vtu').percentage).toBe(0);
  });

  it('accurately converts KTU Kerala formula: (10 * CGPA) - 3.75', () => {
    // 8.0 CGPA -> (10 * 8.0) - 3.75 = 80 - 3.75 = 76.25%
    const res = calculateCgpaToPercentage(8.0, 'ktu');
    expect(res.percentage).toBe(76.25);

    // Reverse: 76.25% -> (76.25 + 3.75) / 10 = 80 / 10 = 8.0
    const rev = calculatePercentageToCgpa(76.25, 'ktu');
    expect(rev.cgpa).toBe(8.0);
  });

  it('accurately converts Anna University & VIT formula: CGPA * 10', () => {
    const resAnna = calculateCgpaToPercentage(8.5, 'anna-university');
    expect(resAnna.percentage).toBe(85.0);

    const revAnna = calculatePercentageToCgpa(85.0, 'anna-university');
    expect(revAnna.cgpa).toBe(8.5);

    const resVit = calculateCgpaToPercentage(9.2, 'vit');
    expect(resVit.percentage).toBe(92.0);
  });

  it('accurately converts AKTU formula: (CGPA - 0.75) * 10', () => {
    const res = calculateCgpaToPercentage(8.25, 'aktu');
    expect(res.percentage).toBe(75.0);
  });

  it('clamps extreme inputs to valid ranges', () => {
    expect(calculateCgpaToPercentage(15, 'universal').cgpa).toBe(10);
    expect(calculateCgpaToPercentage(-2, 'universal').cgpa).toBe(0);
    expect(calculatePercentageToCgpa(150, 'universal').percentage).toBe(100);
    expect(calculatePercentageToCgpa(-10, 'universal').percentage).toBe(0);
  });
});

describe('Marks Percentage & Target Planner', () => {
  it('calculates total percentage across subjects', () => {
    const subjects = [
      { name: 'Physics', obtained: 85, maxMarks: 100 },
      { name: 'Chemistry', obtained: 78, maxMarks: 100 },
      { name: 'Mathematics', obtained: 92, maxMarks: 100 },
      { name: 'English', obtained: 80, maxMarks: 100 },
      { name: 'Computer Science', obtained: 95, maxMarks: 100 }
    ];
    // Total obtained: 430 / 500 = 86.0%
    const res = calculateMarksPercentage(subjects);
    expect(res.totalObtained).toBe(430);
    expect(res.totalMax).toBe(500);
    expect(res.percentage).toBe(86.0);
    expect(res.isPassing).toBe(true);
    expect(res.division.division).toBe('First Class with Distinction');
  });

  it('marks fail if any individual subject is below passing threshold', () => {
    const subjects = [
      { name: 'Physics', obtained: 85, maxMarks: 100, passingMarks: 35 },
      { name: 'Chemistry', obtained: 25, maxMarks: 100, passingMarks: 35 }, // failed
      { name: 'Mathematics', obtained: 90, maxMarks: 100, passingMarks: 35 }
    ];
    const res = calculateMarksPercentage(subjects);
    expect(res.isPassing).toBe(false);
    expect(res.division.division).toBe('Fail / Essential Repeat');
    expect(res.subjects[1].isPass).toBe(false);
  });

  it('plans target scores accurately for achievable goals', () => {
    // Current: 60/100 (60%). Target: 75% on final 200 total (remaining max: 100).
    // Final total needed: 200 * 0.75 = 150.
    // Needed in remaining: 150 - 60 = 90 out of 100 (90%).
    const plan = calculateTargetScorePlan(60, 100, 75, 100);
    expect(plan.status).toBe('achievable');
    expect(plan.neededTotal).toBe(150);
    expect(plan.neededInRemaining).toBe(90);
    expect(plan.neededPercentageInRemaining).toBe(90);
  });

  it('detects mathematically impossible target scores', () => {
    // Current: 40/100. Target: 80% on 150 total (remaining max: 50).
    // Final total needed: 150 * 0.8 = 120.
    // Needed in remaining: 120 - 40 = 80 out of 50 -> impossible!
    const plan = calculateTargetScorePlan(40, 100, 80, 50);
    expect(plan.status).toBe('impossible');
    expect(plan.neededInRemaining).toBe(80);
    expect(plan.neededPercentageInRemaining).toBe(160);
  });

  it('detects already achieved targets', () => {
    // Current: 90/100. Target: 70% on 120 total (remaining max: 20).
    // Final total needed: 120 * 0.70 = 84.
    // Needed in remaining: 84 - 90 = -6 <= 0 -> already achieved!
    const plan = calculateTargetScorePlan(90, 100, 70, 20);
    expect(plan.status).toBe('already_achieved');
    expect(plan.neededInRemaining).toBe(0);
  });
});

describe('Attendance Percentage & Safe Bunk Calculator', () => {
  it('calculates safe bunks when attendance is above target 75%', () => {
    // Attended: 36, Total: 40 -> 90%. Target: 75%.
    // Safe bunks: floor((100 * 36 - 75 * 40) / 75) = floor((3600 - 3000) / 75) = floor(600 / 75) = 8
    const res = calculateAttendance(36, 40, 75);
    expect(res.currentPercentage).toBe(90.0);
    expect(res.status).toBe('safe');
    expect(res.safeBunks).toBe(8);
    expect(res.consecutiveNeeded).toBe(0);
    expect(res.threshold75.meets).toBe(true);
  });

  it('calculates consecutive classes needed when attendance has shortage', () => {
    // Attended: 25, Total: 40 -> 62.5%. Target: 75%.
    // Consecutive needed: ceil((75 * 40 - 100 * 25) / (100 - 75)) = ceil((3000 - 2500) / 25) = ceil(500 / 25) = 20
    const res = calculateAttendance(25, 40, 75);
    expect(res.currentPercentage).toBe(62.5);
    expect(res.status).toBe('shortage');
    expect(res.safeBunks).toBe(0);
    expect(res.consecutiveNeeded).toBe(20);
    expect(res.threshold75.meets).toBe(false);
  });

  it('identifies exact on-track attendance', () => {
    // Attended: 30, Total: 40 -> 75%.
    const res = calculateAttendance(30, 40, 75);
    expect(res.currentPercentage).toBe(75.0);
    expect(res.status).toBe('on_track');
    expect(res.safeBunks).toBe(0);
    expect(res.consecutiveNeeded).toBe(0);
  });

  it('calculates multi-threshold status for 75%, 80%, and 85%', () => {
    // Attended: 33, Total: 40 -> 82.5%.
    const res = calculateAttendance(33, 40, 75);
    expect(res.threshold75.meets).toBe(true);
    expect(res.threshold80.meets).toBe(true);
    expect(res.threshold85.meets).toBe(false);
    expect(res.threshold85.consecutiveNeeded).toBeGreaterThan(0);
  });

  it('handles zero total classes safely', () => {
    const res = calculateAttendance(0, 0, 75);
    expect(res.currentPercentage).toBe(0);
    expect(res.safeBunks).toBe(0);
  });
});

describe('Percentile and Rank Calculations', () => {
  it('calculates exact percentile from rank and total candidates', () => {
    // Rank 1 out of 100,000 -> 100.0%
    const p1 = calculateRankToPercentile(1, 100000);
    expect(p1.percentile).toBe(100.0);

    // Rank 1,001 out of 100,000:
    // (1 - (1000) / 100000) * 100 = (1 - 0.01) * 100 = 99.0%
    const p2 = calculateRankToPercentile(1001, 100000);
    expect(p2.percentile).toBe(99.0);
  });

  it('calculates estimated rank from percentile', () => {
    // 99.0% out of 100,000:
    // round((1 - 0.99) * 100000 + 1) = round(1000 + 1) = 1001
    const r1 = calculatePercentileToRank(99.0, 100000);
    expect(r1.estimatedRank).toBe(1001);

    // 100.0% out of 1,450,000 -> Rank 1
    const rTop = calculatePercentileToRank(100.0, 1450000);
    expect(rTop.estimatedRank).toBe(1);

    // 0.0% out of 1,450,000 -> Rank 1,450,000
    const rBottom = calculatePercentileToRank(0.0, 1450000);
    expect(rBottom.estimatedRank).toBe(1450000);
  });

  it('predicts JEE Main benchmarks accurately', () => {
    const topScore = predictExamPercentile('jee-main', 285);
    expect(topScore.estimatedPercentileMin).toBe(99.99);
    expect(topScore.estimatedRankMax).toBe(150);

    const midScore = predictExamPercentile('jee-main', 110);
    expect(midScore.estimatedPercentileMin).toBe(90.0);
    expect(midScore.estimatedPercentileMax).toBe(94.99);
  });

  it('predicts CAT benchmarks accurately', () => {
    const topCat = predictExamPercentile('cat', 115);
    expect(topCat.estimatedPercentileMin).toBe(99.90);
    expect(topCat.estimatedRankMax).toBe(330);

    const callRange = predictExamPercentile('cat', 85);
    expect(callRange.estimatedPercentileMin).toBe(99.0);
  });

  it('predicts MHT CET PCM benchmarks accurately', () => {
    const topCet = predictExamPercentile('mht-cet-pcm', 170);
    expect(topCet.estimatedPercentileMin).toBe(99.70);
  });
});

describe('Academic Calculator Metadata Registry', () => {
  it('registers all 17 planned calculator tools and variants', () => {
    expect(ACADEMIC_CALCULATORS.length).toBe(17);

    const expectedSlugs = [
      'cgpa-calculator',
      'vit-cgpa-calculator',
      'ktu-cgpa-calculator',
      'vtu-cgpa-calculator',
      'anna-university-cgpa-calculator',
      'sgpa-calculator',
      'ktu-sgpa-calculator',
      'vtu-sgpa-calculator',
      'aktu-sgpa-calculator',
      'sgpa-to-cgpa-calculator',
      'cgpa-to-percentage-calculator',
      'marks-percentage-calculator',
      'attendance-percentage-calculator',
      'percentile-calculator',
      'jee-main-percentile-calculator',
      'cat-percentile-calculator',
      'mht-cet-percentile-calculator'
    ];

    const actualSlugs = getAllAcademicCalculatorSlugs();
    for (const expected of expectedSlugs) {
      expect(actualSlugs, `Slug ${expected} must be in registry`).toContain(expected);
    }
  });

  it('ensures each tool has rich SEO metadata, keywords, and FAQs', () => {
    for (const tool of ACADEMIC_CALCULATORS) {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeTypeOf('string');
      expect(tool.shortName).toBeTypeOf('string');
      expect(tool.title.length, `Title for ${tool.slug} should be descriptive`).toBeGreaterThan(15);
      expect(tool.metaDescription.length, `Meta description for ${tool.slug} should be rich`).toBeGreaterThan(50);
      expect(tool.keywords.length, `Keywords for ${tool.slug} must have >= 3 terms`).toBeGreaterThanOrEqual(3);
      expect(tool.faqs.length, `FAQs for ${tool.slug} must have >= 2 items`).toBeGreaterThanOrEqual(2);
      expect(tool.howToUse.length, `How to use steps for ${tool.slug} must have >= 2 steps`).toBeGreaterThanOrEqual(2);
      for (const faq of tool.faqs) {
        expect(faq.question).toBeTypeOf('string');
        expect(faq.answer).toBeTypeOf('string');
      }
    }
  });

  it('allows lookups by slug and by tool type', () => {
    const cgpa = getAcademicCalculatorBySlug('cgpa-calculator');
    expect(cgpa).toBeDefined();
    expect(cgpa?.toolType).toBe('cgpa');

    const percentileTools = getAcademicCalculatorsByType('percentile');
    expect(percentileTools.length).toBe(4); // universal, jee-main, cat, mht-cet
  });
});
