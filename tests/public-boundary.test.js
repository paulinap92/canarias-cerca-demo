import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const code = ['index.html', 'app.js', 'data.js', 'styles.css']
  .map(name => readFileSync(new URL(name, root), 'utf8'))
  .join('\n');

test('public app is standalone and does not call production endpoints', () => {
  assert.doesNotMatch(code, /fetch\s*\(/);
  assert.doesNotMatch(code, /https?:\/\/[^\s"']*canariascerca\.es\/api\//);
  assert.doesNotMatch(code, /\b(?:postgres(?:ql)?:\/\/|mongodb(?:\+srv)?:\/\/)/i);
  assert.doesNotMatch(code, /(?:OPENAI_API_KEY|TAVILY_API_KEY|DATABASE_URL|PRIVATE_KEY)\s*=/);
});

test('static demo ships no local environment or credential files', () => {
  const names = readdirSync(root);
  assert.ok(!names.some(name => /^\.env(?:\.|$)|^id_rsa$|\.pem$|\.key$/i.test(name)));
});
