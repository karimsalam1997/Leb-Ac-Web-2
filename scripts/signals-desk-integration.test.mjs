import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const base = new URL('../public/signals-desk/', import.meta.url);
const source = new URL('../design-reference/2026-09-27-signal-desk/source/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, base), 'utf8');
test('desk uses local assets, shared data and a visible snapshot label', () => {
  const html = read('index.html');
  assert.match(html, /website-theme.css/);
  assert.match(read('website-theme.css'), /#3c2240/i);
  assert.match(html, /Saved reporting edition/);
  assert.doesNotMatch(html, /unpkg.com|\/public\//);
  assert.match(read('desk.mjs'), /\/signals-desk\/data\//);
  assert.match(read('daily-analysis.mjs'), /\/signals-desk\/data\//);
});
test('all recovered reports and dated geometry are unchanged', () => {
  for (const name of ['live-social.json','source-status.json','yellow-line-liveuamap.geojson','lebanon-boundary.geojson','daily-analysis.json','analysis-archive.json']) {
    assert.equal(read('data/'+name), fs.readFileSync(new URL('data/signal-desk/'+name, source),'utf8'));
  }
  assert.equal(JSON.parse(read('data/live-social.json')).events.length,458);
  const geometry=JSON.parse(read('data/yellow-line-liveuamap.geojson'));
  const coords=geometry.features[0].geometry.coordinates;
  assert.equal(coords.length,143);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(coords)).digest('hex'),'b4769934b5c6d331a24a54312837374d0de13fd48fa28eff00efccbc6074034c');
});
test('dated editions and local map dependencies are packaged', () => {
  assert.equal(JSON.parse(read('data/analysis/2026-09-09.json')).date,'2026-09-09');
  assert.match(read('archive/2026-09-07/index.html'), /\/signal-desk/);
  assert.ok(read('vendor/leaflet.js').includes('Leaflet'));
  assert.ok(fs.statSync(new URL('fonts/CormorantGaramond.ttf',base)).size>100000);
});
