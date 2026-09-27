export const categories=['All','Strikes','Clashes','Security','Politics','Displacement','Other'];
const pointKey=p=>`${p.lat},${p.lng}`;
const newestFirst=(a,b)=>b.timestamp-a.timestamp||a.id.localeCompare(b.id);
export function groupMapReports(events){
 const grouped=new Map();
 for(const event of events)for(const p of event.mapPoints){const key=pointKey(p),group=grouped.get(key)||{key,lat:p.lat,lng:p.lng,reports:[]};if(!group.reports.some(e=>e.id===event.id))grouped.set(key,{...group,reports:[...group.reports,event]})}
 return [...grouped.values()].map(group=>{const reports=[...group.reports].sort(newestFirst);return {...group,reports,latest:reports[0]}});
}
export function locationHistory(events,event){const keys=new Set(event.mapPoints.map(pointKey));return [...new Map(events.filter(e=>e.mapPoints.some(p=>keys.has(pointKey(p)))).map(e=>[e.id,e])).values()].sort(newestFirst)}
export const pageEvents=(events,limit=12)=>events.slice(0,Math.max(0,limit));
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
export function sourceName(e){if(e.sourceName||e.source_name)return e.sourceName||e.source_name;try{const u=new URL(e.source);return u.hostname==='t.me'?'Telegram · @'+u.pathname.split('/')[1]:['x.com','twitter.com'].includes(u.hostname)?'X · @'+u.pathname.split('/')[1]:u.hostname.replace(/^www\./,'')}catch{return 'Source unavailable'}}
export function categoryOf(e){const cat=String(e.category||'').toLowerCase();const exact=categories.find(c=>c.toLowerCase()===cat);if(exact&&exact!=='All')return exact;const title=(e.title||'').toLowerCase();if(/displac|evacuat|نازح/.test(title))return 'Displacement';if(/airstrike|bomb|shell|raid|غارة|قصف/.test(title))return 'Strikes';if(/gunman|opened fire|clash|drone|اشتباك/.test(title))return 'Clashes';if(/president|minister|talks|ceasefire|رئيس|وزير/.test(title))return 'Politics';if(/explosion|demolition|bulldoz|انفجار|تفجير|تجريف/.test(title))return 'Security';if([14,65].includes(e.category))return 'Security';return 'Other'}
export function normalize(e){const valid=p=>p&&typeof p.lat==='number'&&typeof p.lng==='number'&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&p.lat>=-90&&p.lat<=90&&p.lng>=-180&&p.lng<=180;const points=Array.isArray(e.points)?e.points.filter(valid):[];return {...e,id:String(e.id),title:e.title||e.summary||'Update',mapPoints:points.length?points:valid(e)?[{lat:e.lat,lng:e.lng}]:[],displayCategory:categoryOf(e)}}
export function dayKey(ts){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Beirut',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ts*1000))}
export function time(ts,full=false){if(!Number.isFinite(ts))return 'Time unavailable';return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Beirut',day:'numeric',month:full?'long':'short',...(full?{year:'numeric'}:{}),hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(ts*1000))}
export function filterEvents(events,{query='',category='All',date=''}={}){const q=query.trim().toLocaleLowerCase();return events.filter(e=>(category==='All'||e.displayCategory===category)&&(!date||dayKey(e.timestamp)===date)&&(!q||[e.title,e.summary,e.location,sourceName(e)].join(' ').toLocaleLowerCase().includes(q)))}
export function displayText(value){return String(value||'').replace(/https?:\/\/\S+/gi,'').replace(/(?:—|–|-)\s*(?:[\w @.]+\s*)?\(@[\w]+\)\s*$/,'').replace(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}(?:\s+at\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?\s*$/i,'').replace(/\s+/g,' ').trim()}
export function headline(e){const title=displayText(e.short_headline||e.title)||'Update';return title.length>150?title.slice(0,147).replace(/\s+\S*$/,'')+'…':title}
