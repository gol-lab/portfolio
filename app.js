/* ===== Idioma persistente entre páginas ===== */
let LANG = (function(){ try { return localStorage.getItem('lang') || 'pt'; } catch(e){ return 'pt'; } })();
function setLang(l){ LANG=l; try{ localStorage.setItem('lang', l); }catch(e){} }

function ytId(url){const m=url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null;}
function playIcon(){return '<div class="mplay"><span><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>';}

function vcard(m){
  let thumb=m.img;
  if(!thumb && m.type==='youtube'){const id=ytId(m.url); if(id) thumb=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;}
  const plat=m.type==='youtube'?'YouTube':'Instagram';
  const capTxt = m.cap && m.cap[LANG] ? m.cap[LANG] : '';
  const igFill = (!thumb && m.type==='instagram')
    ? `<div class="igfill"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg></div>` : '';
  const img = thumb ? `<img src="${thumb}" alt="" loading="lazy">` : '';
  const cap = capTxt ? `<div class="mcap">${capTxt}</div>` : '';
  const igShape = m.type==='instagram' ? (m.url && /\/reels?\//.test(m.url) ? ' reel' : ' post') : '';
  return `<a class="mediaitem ${m.type}${igShape}" href="${m.url}" target="_blank" rel="noopener"><div class="mthumb"><span class="mtag">${plat}</span>${igFill}${img}${playIcon()}</div>${cap}</a>`;
}

function photosHTML(job){
  const photos = (job.media||[]).filter(m=>m.type==='photo');
  if(!photos.length) return '';
  const cls = photos.length===1?'media one':(photos.length===2?'media two':'media');
  return `<div class="media-block"><div class="mediawrap"><div class="${cls}">`+photos.map(m=>{
    return `<div class="mediaitem photo"><div class="mthumb photoThumb"><img src="${m.img}" alt=""></div><div class="mcap">${m.cap?m.cap[LANG]:''}</div></div>`;
  }).join('')+'</div></div></div>';
}

function contentHTML(job){
  const videos = (job.media||[]).filter(m=>m.type==='youtube'||m.type==='instagram');
  if(!videos.length && !job.igGroups) return '';
  let html='<div class="mediawrap">';
  if(job.igsLabel){ html += `<div class="vslot-label vlbl-wide media-head">${job.igsLabel[LANG]}</div>`; }
  const yts = videos.filter(m=>m.type==='youtube');
  const igs = videos.filter(m=>m.type==='instagram');
  if(yts.length){ if(job.videosLabel){ html += `<div class="vslot-label vlbl-wide">${job.videosLabel[LANG]}</div>`; } const vcls = yts.length===4?' v2':(yts.length%3===0?' v3':''); html += `<div class="media videos${vcls}">`+yts.map(vcard).join('')+`</div>`; }
  function igBlock(items, label){
    let h='';
    if(label){ h += `<div class="vslot-label vlbl-wide">${label[LANG]}</div>`; }
    const allPosts = items.every(m=>m.url && !/\/reels?\//.test(m.url));
    h += `<div class="media reels${allPosts?' posts3':''}">`+items.map(vcard).join('')+`</div>`;
    return h;
  }
  if(job.igGroups){
    job.igGroups.forEach(g=>{ const its = igs.filter(m=>g.ids.some(id=>m.url.indexOf(id)>=0)); if(its.length) html += igBlock(its, g.label); });
  } else if(igs.length){ html += igBlock(igs, null); }
  html+='</div>';
  return `<div class="media-block">${html}</div>`;
}

function renderExperience(){
  const tl=document.getElementById('timeline');
  if(!tl) return;
  tl.innerHTML = JOBS.map(j=>{
    const logo = j.logo ? `<div class="logo"><img src="${j.logo}" alt="${j.name}"></div>` : ``;
    const bullets = j.bullets[LANG].map(b=>`<li>${b}</li>`).join('');
    const metrics = j.metrics.map(m=>`<div class="metric"><div class="mn">${m.n}</div><div class="ml">${m.l[LANG]}</div></div>`).join('');
    return `<div class="job reveal" style="--accent:${j.color}"><div class="job-head"><div><div class="when">${j.when}</div>${logo}</div><div><h3>${j.name}</h3><div class="role">${j.role[LANG]}</div><ul>${bullets}</ul><div class="metrics">${metrics}</div></div></div>${photosHTML(j)}</div>`;
  }).join('');
  observeReveals();
}

function renderContent(){
  const tl=document.getElementById('contentlist');
  if(!tl) return;
  tl.innerHTML = JOBS.map(j=>{
    const content = contentHTML(j);
    if(!content) return '';
    const logo = j.logo ? `<div class="logo"><img src="${j.logo}" alt="${j.name}"></div>` : ``;
    return `<div class="job reveal" style="--accent:${j.color}"><div class="content-head"><div class="content-head-l">${logo}<div><h3>${j.name}</h3><div class="role">${j.role[LANG]}</div></div></div></div>${content}</div>`;
  }).join('');
  observeReveals();
}

function renderSkills(){
  const g=document.getElementById('skillgrid');
  if(!g) return;
  g.innerHTML = SKILLS.map(s=>{
    const chips = s.chips.map(c=>`<span>${c}</span>`).join('');
    return `<div class="skillcat"><h4>${s.cat[LANG]}</h4><div class="chips">${chips}</div><p>${s.use[LANG]}</p></div>`;
  }).join('');
}

function applyI18n(){
  const dict=I18N[LANG];
  document.querySelectorAll('[data-i]').forEach(el=>{ const k=el.getAttribute('data-i'); if(dict[k]!==undefined) el.innerHTML=dict[k]; });
  document.documentElement.lang = LANG==='pt'?'pt-BR':LANG;
  document.querySelectorAll('.langsel button').forEach(x=>x.classList.toggle('active', x.dataset.lang===LANG));
  renderExperience();
  renderContent();
  renderSkills();
}

function observeReveals(){
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08});
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
}

document.querySelectorAll('.langsel button').forEach(b=>{
  b.addEventListener('click',()=>{ setLang(b.dataset.lang); applyI18n(); });
});
const mb=document.getElementById('menubtn'), mm=document.getElementById('mobileMenu');
if(mb && mm){
  mb.addEventListener('click',()=>mm.classList.toggle('open'));
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')));
}
applyI18n();
observeReveals();
