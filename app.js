'use strict';

// Standalone browser-only demonstration. All data is synthetic.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shortTime = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

const stages = [
  { title: 'External providers', label: '01 / PROVIDERS', body: 'Weather stations, seismic bulletins, air-quality feeds and curated geographic sources arrive with different formats and availability guarantees.', bullets: ['Treat provider input as untrusted.', 'A failed source must not invalidate previously good data.', 'Decouple collection from public HTTP requests.'], contract: 'Input: heterogeneous provider payload' },
  { title: 'Python background jobs', label: '02 / COLLECTION', body: 'Asynchronous tasks schedule bounded, staggered requests to external endpoints. Errors are logged per task without bringing down unrelated refresh loops.', bullets: ['Timeouts and HTTP status checks.', 'Task-specific refresh intervals.', 'Isolate failure domains.'], contract: 'Output: candidate observations' },
  { title: 'Validation and normalization', label: '03 / DATA QUALITY', body: 'Validate input structure before promoting it into public-facing storage. Normalize provider-specific values to a stable response contract.', bullets: ['Check required fields and allowed ranges.', 'Reject malformed input.', 'Track sample provenance and freshness.'], contract: 'Gate: accepted or rejected snapshot' },
  { title: 'Persisted snapshot', label: '04 / PERSISTENCE', body: 'Durable records or snapshots provide the read-side source of truth. They allow API requests to stay useful when upstream data is temporarily unavailable.', bullets: ['Keep last-known-good state.', 'Store observed timestamps.', 'Separate writes from reads.'], contract: 'Output: consistent saved state' },
  { title: 'FastAPI service', label: '05 / CONTRACT', body: 'Typed FastAPI endpoints expose read APIs. Query constraints are enforced at the request boundary; refresh operations use separate write paths.', bullets: ['Validate limit with Query(ge=1, le=500).', 'Return structured JSON to consumers.', 'Keep route logic small and testable.'], contract: 'HTTP: GET read / POST refresh' },
  { title: 'JavaScript + MapLibre', label: '06 / CLIENT', body: 'The browser consumes normalized features and environmental observations. MapLibre renders geographic layers; the API determines data semantics.', bullets: ['Keep UI filters separate from provider logic.', 'Render empty and stale states explicitly.', 'Do not expose backend secrets to the client.'], contract: 'Output: geospatial experience' },
];

const safePoints = {
  'tenerife': [
    { name: 'Sample coastal location', type: 'Feature', geometry: { type: 'Point', coordinates: [-16.55, 28.10] } },
    { name: 'Sample mountain viewpoint', type: 'Feature', geometry: { type: 'Point', coordinates: [-16.62, 28.26] } },
    { name: 'Sample town square', type: 'Feature', geometry: { type: 'Point', coordinates: [-16.56, 28.48] } },
  ],
  'gran-canaria': [
    { name: 'Sample natural viewpoint', type: 'Feature', geometry: { type: 'Point', coordinates: [-15.58, 27.97] } },
    { name: 'Sample cultural location', type: 'Feature', geometry: { type: 'Point', coordinates: [-15.41, 28.12] } },
  ],
  'la-palma': [
    { name: 'Sample volcanic trail', type: 'Feature', geometry: { type: 'Point', coordinates: [-17.84, 28.68] } },
    { name: 'Sample coast location', type: 'Feature', geometry: { type: 'Point', coordinates: [-17.75, 28.56] } },
  ],
};

function renderStage(index) {
  $$('#cc-flow .flow-node').forEach((el, i) => el.classList.toggle('active', i === index));
  const stage = stages[index];
  $('#cc-selected-stage').textContent = stage.label;
  const box = $('#cc-stage-detail');
  box.replaceChildren();
  const heading = document.createElement('h3'); heading.textContent = stage.title;
  const paragraph = document.createElement('p'); paragraph.textContent = stage.body;
  const list = document.createElement('ul');
  stage.bullets.forEach((value) => { const li = document.createElement('li'); li.textContent = value; list.appendChild(li); });
  const contract = document.createElement('div'); contract.className = 'mono'; contract.textContent = stage.contract;
  box.append(heading, paragraph, list, contract);
}
$$('#cc-flow [data-stage]').forEach((button) => button.addEventListener('click', () => renderStage(Number(button.dataset.stage))));
renderStage(0);

let runSerial = 0;
function terminalLine(container, message, kind = '') {
  if (container.dataset.empty !== 'false') { container.replaceChildren(); container.dataset.empty = 'false'; }
  const line = document.createElement('p');
  const time = document.createElement('span'); time.className = 'time'; time.textContent = `[${shortTime()}] `;
  const value = document.createElement('span'); value.className = kind; value.textContent = message;
  line.append(time, value); container.append(line); container.scrollTop = container.scrollHeight;
}
const pipelineLog = $('#cc-pipeline-log');
$('#cc-run-pipeline').addEventListener('click', async () => {
  const serial = ++runSerial;
  const failure = $('#cc-provider-failure').checked;
  const button = $('#cc-run-pipeline'); button.disabled = true;
  pipelineLog.dataset.empty = 'true';
  $$('#cc-flow .flow-node').forEach((node) => node.classList.remove('done'));
  terminalLine(pipelineLog, 'Starting local pipeline replay · fixture=weather-tenerife');
  for (let i = 0; i < (failure ? 2 : stages.length); i++) {
    await wait(230);
    if (serial !== runSerial) return;
    renderStage(i);
    $$('#cc-flow .flow-node')[i].classList.add('done');
    terminalLine(pipelineLog, `${String(i + 1).padStart(2, '0')}/06 ${stages[i].title} · complete`, 'ok');
  }
  if (failure) {
    await wait(250);
    if (serial !== runSerial) return;
    renderStage(3);
    terminalLine(pipelineLog, 'Provider timeout (simulated) · candidate rejected', 'bad');
    terminalLine(pipelineLog, 'Fallback selected: previously validated snapshot retained', 'warn');
    terminalLine(pipelineLog, 'HTTP reads remain available from the saved snapshot', 'ok');
    $('#pipeline-state').textContent = 'Degraded · fallback retained';
  } else {
    terminalLine(pipelineLog, 'Normalized snapshot accepted · API serves saved data', 'ok');
    $('#pipeline-state').textContent = 'Completed · snapshot available';
  }
  button.disabled = false;
});
$('#cc-reset-pipeline').addEventListener('click', () => {
  ++runSerial;
  $('#cc-run-pipeline').disabled = false;
  $$('#cc-flow .flow-node').forEach((node) => node.classList.remove('done'));
  renderStage(0);
  pipelineLog.textContent = '[ready] Pipeline has not been executed.';
  pipelineLog.dataset.empty = 'true';
  $('#pipeline-state').textContent = 'Ready for walkthrough';
});

function requestExample({ island, limit, format }) {
  const errors = [];
  if (!Number.isInteger(limit)) errors.push({ loc: ['query', 'limit'], msg: 'Input should be a valid integer', type: 'int_parsing' });
  else if (limit < 1) errors.push({ loc: ['query', 'limit'], msg: 'Input should be greater than or equal to 1', type: 'greater_than_equal' });
  else if (limit > 500) errors.push({ loc: ['query', 'limit'], msg: 'Input should be less than or equal to 500', type: 'less_than_equal' });
  if (errors.length) return { status: 422, body: { detail: errors } };
  const points = safePoints[island] || [];
  const features = points.slice(0, limit).map((p, index) => ({
    type: 'Feature', id: `example-${index + 1}`, geometry: p.geometry,
    properties: { title: p.name, source: 'synthetic portfolio fixture' },
  }));
  return { status: 200, body: format === 'summary'
    ? { island, returned: features.length, has_more: points.length > features.length, fixture: true }
    : { type: 'FeatureCollection', features, meta: { island, limit, fixture: true } } };
}
$('#cc-send-request').addEventListener('click', () => {
  const island = $('#cc-island').value;
  const raw = $('#cc-limit').value;
  const limit = raw.trim() === '' ? Number.NaN : Number(raw);
  const format = $('#cc-format').value;
  $('#cc-request-url').textContent = `GET /api/regions/canarias/places?island=${island}&limit=${encodeURIComponent(raw)}`;
  const result = requestExample({ island, limit, format });
  $('#cc-api-status').textContent = `HTTP ${result.status}`;
  $('#cc-api-status').className = `status ${result.status === 200 ? 'done' : 'error'}`;
  $('#cc-api-result').textContent = JSON.stringify(result.body, null, 2);
});

const jobs = ['Alerts / seismic / news', 'Weather across 8 islands', 'Air quality and tides', 'Volcanic and wildlife'];
$$('#cc-jobs [data-job]').forEach((button) => button.addEventListener('click', async () => {
  const id = Number(button.dataset.job);
  const area = $('#cc-job-log');
  area.dataset.empty = 'true';
  button.disabled = true;
  terminalLine(area, `Starting ${jobs[id]} (local replay)`);
  for (const action of ['Queue batch', 'Apply request timeout', 'Process each feed', 'Record successful outcome']) {
    await wait(175); terminalLine(area, action + ' · OK', 'ok');
  }
  terminalLine(area, 'Finished · no external request sent', 'ok');
  button.disabled = false;
}));
$('#cc-clear-job-log').addEventListener('click', () => { const box = $('#cc-job-log'); box.textContent = '[ready] Select a job to replay its steps.'; box.dataset.empty = 'true'; });

const snippets = {
  fastapi: {
    title: 'PYTHON / FASTAPI',
    note: 'Short formatting-adapted excerpt based on the private FastAPI places route. Query limits match the source implementation.',
    code: `from typing import Any\nfrom fastapi import APIRouter, Query\n\nrouter = APIRouter(prefix="/api/regions/canarias/places")\n\n@router.get("")\nasync def get_places(\n    limit: int = Query(100, ge=1, le=500),\n    island: str | None = Query(None),\n) -> dict[str, Any]:\n    data = source.read(island=island)\n    return trim(data, limit)\n\n# Source adapter and persistence implementation omitted.`
  },
  jobs: {
    title: 'PYTHON / ASYNCIO',
    note: 'Condensed from the private cache-warmer module; routes and configuration details are omitted.',
    code: `async def refresh_loop(paths: list[str], interval: int):\n    async with httpx.AsyncClient(timeout=90.0) as client:\n        while True:\n            for path in paths:\n                try:\n                    response = await client.get(path)\n                    response.raise_for_status()\n                except Exception:\n                    logger.exception("Refresh failed")\n                await asyncio.sleep(2)\n            await asyncio.sleep(interval)\n\n# Individual job groups use different intervals.`
  },
  validation: {
    title: 'PYTHON / VALIDATION PATTERN',
    note: 'Illustrative Pydantic boundary, not a copied production data model.',
    code: `from pydantic import BaseModel, Field\n\nclass Observation(BaseModel):\n    island: str = Field(min_length=2)\n    temperature_c: float = Field(ge=-60, le=70)\n    observed_at: str\n\ndef accept_candidate(payload: dict) -> Observation:\n    # Malformed provider data never replaces a saved snapshot.\n    return Observation.model_validate(payload)`
  },
  javascript: {
    title: 'JAVASCRIPT / BROWSER SIMULATOR',
    note: 'Real excerpt from this public demo, not claimed to be a production frontend source file.',
    code: `function validateLimit(limit) {\n  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {\n    return { status: 422, error: 'Invalid query limit' };\n  }\n  return { status: 200, limit };\n}\n\n// The public case study simulates API errors without\n// sending a request to a real FastAPI instance.`
  }
};
function showCode(which) {
  const snippet = snippets[which];
  if (!snippet) return;
  $$('#cc-code-tabs button').forEach((button) => {
    const active = button.dataset.code === which;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $('#cc-code-title').textContent = snippet.title;
  $('#cc-code-note').textContent = snippet.note;
  $('#cc-code').textContent = snippet.code;
}
$$('#cc-code-tabs button').forEach((button) => button.addEventListener('click', () => showCode(button.dataset.code)));
showCode('fastapi');
$('#cc-copy-code').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#cc-code').textContent); $('#cc-copy-code').textContent = 'Copied'; setTimeout(() => { $('#cc-copy-code').textContent = 'Copy excerpt'; }, 1200); }
  catch { $('#cc-copy-code').textContent = 'Select text to copy'; }
});

// Expose pure validation for the Node test suite, without changing browser behavior.
if (typeof module !== 'undefined' && module.exports) module.exports = { requestExample };
