import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = [
  'index.html',
  'blog.html',
  'blog-post.html',
  'founder-story/index.html',
  'impulse-spending-app/index.html',
  'adhd-spending-tracker/index.html',
  'shopping-wait-timer/index.html',
  'privacy.html',
  'terms.html',
];

test('site pages use the self-hosted accessibility font', async () => {
  const pages = await Promise.all(pagePaths.map(path => readFile(path, 'utf8')));
  for (const html of pages) {
    assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
  }

  const styles = await readFile('styles.css', 'utf8');
  assert.match(styles, /atkinson-hyperlegible-400\.woff2/);
  assert.match(styles, /atkinson-hyperlegible-700\.woff2/);
});

test('shared runtime exposes menu and accessible carousel state', async () => {
  const script = await readFile('script.js', 'utf8');

  assert.match(script, /aria-expanded/);
  assert.match(script, /aria-pressed/);
  assert.match(script, /aria-hidden/);
});

test('carousel offers optional five-second playback and starts paused', async () => {
  const [html, script] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('script.js', 'utf8'),
  ]);

  const screens = [...html.matchAll(/class="screenshot-wrapper(?: active)?" data-screen="(\d+)"/g)].map(match => match[1]);
  const controls = [...html.matchAll(/class="nav-dot(?: active)?" data-screen="(\d+)"/g)].map(match => match[1]);
  assert.deepEqual(controls, screens, 'Every genuine screen has a matching navigation control');
  assert.match(html, /class="carousel-playback"/);
  assert.match(script, /let isPausedByUser = true/);
  assert.match(script, /CAROUSEL_AUTOPLAY_DELAY\s*=\s*5000/);
  assert.match(script, /window\.setTimeout/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
  assert.match(script, /visibilitychange/);
  assert.match(script, /IntersectionObserver/);
  assert.doesNotMatch(script, /mouseenter|isPointerPaused|isFocusPaused/);
});

test('reduced-motion and minimum touch targets are defined', async () => {
  const styles = await readFile('styles.css', 'utf8');

  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /\.nav-dot\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(styles, /\.mobile-menu-toggle\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
});

test('hero phone preserves the complete screenshot aspect ratio', async () => {
  const styles = await readFile('styles.css', 'utf8');

  assert.match(styles, /\.phone-mockup\s*\{[^}]*height:\s*auto;/s);
  assert.match(styles, /\.phone-mockup img\s*\{[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/s);
});

test('screenshot carousel reserves breathing room around the complete phone frame', async () => {
  const styles = await readFile('styles.css', 'utf8');

  assert.match(styles, /\.screenshot-container\s*\{[^}]*min-height:\s*840px;/s);
  assert.match(styles, /@media\s*\(max-width:\s*768px\)[\s\S]*\.screenshot-container\s*\{[^}]*min-height:\s*735px;/s);
});

test('monthly and annual prices stay consistent in the plan details and structured data', async () => {
  const [html, styles] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('styles.css', 'utf8'),
  ]);

  assert.match(html, /<span class="amount">\$4\.99<\/span>/);
  assert.match(html, /"price":\s*"4\.99"/);
  assert.match(html, /<span class="period">per year<\/span>/);
  assert.match(html, /<span class="amount">\$29\.99<\/span>/);
  assert.match(html, /"price":\s*"29\.99"/);
  assert.doesNotMatch(html, /29\.00/);
  assert.match(styles, /\.hero-stats\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.match(styles, /\.hero-stats\s*\{[^}]*column-gap:\s*0;[^}]*justify-items:\s*center;/s);
  assert.match(styles, /\.stat\s*\{[^}]*align-items:\s*center;[^}]*text-align:\s*center;/s);
  assert.match(styles, /@media\s*\(max-width:\s*768px\)[\s\S]*\.hero-stats\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
});

test('shared wordmarks use the new optimized app icon', async () => {
  const [html, styles, icon] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('styles.css', 'utf8'),
    readFile('assets/images/impulselog-app-icon.png'),
  ]);

  assert.ok(icon.length > 0);
  assert.equal(icon[25], 6, 'optimized logo should remain an RGBA PNG');
  assert.match(styles, /\.logo-icon\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;[^}]*impulselog-app-icon\.png[^}]*\}/s);
  assert.match(styles, /\.logo-icon svg\s*\{[^}]*display:\s*none;/s);
  assert.match(html, /"logo":\s*"https:\/\/www\.impulselog\.com\/assets\/images\/impulselog-app-icon\.png"/);
});
