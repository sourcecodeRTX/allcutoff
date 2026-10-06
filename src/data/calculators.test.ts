import { describe, it, expect } from 'vitest';
import {
  CALCULATORS,
  getCalculatorBySlug,
  getCalculatorsByCategory,
  getCalculatorsByState,
  NEET_UR_50TH_PERCENTILE_2026,
  NEET_AIQ_15_GENERAL_CLOSING_2025,
} from './calculators';
import type { CalculatorInput, CutoffCalculator } from './calculators';

/* ------------------------------------------------------------------------- *
 * Helpers
 * ------------------------------------------------------------------------- */

function bySlug(slug: string): CutoffCalculator {
  const calc = getCalculatorBySlug(slug);
  expect(calc, `calculator ${slug} must exist`).toBeDefined();
  return calc!;
}

function valuesFrom(
  calc: CutoffCalculator,
  pick: (input: CalculatorInput) => number
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const input of calc.inputs) out[input.id] = pick(input);
  return out;
}

const atMin = (calc: CutoffCalculator) => valuesFrom(calc, (i) => i.min);
const atMax = (calc: CutoffCalculator) => valuesFrom(calc, (i) => i.max);
const atDefaults = (calc: CutoffCalculator) => valuesFrom(calc, (i) => i.defaultValue);

/** Values far above every declared max, one input at a time and all at once. */
function overMax(calc: CutoffCalculator): Record<string, number> {
  const out: Record<string, number> = {};
  for (const input of calc.inputs) out[input.id] = input.max + 5000;
  return out;
}

/** Every input id that calculate() actually reads. */
function idsUsedByCalculate(calc: CutoffCalculator): string[] {
  const src = calc.calculate.toString();
  const ids = new Set<string>();
  for (const match of src.matchAll(/values\.([A-Za-z_$][\w$]*)/g)) ids.add(match[1]);
  for (const match of src.matchAll(/values\[['"]([^'"]+)['"]\]/g)) ids.add(match[1]);
  return [...ids];
}

function expectSaneResult(result: ReturnType<CutoffCalculator['calculate']>, label: string) {
  expect(Number.isFinite(result.totalCutoff), `${label}: totalCutoff must be finite`).toBe(true);
  expect(result.remarks, `${label}: remarks must be a string`).toBeTypeOf('string');
  for (const row of result.breakdown) {
    expect(Number.isFinite(row.score), `${label}: breakdown score for ${row.label}`).toBe(true);
    expect(Number.isFinite(row.max), `${label}: breakdown max for ${row.label}`).toBe(true);
    expect(row.max).toBeGreaterThan(0);
  }
}

/* ------------------------------------------------------------------------- *
 * Structural integrity — catches silent input/calculate drift
 * ------------------------------------------------------------------------- */

describe('Calculator definition integrity', () => {
  it('contains verified calculators with unique IDs and slugs', () => {
    expect(CALCULATORS.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(CALCULATORS.map((c) => c.id));
    const slugs = new Set(CALCULATORS.map((c) => c.slug));
    expect(ids.size).toBe(CALCULATORS.length);
    expect(slugs.size).toBe(CALCULATORS.length);
  });

  it('every id referenced by calculate() exists in the inputs array', () => {
    for (const calc of CALCULATORS) {
      const declared = new Set(calc.inputs.map((i) => i.id));
      for (const id of idsUsedByCalculate(calc)) {
        expect(declared.has(id), `${calc.id}: calculate() reads "${id}" which is not in inputs`).toBe(true);
      }
    }
  });

  it('every declared input id is referenced by calculate()', () => {
    for (const calc of CALCULATORS) {
      const used = new Set(idsUsedByCalculate(calc));
      for (const input of calc.inputs) {
        expect(used.has(input.id), `${calc.id}: input "${input.id}" is never read by calculate()`).toBe(true);
      }
    }
  });

  it('every input has a positive finite max and a usable min/default', () => {
    for (const calc of CALCULATORS) {
      const seen = new Set<string>();
      for (const input of calc.inputs) {
        expect(Number.isFinite(input.max), `${calc.id}/${input.id}: max must be finite`).toBe(true);
        expect(input.max, `${calc.id}/${input.id}: max must be > 0`).toBeGreaterThan(0);
        expect(Number.isFinite(input.min), `${calc.id}/${input.id}: min must be finite`).toBe(true);
        expect(input.min).toBeLessThan(input.max);
        expect(input.defaultValue).toBeGreaterThanOrEqual(input.min);
        expect(input.defaultValue).toBeLessThanOrEqual(input.max);
        expect(seen.has(input.id), `${calc.id}: duplicate input id ${input.id}`).toBe(false);
        seen.add(input.id);
      }
      expect(calc.maxScore, `${calc.id}: maxScore must be > 0`).toBeGreaterThan(0);
    }
  });

  it('renders formulas as plain text, not raw LaTeX', () => {
    for (const calc of CALCULATORS) {
      for (const field of [calc.verifiedFormulaText, calc.formulaDisplay]) {
        expect(field, `${calc.id}: formula fields must be non-empty`).toBeTruthy();
        expect(field, `${calc.id}: formula field contains LaTeX`).not.toMatch(/\\[a-zA-Z{}]/);
      }
      for (const step of calc.formulaSteps) {
        expect(step.formula, `${calc.id}: step formula contains LaTeX`).not.toMatch(/\\[a-zA-Z{}]/);
        expect(step.example, `${calc.id}: step example contains LaTeX`).not.toMatch(/\\[a-zA-Z{}]/);
      }
    }
  });

  it('survives the client-side Function() rebuild the widgets perform', () => {
    // CalculatorWidget.astro / HeroCalculator.astro serialise calculate() with
    // toString() and rebuild it with `new Function`, so every calculate() must be
    // fully self-contained — a reference to a module-level constant would throw
    // ReferenceError in the browser and break the calculator for real students.
    for (const calc of CALCULATORS) {
      const rebuilt = new Function(
        'values',
        `return (${calc.calculate.toString()})(values);`
      ) as (values: Record<string, number>) => ReturnType<CutoffCalculator['calculate']>;
      const result = rebuilt(atDefaults(calc));
      expectSaneResult(result, `${calc.id}/rebuilt`);
      expect(result.totalCutoff).toBe(calc.calculate(atDefaults(calc)).totalCutoff);
    }
  });
});

/* ------------------------------------------------------------------------- *
 * 1. TNEA Tamil Nadu Engineering — Maths + P/2 + C/2, out of 200
 * ------------------------------------------------------------------------- */

describe('TNEA Engineering', () => {
  const tnea = () => bySlug('tnea-engineering-cutoff-calculator');

  it('calculates Maths + (Physics / 2) + (Chemistry / 2)', () => {
    const result = tnea().calculate({ maths: 95, physics: 90, chemistry: 88 });
    expect(result.totalCutoff).toBe(184.00);
    expect(result.breakdown).toHaveLength(3);
    expect(result.breakdown[0].score).toBe(95);
    expect(result.breakdown[1].score).toBe(45);
    expect(result.breakdown[2].score).toBe(44);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = tnea();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(200);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'tnea over-max');
    expect(clamped.totalCutoff).toBe(200);
  });

  it('produces a sane result from its own defaults', () => {
    const calc = tnea();
    expectSaneResult(calc.calculate(atDefaults(calc)), 'tnea defaults');
  });
});

/* ------------------------------------------------------------------------- *
 * 2. TNAU Agriculture — (P + C + B + M) / 2, out of 200
 * ------------------------------------------------------------------------- */

describe('TNAU Agriculture', () => {
  const tnau = () => bySlug('tnau-agriculture-cutoff-calculator');

  it('divides each of the four subjects by 2', () => {
    const result = tnau().calculate({ physics: 88, chemistry: 86, biology: 92, maths: 90 });
    expect(result.totalCutoff).toBe(178.00);
    expect(result.breakdown).toHaveLength(4);
    expect(result.breakdown[0].score).toBe(44);
    expect(result.breakdown[1].score).toBe(43);
    expect(result.breakdown[2].score).toBe(46);
    expect(result.breakdown[3].score).toBe(45);
  });

  it('scores Botany + Zoology as a SUM out of 200, never an average (pure science)', () => {
    // Group II(A) without Mathematics: Physics 50 + Chemistry 50 + Botany 50 + Zoology 50 = 200.
    // Botany 90 and Zoology 90 must score 45 + 45 = 90, not 45.
    const result = tnau().calculate({ physics: 80, chemistry: 80, biology: 180, maths: 0 });
    expect(result.totalCutoff).toBe(170);
    expect(result.breakdown[2].label).toBe('Botany + Zoology (100%)');
    expect(result.breakdown[2].score).toBe(90);
    expect(result.breakdown[2].max).toBe(100);
    expect(result.totalCutoff).toBeLessThanOrEqual(tnau().maxScore);
  });

  it('keeps the /200 total valid on the single-Biology path', () => {
    const result = tnau().calculate({ physics: 100, chemistry: 100, biology: 100, maths: 100 });
    expect(result.totalCutoff).toBe(200);
    expect(result.breakdown[2].label).toBe('Biology (50%)');
  });

  it('allows the Botany + Zoology input to reach 200', () => {
    const biology = tnau().inputs.find((i) => i.id === 'biology');
    expect(biology?.max).toBe(200);
    const result = tnau().calculate({ physics: 0, chemistry: 0, biology: 200, maths: 0 });
    expect(result.totalCutoff).toBe(100);
  });

  it('handles min and over-max inputs without NaN', () => {
    const calc = tnau();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'tnau over-max');
    expect(clamped.totalCutoff).toBe(calc.calculate(atMax(calc)).totalCutoff);
  });

  it('labels the 110 band as indicative, never official', () => {
    const calc = tnau();
    const below = calc.calculate({ physics: 0, chemistry: 0, biology: 0, maths: 0 });
    const above = calc.calculate({ physics: 100, chemistry: 100, biology: 100, maths: 0 });
    expect(below.qualifyingStatus?.isQualified).toBe(false);
    expect(above.qualifyingStatus?.isQualified).toBe(true);
    for (const status of [below.qualifyingStatus, above.qualifyingStatus]) {
      expect(`${status?.label} ${status?.details}`.toLowerCase()).toContain('indicative');
    }
  });

  it('breaks ties in the official G.O. order', () => {
    const rules = tnau().tieBreakingRules;
    expect(rules).toHaveLength(5);
    expect(rules[0]).toMatch(/^1\..*Mathematics/);
    expect(rules[1]).toMatch(/^2\..*Physics/);
    expect(rules[2]).toMatch(/^3\..*Chemistry/);
    expect(rules[3]).toMatch(/^4\..*birth/);
    expect(rules[4]).toMatch(/^5\..*[Rr]andom/);
  });
});

/* ------------------------------------------------------------------------- *
 * 3. KCET Engineering — 50:50 composite out of 100
 * ------------------------------------------------------------------------- */

describe('KCET Engineering', () => {
  const kcet = () => bySlug('kcet-engineering-cutoff-calculator');

  it('combines board and KCET 50:50', () => {
    const result = kcet().calculate({ board_pcm: 270, kcet_pcm: 135 });
    expect(result.totalCutoff).toBe(82.5);
    expect(result.breakdown[0].score).toBe(45);
    expect(result.breakdown[1].score).toBe(37.5);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = kcet();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(100);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'kcet over-max');
    expect(clamped.totalCutoff).toBe(100);
  });
});

/* ------------------------------------------------------------------------- *
 * 4. AP/TS EAPCET — 75:25 composite out of 100
 * ------------------------------------------------------------------------- */

describe('AP/TS EAPCET', () => {
  const eapcet = () => bySlug('eapcet-cutoff-calculator');

  it('combines entrance 75% and inter group 25%', () => {
    const result = eapcet().calculate({ eapcet_marks: 105, inter_group_pct: 92 });
    expect(result.totalCutoff).toBe(72.219);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('enforces the 40/160 minimum qualifying mark', () => {
    const calc = eapcet();
    expect(calc.calculate({ eapcet_marks: 40, inter_group_pct: 0 }).qualifyingStatus?.isQualified).toBe(true);
    expect(calc.calculate({ eapcet_marks: 39.75, inter_group_pct: 0 }).qualifyingStatus?.isQualified).toBe(false);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = eapcet();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(100);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'eapcet over-max');
    expect(clamped.totalCutoff).toBe(100);
  });
});

/* ------------------------------------------------------------------------- *
 * 5. TN Paramedical — Biology + (P + C) / 2, out of 200
 * ------------------------------------------------------------------------- */

describe('TN Paramedical', () => {
  const para = () => bySlug('tn-paramedical-cutoff-calculator');

  it('adds Biology to the halved Physics + Chemistry pair', () => {
    const result = para().calculate({ biology: 90, physics: 82, chemistry: 86 });
    expect(result.totalCutoff).toBe(174.00);
    expect(result.breakdown[0].score).toBe(90);
    expect(result.breakdown[1].score).toBe(84);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = para();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(200);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'paramedical over-max');
    expect(clamped.totalCutoff).toBe(200);
  });

  it('labels the 100 band as indicative, never official', () => {
    const calc = para();
    const status = calc.calculate(atDefaults(calc)).qualifyingStatus;
    expect(`${status?.label} ${status?.details}`.toLowerCase()).toContain('indicative');
  });
});

/* ------------------------------------------------------------------------- *
 * 6. TANUVAS Veterinary — Biology + (P + C) / 2, out of 200, OC min 140
 * ------------------------------------------------------------------------- */

describe('TANUVAS Veterinary', () => {
  const tanuvas = () => bySlug('tanuvas-veterinary-cutoff-calculator');

  it('calculates the 200-mark cutoff', () => {
    const result = tanuvas().calculate({ biology: 96, physics: 92, chemistry: 94 });
    expect(result.totalCutoff).toBe(189.00);
    expect(result.breakdown[0].score).toBe(96);
    expect(result.breakdown[1].score).toBe(93);
  });

  it('uses the official Open Category minimum of 140/200', () => {
    const calc = tanuvas();
    const at139 = calc.calculate({ biology: 60, physics: 80, chemistry: 78 });
    const at140 = calc.calculate({ biology: 60, physics: 80, chemistry: 80 });
    expect(at139.totalCutoff).toBe(139);
    expect(at139.qualifyingStatus?.isQualified).toBe(false);
    expect(at140.totalCutoff).toBe(140);
    expect(at140.qualifyingStatus?.isQualified).toBe(true);
    expect(at140.qualifyingStatus?.label).toContain('Minimum');
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = tanuvas();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(200);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'tanuvas over-max');
    expect(clamped.totalCutoff).toBe(200);
  });
});

/* ------------------------------------------------------------------------- *
 * 7. KEAM Kerala — entrance /600 -> 300 plus 5:3:2 board -> 300, out of 600
 * ------------------------------------------------------------------------- */

describe('KEAM Engineering', () => {
  const keam = () => bySlug('keam-engineering-cutoff-calculator');

  it('treats the entrance paper as 600 marks', () => {
    const calc = keam();
    expect(calc.inputs.find((i) => i.id === 'keam_entrance')?.max).toBe(600);
    const result = calc.calculate({ keam_entrance: 400, board_maths: 92, board_physics: 88, board_chemistry: 90 });
    expect(result.totalCutoff).toBe(471.2);
    expect(result.breakdown[0].score).toBe(200);
    expect(result.breakdown[1].score).toBe(271.2);
  });

  it('applies the mandatory 5:3:2 board ratio (150 / 90 / 60)', () => {
    const result = keam().calculate({ keam_entrance: 0, board_maths: 100, board_physics: 100, board_chemistry: 100 });
    expect(result.totalCutoff).toBe(300);
    const partial = keam().calculate({ keam_entrance: 0, board_maths: 100, board_physics: 0, board_chemistry: 0 });
    expect(partial.totalCutoff).toBe(150);
  });

  it('uses the official 10-mark minimum qualifying threshold', () => {
    const calc = keam();
    const at10 = calc.calculate({ keam_entrance: 10, board_maths: 0, board_physics: 0, board_chemistry: 0 });
    const at9 = calc.calculate({ keam_entrance: 9, board_maths: 0, board_physics: 0, board_chemistry: 0 });
    expect(at10.qualifyingStatus?.isQualified).toBe(true);
    expect(at9.qualifyingStatus?.isQualified).toBe(false);
    expect(at10.qualifyingStatus?.details).toContain('10');
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = keam();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'keam over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
  });

  it('exposes exactly the four inputs calculate() reads', () => {
    expect(keam().inputs.map((i) => i.id)).toEqual([
      'keam_entrance',
      'board_maths',
      'board_physics',
      'board_chemistry',
    ]);
  });
});

/* ------------------------------------------------------------------------- *
 * 8. GUJCET ACPC — 60% board + 40% GUJCET, out of 100
 * ------------------------------------------------------------------------- */

describe('GUJCET ACPC', () => {
  const gujcet = () => bySlug('gujcet-acpc-cutoff-calculator');

  it('weights the board 60 and GUJCET 40', () => {
    const result = gujcet().calculate({ board_pcm: 250, gujcet_pcm: 95 });
    expect(result.totalCutoff).toBe(81.67);
    expect(result.breakdown[0].score).toBe(50);
    expect(result.breakdown[0].max).toBe(60);
    expect(result.breakdown[1].max).toBe(40);
    expect(result.breakdown[0].max + result.breakdown[1].max).toBe(gujcet().maxScore);
  });

  it('no longer claims ACPC amended the formula to 50:50', () => {
    const answers = gujcet()
      .faqs.map((f) => f.answer)
      .join(' ');
    expect(answers).not.toMatch(/amended/i);
    expect(gujcet().verifiedFormulaText).toContain('60');
    expect(gujcet().verifiedFormulaText).toContain('40');
  });

  it('discloses that the raw GUJCET score is only a percentile proxy', () => {
    const calc = gujcet();
    const hint = calc.inputs.find((i) => i.id === 'gujcet_pcm')?.hint ?? '';
    expect(hint.toLowerCase()).toContain('percentile');
    expect(hint.toLowerCase()).toContain('proxy');
    const text = `${calc.remarks} ${calc.officialRules.join(' ')}`.toLowerCase();
    expect(text).toContain('percentile');
  });

  it('keeps the 135/300 open category eligibility gate', () => {
    const calc = gujcet();
    expect(calc.calculate({ board_pcm: 135, gujcet_pcm: 0 }).qualifyingStatus?.isQualified).toBe(true);
    expect(calc.calculate({ board_pcm: 134.5, gujcet_pcm: 0 }).qualifyingStatus?.isQualified).toBe(false);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = gujcet();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'gujcet over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
  });
});

/* ------------------------------------------------------------------------- *
 * 9. NEET UG — total out of 720, percentile framed per year
 * ------------------------------------------------------------------------- */

describe('NEET UG', () => {
  const neet = () => bySlug('neet-ug-cutoff-score-calculator');

  const totalOf = (total: number) => {
    const physics = Math.min(180, Math.max(0, total));
    const chemistry = Math.min(180, Math.max(0, total - physics));
    const biology = Math.min(360, Math.max(0, total - physics - chemistry));
    return neet().calculate({ physics, chemistry, biology });
  };

  it('totals Physics + Chemistry + Biology out of 720', () => {
    const result = neet().calculate({ physics: 140, chemistry: 145, biology: 320 });
    expect(result.totalCutoff).toBe(605);
    expect(result.breakdown[2].score).toBe(320);
    expectSaneResult(result, 'neet known');
  });

  it('gates on the current cycle UR 50th-percentile mark, not a hardcoded 140', () => {
    expect(NEET_UR_50TH_PERCENTILE_2026).toBe(213);
    expect(totalOf(NEET_UR_50TH_PERCENTILE_2026).qualifyingStatus?.isQualified).toBe(true);
    expect(totalOf(NEET_UR_50TH_PERCENTILE_2026 - 1).qualifyingStatus?.isQualified).toBe(false);
    expect(totalOf(140).qualifyingStatus?.isQualified).toBe(false);
    const label = totalOf(NEET_UR_50TH_PERCENTILE_2026).qualifyingStatus?.label ?? '';
    expect(label).toContain(String(NEET_UR_50TH_PERCENTILE_2026));
  });

  it('uses the 2025 AIQ 15% general closing reference of about 525', () => {
    expect(NEET_AIQ_15_GENERAL_CLOSING_2025).toBe(525);
    expect(totalOf(NEET_AIQ_15_GENERAL_CLOSING_2025).remarks).toContain('525');
    expect(totalOf(NEET_AIQ_15_GENERAL_CLOSING_2025 + 1).remarks).toContain('525');
    expect(totalOf(524).remarks).not.toContain('525');
  });

  it('states the percentile rule and the year it belongs to', () => {
    const calc = neet();
    const text = [calc.officialRules.join(' '), calc.faqs.map((f) => f.answer).join(' ')].join(' ');
    expect(text).toMatch(/50th percentile/);
    expect(text).toContain('2026');
    expect(text).not.toMatch(/620/);
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = neet();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(-180);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'neet over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
    const negatives = calc.calculate({ physics: -999, chemistry: -999, biology: -999 });
    expect(negatives.totalCutoff).toBe(-180);
  });
});

/* ------------------------------------------------------------------------- *
 * 10. DU CSAS CUET — four CUET subjects of 250, out of 1000
 * ------------------------------------------------------------------------- */

describe('DU CSAS CUET', () => {
  const duet = () => bySlug('cuet-du-cutoff-score-calculator');

  it('uses 250 marks per CUET subject and a /1000 total', () => {
    const calc = duet();
    expect(calc.maxScore).toBe(1000);
    for (const input of calc.inputs) {
      expect(input.max, `${input.id} must be out of 250`).toBe(250);
      expect(input.unit).toBe('out of 250');
    }
    const result = calc.calculate({ subject_1: 235, subject_2: 240, subject_3: 230, subject_4: 225 });
    expect(result.totalCutoff).toBe(930);
    expect(result.breakdown).toHaveLength(4);
    expect(result.remarks).toContain('1000');
  });

  it('never rescales to /750 just because subject 4 is zero', () => {
    const result = duet().calculate({ subject_1: 250, subject_2: 250, subject_3: 250, subject_4: 0 });
    expect(result.totalCutoff).toBe(750);
    expect(result.breakdown).toHaveLength(4);
    expect(result.remarks).toContain('1000');
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = duet();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'duet over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
  });
});

/* ------------------------------------------------------------------------- *
 * 11. MHT CET — Maths 100 + P 50 + C 50 out of 200, HSC gate 50%
 * ------------------------------------------------------------------------- */

describe('MHT CET', () => {
  const mht = () => bySlug('mht-cet-cutoff-calculator');

  it('calculates the 200-mark CET score', () => {
    const result = mht().calculate({ maths: 76, physics: 38, chemistry: 40, hsc_pcm_marks: 210 });
    expect(result.totalCutoff).toBe(154);
    expect(result.remarks).toContain('70.00');
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('uses the official 50% (150/300) open category HSC gate', () => {
    const calc = mht();
    const at150 = calc.calculate({ maths: 0, physics: 0, chemistry: 0, hsc_pcm_marks: 150 });
    const at149 = calc.calculate({ maths: 0, physics: 0, chemistry: 0, hsc_pcm_marks: 149 });
    expect(at150.qualifyingStatus?.isQualified).toBe(true);
    expect(at149.qualifyingStatus?.isQualified).toBe(false);
    expect(at149.qualifyingStatus?.label).toContain('40%-50%');
    expect(at149.qualifyingStatus?.details).toContain('150/300');
  });

  it('keeps the 40% (120/300) reserved band', () => {
    const calc = mht();
    const at120 = calc.calculate({ maths: 0, physics: 0, chemistry: 0, hsc_pcm_marks: 120 });
    const at119 = calc.calculate({ maths: 0, physics: 0, chemistry: 0, hsc_pcm_marks: 119 });
    expect(at120.qualifyingStatus?.label).toBe('Eligible for Reserved Categories Only (40%-50%)');
    expect(at119.qualifyingStatus?.label).toBe('HSC Aggregate Below 40%');
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = mht();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'mht over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
  });
});

/* ------------------------------------------------------------------------- *
 * 12. TNGASA Arts & Science — four core subjects out of 400
 * ------------------------------------------------------------------------- */

describe('TNGASA Arts & Science', () => {
  const tngasa = () => bySlug('tngasa-arts-and-science-cutoff-calculator');

  it('sums the four core subjects out of 400', () => {
    const result = tngasa().calculate({ sub_1: 94, sub_2: 96, sub_3: 92, sub_4: 90 });
    expect(result.totalCutoff).toBe(372);
    expect(result.remarks).toContain('400');
    expect(result.qualifyingStatus?.label).toBe('Excellent Merit (Top Tier Govt Colleges)');
  });

  it('handles min, max and over-max inputs without NaN', () => {
    const calc = tngasa();
    expect(calc.calculate(atMin(calc)).totalCutoff).toBe(0);
    expect(calc.calculate(atMax(calc)).totalCutoff).toBe(calc.maxScore);
    const clamped = calc.calculate(overMax(calc));
    expectSaneResult(clamped, 'tngasa over-max');
    expect(clamped.totalCutoff).toBe(calc.maxScore);
  });
});

/* ------------------------------------------------------------------------- *
 * Cross-cutting sweep + lookups
 * ------------------------------------------------------------------------- */

describe('Every calculator', () => {
  it('returns finite results for min, max, default and over-max inputs', () => {
    for (const calc of CALCULATORS) {
      for (const [label, values] of [
        ['min', atMin(calc)],
        ['max', atMax(calc)],
        ['defaults', atDefaults(calc)],
        ['over-max', overMax(calc)],
      ] as const) {
        expectSaneResult(calc.calculate(values), `${calc.id}/${label}`);
      }
    }
  });

  it('clamps every input at its own max rather than trusting the caller', () => {
    for (const calc of CALCULATORS) {
      for (const input of calc.inputs) {
        const spiked = valuesFrom(calc, (i) => (i.id === input.id ? i.max + 1234 : i.defaultValue));
        const atDeclaredMax = valuesFrom(calc, (i) => (i.id === input.id ? i.max : i.defaultValue));
        expectSaneResult(calc.calculate(spiked), `${calc.id}/spike-${input.id}`);
        expect(
          calc.calculate(spiked).totalCutoff,
          `${calc.id}/${input.id} must clamp at max`
        ).toBe(calc.calculate(atDeclaredMax).totalCutoff);
      }
    }
  });

  it('filters calculators by category and state', () => {
    const engg = getCalculatorsByCategory('engineering');
    expect(engg.length).toBeGreaterThanOrEqual(2);

    const tn = getCalculatorsByState('tamil-nadu');
    expect(tn.length).toBeGreaterThanOrEqual(4);
  });
});
