const ROOT='/signals-desk/data/';
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
export function editionPath(date){return validDate(date)?'analysis/'+date+'.json':'daily-analysis.json'}
export function validateEdition(value){
 if(!value||!validDate(value.date)||typeof value.title!=='string'||!value.title.trim()||!Array.isArray(value.paragraphs)||!value.paragraphs.length||value.paragraphs.some(p=>typeof p!=='string'||!p.trim()))throw Error('Edition is incomplete');
 const keyPoints=Array.isArray(value.keyPoints)?value.keyPoints.filter(p=>typeof p==='string'&&p.trim()):[];
 if(keyPoints.length<3)throw Error('Edition needs at least three argument points');
 const wordCount=([value.title,...value.paragraphs,...keyPoints].join(' ').match(/[\p{L}\p{N}_]+(?:[’'-][\p{L}\p{N}_]+)*/gu)||[]).length;
 if(wordCount>400)throw Error('Edition exceeds 400 words');
 return {...value,wordCount,keyPoints};
}
export function archiveItems(value){const entries=Array.isArray(value)?value:value?.editions||[];return entries.filter(e=>e&&validDate(e.date)&&typeof e.title==='string').sort((a,b)=>b.date.localeCompare(a.date))}
export function finalSentence(paragraphs){return (paragraphs.at(-1)||'').trim().split(/(?<=[.!?])\s+/u).at(-1)||''}
function dateLabel(date){return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Beirut'}).format(new Date(date+'T12:00:00Z'))}
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node}
function setText(selector,text){const node=document.querySelector(selector);if(node)node.textContent=text}
function safeHttp(value){try{const url=new URL(value);return /^https?:$/.test(url.protocol)?url.href:''}catch{return ''}}
function renderEdition(edition,historical){
 const date=dateLabel(edition.date);
 setText('.analysis h2',edition.title);
 setText('.analysis .dek',edition.summary||edition.paragraphs[0]);
 setText('.analysis .analysis-label','Lebanese Academic analysis');
 setText('.editorial-meta span:first-child',(historical?'Archive edition':'Latest analysis')+' · '+date);
 setText('.editorial-meta span:last-child','Karim Salam · '+Math.max(1,Math.ceil(edition.wordCount/220))+' min read · '+edition.wordCount+' words');
 const cutoff=Date.parse(edition.sourceCutoff);
 if(Number.isFinite(cutoff)){const label='Coverage through '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Beirut',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(cutoff))+' Beirut';let note=document.querySelector('.analysis-cutoff');if(!note){note=element('p','','analysis-cutoff');note.style.cssText='margin:9px 0 0;font-size:10px;color:var(--muted)';document.querySelector('.editorial-meta')?.after(note)}note.textContent=label}else document.querySelector('.analysis-cutoff')?.remove();
 const article=document.querySelector('#full-analysis .article-body');
 if(article)article.replaceChildren(...edition.paragraphs.map(p=>element('p',p)));
 setText('#full-analysis > summary','Read the full '+date+' analysis');
 setText('.editorial-notes > div > .eyebrow','From the '+date+' analysis');
 const points=document.querySelector('.editorial-notes ol');
 if(points){points.replaceChildren(...edition.keyPoints.map(p=>element('li',p)));points.parentElement.hidden=!edition.keyPoints.length}
 setText('.editorial-notes blockquote p','“'+finalSentence(edition.paragraphs)+'”');
 setText('.editorial-notes blockquote cite','Karim Salam · '+date);
 const figure=document.querySelector('.image-empty');
 if(figure){const label=figure.querySelector('.eyebrow')||element('span','Image of the day','eyebrow');const src=safeHttp(edition.image?.src);const source=safeHttp(edition.image?.sourceUrl);if(src){const img=document.createElement('img');img.src=src;img.alt=edition.image?.alt||'';img.loading='lazy';img.referrerPolicy='no-referrer';const caption=element('figcaption','');caption.append(document.createTextNode((edition.image?.caption||'')+' '));if(source){const link=element('a',edition.image?.credit||'Source ↗');link.href=source;link.target='_blank';link.rel='noopener noreferrer';caption.append(link)}else caption.append(document.createTextNode(edition.image?.credit||''));figure.replaceChildren(label,img,caption)}else{const empty=element('p','No editorial photograph selected.');const caption=element('figcaption','No photograph has been selected for this edition.');figure.replaceChildren(label,empty,caption)}}
 document.querySelector('.edition-error')?.remove();
}
function renderArchive(data){
 const root=document.querySelector('.archive');if(!root)return;
 const entries=archiveItems(data);const label=element('div','Previous editions','analysis-label');
 const links=entries.map(e=>{const a=element('a','');a.href='/signal-desk?edition='+e.date+'#analysis';a.target='_top';a.append(element('time',dateLabel(e.date)),element('strong',e.title));return a});
 const old=element('a','');old.href='/signal-desk?edition=2026-09-07';old.target='_top';old.append(element('time','7 September 2026'),element('strong',"Lebanon's sovereignty, subject to Israeli approval"));
 if(!entries.some(e=>e.date==='2026-09-07'))links.push(old);
 const latest=element('a','Back to latest analysis');latest.href='/signal-desk#analysis';latest.target='_top';
 root.replaceChildren(label,...links,...(new URLSearchParams(location.search).has('edition')?[latest]:[]));
}
async function getJson(path){const r=await fetch(ROOT+path,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Edition request failed: '+r.status);return r.json()}
async function start(){
 const requested=new URLSearchParams(location.search).get('edition');const historical=validDate(requested);let signature='';
 async function refresh(){
  try{const edition=validateEdition(await getJson(editionPath(requested)));const next=JSON.stringify(edition);if(next!==signature){renderEdition(edition,historical);signature=next}}
  catch(error){console.info('Retaining previous analysis:',error.message);if(historical&&!signature&&!document.querySelector('.edition-error')){const note=element('p','The requested edition could not be loaded. The retained 7 September edition is shown below.','edition-error notice');document.querySelector('.editorial-meta')?.before(note)}}
  try{renderArchive(await getJson('analysis-archive.json'))}catch(error){console.info('Retaining existing analysis archive:',error.message)}
 }
 await refresh();if(!historical)setInterval(refresh,60000);
}
if(typeof document!=='undefined')start();
