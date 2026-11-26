import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {locations, observations, traffic, editorial} from '../data.js';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('geodata distinct and within Canary Islands bounding box',()=>{
  assert.equal(locations.length,9);
  assert.equal(new Set(locations.map(x=>x.id)).size,locations.length);
  for(const p of locations){assert.ok(p.lat>27&&p.lat<30);assert.ok(p.lng>-19&&p.lng<-13)}
});
test('synthetic live observations exist for three layers',()=>{
  assert.deepEqual(Object.keys(observations).sort(),['Calima','Seismic','Weather']);
  Object.values(observations).forEach(x=>assert.ok(x.length>0));
});
test('chart and editorial demo valid',()=>{assert.equal(traffic.length,12);assert.ok(editorial.every(x=>x.title&&x.summary))});
test('no production fetches or known secret patterns in browser code',()=>{
  const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.ok(!js.includes('canariascerca.es/api/'));
  assert.ok(!/sk-[a-zA-Z0-9]{20,}/.test(js));
  assert.ok(html.includes('SIMULADO'));
});

test('Spanish UI labels keep internal API categories stable',()=>{
  const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(html,/Explora las islas/);
  assert.match(html,/value="Nature">Naturaleza/);
  assert.match(js,/const categoryLabels/);
});
