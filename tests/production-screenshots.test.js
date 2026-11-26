import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url));
const imageMeta = (path) => {
  const bytes = read(path);
  assert.deepEqual([...bytes.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
  return {width: bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
};

test('real screenshot assets are present with expected original dimensions', () => {
  assert.deepEqual(imageMeta('../screenshots/production-desktop.png'), {width:1440,height:900});
  assert.deepEqual(imageMeta('../screenshots/production-mobile.png'), {width:390,height:844});
});

test('production screenshot provenance and responsive display are recorded', () => {
  const meta = JSON.parse(read('../screenshots/capture-metadata.json').toString());
  assert.equal(meta.url, 'https://canariascerca.es/');
  assert.match(meta.method, /Playwright/);
  const html = read('../index.html').toString();
  assert.match(html, /<picture>/);
  assert.match(html, /production-desktop\.png/);
  assert.match(html, /production-mobile\.png/);
  assert.match(html, /production-captures/);
});
