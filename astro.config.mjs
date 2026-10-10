// @ts-check
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://allcutoff.com';
const CANONICAL_HOST = 'allcutoff.com';

/**
 * Force the ONE canonical URL shape this site publishes:
 * `https://allcutoff.com` + a clean, slash-free path.
 *
 * `@astrojs/sitemap` wrote `https://allcutoff.com/about/` while `rel=canonical`
 * wrote `https://allcutoff.com/about`. With `trailingSlash: 'ignore'` both
 * returned 200 with no redirect, so the two self-cancelled and advertised a
 * duplicate-URL pair. `trailingSlash: 'never'` below fixes the build-side half;
 * this finishes the job so the sitemap can never drift from the canonical again.
 *
 * Note this is NOT a mirror of `normalizeUrl()` in src/layouts/Layout.astro —
 * that one also forces `https:` and strips query + fragment, which a sitemap URL
 * never carries in the first place. This is the smaller, sitemap-specific rule.
 */
const toCanonical = (href) => {
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }
  if (parsed.hostname !== CANONICAL_HOST) return null;
  const path = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return `${parsed.origin}${path || '/'}`;
};

/**
 * Capture the resolved build output directory. `serialize()` only receives the
 * item, so the path has to be remembered from the config hook — and this
 * integration must sit BEFORE the sitemap in the integrations array, because
 * Astro runs every `astro:config:done` hook before any `astro:build:done` hook.
 */
let outDir = 'dist';
const captureOutDir = {
  name: 'allcutoff-capture-outdir',
  hooks: {
    'astro:config:done': ({ config }) => {
      outDir = typeof config.outDir === 'string' ? config.outDir : fileURLToPath(config.outDir);
    },
  },
};

/**
 * Per-URL `<lastmod>`, read from the `dateModified` the page itself declares in
 * its JSON-LD. That value is a hand-set content-review date, so the sitemap never
 * claims a page changed just because it was redeployed — the one signal a
 * "current-cycle formulas" site cannot afford to get wrong.
 */
const lastmodFromPage = (canonical) => {
  const { pathname } = new URL(canonical);
  const file = pathname === '/'
    ? join(outDir, 'index.html')
    : join(outDir, pathname.replace(/^\//, ''), 'index.html');

  try {
    const html = readFileSync(file, 'utf8');
    const match = /"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/.exec(html);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Copy the generated sitemap-index.xml to sitemap.xml so both standard paths
 * resolve identical, valid XML sitemaps.
 */
const syncSitemapXml = {
  name: 'allcutoff-sync-sitemap-xml',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const targetDir = typeof dir === 'string' ? dir : fileURLToPath(dir);
      const sitemapIndex = join(targetDir, 'sitemap-index.xml');
      const sitemapZero = join(targetDir, 'sitemap-0.xml');
      const sitemapXml = join(targetDir, 'sitemap.xml');
      if (existsSync(sitemapIndex)) {
        copyFileSync(sitemapIndex, sitemapXml);
        copyFileSync(sitemapIndex, join('public', 'sitemap-index.xml'));
        copyFileSync(sitemapIndex, join('public', 'sitemap.xml'));
      }
      if (existsSync(sitemapZero)) {
        copyFileSync(sitemapZero, join('public', 'sitemap-0.xml'));
      }
    },
  },
};

export default defineConfig({
  site: SITE,
  // One canonical, one sitemap URL, one dev-server behaviour per page.
  trailingSlash: 'never',
  devToolbar: {
    enabled: false,
  },
  /*
   * `compressHTML` is OFF, deliberately.
   *
   * Astro's compressor strips the newline between an inline element and the
   * text that follows it, which welded words together in the shipped HTML:
   * `...every subject as equal. Your\n<strong>entrance score</strong> is what`
   * rendered as `equal. Your<strong>entrance score</strong>is what`. It hit
   * every prose paragraph that wrapped a `<strong>`/`<em>`/`<span>` onto its own
   * source line — 33 occurrences across 5 pages, and it is invisible in review
   * because the `.astro` source still reads correctly.
   *
   * The whole page is hand-authored prose, so the bytes saved by collapsing the
   * indentation are worth less than readable, correctly-spaced output. Gzip on
   * the CDN removes most of that difference anyway.
   */
  compressHTML: false,
  integrations: [
    captureOutDir,
    sitemap({
      filter: (page) =>
        !['/about-us', '/contact-us', '/privacy-policy', '/terms-and-conditions', '/404', '/500'].some(
          (r) => page.endsWith(r) || page.endsWith(r + '/')
        ),
      serialize: (item) => {
        const url = toCanonical(item.url);
        if (!url) return undefined;
        const lastmod = lastmodFromPage(url);
        return lastmod ? { ...item, url, lastmod } : { ...item, url };
      },
    }),
    syncSitemapXml,
  ],
  redirects: {
    '/about-us': '/about',
    '/contact-us': '/contact',
    '/privacy-policy': '/privacy',
    '/terms-and-conditions': '/terms',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
