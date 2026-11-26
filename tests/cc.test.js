import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
test('FastAPI playground includes typed request, validation and response',()=>{
  assert.match(html,/id="cc-limit"/);
  assert.match(html,/id="cc-api-result"/);
  assert.match(script,/status: 422/);
  assert.match(script,/limit < 1/);
  assert.match(script,/limit > 500/);
});
test('replayable pipeline and real cache-warmer intervals',()=>{
  assert.match(html,/id="cc-run-pipeline"/);
  for (const interval of ['600 s','1,800 s','3,600 s','21,600 s']) assert.ok(html.includes(interval));
  assert.match(script,/Fallback selected: previously validated snapshot retained/);
});
