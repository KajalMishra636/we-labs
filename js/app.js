const $=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const G=[['#7c5cff','#ff6fb5'],['#1fb8a0','#5ab0ff'],['#ff9f1c','#ff6f6f'],['#ff6fb5','#b06cff'],['#5a8cff','#7c5cff'],['#3fc46a','#1fb8a0']];
const T=[['Asmita Maam','the Team Leader','I made a schedule'],['Pratiksha ','the Leader Didi','wait, that is not even funny'],['Shrutika','Sweet Didi','who wants fries?'],['Rutika','Strong Didi','one more story'],['Ankita','Always Sweet ','hold still please'],['Nitesh','Gulaboo small brother ','I made a list'],['Payal','Content Creator didi','this song is perfect'],['Deepa','Pyari Didi','tell me everything'],['Naaz','Happy and sweet','let us go somewhere'],['Samidha','good listner ','why is nobody up'],['Gunjan','Chulbuli Kanchana name by payal didi ','what if we did it?'],['Akash','peacemaker','Champa a big brother ']];
const SEED=[{title:'The day we all met',text:'Twelve strangers, one table, and a very long lunch.',date:'Year one',by:'WE LABS'},{title:'First group photo',text:'It took fourteen tries. Someone blinked in every single one.',date:'Year one',by:'WE LABS'},{title:'Seat 13 opens',text:'The crew becomes complete and this website is born.',date:'Now',by:'WE LABS'}];
const SPOLL={pid:'seedpoll',text:'Best snack for our next meetup?',opts:['Pizza','Samosa','Fries','Ice cream'],by:'WE LABS'};
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},ss=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let me=ls('wl3-me',null),local=ls('wl3-posts',[]),best=ls('wl3-best',{}),shared=null,dbc=null,sampler=null;
const posts=()=>shared||local,okImg=s=>typeof s==='string'&&s.startsWith('data:image/');
const pid=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
/* theme */
function theme(t){document.documentElement.dataset.theme=t;$('#th').textContent=t==='dark'?'☀️':'🌙';$('#th').setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');ss('wl3-theme',t)}
theme(ls('wl3-theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
$('#th').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');
function startCaps(){if(!window.claude||!claude.use)return;
 claude.use('db').then(d=>{if(!d)return;dbc=d;d.collection('posts').orderBy('ts','desc').limit(250).onSnapshot(s=>{shared=s.docs.map(x=>({id:x.id,...x.data()}));renderAll()},()=>{shared=null;renderAll()})}).catch(()=>{});
 claude.use('sample').then(s=>{sampler=s}).catch(()=>{})}
async function addPost(p){p.id=p.id||pid();p.ts=Date.now();if(dbc){try{await dbc.collection('posts').add(p);return}catch(e){}}local.unshift(p);ss('wl3-posts',local.slice(0,60));renderAll()}
async function deletePost(id){
  if(!id)return;
  if(!confirm('Are you sure you want to delete this note?'))return;
  if(dbc){
    try{
      const snap=await dbc.collection('posts').where('id','==',id).get();
      if(snap&&snap.docs)for(const doc of snap.docs)await dbc.collection('posts').doc(doc.id).delete();
    }catch(e){console.warn('Remote delete failed; removing local copy.',e)}
  }
  local=local.filter(x=>x.id!==id);
  ss('wl3-posts',local.slice(0,60));
  renderAll();
}
function profileImage(name){
  const seed=encodeURIComponent(name||'Friend');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear&fontWeight=700&fontSize=42`;
}
const PROFILE_IMAGES = [
  "images/asmita.jpg",
  "images/pratiskha.jpg",
  "images/shrutika.jpg",
  "images/rutika.jpg",
  "images/ankita.jpg",
  "images/nitesh.jpg",
  "images/payal.jpg",
  "images/deepa.jpg",
  "images/neel.jpg",
  "images/tara.jpg",
  "images/riya.jpg",
  "images/sam.jpg"
];

function people(){

  const p=T.map((t,i)=>({
    id:'t'+i,
    name:t[0],
    role:t[1],
    q:t[2],
    g:G[i%6],
    image:PROFILE_IMAGES[i]
  }));

  p.push(
    me
      ? {
          id:'me',
          name:me.name,
          role:me.role,
          q:me.q,
          g:me.g,
          you:1,
          image:me.image || ''
        }
      : {
          id:'me',
          name:'You?',
          role:'seat 13 is open',
          q:'join to claim this card',
          g:['#8a8fb8','#a3a8cc'],
          you:1,
          image:''
        }
  );

  return p;
}
const notesFor=id=>posts().filter(x=>x.kind==='note'&&x.target===id);
const grad=g=>`--g1:${g[0]};--g2:${g[1]}`;
/* hero art */
(function(){const cs=['#ffb84d','#4de0c4','#ff6fb5','#7c5cff','#5ab0ff','#ff8a5c','#6fe37a'];let h='';for(let i=0;i<13;i++){const x=34+i*27.5,y=372-Math.sin(i/12*Math.PI)*14;h+=`<g class="pp" style="animation-delay:${-i*.22}s"><circle cx="${x}" cy="${y-14}" r="7" fill="${cs[i%7]}"/><rect x="${x-6}" y="${y-6}" width="12" height="18" rx="6" fill="${cs[(i+3)%7]}"/></g>`}$('#ppl').innerHTML=h})();
function setBanner(){const b=posts().find(x=>x.kind==='banner'&&okImg(x.img));$('#bi').innerHTML=b?`<img src="${b.img}" alt="Banner photo by ${esc(b.by)}">`:'';$('#sv').style.display=b?'none':''}
(function(){const a=$('#art'),f=$('#fr');if(RM||!matchMedia('(hover:hover)').matches)return;
 a.addEventListener('pointermove',e=>{const r=a.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;f.style.transform=`rotateY(${x*12}deg) rotateX(${-y*12}deg)`;f.querySelectorAll('svg,img').forEach(n=>n.style.transform=`translate(${-x*14}px,${-y*14}px)`)});
 a.addEventListener('pointerleave',()=>{f.style.transform='';f.querySelectorAll('svg,img').forEach(n=>n.style.transform='')})})();
function votes(pidv){const m={};[...posts()].reverse().forEach(x=>{if(x.kind==='vote'&&x.target===pidv)m[x.by]=+x.text});return m}
function renderAll(){const ps=people();
 $('#pg').innerHTML=ps.map(p=>`<button class="pc rv in${p.you?' you':''}" data-id="${p.id}" style="${grad(p.g)}">
   <div class="ring">
    <img class="person-card-photo" src="${esc(p.image)}" alt="${esc(p.name)} profile image"
         loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
    <div class="av person-card-fallback" style="display:none">${esc(p.name[0].toUpperCase())}</div>
   </div>
   <h3>${esc(p.name)}</h3>
   <div class="r">${esc(p.role)}</div>
   <q>${esc(p.q)}</q>
   <span class="n">💌 ${notesFor(p.id).length} notes</span>
  </button>`).join('');
 const mm=[...posts().filter(x=>x.kind==='memory'),...SEED];
 $('#tl').innerHTML=mm.map(x=>`<div class="it"><div class="y">${esc(x.date||'')}</div><h3>${esc(x.title||x.text)}</h3><p>${esc(x.title?x.text:'')}</p>${okImg(x.img)?`<img loading="lazy" src="${x.img}" alt="${esc(x.title||'Memory')}">`:''}<small>by ${esc(x.by)}</small></div>`).join('');
 const pl=posts().filter(x=>x.kind==='plan');
 $('#pl').innerHTML=pl.length?pl.map(x=>{const who=[...new Set(posts().filter(r=>r.kind==='rsvp'&&r.target===x.pid).map(r=>r.by))];const inn=me&&who.includes(me.name);
  return `<div class="card plan"><span class="d">🗓️ ${esc(x.date||'Soon')}</span><h3>${esc(x.text)}</h3><small style="color:var(--mu)">posted by ${esc(x.by)}</small><div class="w">${who.length?'In: '+who.map(esc).join(', '):'Nobody yet. Be first!'}</div><button class="btn ${inn?'g':''} s" data-rsvp="${x.pid}" ${inn?'disabled':''}>${inn?"You're in ✓":"I'm in ✋"}</button></div>`}).join(''):'<div class="empty">No plans yet. Suggest something fun!</div>';
 const polls=[...posts().filter(x=>x.kind==='poll'),SPOLL];
 $('#po').innerHTML=polls.map(x=>{const v=votes(x.pid),tot=Object.keys(v).length;
  return `<div class="card"><h3 style="font-size:18px">${esc(x.text)}</h3>${x.opts.map((o,i)=>{const c=Object.values(v).filter(n=>n===i).length,pc=tot?Math.round(c/tot*100):0;return `<button class="opt${me&&v[me.name]===i?' me':''}" data-v="${x.pid}" data-o="${i}"><i style="width:${pc}%"></i><span><b>${esc(o)}</b><span>${c} · ${pc}%</span></span></button>`}).join('')}<small style="color:var(--mu);display:block;margin-top:10px">${tot} vote${tot===1?'':'s'} · by ${esc(x.by)}</small></div>`}).join('');
 const ph=posts().filter(x=>x.kind==='photo'&&okImg(x.img));
 $('#wall').innerHTML=ph.length?ph.map((x,i)=>`<button class="ph" data-i="${i}"><img loading="lazy" src="${x.img}" alt="${esc(x.text||'Photo')}"><div>${esc(x.text||'')}<br><small>by ${esc(x.by)}</small></div></button>`).join(''):'<div class="empty">No photos yet. Add the first one!</div>';
 const g=posts().filter(x=>x.kind==='guest');
 $('#gb').innerHTML=g.length?g.map((x,i)=>`<div class="note" style="--ac:${G[i%6][0]}">${esc(x.text)}${okImg(x.img)?`<img src="${x.img}" alt="Photo from ${esc(x.by)}">`:''}<small>from ${esc(x.by)}</small></div>`).join(''):'<div class="empty">No notes yet. Say hi!</div>';
 $('#k2').textContent=posts().filter(x=>!['score','rsvp','vote'].includes(x.kind)).length;
 $('#st1').textContent=dbc?'🌍 Everything you add is shared with everyone':'💾 Everything you add is saved on this device';
 $('#me').querySelector('.av').style.background=me?`linear-gradient(135deg,${me.g[0]},${me.g[1]})`:'var(--s3)';$('#meav').textContent=me?me.name[0].toUpperCase():'?';$('#mename').textContent=me?me.name:'Join';setBanner();lboard()}
function open(h){$('#mb').innerHTML=h;$('#mm').classList.add('open');const f=$('#mb input,#mb textarea,#mb button');f&&f.focus();if(!RM&&window.gsap)gsap.from('#mb',{y:40,scale:.92,opacity:0,duration:.4,ease:'back.out(1.6)'})}
const close=()=>$('#mm').classList.remove('open');
addEventListener('keydown',e=>{if(e.key==='Escape'&&me)close()});
$('#mm').addEventListener('click',e=>{if(e.target.id==='mm'&&me)close()});
function profile(first,then){const m=me||{name:'',role:'',q:'',g:G[0]};let g=m.g;
 open(`<h2>${first?'Welcome! 👋':'Your profile'}</h2><p class="sub" style="margin:0 0 16px">${first?'Tell us your name to take seat 13.':'Change anything, anytime.'}</p>
 <label for="pn">Your name</label><input id="pn" maxlength="18" value="${esc(m.name)}" placeholder="e.g. Maya" autocomplete="nickname">
 <label for="pr">Known for</label><input id="pr" maxlength="28" value="${esc(m.role)}" placeholder="the funny one">
 <label for="pq">Favourite line</label><input id="pq" maxlength="48" value="${esc(m.q)}" placeholder="something you always say">
 <label>Your colour</label><div class="sw" id="sw">${G.map(c=>`<button type="button" aria-label="colour" style="background:linear-gradient(135deg,${c[0]},${c[1]})" class="${c[0]===g[0]?'on':''}"></button>`).join('')}</div>
 <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn g" id="skip">${first?'Just look':'Cancel'}</button><button class="btn" id="sv2">Save</button></div>`);
 $('#sw').onclick=e=>{const b=e.target.closest('button');if(!b)return;g=G[[...$('#sw').children].indexOf(b)];[...$('#sw').children].forEach(x=>x.classList.toggle('on',x===b))};
 $('#skip').onclick=close;
 $('#sv2').onclick=()=>{const n=$('#pn').value.trim();if(!n){$('#pn').focus();return}
  me={name:n,role:$('#pr').value.trim()||'new friend',q:$('#pq').value.trim()||'hello everyone!',g};ss('wl3-me',me);renderAll();close();then&&then()}}
$('#me').onclick=()=>profile(!me);
function pickImg(max=560){return new Promise(res=>{const fi=$('#fi');fi.value='';fi.onchange=()=>{const f=fi.files[0];if(!f)return res(null);const r=new FileReader();
 r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.68))};im.onerror=()=>res(null);im.src=r.result};r.readAsDataURL(f)};fi.click()})}
/* generic form: fields [{k,l,t,ph,req}] */
function form(o){if(!me)return profile(true,()=>form(o));let img=null;
 open(`<h2>${esc(o.title)}</h2>${o.fields.map(f=>`<label for="f_${f.k}">${esc(f.l)}</label>${f.t==='area'?`<textarea id="f_${f.k}" rows="3" maxlength="200" placeholder="${esc(f.ph||'')}"></textarea>`:`<input id="f_${f.k}" type="${f.t||'text'}" maxlength="80" placeholder="${esc(f.ph||'')}">`}`).join('')}
 <img class="prev" id="pv" alt="Preview"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${o.photo?`<button class="btn g s" id="pi" type="button">📷 ${o.photo===2?'Choose photo':'Add photo (optional)'}</button>`:''}${o.ai?'<button class="btn g s" id="mg" type="button">✨ Write it for me</button>':''}</div>
 <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn g" id="cx">Cancel</button><button class="btn" id="go">Post</button></div><p id="er" style="color:#e5484d;margin:8px 0 0"></p>`);
 $('#cx').onclick=close;const pi=$('#pi');if(pi)pi.onclick=async()=>{const d=await pickImg();if(d){img=d;$('#pv').src=d;$('#pv').style.display='block'}};
 const mg=$('#mg');if(mg)mg.onclick=async()=>{mg.textContent='✨ thinking...';try{const r=await sampler(o.ai,{modelTier:'quick',cache:false});$('#f_'+o.fields[0].k).value=r.text.trim().replace(/^["']|["']$/g,'')}catch(e){$('#er').textContent='The helper is busy. Try again.'}mg.textContent='✨ Write it for me'};
 $('#go').onclick=async()=>{const v={};for(const f of o.fields){v[f.k]=$('#f_'+f.k).value.trim();if(f.req&&!v[f.k]){$('#f_'+f.k).focus();return}}if(o.photo===2&&!img){$('#er').textContent='Pick a photo first.';return}
  const p=o.make(v,img||'');if(!p){$('#er').textContent=o.err||'Check the form.';return}await addPost({by:me.name,target:'',text:'',img:img||'',...p});close();o.after&&o.after()}}
function person(id){const p=people().find(x=>x.id===id);if(id==='me'&&!me)return profile(true);const ns=notesFor(id);
 open(`<div class="profile-hero" style="${grad(p.g)}">
   <div class="profile-photo-wrap">
    <img class="profile-photo" src="${esc(p.image)}" alt="${esc(p.name)} profile image"
         onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
    <div class="profile-photo-fallback av" style="display:none">${esc(p.name[0].toUpperCase())}</div>
   </div>
   <h2 style="margin:0">${esc(p.name)}</h2>
   <div style="color:${p.g[0]};font-weight:700">${esc(p.role)}</div>
   <p style="color:var(--mu);margin:8px 0 0">"${esc(p.q)}"</p>
  </div>
 <div class="person-notes">${ns.length?ns.map((n,i)=>`<div class="note" style="--ac:${G[i%6][0]}"><div class="note-text">${esc(n.text)}</div>${okImg(n.img)?`<img src="${n.img}" alt="Photo from ${esc(n.by)}">`:''}<small>from ${esc(n.by)}</small>${me&&n.by===me.name?`<button type="button" class="delete-note" data-delete-note="${esc(n.id||'')}">🗑️ Delete note</button>`:''}</div>`).join(''):'<div class="empty">No notes yet. Be the first to say something nice.</div>'}</div>
 <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn g" id="cl">Close</button><button class="btn" id="nn">💌 Leave a note</button></div>`);
 $('#cl').onclick=close;
 $('#nn').onclick=()=>form({title:'A note for '+p.name,fields:[{k:'t',l:'Your message',t:'area',ph:'write something kind...'}],photo:1,ai:sampler?`Write one short, warm, slightly funny note (max 18 words) from a friend named ${me.name} to ${p.name}. Output only the note.`:'',make:v=>v.t?{kind:'note',target:id,text:v.t}:null,err:'Write a message first.',after:()=>person(id)});
 $('#mb').onclick=async e=>{
  const b=e.target.closest('[data-delete-note]');
  if(!b)return;
  const noteId=b.dataset.deleteNote;
  if(!noteId){
    alert('This older note does not have a delete ID. New notes will have one.');
    return;
  }
  const note=posts().find(x=>x.id===noteId);
  if(!note || !me || note.by!==me.name){
    alert('You can only delete your own note.');
    return;
  }
  await deletePost(noteId);
  close();
  person(id);
};
}
$('#pg').onclick=e=>{const c=e.target.closest('.pc');if(c)person(c.dataset.id)};
$('#addph').onclick=()=>form({title:'Add to the wall',fields:[{k:'t',l:'Caption',ph:'what is happening here?'}],photo:2,make:v=>({kind:'photo',text:v.t})});
$('#addgb').onclick=()=>form({title:'Sign the guestbook',fields:[{k:'t',l:'Your message',t:'area',ph:'write something kind...'}],photo:1,make:v=>v.t?{kind:'guest',text:v.t}:null,err:'Write a message first.'});
$('#addmem').onclick=()=>form({title:'Add a memory',fields:[{k:'t',l:'Title',ph:'The wrong bus',req:1},{k:'x',l:'What happened?',t:'area',ph:'tell the story...'},{k:'d',l:'When?',ph:'e.g. March 2025'}],photo:1,make:v=>({kind:'memory',title:v.t,text:v.x,date:v.d||'Sometime'})});
$('#addpl').onclick=()=>form({title:'New plan',fields:[{k:'t',l:'What is the plan?',ph:'Movie night at Sam\'s',req:1},{k:'d',l:'When?',ph:'Saturday 7pm',req:1}],make:v=>({kind:'plan',pid:pid(),text:v.t,date:v.d})});
$('#addpo').onclick=()=>form({title:'New poll',fields:[{k:'q',l:'Question',ph:'Where should we go?',req:1},{k:'o',l:'Options (separate with commas)',ph:'Beach, Hills, Cafe',req:1}],make:v=>{const o=v.o.split(',').map(s=>s.trim()).filter(Boolean).slice(0,5);return o.length>=2?{kind:'poll',pid:pid(),text:v.q,opts:o}:null},err:'Add at least two options.'});
$('#pl').onclick=e=>{const b=e.target.closest('[data-rsvp]');if(!b)return;if(!me)return profile(true);addPost({kind:'rsvp',target:b.dataset.rsvp,by:me.name,text:'',img:''})};
$('#po').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;if(!me)return profile(true);addPost({kind:'vote',target:b.dataset.v,by:me.name,text:b.dataset.o,img:''})};
$('#bn').onclick=async()=>{if(!me)return profile(true,()=>$('#bn').click());const d=await pickImg(900);if(d)addPost({kind:'banner',by:me.name,img:d,text:'',target:''})};
$('#wall').onclick=e=>{const b=e.target.closest('.ph');if(!b)return;const x=posts().filter(x=>x.kind==='photo'&&okImg(x.img))[+b.dataset.i];if(!x)return;
 open(`<img src="${x.img}" alt="${esc(x.text||'Photo')}" style="width:100%;border-radius:16px;display:block"><p style="margin:12px 0 2px;font-weight:700">${esc(x.text||'')}</p><small style="color:var(--mu)">by ${esc(x.by)}</small><div style="text-align:right"><button class="btn g" id="cl">Close</button></div>`);$('#cl').onclick=close};
if(!RM&&matchMedia('(hover:hover)').matches){$('#pg').addEventListener('pointermove',e=>{const c=e.target.closest('.pc');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`rotateY(${x*14}deg) rotateX(${-y*14}deg) translateY(-6px)`});$('#pg').addEventListener('pointerout',e=>{const c=e.target.closest('.pc');if(c)c.style.transform=''})}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.rv').forEach(el=>io.observe(el));
/* games */
const GN={mem:['moves',1],ttt:['',0],wh:['points',-1],rps:['wins in a row',-1],snk:['apples',-1],rea:['ms',1],mth:['correct',-1]};let cur='mem',stop=()=>{};
function lboard(){const[u,dir]=GN[cur];if(!dir){$('#lb').innerHTML='<li><span>This one is just for fun 😄</span></li>';return}
 const l=posts().filter(x=>x.kind==='score'&&x.game===cur).sort((a,b)=>dir*(a.score-b.score)).slice(0,6);
 $('#lb').innerHTML=l.length?l.map((x,i)=>`<li><span>${['🥇','🥈','🥉'][i]||i+1+'.'} ${esc(x.by)}</span><b>${x.score} ${u}</b></li>`).join(''):'<li><span>No scores yet. Be first!</span></li>'}
function done(sc){const dir=GN[cur][1];if(!dir)return;if(best[cur]==null||dir*(sc-best[cur])<0){best[cur]=sc;ss('wl3-best',best)}addPost({kind:'score',game:cur,by:me?me.name:'Guest',score:sc,target:'',text:'',img:''})}
const bt=()=>best[cur]??'-';
function setGame(g){stop();stop=()=>{};cur=g;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.g===g));({mem,ttt,wh,rps,snk,rea,mth})[g]();lboard()}
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(b)setGame(b.dataset.g)};
function mem(){const IC=['🍕','🎈','📸','🍓','🌈','🎧','🧸','🍩','🚀','🎂'];let n=6,first=null,lock=false,mv=0,fd=0;const g=$('#gb2');
 g.innerHTML=`<div class="row"><span>Pairs: <button class="btn g s" data-n="6">6</button> <button class="btn g s" data-n="8">8</button> <button class="btn g s" data-n="10">10</button></span><span>Moves <b id="mv">0</b> · Best <b>${bt()}</b></span></div><div class="deck" id="dk"></div><div class="big" id="mg">Find all the pairs</div>`;
 function deal(){const c=[...IC].sort(()=>Math.random()-.5).slice(0,n),d=[...c,...c].sort(()=>Math.random()-.5);mv=0;fd=0;first=null;lock=false;$('#mv').textContent=0;$('#mg').textContent='Find all the pairs';
  $('#dk').style.gridTemplateColumns=`repeat(${n===10?5:4},1fr)`;$('#dk').innerHTML=d.map(v=>`<button class="cd" data-c="${v}" aria-label="Card"><i class="b">?</i><i class="f">${v}</i></button>`).join('')}
 g.onclick=e=>{const nb=e.target.closest('[data-n]');if(nb){n=+nb.dataset.n;return deal()}const k=e.target.closest('.cd');if(!k||lock||k.classList.contains('up'))return;k.classList.add('up');if(!first){first=k;return}
  mv++;$('#mv').textContent=mv;const a=first;first=null;
  if(a.dataset.c===k.dataset.c){a.classList.add('ok');k.classList.add('ok');if(++fd===n){$('#mg').textContent=`🎉 Done in ${mv} moves!`;done(mv)}}
  else{lock=true;setTimeout(()=>{a.classList.remove('up');k.classList.remove('up');lock=false},700)}};deal()}
function ttt(){const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let B,over,sc=ls('wl3-ttt',{w:0,l:0,d:0});const g=$('#gb2');
 const win=b=>W.find(l=>b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]]);
 function mm(b,p){const w=win(b);if(w)return{s:b[w[0]]==='O'?1:-1};if(b.every(Boolean))return{s:0};let r=null;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const x=mm(b,p==='O'?'X':'O');b[i]=null;if(!r||(p==='O'?x.s>r.s:x.s<r.s))r={s:x.s,i}}return r}
 g.innerHTML=`<div class="row"><span>You are ✕. The computer is ○.</span><span>W <b id="tw">0</b> · L <b id="tl">0</b> · D <b id="td">0</b></span></div><div class="ttt" id="bd"></div><div class="big" id="tm"></div><div style="text-align:center"><button class="btn g s" id="tn">New game</button></div>`;
 function draw(){const w=win(B);$('#bd').innerHTML=B.map((v,i)=>`<button data-i="${i}" class="${w&&w.includes(i)?'w':''}" aria-label="Square ${i+1}" ${v||over?'disabled':''}>${v==='X'?'✕':v==='O'?'○':''}</button>`).join('');$('#tw').textContent=sc.w;$('#tl').textContent=sc.l;$('#td').textContent=sc.d}
 function end(){over=true;const w=win(B);if(w){if(B[w[0]]==='X'){sc.w++;$('#tm').textContent='You win! 🎉'}else{sc.l++;$('#tm').textContent='Computer wins 🤖'}}else{sc.d++;$('#tm').textContent="It's a draw 🤝"}ss('wl3-ttt',sc);draw()}
 function nw(){B=Array(9).fill(null);over=false;$('#tm').textContent='Your move';draw()}
 $('#bd').onclick=e=>{const b=e.target.closest('button');if(!b||over)return;B[+b.dataset.i]='X';draw();if(win(B)||B.every(Boolean))return end();
  setTimeout(()=>{const f=B.map((v,i)=>v?null:i).filter(x=>x!==null);B[Math.random()<.3?f[Math.random()*f.length|0]:mm([...B],'O').i]='O';if(win(B)||B.every(Boolean))return end();draw()},350)};
 $('#tn').onclick=nw;nw()}
function wh(){const g=$('#gb2');let sc=0,left=20,tm=null,pop=null,run=false;
 g.innerHTML=`<div class="row"><span>Tap the moles! 20 seconds.</span><span>Score <b id="ws">0</b> · Time <b id="wt">20</b> · Best <b>${bt()}</b></span></div><div class="holes" id="hs">${Array.from({length:9},(_,i)=>`<button class="hole" data-i="${i}" aria-label="Hole ${i+1}"><span>🐹</span></button>`).join('')}</div><div class="big" id="wm"></div><div style="text-align:center"><button class="btn" id="wb">Start</button></div>`;
 const hs=[...document.querySelectorAll('.hole')];
 function up(){hs.forEach(h=>h.classList.remove('up'));hs[Math.random()*9|0].classList.add('up')}
 function end(){run=false;clearInterval(tm);clearInterval(pop);hs.forEach(h=>h.classList.remove('up'));$('#wm').textContent=`Time! You got ${sc} 🎉`;$('#wb').textContent='Play again';if(sc>0)done(sc)}
 $('#wb').onclick=()=>{clearInterval(tm);clearInterval(pop);sc=0;left=20;run=true;$('#ws').textContent=0;$('#wt').textContent=20;$('#wm').textContent='';$('#wb').textContent='Go go go!';up();pop=setInterval(up,720);tm=setInterval(()=>{$('#wt').textContent=--left;if(left<=0)end()},1000)};
 $('#hs').onclick=e=>{const h=e.target.closest('.hole');if(!h||!run||!h.classList.contains('up'))return;h.classList.remove('up');sc++;$('#ws').textContent=sc};
 stop=()=>{clearInterval(tm);clearInterval(pop)}}
function rps(){const g=$('#gb2');let st=0;const E={r:'✊',p:'✋',s:'✌️'},B={r:'s',p:'r',s:'p'};
 g.innerHTML=`<div class="row"><span>Win as many times in a row as you can.</span><span>Streak <b id="rs">0</b> · Best <b>${bt()}</b></span></div><div class="rps"><button data-m="r" aria-label="Rock">✊</button><button data-m="p" aria-label="Paper">✋</button><button data-m="s" aria-label="Scissors">✌️</button></div><div class="big" id="rm">Choose one!</div>`;
 g.onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;const u=b.dataset.m,c='rps'[Math.random()*3|0];
  if(u===c)$('#rm').textContent=`${E[u]} vs ${E[c]}: a tie`;
  else if(B[u]===c){st++;$('#rm').textContent=`${E[u]} vs ${E[c]}: you win! 🎉`}
  else{$('#rm').textContent=`${E[u]} vs ${E[c]}: you lose 😅`;if(st>0)done(st);st=0}
  $('#rs').textContent=st}}
function snk(){const N=16,S=20,g=$('#gb2');g.innerHTML=`<div class="row"><span>Arrow keys, WASD, swipe or buttons</span><span>Apples <b id="sa">0</b> · Best <b>${bt()}</b></span></div><canvas id="sc" width="${N*S}" height="${N*S}" aria-label="Snake game"></canvas><div class="pad"><span></span><button data-d="u" aria-label="Up">▲</button><span></span><button data-d="l" aria-label="Left">◀</button><button data-d="d" aria-label="Down">▼</button><button data-d="r" aria-label="Right">▶</button></div><div class="big" id="sm" style="font-size:18px">Press a direction to start</div>`;
 const c=$('#sc').getContext('2d');let s,d,nd,ap,sc,t=null;const V={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
 function reset(){s=[[8,8],[7,8],[6,8]];d=nd=[0,0];sc=0;food();$('#sa').textContent=0;draw()}
 function food(){do{ap=[Math.random()*N|0,Math.random()*N|0]}while(s.some(p=>p[0]===ap[0]&&p[1]===ap[1]))}
 function draw(){c.fillStyle='#120f2b';c.fillRect(0,0,N*S,N*S);c.fillStyle='#ff6fb5';c.beginPath();c.arc(ap[0]*S+S/2,ap[1]*S+S/2,S/2-3,0,7);c.fill();s.forEach((p,i)=>{c.fillStyle=i?'#4de0c4':'#b6fff0';c.beginPath();c.roundRect(p[0]*S+1,p[1]*S+1,S-2,S-2,6);c.fill()})}
 function tick(){d=nd;if(!d[0]&&!d[1])return;const h=[s[0][0]+d[0],s[0][1]+d[1]];
  if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||s.some(p=>p[0]===h[0]&&p[1]===h[1])){clearInterval(t);t=null;$('#sm').textContent=`Game over: ${sc} apples. Press a direction to retry`;if(sc>0)done(sc);reset();return}
  s.unshift(h);if(h[0]===ap[0]&&h[1]===ap[1]){sc++;$('#sa').textContent=sc;food()}else s.pop();draw()}
 function dir(k){const v=V[k];if(!v)return;if(v[0]===-d[0]&&v[1]===-d[1]&&(d[0]||d[1]))return;nd=v;if(!t){$('#sm').textContent='Go!';t=setInterval(tick,115)}}
 const kd=e=>{const m={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r'}[e.key];if(m&&$('#sc')){e.preventDefault();dir(m)}};addEventListener('keydown',kd);
 $('.pad').onclick=e=>{const b=e.target.closest('button');if(b)dir(b.dataset.d)};
 let sx,sy;const cv=$('#sc');cv.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});cv.addEventListener('pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;dir(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'))});
 stop=()=>{clearInterval(t);removeEventListener('keydown',kd)};reset()}
function rea(){const g=$('#gb2');g.innerHTML=`<div class="row"><span>Click when it turns green</span><span>Best <b>${bt()}</b> ms</span></div><button id="rb">Click to start</button><div class="big" id="rm"></div>`;
 let st=0,to=null,s='idle';const b=$('#rb');
 b.onclick=()=>{if(s==='idle'){s='wait';b.className='wait';b.textContent='Wait for green...';to=setTimeout(()=>{s='go';b.className='go';b.textContent='CLICK!';st=performance.now()},1000+Math.random()*2500)}
  else if(s==='wait'){clearTimeout(to);s='idle';b.className='';b.textContent='Too soon! Click to retry'}
  else{const ms=Math.round(performance.now()-st);s='idle';b.className='';b.textContent=`${ms} ms. Click to go again`;$('#rm').textContent=ms<250?'Lightning fast ⚡':ms<350?'Nice reflexes 👍':'Wake up! ☕';done(ms)}};
 stop=()=>clearTimeout(to)}
function mth(){const g=$('#gb2');let sc=0,left=30,tm=null,run=false,ans=0;
 g.innerHTML=`<div class="row"><span>Solve as many as you can in 30 seconds</span><span>Score <b id="ms">0</b> · Time <b id="mt">30</b> · Best <b>${bt()}</b></span></div><div class="mq" id="mq">Ready?</div><input id="ma" inputmode="numeric" autocomplete="off" aria-label="Your answer" disabled><div class="big" id="mm2"></div><div style="text-align:center"><button class="btn" id="mb2">Start</button></div>`;
 function q(){const a=2+Math.random()*10|0,b=2+Math.random()*10|0,o=Math.random()*3|0;ans=o===0?a+b:o===1?Math.max(a,b)-Math.min(a,b):a*b;$('#mq').textContent=o===0?`${a} + ${b}`:o===1?`${Math.max(a,b)} − ${Math.min(a,b)}`:`${a} × ${b}`;$('#ma').value=''}
 function end(){run=false;clearInterval(tm);$('#ma').disabled=true;$('#mq').textContent='Time!';$('#mm2').textContent=`You solved ${sc} 🎉`;$('#mb2').textContent='Play again';if(sc>0)done(sc)}
 $('#mb2').onclick=()=>{clearInterval(tm);sc=0;left=30;run=true;$('#ms').textContent=0;$('#mt').textContent=30;$('#mm2').textContent='';$('#ma').disabled=false;$('#ma').focus();q();tm=setInterval(()=>{$('#mt').textContent=--left;if(left<=0)end()},1000)};
 $('#ma').oninput=e=>{if(run&&+e.target.value===ans&&e.target.value!==''){sc++;$('#ms').textContent=sc;q()}};stop=()=>clearInterval(tm)}
/* assistant */
const hist=[];const FB=[[/team|people|who|crew/,()=>`The crew: ${T.map(t=>t[0]).join(', ')}, and seat 13 is open for you.`],[/game|play|bored/,()=>'Try Whack-a-mole for a quick score, Snake for a classic, or Quick math for a brain workout.'],[/plan|event|meet/,()=>'Scroll to Plans, tap "New plan", and everyone can say "I\'m in".'],[/poll|vote/,()=>'In Polls you can start a question with options. Each person gets one vote.'],[/note|message|write/,()=>'Open anyone in People and tap "Leave a note". You can add a photo too.'],[/photo|picture|image|banner/,()=>'Use "Add a photo" on the Photos wall, or "Change photo" on the top picture.'],[/theme|dark|light/,()=>'Tap the sun or moon button in the top bar to switch themes.'],[/hi|hello|hey/,()=>'Hey! I can help with games, plans, polls, notes and photos.']];
const fb=q=>{const m=FB.find(f=>f[0].test(q.toLowerCase()));return m?m[1]():"I'm a small helper. Ask me about the crew, games, plans, polls, notes or photos!"};
const ctx=()=>`You are Lab Buddy, the cheerful helper for the WE LABS friends website (13 friends, motto "best of best"). Sections: People (cards with notes), Memories timeline, Plans with "I'm in" RSVP, Polls, Photo wall and guestbook, Game room (memory, tic-tac-toe, whack-a-mole, rock paper scissors, snake, reflex, quick math, with leaderboard), and a light/dark theme button. People: ${T.map(t=>t[0]+' ('+t[1]+')').join(', ')}. The viewer is ${me?me.name:'a guest'}. Keep replies short (max 3 sentences), friendly and useful. If asked to write something, write it.`;
function bub(t,c){const d=document.createElement('div');d.className='m '+c;d.textContent=t;$('#msgs').appendChild(d);$('#msgs').scrollTop=1e9;return d}
async function ask(q){bub(q,'u');hist.push('User: '+q);const b=bub('...','b');
 if(sampler){try{const r=await sampler(`${ctx()}\n\nConversation so far:\n${hist.slice(-8).join('\n')}\nAssistant:`,{modelTier:'quick',cache:false,onText:({text})=>{b.textContent=text;$('#msgs').scrollTop=1e9}});b.textContent=r.text.trim();hist.push('Assistant: '+b.textContent);return}catch(e){}}
 b.textContent=fb(q);hist.push('Assistant: '+b.textContent)}
$('#af').onsubmit=e=>{e.preventDefault();const v=$('#aq').value.trim();if(!v)return;$('#aq').value='';ask(v)};
$('#sg').innerHTML=['Who is in the crew?','Suggest a game','How do I make a plan?','Write a funny note for the group'].map(s=>`<button type="button">${s}</button>`).join('');
$('#sg').onclick=e=>{const b=e.target.closest('button');if(b)ask(b.textContent)};
$('#fab').onclick=()=>{const a=$('#ai');a.classList.toggle('open');if(a.classList.contains('open')){if(!$('#msgs').children.length)bub("Hi! I'm Lab Buddy 👋 Ask me about the crew, games, plans, polls, notes or photos.",'b');$('#aq').focus()}};
$('#aix').onclick=()=>$('#ai').classList.remove('open');
function boot(){renderAll();setGame('mem');startCaps();const after=()=>{$('#ld').remove();if(!me)profile(true)};
 if(RM||!window.gsap)return after();
 const lt=$('#lt');'WE LABS'.split('').forEach(ch=>{const s=document.createElement('span');s.innerHTML=ch===' '?'&nbsp;':ch;lt.appendChild(s)});
 const msgs=['getting things ready...','gathering the crew...','warming up the games...','almost there...','welcome! 💜'];
 gsap.timeline({onComplete:after}).from('#lt span',{y:-120,opacity:0,rotate:()=>gsap.utils.random(-40,40),duration:.7,ease:'bounce.out',stagger:.07})
  .to('#lf',{width:'100%',duration:1.8,ease:'power1.inOut',onUpdate(){$('#lm').textContent=msgs[Math.min(4,Math.floor(this.progress()*5))]}},.2)
  .to('#lt span',{y:-14,duration:.25,yoyo:true,repeat:1,stagger:.04})
  .to('.c',{scale:1.15,opacity:0,duration:.45,ease:'power2.in'},'+=.1').to('#ld',{opacity:0,duration:.4},'-=.2')}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot);else boot();
