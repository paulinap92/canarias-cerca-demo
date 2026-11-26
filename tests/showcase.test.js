import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');

test('architecture includes a real, scoped code excerpt without secrets', () => {
  const html = read('index.html');
  const examples = read('docs/source-excerpts.md');
  assert.match(html, /class="source-excerpt"/);
  assert.match(examples, /```python/);
  assert.doesNotMatch(examples, /OPENAI_API_KEY|DJANGO_SECRET_KEY|postgres:\/\/|BEGIN (RSA|OPENSSH) PRIVATE KEY/);
});
test('hero displays actual production screenshots, not illustrations', () => {
  const html = read('index.html');
  assert.match(html, /production-desktop\.png/);
  assert.match(html, /product-shot-fallback/);
  assert.doesNotMatch(html, /class="hero-art"/);
  assert.ok(existsSync(join(root, 'tools/capture_public_site.py')));
  assert.ok(existsSync(join(root, 'screenshots/production-desktop.png')));
  assert.ok(existsSync(join(root, 'screenshots/production-mobile.png')));
});
