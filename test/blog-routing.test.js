import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getArchiveRedirectTarget,
  getUnavailablePostRedirectTarget,
} from '../api/_lib/blog-routing.js';

test('retired blog filters redirect to the canonical archive', () => {
  assert.equal(getArchiveRedirectTarget({ tag: 'ADHD' }), '/blog');
  assert.equal(getArchiveRedirectTarget({ category: 'Finance' }), '/blog');
});

test('empty stale archive pages redirect while healthy pages remain available', () => {
  assert.equal(getArchiveRedirectTarget({ page: 3, hasPosts: false }), '/blog');
  assert.equal(getArchiveRedirectTarget({ page: 3, hasPosts: true }), null);
  assert.equal(getArchiveRedirectTarget({ page: 1, hasPosts: false }), null);
});

test('disabled posts retire cleanly while invented URLs keep a proper 404 path', () => {
  assert.equal(getUnavailablePostRedirectTarget('unpublished'), '/blog');
  assert.equal(getUnavailablePostRedirectTarget('missing'), null);
});
