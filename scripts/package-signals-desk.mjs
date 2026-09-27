import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recovery = path.join(root, 'design-reference/2026-09-27-signal-desk');
const source = path.join(recovery, 'source');
const output = path.join(root, 'public/signals-desk');
const write = (name, data) => {
  const dest = path.join(output, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
};
const data = JSON.parse(fs.readFileSync(path.join(source, 'data/signal-desk/live-social.json'), 'utf8'));
for (const name of ['index.html','desk.mjs','desk-model.mjs','daily-analysis.mjs','desk.css','editorial.css','reference.css','archive/2026-09-07/index.html']) {
  let content = fs.readFileSync(path.join(source, name), 'utf8')
    .replaceAll('/data/signal-desk/', '/signals-desk/data/')
    .replaceAll('https://unpkg.com/leaflet@1.9.4/dist/', '/signals-desk/vendor/');
  if (name === 'index.html') {
    content = content.replace('</head>', '<link rel="stylesheet" href="./website-theme.css">\n</head>')
      .replace(/<img class="brand-logo"[^>]*>/, '<span class="edition-label">Saved reporting edition</span>')
      .replace('· Live updates. Mapped. In context.', '· Reporting, mapped and in context.')
      .replace('href="./archive/2026-09-07/"', 'href="/signal-desk?edition=2026-09-07" target="_top"')
      .replace('aria-label="Live Lebanon updates"', 'aria-label="Saved Lebanon reports"')
      .replace('<p id="notice"', '<p class="snapshot-note">This is the saved September 2026 edition. Reports, source checks and map layers retain their original dates.</p>\n<p id="notice"');
    content = content.replace(/window\.retainedSnapshot=([\s\S]*?);<\/script>/, () => `window.retainedSnapshot=${JSON.stringify(data).replaceAll('<', '\\u003c')};</script>`);
  }
  if (name === 'desk.mjs') {
    content = content.replace("$('count').textContent=events.filter(e=>dayKey(e.timestamp)===today).length+' updates today · '+events.length+' retained';", "$('count').textContent=events.length+' retained reports';$('current-date').textContent='Edition saved '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Beirut',dateStyle:'long'}).format(new Date(next.generatedAt));")
      .replace("document.documentElement.requestFullscreen()", "document.querySelector('.frame').requestFullscreen()");
  }
  if (name === 'daily-analysis.mjs') {
    content = content.replace("a.href='?edition='+e.date+'#analysis';", "a.href='/signal-desk?edition='+e.date+'#analysis';a.target='_top';")
      .replace("old.href='./archive/2026-09-07/';", "old.href='/signal-desk?edition=2026-09-07';old.target='_top';")
      .replace("latest.href=location.pathname+'#analysis';", "latest.href='/signal-desk#analysis';latest.target='_top';");
  }
  if (name.startsWith('archive/')) {
    content = content.replace('</head>', '<link rel="stylesheet" href="../../website-theme.css"><style>.brand{display:none}main{max-width:760px;padding:28px 0 40px}.back{color:var(--ink);margin:0 0 28px}h1{font-family:"Desk Cormorant",Georgia,serif}article{font-family:Georgia,serif}</style></head>')
      .replace('href="../../"', 'href="/signal-desk" target="_top"')
      .replace('Return to the live map', 'Return to Signals Desk');
  }
  write(name, content);
}
fs.rmSync(path.join(output,'data'), {recursive:true,force:true});
fs.cpSync(path.join(source,'data/signal-desk'), path.join(output,'data'), {recursive:true});
fs.cpSync(path.join(root,'node_modules/leaflet/dist'), path.join(output,'vendor'), {recursive:true,filter: p => !p.endsWith('.map') && !p.endsWith('leaflet-src.js') && !p.endsWith('leaflet-src.esm.js')});
write('fonts/CormorantGaramond.ttf', fs.readFileSync(path.join(recovery,'CormorantGaramond.ttf')));
write('website-theme.css', fs.readFileSync(path.join(recovery,'website-theme.css')));
// Normalize the upstream Leaflet stylesheet's CRLF lines for a clean diff.
write('vendor/leaflet.css', fs.readFileSync(path.join(output,'vendor/leaflet.css'),'utf8').replaceAll('\r\n','\n'));
console.log(`Packaged ${data.events.length} retained reports with original dates and geometry.`);
