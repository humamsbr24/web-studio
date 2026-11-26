'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const T={
ar:{projects:'المشاريع',files:'الملفات',run:'تشغيل',code:'المحرر',console:'الطرفية',newProject:'مشروع جديد',import:'استيراد ZIP',theme:'الوضع الليلي / النهاري',close:'إغلاق',clear:'مسح',noFile:'افتح ملفاً من قائمة الملفات ☰',empty:'لا توجد مشاريع بعد',nFiles:'ملف',saved:'✓ تم الحفظ',saving:'…',newFile:'اسم الملف (مثال: js/app.js)',newFolder:'اسم المجلد',rename:'الاسم الجديد',confirm:'هل تريد الحذف؟',dupe:'موجود مسبقاً',noHtml:'لا يوجد ملف HTML للتشغيل',projName:'اسم المشروع',imported:'تم الاستيراد',badZip:'ملف ZIP غير صالح',binary:'ملف ثنائي (صورة/خط) — لا يمكن تحريره',lang:'English',openFirst:'افتح مشروعاً أولاً',save:'حفظ وتنزيل',dlFile:'تنزيل الملف الحالي',dlZip:'تنزيل المشروع كاملاً (ZIP)',tapDl:'اضغط للتنزيل:',copy:'نسخ الكود إلى الحافظة',copied:'تم النسخ',settings:'الإعدادات',renameL:'إعادة تسمية',del:'حذف',exp:'تصدير ZIP'},
en:{projects:'Projects',files:'Files',run:'Run',code:'Editor',console:'Console',newProject:'New project',import:'Import ZIP',theme:'Dark / Light mode',close:'Close',clear:'Clear',noFile:'Open a file from the Files list ☰',empty:'No projects yet',nFiles:'files',saved:'✓ Saved',saving:'…',newFile:'File name (e.g. js/app.js)',newFolder:'Folder name',rename:'New name',confirm:'Delete this?',dupe:'Already exists',noHtml:'No HTML file to run',projName:'Project name',imported:'Imported',badZip:'Invalid ZIP file',binary:'Binary file (image/font) — not editable',lang:'العربية',openFirst:'Open a project first',save:'Save',dlFile:'Download current file',dlZip:'Download whole project (ZIP)',tapDl:'Tap to download:',copy:'Copy code to clipboard',copied:'Copied',settings:'Settings',renameL:'Rename',del:'Delete',exp:'Export ZIP'}};
const S={lang:localStorage.wsLang||'ar',theme:localStorage.wsTheme||'dark',projects:[],cur:null,open:[],active:null,view:'projects',entry:null};
const t=k=>T[S.lang][k]||k;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA=s=>esc(s).replace(/"/g,'&quot;');
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
let toastT;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2200)};

const IC={plus:'M12 5v14M5 12h14',play:'M7 4.5v15l12-7.5z',folder:'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',file:'M6 3h8l4 4v14H6zM14 3v4h4',trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',download:'M12 4v11M7 11l5 5 5-5M5 20h14',upload:'M12 16V5M7 9l5-5 5 5M5 20h14',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',list:'M4 6h16M4 12h16M4 18h10',code:'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',term:'M4 5h16v14H4zM8 10l3 2-3 2M13 15h4',gear:'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',undo:'M9 5L4 10l5 5M4 10h9a5 5 0 0 1 0 10h-2',redo:'M15 5l5 5-5 5M20 10h-9a5 5 0 0 0 0 10h2',refresh:'M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5',dots:'M5 12h.01M12 12h.01M19 12h.01',copy:'M9 9h11v11H9zM5 15V4h11'};
const svg=n=>`<svg viewBox="0 0 24 24" fill="${n==='play'?'currentColor':'none'}" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;
const icons=()=>$$('[data-ic]').forEach(e=>e.innerHTML=svg(e.dataset.ic));
function sheet(title,items,extra){const p=$('#panel');p.innerHTML=`<h3>${esc(title)}</h3>`;items.forEach(i=>{const b=document.createElement('button');b.innerHTML=(i.ic?svg(i.ic):'')+`<span>${esc(i.l)}</span>`;b.onclick=()=>{if(!i.keep)$('#sheet').hidden=true;i.f&&i.f()};p.append(b)});if(extra)p.append(extra);const c=document.createElement('button');c.className='cancel';c.textContent=t('close');c.onclick=()=>$('#sheet').hidden=true;p.append(c);$('#sheet').hidden=false}
$('#sheet').onclick=e=>{if(e.target.id==='sheet')e.target.hidden=true};
/* ---------- IndexedDB ---------- */
const idb=new Promise((ok,no)=>{const r=indexedDB.open('webstudio',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const tx=async(m,f)=>{const d=await idb;return new Promise((ok,no)=>{const x=d.transaction('p',m),q=f(x.objectStore('p'));x.oncomplete=()=>ok(q&&q.result);x.onerror=()=>no(x.error)})};
const dbAll=()=>tx('readonly',s=>s.getAll()),dbPut=p=>tx('readwrite',s=>s.put(p)),dbDel=id=>tx('readwrite',s=>s.delete(id));

/* ---------- Syntax highlighting ---------- */
const LANG={
js:{r:/(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|super|switch|this|throw|try|typeof|var|void|while|async|await|yield|null|undefined|true|false)\b|\b(\d[\w.]*)\b|([A-Za-z_$][\w$]*)(?=\()/g,c:['c','s','k','n','f']},
css:{r:/(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(#[0-9a-fA-F]{3,8}\b|\b\d[\w.%]*)|(@[\w-]+)|([\w-]+)(?=\s*:)/g,c:['c','s','n','k','a']},
html:{r:/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w-]+|\/?&gt;)|("[^"\n]*"|'[^'\n]*')|([\w:-]+)(?==)/g,c:['c','k','s','a']}};
const LX={js:'js',mjs:'js',json:'js',css:'css',html:'html',htm:'html',svg:'html',xml:'html'};
const ext=p=>(p.split('.').pop()||'').toLowerCase();
const hl=(code,l)=>{const L=LANG[l],h=esc(code);return (L?h.replace(L.r,(...m)=>{for(let i=0;i<L.c.length;i++)if(m[i+1]!==undefined)return`<i class="${L.c[i]}">${m[i+1]}</i>`;return m[0]}):h)+'\n'};

/* ---------- Files / mime ---------- */
const M={html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',ico:'image/x-icon',woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',mp3:'audio/mpeg',mp4:'video/mp4',txt:'text/plain'};
const mime=p=>M[ext(p)]||'application/octet-stream';
const TXT=/\.(html?|css|js|mjs|json|txt|md|svg|xml|csv|ts|jsx|tsx|map|ya?ml)$/i;
const b64e=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const b64d=d=>Uint8Array.from(atob(d.split(',')[1]),c=>c.charCodeAt(0));
const starter=()=>({
'index.html':'<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>My Page</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Hello Web Studio 👋</h1>\n<button id="b">Click me</button>\n<script src="script.js"><\/script>\n</body>\n</html>\n',
'style.css':'body{font-family:system-ui;text-align:center;padding:2rem;background:#0f172a;color:#e2e8f0}\nbutton{padding:.7rem 1.4rem;border:0;border-radius:10px;background:#38bdf8;font-size:1rem}\n',
'script.js':"let n=0;\ndocument.getElementById('b').onclick=()=>{\n  n++;\n  console.log('clicks:',n);\n};\n"});
const newP=name=>({id:uid(),name,files:starter(),updated:Date.now()});
const F=()=>S.cur.files;

/* ---------- Save ---------- */
let saveT;
const saveNow=async()=>{if(!S.cur)return;clearTimeout(saveT);S.cur.updated=Date.now();await dbPut(S.cur);$('#st').textContent=t('saved')};
const sched=()=>{$('#st').textContent=t('saving');clearTimeout(saveT);saveT=setTimeout(saveNow,500)};
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveNow()});
addEventListener('pagehide',saveNow);

/* ---------- Views ---------- */
function go(v){S.view=v;$$('.v').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));document.body.classList.remove('dr');
  $$('nav [data-n]').forEach(b=>b.classList.toggle('on',b.dataset.n===(v==='projects'?'projects':v==='editor'?'code':'run')&&b.dataset.n!=='run'));
  $('#title').textContent=v!=='projects'&&S.cur?S.cur.name:'Web Studio';$('#st').textContent=v==='projects'?'':$('#st').textContent}
function needP(){if(!S.cur){toast(t('openFirst'));go('projects');return false}return true}
$('nav').onclick=e=>{const b=e.target.closest('[data-n]');if(!b)return;const n=b.dataset.n;
  if(n==='projects'){saveNow();renderProjects();go('projects')}
  else if(!needP())return;
  else if(n==='code')go('editor');
  else if(n==='files'){go('editor');document.body.classList.add('dr')}
  else if(n==='run')run();
  else if(n==='console'){if(S.view!=='preview')run();$('#con').hidden=!$('#con').hidden}};
$('#scrim').onclick=()=>document.body.classList.remove('dr');

/* ---------- Projects ---------- */
function renderProjects(){const l=[...S.projects].sort((a,b)=>b.updated-a.updated);
  $('#plist').innerHTML=l.length?l.map(p=>`<div class="card" data-id="${p.id}"><div class="ico">${svg('code')}</div><div class="m" data-a="open"><b>${esc(p.name)}</b><small>${Object.keys(p.files).filter(k=>!k.endsWith('/.keep')).length} ${t('nFiles')} · ${new Date(p.updated).toLocaleDateString(S.lang)}</small></div><button class="ib" data-a="more">${svg('dots')}</button></div>`).join(''):`<div class="none">${t('empty')}</div>`}
$('#plist').onclick=e=>{const c=e.target.closest('.card'),b=e.target.closest('[data-a]');if(!c||!b)return;const p=S.projects.find(x=>x.id===c.dataset.id),a=b.dataset.a;
  if(a==='open')openProject(p);
  else if(a==='more')sheet(p.name,[{ic:'download',l:t('exp'),f:()=>exportProj(p)},{ic:'edit',l:t('renameL'),f:async()=>{const n=(prompt(t('projName'),p.name)||'').trim();if(n){p.name=n;await dbPut(p);renderProjects()}}},{ic:'trash',l:t('del'),f:async()=>{if(!confirm(t('confirm')))return;await dbDel(p.id);S.projects=S.projects.filter(x=>x!==p);if(S.cur===p)S.cur=null;renderProjects()}}])};
$('#bNew').onclick=async()=>{const n=(prompt(t('projName'),'Project '+(S.projects.length+1))||'').trim();if(!n)return;const p=newP(n);await dbPut(p);S.projects.push(p);openProject(p)};
function openProject(p){S.cur=p;S.open=[];S.active=null;const f=Object.keys(p.files).filter(k=>typeof p.files[k]==='string'&&!k.endsWith('/.keep'));
  const first=p.files['index.html']!=null?'index.html':f[0];first?openFile(first):(tabs(),tree(),load(),go('editor'))}

/* ---------- Editor ---------- */
const ta=$('#ta'),pre=$('#hl');
function load(){const v=S.cur&&S.active&&F()[S.active],ed=$('.ed');
  if(v==null||v===false||typeof v==='object'){ta.value='';ta.disabled=true;pre.innerHTML='';ln.textContent='';ln.dataset.n='';ed.classList.remove('has');$('#empty').textContent=typeof v==='object'?t('binary'):t('noFile');return}
  ta.disabled=false;ta.value=v;ed.classList.add('has');draw();ta.scrollTop=ta.scrollLeft=0;sync()}
const ln=$('#ln');
const draw=()=>{pre.innerHTML=hl(ta.value,LX[ext(S.active)]);const n=ta.value.split('\n').length;if(ln.dataset.n!=n){ln.dataset.n=n;ln.textContent=Array.from({length:n},(_,i)=>i+1).join('\n')}};
const sync=()=>{pre.scrollTop=ta.scrollTop;pre.scrollLeft=ta.scrollLeft;ln.scrollTop=ta.scrollTop};
ta.addEventListener('scroll',sync);
ta.addEventListener('input',()=>{if(!S.active)return;F()[S.active]=ta.value;draw();sync();sched()});
function ins(txt,back){ta.focus();if(!document.execCommand('insertText',false,txt)){ta.setRangeText(txt,ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input'))}if(back)ta.selectionStart=ta.selectionEnd=ta.selectionEnd-back}
ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();ins('  ')}
  else if(e.key==='Enter'){e.preventDefault();const s=ta.selectionStart,ls=ta.value.lastIndexOf('\n',s-1)+1,ind=ta.value.slice(ls,s).match(/^\s*/)[0];ins('\n'+ind+(ta.value[s-1]==='{'?'  ':''))}});
const PAIR={'{':'{}','(':'()','[':'[]','"':'""',"'":"''"};
$('#keys').innerHTML=['Tab','<','>','/','{','}','(',')','[',']','"',"'",';','=',':','$','`','!','&','|'].map(k=>`<button>${esc(k)}</button>`).join('');
$('#keys').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b||ta.disabled)return;e.preventDefault();const k=b.textContent;
  if(k==='Tab')ins('  ');else if(PAIR[k])ins(PAIR[k],1);else ins(k)});
function tabs(){$('#tabs').innerHTML=S.open.map(p=>`<div class="tab${p===S.active?' on':''}" data-p="${escA(p)}"><span>${esc(p.split('/').pop())}</span><b data-x>×</b></div>`).join('')}
$('#tabs').onclick=e=>{const d=e.target.closest('.tab');if(!d)return;const p=d.dataset.p;
  if(e.target.matches('[data-x]')){S.open=S.open.filter(x=>x!==p);if(S.active===p)S.active=S.open[S.open.length-1]||null;tabs();tree();load()}else openFile(p)};
function openFile(p){if(!S.open.includes(p))S.open.push(p);S.active=p;tabs();tree();load();go('editor')}

/* ---------- File tree ---------- */
function tree(){const f=F(),ks=Object.keys(f),dirs=new Set();
  ks.forEach(k=>{const a=k.split('/');for(let i=1;i<a.length;i++)dirs.add(a.slice(0,i).join('/'))});
  const it=[...dirs].map(p=>({p,d:1})).concat(ks.filter(k=>!k.endsWith('/.keep')).map(p=>({p})));
  const key=x=>x.p.replace(/\//g,'\0');it.sort((a,b)=>key(a)<key(b)?-1:1);
  $('#tree').innerHTML=it.map(({p,d})=>{const a=p.split('/');return`<div class="ti${p===S.active?' on':''}" style="padding-inline-start:${12+(a.length-1)*16}px" data-p="${escA(p)}" data-d="${d?1:''}"><span class="tn">${svg(d?'folder':'file')}${esc(a.pop())}</span><span><button class="ib" data-a="ren">${svg('edit')}</button><button class="ib" data-a="del">${svg('trash')}</button></span></div>`}).join('')}
$('#tree').onclick=e=>{const r=e.target.closest('.ti');if(!r)return;const p=r.dataset.p,d=!!r.dataset.d,a=e.target.closest('[data-a]');
  if(a)return a.dataset.a==='ren'?rename(p,d):remove(p,d);
  if(!d)openFile(p)};
const hit=(k,p,d)=>d?k.startsWith(p+'/'):k===p;
function rename(p,d){const n=(prompt(t('rename'),p)||'').trim().replace(/^\/+|\/+$/g,'');if(!n||n===p)return;const f=F(),ks=Object.keys(f).filter(k=>hit(k,p,d)),nk=k=>n+k.slice(p.length);
  if(ks.some(k=>f[nk(k)]!=null))return toast(t('dupe'));
  ks.forEach(k=>{f[nk(k)]=f[k];delete f[k];S.open=S.open.map(x=>x===k?nk(k):x);if(S.active===k)S.active=nk(k)});tabs();tree();load();sched()}
function remove(p,d){if(!confirm(t('confirm')))return;const f=F();Object.keys(f).filter(k=>hit(k,p,d)).forEach(k=>{delete f[k];S.open=S.open.filter(x=>x!==k);if(S.active===k)S.active=S.open[S.open.length-1]||null});tabs();tree();load();sched()}
$('#bAF').onclick=()=>{const p=(prompt(t('newFile'),'')||'').trim().replace(/^\/+/,'');if(!p)return;if(F()[p]!=null)return toast(t('dupe'));F()[p]='';sched();openFile(p)};
$('#bAD').onclick=()=>{const p=(prompt(t('newFolder'),'')||'').trim().replace(/^\/+|\/+$/g,'');if(!p)return;F()[p+'/.keep']='';tree();sched()};
$('#bUp').onclick=()=>$('#fUp').click();
$('#fUp').onchange=async e=>{for(const f of e.target.files)F()[f.name]=TXT.test(f.name)?await f.text():{b:await new Promise(r=>{const x=new FileReader;x.onload=()=>r(x.result);x.readAsDataURL(f)})};e.target.value='';tree();sched()};

/* ---------- Preview ---------- */
const HOOK=`<script>(()=>{const s=(t,a)=>parent.postMessage({ws:1,t,m:a.map(x=>{try{return typeof x==='string'?x:x instanceof Error?(x.stack||String(x)):(JSON.stringify(x)??String(x))}catch(e){return String(x)}}).join(' ')},'*');['log','info','warn','error','debug'].forEach(k=>{const o=console[k];console[k]=(...a)=>{s(k,a);o.apply(console,a)}});addEventListener('error',e=>s('error',[e.message+' (line '+e.lineno+')']));addEventListener('unhandledrejection',e=>s('error',['Unhandled: '+((e.reason&&e.reason.message)||e.reason)]));addEventListener('message',e=>{if(e.data&&e.data.ws==='eval'){try{s('log',[(0,eval)(e.data.c)])}catch(x){s('error',[x])}}})})()<\/script>`;
const res=(base,ref)=>{if(/^(\w+:|\/\/|#)/.test(ref))return null;try{return decodeURIComponent(new URL(ref,'http://x/'+base).pathname.slice(1))}catch(e){return null}};
const durl=(f,p)=>{const v=f[p];return v==null?null:typeof v==='object'?v.b:'data:'+mime(p)+';charset=utf-8,'+encodeURIComponent(v)};
function build(entry){const f=F();
  const css=(txt,base)=>txt.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g,(m,u)=>{const p=res(base,u),d=p&&durl(f,p);return d?`url(${d})`:m});
  let h=f[entry];
  h=h.replace(/<(?!script\b|link\b|style\b)[a-z][^>]*>/gi,tag=>tag.replace(/\b(src|href|poster)=["']([^"']+)["']/gi,(m,a,s)=>{const p=res(entry,s),d=p&&durl(f,p);return d?`${a}="${d}"`:m}));
  h=h.replace(/<link\b[^>]*>/gi,tg=>{if(!/rel=["']?stylesheet/i.test(tg))return tg;const m=tg.match(/href=["']([^"']+)["']/i),p=m&&res(entry,m[1]);return p&&typeof f[p]==='string'?`<style>${css(f[p],p)}</style>`:tg});
  h=h.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(m,a,c)=>`<style${a}>${css(c,entry)}</style>`);
  h=h.replace(/<script\b([^>]*?)\ssrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(m,a,s,b)=>{const p=res(entry,s);return p&&typeof f[p]==='string'?`<script${a}${b}>${f[p].replace(/<\/script/gi,'<\\/script')}<\/script>`:m});
  return HOOK+h}
let frame=null,con=[];
function run(){if(!needP())return;saveNow();const f=F(),isH=p=>p&&/\.html?$/i.test(p)&&typeof f[p]==='string';
  const e=isH(S.active)?S.active:isH('index.html')?'index.html':Object.keys(f).find(isH);if(!e)return toast(t('noHtml'));
  S.entry=e;go('preview');con=[];drawCon();$('#addr').textContent='studio://'+S.cur.name+'/'+e;
  $('#fw').innerHTML='';frame=document.createElement('iframe');frame.sandbox='allow-scripts allow-modals allow-forms allow-popups';frame.srcdoc=build(e);$('#fw').append(frame)}
$('#bReload').onclick=run;
function drawCon(){const c=$('#cl');c.innerHTML=con.map(x=>`<div class="${x.t==='in'?'in':x.t}">${esc(x.m)}</div>`).join('');c.scrollTop=c.scrollHeight;
  const n=con.filter(x=>x.t==='error').length,b=$('#badge');b.hidden=!n;b.textContent=n}
addEventListener('message',e=>{const d=e.data;if(!d||!d.ws||!frame||e.source!==frame.contentWindow)return;con.push(d);if(con.length>500)con.shift();drawCon();if(d.t==='error')$('#con').hidden=false});
$('#ce').onkeydown=e=>{if(e.key!=='Enter'||!e.target.value||!frame)return;con.push({t:'in',m:'› '+e.target.value});frame.contentWindow.postMessage({ws:'eval',c:e.target.value},'*');e.target.value='';drawCon()};
$('#bClr').onclick=()=>{con=[];drawCon()};

/* ---------- ZIP (store + inflate, no libraries) ---------- */
const crcT=(()=>{const a=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;a[n]=c>>>0}return a})();
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=crcT[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function zipBuild(files){const en=new TextEncoder(),parts=[],cd=[];let off=0,n=0;
  for(const[p,v]of Object.entries(files)){const nm=en.encode(p),d=typeof v==='string'?en.encode(v):b64d(v.b),c=crc(d);n++;
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,0x21,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
    const e=new DataView(new ArrayBuffer(46));e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x800,true);e.setUint16(14,0x21,true);e.setUint32(16,c,true);e.setUint32(20,d.length,true);e.setUint32(24,d.length,true);e.setUint16(28,nm.length,true);e.setUint32(42,off,true);
    parts.push(h.buffer,nm,d);cd.push(e.buffer,nm);off+=30+nm.length+d.length}
  let cs=0;cd.forEach(x=>cs+=x.byteLength);const z=new DataView(new ArrayBuffer(22));z.setUint32(0,0x06054b50,true);z.setUint16(8,n,true);z.setUint16(10,n,true);z.setUint32(12,cs,true);z.setUint32(16,off,true);
  return new Blob([...parts,...cd,z.buffer],{type:'application/zip'})}
async function zipRead(buf){const u=new Uint8Array(buf),v=new DataView(buf),dc=new TextDecoder();let e=u.length-22;while(e>=0&&v.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw 0;
  const cnt=v.getUint16(e+10,true);let o=v.getUint32(e+16,true);const L=[];
  for(let i=0;i<cnt;i++){const nl=v.getUint16(o+28,true);L.push({m:v.getUint16(o+10,true),cs:v.getUint32(o+20,true),lo:v.getUint32(o+42,true),name:dc.decode(u.subarray(o+46,o+46+nl))});o+=46+nl+v.getUint16(o+30,true)+v.getUint16(o+32,true)}
  const ns=L.map(x=>x.name).filter(n=>!n.startsWith('__MACOSX')),fi=ns[0]&&ns[0].split('/')[0],strip=fi&&ns.every(n=>n.startsWith(fi+'/'))?fi+'/':'',out={};
  for(const x of L){let n=x.name;if(n.endsWith('/')||n.startsWith('__MACOSX')||n.includes('.DS_Store'))continue;n=n.slice(strip.length);if(!n)continue;
    const ds=x.lo+30+v.getUint16(x.lo+26,true)+v.getUint16(x.lo+28,true);let d=u.subarray(ds,ds+x.cs);
    if(x.m===8)d=new Uint8Array(await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());else if(x.m!==0)continue;
    out[n]=TXT.test(n)?dc.decode(d):{b:'data:'+mime(n)+';base64,'+b64e(d)}}
  return out}
const safeName=n=>(n||'project').replace(/[\\/:*?"<>|]/g,'-').trim()||'project';
async function saveBlob(blob,name,text){
  const file=new File([blob],name,{type:blob.type||'application/octet-stream'});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file]});return}}catch(e){if(e.name==='AbortError')return}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.className='dllink';a.textContent=t('tapDl')+' '+name;
  const it=text!=null&&navigator.clipboard?[{ic:'copy',l:t('copy'),keep:1,f:()=>navigator.clipboard.writeText(text).then(()=>toast(t('copied')))}]:[];
  sheet(t('save'),it,a);setTimeout(()=>URL.revokeObjectURL(url),180000)}
const exportProj=p=>saveBlob(zipBuild(p.files),safeName(p.name)+'.zip');
function exportFile(p){const v=F()[p],tx=typeof v==='string';saveBlob(new Blob([tx?v:b64d(v.b)],{type:mime(p)}),p.split('/').pop(),tx?v:null)}
function dlSheet(){if(!needP())return;saveNow();const it=[];if(S.active&&F()[S.active]!=null)it.push({ic:'file',l:t('dlFile')+': '+S.active.split('/').pop(),f:()=>exportFile(S.active)});it.push({ic:'download',l:t('dlZip'),f:()=>exportProj(S.cur)});sheet(t('save'),it)}
$('#bImp').onclick=()=>$('#fImp').click();
$('#fImp').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const files=await zipRead(await f.arrayBuffer());if(!Object.keys(files).length)throw 0;const p={id:uid(),name:f.name.replace(/\.zip$/i,''),files,updated:Date.now()};await dbPut(p);S.projects.push(p);renderProjects();toast(t('imported'))}catch(x){toast(t('badZip'))}};

/* ---------- Settings / i18n ---------- */
function applyLang(){document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='ar'?'rtl':'ltr';$$('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));localStorage.wsLang=S.lang;renderProjects()}
function applyTheme(){document.documentElement.dataset.theme=S.theme;localStorage.wsTheme=S.theme;$('meta[name=theme-color]').content=S.theme==='dark'?'#0d1117':'#f6f8fa'}
$('#bSet').onclick=()=>sheet(t('settings'),[{ic:'gear',l:t('theme'),f:()=>{S.theme=S.theme==='dark'?'light':'dark';applyTheme()}},{ic:'list',l:t('lang'),f:()=>{S.lang=S.lang==='ar'?'en':'ar';applyLang();go(S.view)}}]);
/* ---------- Toolbar / iPhone viewport ---------- */
const setFs=n=>{S.fs=Math.max(11,Math.min(22,n));localStorage.wsFs=S.fs;const e=$('.ed');e.style.setProperty('--fs',S.fs+'px');e.style.setProperty('--lh',Math.round(S.fs*1.6)+'px')};
setFs(+localStorage.wsFs||14);
$('#bFm').onclick=()=>setFs(S.fs-1);$('#bFp').onclick=()=>setFs(S.fs+1);
$('#bUndo').onclick=()=>{ta.focus();document.execCommand('undo')};$('#bRedo').onclick=()=>{ta.focus();document.execCommand('redo')};
$('#bSave').onclick=dlSheet;$('#bBack').onclick=()=>go('editor');
const vv=window.visualViewport;
function fit(){const h=vv?vv.height:innerHeight;document.documentElement.style.setProperty('--vh',h+'px');document.body.classList.toggle('kb',vv?innerHeight-vv.height>120:false);scrollTo(0,0)}
if(vv){vv.addEventListener('resize',fit);vv.addEventListener('scroll',()=>scrollTo(0,0))}
addEventListener('orientationchange',()=>setTimeout(fit,300));fit();
/* ---------- Init ---------- */
(async()=>{S.projects=await dbAll();if(!S.projects.length){const p=newP('My First Project');await dbPut(p);S.projects.push(p)}icons();applyLang();applyTheme();go('projects')})();
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)saveNow().finally(()=>location.reload())});addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}))}
