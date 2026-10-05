import { describe, it, expect } from 'vitest';
import { CALCULATORS, getCalculatorBySlug, getCalculatorsByCategory, getCalculatorsByState } from './calculators';

describe('Verified Cutoff Calculators Engine', () => {
  it('contains verified calculators with unique IDs and slugs', () => {
    expect(CALCULATORS.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(CALCULATORS.map(c => c.id));
    const slugs = new Set(CALCULATORS.map(c => c.slug));
    expect(ids.size).toBe(CALCULATORS.length);
    expect(slugs.size).toBe(CALCULATORS.length);
  });

  it('correctly calculates TNEA Tamil Nadu Engineering Cutoff (Maths + P/2 + C/2)', () => {
    const tnea = getCalculatorBySlug('tnea-engineering-cutoff-calculator');
    expect(tnea).toBeDefined();

    const result = tnea!.calculate({ maths: 95, physics: 90, chemistry: 88 });
    expect(result.totalCutoff).toBe(184.00);
    expect(result.breakdown).toHaveLength(3);
    expect(result.breakdown[0].score).toBe(95);
    expect(result.breakdown[1].score).toBe(45);
    expect(result.breakdown[2].score).toBe(44);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('correctly calculates TNAU Agriculture Cutoff (all 4 subjects divided by 2)', () => {
    const tnau = getCalculatorBySlug('tnau-agriculture-cutoff-calculator');
    expect(tnau).toBeDefined();

    const result = tnau!.calculate({ physics: 88, chemistry: 86, biology: 92, maths: 90 });
    expect(result.totalCutoff).toBe(178.00);
    expect(result.breakdown).toHaveLength(4);
    expect(result.breakdown[0].score).toBe(44);
    expect(result.breakdown[1].score).toBe(43);
    expect(result.breakdown[2].score).toBe(46);
    expect(result.breakdown[3].score).toBe(45);
  });

  it('correctly calculates KCET Engineering 50:50 composite score', () => {
    const kcet = getCalculatorBySlug('kcet-engineering-cutoff-calculator');
    expect(kcet).toBeDefined();

    // Board PCM: 270/300 (45 points), KCET PCM: 135/180 (37.5 points)
    const result = kcet!.calculate({ board_pcm: 270, kcet_pcm: 135 });
    expect(result.totalCutoff).toBe(82.5);
    expect(result.breakdown[0].score).toBe(45);
    expect(result.breakdown[1].score).toBe(37.5);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('correctly calculates AP/TS EAPCET 75:25 composite score', () => {
    const eapcet = getCalculatorBySlug('eapcet-cutoff-calculator');
    expect(eapcet).toBeDefined();

    // EAPCET 105/160 (49.219 points), Inter: 92% (23 points)
    const result = eapcet!.calculate({ eapcet_marks: 105, inter_group_pct: 92 });
    expect(result.totalCutoff).toBe(72.219);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('correctly calculates NEET UG total score out of 720', () => {
    const neet = getCalculatorBySlug('neet-ug-cutoff-score-calculator');
    expect(neet).toBeDefined();

    const result = neet!.calculate({ physics: 140, chemistry: 145, biology: 320 });
    expect(result.totalCutoff).toBe(605);
    expect(result.qualifyingStatus?.isQualified).toBe(true);
  });

  it('correctly calculates TN Paramedical Cutoff (Bio + (P+C)/2)', () => {
    const paramedical = getCalculatorBySlug('tn-paramedical-cutoff-calculator');
    expect(paramedical).toBeDefined();

    // Biology: 90, Physics: 82, Chemistry: 86 -> 90 + 84 = 174
    const result = paramedical!.calculate({ biology: 90, physics: 82, chemistry: 86 });
    expect(result.totalCutoff).toBe(174.00);
  });

  it('correctly filters calculators by category and state', () => {
    const engg = getCalculatorsByCategory('engineering');
    expect(engg.length).toBeGreaterThanOrEqual(2);

    const tn = getCalculatorsByState('tamil-nadu');
    expect(tn.length).toBeGreaterThanOrEqual(4);
  });
});
