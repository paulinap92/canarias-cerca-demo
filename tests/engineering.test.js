import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
test('all recruiter-facing pages and docs use English', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(readme, /engineering/i);
  assert.doesNotMatch(html, /<html lang="(?:pl|es)">/);
});
test('technical walkthrough rather than portal imitation', () => {
  assert.match(html, /Source excerpts|Code browser/);
  assert.match(html, /Production website/);
  assert.match(html, /synthetic|fictional/i);
  assert.doesNotMatch(html, /tourism index|monthly visitors|monthly traffic|fictitious statistics/i);
});
test('interactive architecture, code tabs and documentation exist', () => {
  assert.match(html, /data-code=/);
  assert.match(html, /id="code"/);
  assert.match(html, /id="overview"/);
  assert.ok(css.length > 2000);
  assert.ok(js.length > 4000);
  execFileSync('node', ['--check', new URL('../app.js', import.meta.url).pathname]);
});
test('no browser production API connections or embedded secrets', () => {
  assert.doesNotMatch(js, /\bfetch\s*\(/);
  assert.doesNotMatch(js, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(js, /sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{20,}/);
  assert.doesNotMatch(html, /type="password"/);
});
test('real optional public screenshots remain available', () => {
  for(const name of ['production-desktop.png','production-mobile.png']){
    const path = new URL('../screenshots/'+name, import.meta.url);
    assert.ok(statSync(path).size > 40000);
  }
});
