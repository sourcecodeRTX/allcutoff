import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CALCULATORS, CATEGORIES, STATES } from './calculators';
import { ACADEMIC_CALCULATORS } from './academicCalculators';

const SITE_URL = 'https://allcutoff.com';
const CANONICAL_HOST = 'allcutoff.com';

/**
 * Re-derives the exact canonical normalization logic from src/layouts/Layout.astro
 * to verify canonical URL contracts across all routes.
 */
function normalizeUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url, `${SITE_URL}/`);
  } catch {
    return `${SITE_URL}/`;
  }

  parsed.protocol = 'https:';
  parsed.host = CANONICAL_HOST;
  parsed.search = '';
  parsed.hash = '';

  const path = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return `${parsed.origin}${path || '/'}`;
}

describe('SEO & Canonical URL Consistency', () => {
  it('enforces non-www canonical host and https protocol', () => {
    expect(normalizeUrl('http://www.allcutoff.com/calculator/tnea-engineering-cutoff-calculator')).toBe(
      'https://allcutoff.com/calculator/tnea-engineering-cutoff-calculator'
    );
    expect(normalizeUrl('https://www.allcutoff.com/state/karnataka')).toBe(
      'https://allcutoff.com/state/karnataka'
    );
    expect(normalizeUrl('http://allcutoff.com/about')).toBe(
      'https://allcutoff.com/about'
    );
  });

  it('strips trailing slashes from all paths except root', () => {
    expect(normalizeUrl('https://allcutoff.com/')).toBe('https://allcutoff.com/');
    expect(normalizeUrl('https://allcutoff.com/calculator/')).toBe('https://allcutoff.com/calculator');
    expect(normalizeUrl('https://allcutoff.com/tools/')).toBe('https://allcutoff.com/tools');
    expect(normalizeUrl('https://allcutoff.com/privacy/')).toBe('https://allcutoff.com/privacy');
    expect(normalizeUrl('https://allcutoff.com/contact/')).toBe('https://allcutoff.com/contact');
    expect(normalizeUrl('https://allcutoff.com/calculator/attendance-percentage-calculator/')).toBe(
      'https://allcutoff.com/calculator/attendance-percentage-calculator'
    );
    expect(normalizeUrl('https://allcutoff.com/state/all-india/')).toBe(
      'https://allcutoff.com/state/all-india'
    );
  });

  it('strips query parameters and hash fragments', () => {
    expect(normalizeUrl('https://allcutoff.com/?calc=tnea')).toBe('https://allcutoff.com/');
    expect(normalizeUrl('https://allcutoff.com/tools#cutoff-tools-section')).toBe('https://allcutoff.com/tools');
    expect(normalizeUrl('https://allcutoff.com/calculator/sgpa-calculator?ref=test#result')).toBe(
      'https://allcutoff.com/calculator/sgpa-calculator'
    );
  });

  it('resolves relative paths to absolute canonical URLs', () => {
    expect(normalizeUrl('/calculator')).toBe('https://allcutoff.com/calculator');
    expect(normalizeUrl('/tools')).toBe('https://allcutoff.com/tools');
    expect(normalizeUrl('/state/karnataka')).toBe('https://allcutoff.com/state/karnataka');
  });
});

describe('Cloudflare _redirects Configuration', () => {
  const redirectsPath = join(process.cwd(), 'public', '_redirects');

  it('verifies that public/_redirects exists', () => {
    expect(existsSync(redirectsPath)).toBe(true);
  });

  it('contains valid 301 redirects and no redirect loops', () => {
    const content = readFileSync(redirectsPath, 'utf8');
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));

    expect(lines.length).toBeGreaterThan(0);

    for (const line of lines) {
      const parts = line.split(/\s+/);
      expect(parts.length).toBe(3);
      const [from, to, status] = parts;

      expect(['301', '302']).toContain(status);
      expect(from).not.toBe(to); // No self-redirect loop

      // If redirecting from a trailing slash to non-trailing slash, target must not have trailing slash
      if (from.endsWith('/') && !from.includes('*')) {
        expect(to.endsWith('/')).toBe(false);
      }
    }
  });

  it('includes essential 404-remediation and canonicalization rules', () => {
    const content = readFileSync(redirectsPath, 'utf8');

    // Calculator directory normalization
    expect(content).toContain('/calculator/ /calculator 301');

    // Tools trailing slash normalization
    expect(content).toContain('/tools/ /tools 301');

    // Legacy paths
    expect(content).toContain('/about-us /about 301');
    expect(content).toContain('/contact-us /contact 301');
    expect(content).toContain('/privacy-policy /privacy 301');
    expect(content).toContain('/terms-and-conditions /terms 301');
  });
});

describe('Calculator & Tools Route Inventory', () => {
  it('has 12 entrance cutoff calculators and 17 academic calculators (total 29)', () => {
    expect(CALCULATORS.length).toBe(12);
    expect(ACADEMIC_CALCULATORS.length).toBe(17);
    expect(CALCULATORS.length + ACADEMIC_CALCULATORS.length).toBe(29);
  });

  it('ensures all calculator slugs are unique and URL-safe', () => {
    const allSlugs = [
      ...CALCULATORS.map((c) => c.slug),
      ...ACADEMIC_CALCULATORS.map((c) => c.slug),
    ];
    const uniqueSlugs = new Set(allSlugs);
    expect(uniqueSlugs.size).toBe(allSlugs.length);

    for (const slug of allSlugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug.endsWith('/')).toBe(false);
    }
  });

  it('ensures all categories and states are defined with clean slugs', () => {
    expect(CATEGORIES.length).toBe(5);
    expect(STATES.length).toBe(8);

    for (const cat of CATEGORIES) {
      expect(cat.slug).toMatch(/^[a-z0-9-]+$/);
    }
    for (const st of STATES) {
      expect(st.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('verifies src/pages/calculator/index.astro exists and provides the directory page', () => {
    const calcIndexPath = join(process.cwd(), 'src', 'pages', 'calculator', 'index.astro');
    expect(existsSync(calcIndexPath)).toBe(true);

    const content = readFileSync(calcIndexPath, 'utf8');
    expect(content).toContain("canonical = `${SITE_URL}/calculator`");
    expect(content).toContain("All Admission Cutoff Calculators & Merit Score Directory");
  });
});

describe('Sitemap Validation', () => {
  it('ensures generated sitemap includes canonical /calculator and /tools without trailing slash', () => {
    const sitemapPath = join(process.cwd(), 'public', 'sitemap-0.xml');
    if (!existsSync(sitemapPath)) return;

    const xml = readFileSync(sitemapPath, 'utf8');

    // Must contain canonical URLs
    expect(xml).toContain('<loc>https://allcutoff.com/calculator</loc>');
    expect(xml).toContain('<loc>https://allcutoff.com/tools</loc>');
    expect(xml).toContain('<loc>https://allcutoff.com/privacy</loc>');
    expect(xml).toContain('<loc>https://allcutoff.com/contact</loc>');

    // Must NOT contain trailing slashes (except root)
    expect(xml).not.toContain('<loc>https://allcutoff.com/calculator/</loc>');
    expect(xml).not.toContain('<loc>https://allcutoff.com/tools/</loc>');
    expect(xml).not.toContain('<loc>https://allcutoff.com/privacy/</loc>');

    // Must NOT contain legacy redirect URLs or error pages
    expect(xml).not.toContain('/about-us');
    expect(xml).not.toContain('/contact-us');
    expect(xml).not.toContain('/privacy-policy');
    expect(xml).not.toContain('/terms-and-conditions');
    expect(xml).not.toContain('/404');
    expect(xml).not.toContain('/500');
  });
});
