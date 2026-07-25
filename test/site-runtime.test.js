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

test('shared runtime exposes menu and carousel state without automatic rotation', async () => {
  const script = await readFile('script.js', 'utf8');

  assert.match(script, /aria-expanded/);
  assert.match(script, /aria-pressed/);
  assert.match(script, /aria-hidden/);
  assert.doesNotMatch(script, /setInterval\s*\(/);
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
