/* Syllabo doc pages (support, privacy, terms): the homepage's nav, footer and small details, without the homepage's
   sections. Here the "sections" are the page's own h2 headings, so the lockup readout and the progress wave follow
   your reading. The nav code is kept in step with the copy inside index.html by hand. */
(()=>{
'use strict';
const d=document,root=d.documentElement,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>Array.from(c.querySelectorAll(s));
const mq=q=>matchMedia(q),mFine=mq('(hover: hover) and (pointer: fine)');
const reduced=mq('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,eOut=t=>1-Math.pow(1-t,3),TAU=Math.PI*2,NS='http://www.w3.org/2000/svg';
let maxYc=0;const docTop=el=>el.getBoundingClientRect().top+scrollY,maxY=()=>maxYc||(maxYc=Math.max(root.scrollHeight-innerHeight,1));
let W=innerWidth,H=innerHeight,sy=scrollY,dirty=true,running=false,last=performance.now();
function kick(){if(!running){running=true;last=performance.now();requestAnimationFrame(frame)}}

/* ---------- nav ---------- */
const navEl=$('#nav'),bar=$('.bar',navEl),links=$('.links',navEl),curA=$('.links a[aria-current="page"]',navEl);
const circ=$('.circ',links),circP=circ&&$('path',circ),sub=$('.sub',navEl),lkSpark=$('.lk-spark',navEl),wave=$('.wave',navEl),wvT=$('.wv-t',navEl),wvF=$('.wv-f',navEl);
const SUB0=sub?sub.textContent.trim():'',CIRC_COLS=['#2F63D6','#7C6CF0','#F0524F','#E7B400'];
const heads=$$('.doc h2'),SECS=[{n:'',t:SUB0,el:null,top:-1e9}].concat(heads.map((h,i)=>({n:String(i+1).padStart(2,'0'),t:(h.dataset.short||h.textContent.replace(/^\d+\.?\s*/,'')).trim(),el:h,top:0})));
const tocA=$$('.toc a');
let secIdx=-1,merged=null,tucked=false,lastSy=-1,tuckAcc=0,noTuckUntil=0;
$$('.lbl',links).forEach(l=>{
  const t=l.textContent.trim(),row=()=>{const r=d.createElement('span');Array.from(t).forEach((c,j)=>{const i=d.createElement('i');i.style.setProperty('--j',j);i.textContent=c===' '?' ':c;r.appendChild(i)});return r};
  const sr=d.createElement('span');sr.className='sr';sr.textContent=t;
  const rl=d.createElement('span');rl.className='rl';rl.setAttribute('aria-hidden','true');rl.append(row(),row());
  l.replaceChildren(sr,rl);
});
function placeCirc(a){circ.style.left=(a.offsetLeft-7)+'px';circ.style.top=(a.offsetTop-4)+'px';circ.style.width=(a.offsetWidth+14)+'px';circ.style.height=(a.offsetHeight+8)+'px'}
function drawCirc(){
  if(!circP||!curA||W<960)return;placeCirc(curA);circ.style.opacity='1';circP.style.stroke=CIRC_COLS[0];
  if(reduced){circP.style.strokeDashoffset='0';return}
  circP.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:900,delay:350,easing:'cubic-bezier(.65,0,.35,1)',fill:'both'});
}
function rollSub(sec,dir,first){
  if(!sub)return;const cur=sub.lastElementChild,fill=el=>{el.textContent='';if(sec.n){const b=d.createElement('b');b.textContent=sec.n;el.append(b,' · '+sec.t)}else el.textContent=SUB0};
  if(first||!cur){if(cur)fill(cur);return}
  const nw=d.createElement('span');fill(nw);sub.appendChild(nw);
  if(reduced){cur.remove();return}
  const e='cubic-bezier(.22,1,.36,1)';
  cur.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY('+(-dir*100)+'%)',opacity:0}],{duration:520,easing:e,fill:'forwards'}).onfinish=()=>cur.remove();
  nw.animate([{transform:'translateY('+(dir*100)+'%)',opacity:0},{transform:'none',opacity:1}],{duration:660,easing:e});
  if(lkSpark)lkSpark.animate([{transform:'none'},{transform:'rotate('+(dir*180)+'deg) scale(1.45)',offset:.45},{transform:'rotate('+(dir*360)+'deg)'}],{duration:900,easing:'cubic-bezier(.34,1.45,.64,1)'});
}
function setTuck(v){if(v!==tucked){tucked=v;navEl.classList.toggle('tuck',v)}}
function measureNav(){
  if(W>=960){const l=links.offsetLeft;bar.style.setProperty('--cl',l+'px');bar.style.setProperty('--cr',Math.max(bar.clientWidth-l-links.offsetWidth,0)+'px')}
  SECS.forEach(s=>{if(s.el)s.top=docTop(s.el)-120});
  const ww=Math.max(bar.clientWidth-44,10),n=Math.max(2,Math.round(ww/11)),st=ww/n;let p='M0 4';
  for(let i=0;i<n;i++)p+='q'+(st/2).toFixed(2)+' '+(i%2?3.6:-3.6)+' '+st.toFixed(2)+' 0';
  wave.setAttribute('viewBox','0 0 '+ww.toFixed(1)+' 8');wvT.setAttribute('d',p);wvF.setAttribute('d',p);
  if(sub){const t=d.createElement('span');t.style.visibility='hidden';t.style.right='auto';sub.appendChild(t);let mw=0;SECS.forEach(x=>{t.textContent=x.n?x.n+' · '+x.t:SUB0;mw=Math.max(mw,t.offsetWidth)});sub.style.width=Math.ceil(Math.min(mw+1,260))+'px';t.remove()}
  if(curA&&circ.style.opacity==='1')placeCirc(curA);
  const ai=arrA&&$('.ico',arrA),cta=$('.nav-cta',navEl);
  if(ai&&cta&&W>=960){const a=ai.getBoundingClientRect(),c=cta.getBoundingClientRect();arrLen=c.width?clamp(c.left-a.left-18,40,240):44}
}
function navUpd(){
  const mid=sy+H*.35;let k=0;for(let i=1;i<SECS.length;i++)if(SECS[i].top<=mid)k=i;
  if(k!==secIdx){const first=secIdx<0,dir=k>secIdx?1:-1;secIdx=k;rollSub(SECS[k],dir,first);tocA.forEach((a,i)=>a.classList.toggle('on',i===k-1))}
  const m=W<960||sy>Math.min(H*.18,140);if(m!==merged){merged=m;navEl.classList.toggle('merged',m)}
  wvF.style.strokeDashoffset=(1-clamp(sy/Math.max(maxY(),1),0,1)).toFixed(4);
  const dy=lastSy<0?0:sy-lastSy;lastSy=sy;
  if(sy<H*.6||!sheet.hidden||navEl.contains(d.activeElement)||performance.now()<noTuckUntil){tuckAcc=0;setTuck(false);return}
  if(dy&&(dy>0)!==(tuckAcc>0))tuckAcc=0;tuckAcc+=dy;
  if(tuckAcc>48)setTuck(true);else if(tuckAcc<-24)setTuck(false);
}
navEl.addEventListener('focusin',()=>setTuck(false));
addEventListener('pointermove',e=>{if(tucked&&e.pointerType==='mouse'&&e.clientY<26)setTuck(false)},{passive:true});

/* Product: googly eyes that follow the pointer, and blink now and then */
const pupils=$$('.l-eyes .pu'),eyeSvg=$('.l-eyes .ico');let eyeRaf=0,eyeX=0,eyeY=0;
function lookEyes(){eyeRaf=0;const r=eyeSvg.getBoundingClientRect();if(!r.width)return;const sc=r.width/30;
  pupils.forEach(p=>{const cx=r.left+(+p.getAttribute('cx'))*sc,cy=r.top+11*sc,dx=eyeX-cx,dy=eyeY-cy,dist=Math.hypot(dx,dy)||1,f=Math.min(dist/70,1);p.setAttribute('transform','translate('+(dx/dist*2.9*f).toFixed(2)+' '+(dy/dist*5.6*f).toFixed(2)+')')})}
if(pupils.length&&!reduced){
  addEventListener('pointermove',e=>{eyeX=e.clientX;eyeY=e.clientY;if(!eyeRaf)eyeRaf=requestAnimationFrame(lookEyes)},{passive:true});
  const blink=()=>setTimeout(()=>{if(!tucked&&W>=1180&&!d.hidden)$$('.l-eyes .eye').forEach(g=>g.animate([{transform:'scaleY(1)'},{transform:'scaleY(.1)',offset:.45},{transform:'scaleY(1)'}],{duration:190,easing:'ease-in-out'}));blink()},2800+Math.random()*4400);
  blink();
}
/* Compete: every hit jolts the letters; the fourth knocks them to the floor, then they spring back */
const knockA=$('.links a.knock');
if(knockA&&!reduced){
  const ls=$$('.rl>span:first-child i',knockA),st=ls.map(()=>({x:0,y:0,r:0})),bolt=$('.ico',knockA);let hits=0,healT=0,broken=false;
  const tf=q=>'translate('+q.x.toFixed(2)+'px,'+q.y.toFixed(2)+'px) rotate('+q.r.toFixed(1)+'deg)';
  const mv=(i,to,dur,ease,mid)=>{const el=ls[i],q=st[i],kf=[{transform:tf(q)}];if(mid)kf.push({transform:tf(mid),offset:.32});kf.push({transform:tf(to)});if(el._k)el._k.cancel();el._k=el.animate(kf,{duration:dur,easing:ease,fill:'forwards'});q.x=to.x;q.y=to.y;q.r=to.r};
  const heal=()=>{hits=0;broken=false;ls.forEach((el,i)=>mv(i,{x:0,y:0,r:0},760+i*45,'cubic-bezier(.34,1.56,.64,1)'))};
  const hit=()=>{
    clearTimeout(healT);
    if(broken){healT=setTimeout(heal,1500);return}
    hits++;
    bolt.animate([{transform:'none'},{transform:'translate(1px,-3px) rotate(-14deg) scale(1.18)',offset:.3},{transform:'none'}],{duration:380,easing:'ease-out'});
    if(hits>=4){
      broken=true;
      ls.forEach((el,i)=>mv(i,{x:(Math.random()-.5)*6,y:9+Math.random()*4,r:(Math.random()-.5)*84},520+Math.random()*260,'cubic-bezier(.55,0,1,.45)'));
      setTimeout(()=>{if(broken)ls.forEach((el,i)=>{const q=st[i];mv(i,{x:q.x,y:q.y,r:q.r},300,'ease-out',{x:q.x,y:q.y-3.5,r:q.r*.85})})},800);
      healT=setTimeout(heal,2300);return;
    }
    const k=hits/4;
    ls.forEach((el,i)=>{const q=st[i],to={x:clamp(q.x+(Math.random()-.5)*2.6*k,-3,3),y:clamp(q.y+(Math.random()-.3)*3.2*k,-2.5,4),r:clamp(q.r+(Math.random()-.5)*22*k,-24,24)};mv(i,to,440,'cubic-bezier(.22,1,.36,1)',{x:to.x+(Math.random()-.5)*3,y:to.y-2-Math.random()*3,r:to.r+(Math.random()-.5)*16})});
    healT=setTimeout(heal,2600);
  };
  knockA.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hit()});
  knockA.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')hit()});
}
/* Support: the curly arrow uncurls into a long straight one on hover */
const arrA=$('.links a.l-arrow'),arrS=arrA&&$('.shaft',arrA),arrH=arrA&&$('.head',arrA);let arrU=0,arrV=0,arrOn=false,arrRun=false,arrT=0,arrLen=44;
function drawArr(u){
  const N=30,pts=[],f=p=>p[0].toFixed(2)+' '+p[1].toFixed(2);
  for(let i=0;i<=N;i++){const t=i/N,lu=clamp((t-.2)/.5,0,1),a=TAU*lu;pts.push([Math.min(lerp(2.5+17*t+4.2*Math.sin(a),2.5+(arrLen-2.5)*t,u),arrLen+3),lerp(13-4.2*(1-Math.cos(a))+.8*Math.sin(Math.PI*t),12.5,u)])}
  let p='M'+f(pts[0]);for(let i=1;i<N;i++)p+='Q'+f(pts[i])+' '+f([(pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2]);p+='L'+f(pts[N]);
  arrS.setAttribute('d',p);
  const E=pts[N],B=pts[N-3],th=Math.atan2(E[1]-B[1],E[0]-B[0]),h=4.4,w=.7;
  arrH.setAttribute('d','M'+f([E[0]-h*Math.cos(th-w),E[1]-h*Math.sin(th-w)])+'L'+f(E)+'L'+f([E[0]-h*Math.cos(th+w),E[1]-h*Math.sin(th+w)]));
}
function arrStep(now){const dt=clamp((now-arrT)/1000,0,.034);arrT=now;const tg=arrOn?1:0;arrV+=(170*(tg-arrU)-15*arrV)*dt;arrU+=arrV*dt;
  if(Math.abs(tg-arrU)<.001&&Math.abs(arrV)<.002){arrU=tg;arrRun=false;drawArr(arrU);return}drawArr(arrU);requestAnimationFrame(arrStep)}
function arrGo(on){arrOn=on;if(reduced){arrU=on?1:0;drawArr(arrU);return}if(!arrRun){arrRun=true;arrT=performance.now();requestAnimationFrame(arrStep)}}
if(arrA){drawArr(0);arrA.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')arrGo(true)});arrA.addEventListener('pointerleave',()=>arrGo(false));arrA.addEventListener('focus',()=>arrGo(true));arrA.addEventListener('blur',()=>arrGo(false))}

/* ---------- mobile menu ---------- */
const menuBtn=$('.menu-btn'),sheet=$('#sheet'),mainEl=$('main'),footEl=$('footer');
function setMenu(open){if(open)setTuck(false);sheet.hidden=!open;menuBtn.setAttribute('aria-expanded',String(open));$('.mb-label',menuBtn).textContent=open?'Close':'Menu';root.classList.toggle('locked',open);mainEl.inert=open;footEl.inert=open;if(open){const f=$('a',sheet);f&&f.focus()}}
menuBtn.setAttribute('role','button');
menuBtn.addEventListener('click',e=>{e.preventDefault();setMenu(sheet.hidden)});
menuBtn.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();setMenu(sheet.hidden)}});
sheet.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
d.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden){setMenu(false);menuBtn.focus()}});
mq('(min-width: 960px)').addEventListener('change',e=>{if(e.matches&&!sheet.hidden)setMenu(false)});

/* ---------- smooth wheel scrolling (Lenis-style), and in-page links that glide ---------- */
const SS={active:false,cur:scrollY,tgt:scrollY,set:-1},ssOn=()=>!reduced&&mFine.matches;
function nestedScrolls(el,dy){for(;el&&el!==d.body&&el!==root;el=el.parentElement){if(el.nodeType!==1)continue;const oy=getComputedStyle(el).overflowY;if((oy==='auto'||oy==='scroll')&&el.scrollHeight>el.clientHeight+1){if(dy>0?el.scrollTop+el.clientHeight<el.scrollHeight-1:el.scrollTop>0)return true}}return false}
addEventListener('wheel',e=>{
  if(!ssOn()||e.ctrlKey||e.metaKey||root.classList.contains('locked'))return;
  let dy=e.deltaY,dx=e.deltaX;
  if(e.deltaMode===1){dy*=100/6;dx*=100/6}else if(e.deltaMode===2){dy*=innerHeight;dx*=innerWidth}
  if(Math.abs(dx)>Math.abs(dy)||nestedScrolls(e.target,dy))return;
  e.preventDefault();if(!SS.active){SS.cur=scrollY;SS.tgt=scrollY}
  SS.tgt=clamp(SS.tgt+dy,0,maxY());SS.active=true;kick();
},{passive:false});
addEventListener('keydown',e=>{if(SS.active&&/^(Arrow|Page|Home|End| )/.test(e.key))SS.active=false});
function glideTo(y){y=clamp(y,0,maxY());if(reduced){scrollTo(0,y);return}if(!ssOn()){scrollTo({top:y,behavior:'smooth'});return}SS.cur=scrollY;SS.tgt=y;SS.active=true;kick()}
d.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;
  const a=e.target.closest('a[href^="#"]');if(!a||a.classList.contains('menu-btn'))return;
  const id=decodeURIComponent(a.getAttribute('href').slice(1)),el=id?d.getElementById(id):null;if(!el)return;
  e.preventDefault();if(!sheet.hidden)setMenu(false);if(a.closest('.nav,.toc'))noTuckUntil=performance.now()+1800;
  glideTo(id==='top'?0:docTop(el)-100);history.pushState(null,'','#'+id);
  if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');el.focus({preventScroll:true});
});

/* ---------- pointer ink trail (28 pooled segments) ---------- */
const inkSvg=$('.ink'),POOL=[];let inkIdx=0,inkCol=-1,inkLast=null,inkMid=null,inkT=0,inkPrevT=0;
if(inkSvg&&!reduced&&mFine.matches&&W>=760)for(let i=0;i<28;i++){const p=d.createElementNS(NS,'path');inkSvg.appendChild(p);POOL.push(p)}
const inkReset=()=>{inkLast=null;inkMid=null};
addEventListener('pointermove',e=>{
  if(!POOL.length||e.pointerType!=='mouse')return;
  const now=performance.now();if(now-inkT<24)return;
  const t=e.target;if(!(t instanceof Element)||t.closest('a,button,summary,input,.sheet,.nav')){inkReset();return}
  const x=e.clientX,y=e.clientY;
  if(!inkLast||now-inkPrevT>140||Math.hypot(x-inkLast.x,y-inkLast.y)>100){inkCol=(inkCol+1)%CIRC_COLS.length;inkLast={x,y};inkMid={x,y};inkT=inkPrevT=now;return}
  const dist=Math.hypot(x-inkLast.x,y-inkLast.y);if(dist<4)return;
  const mid={x:(inkLast.x+x)/2,y:(inkLast.y+y)/2},p=POOL[inkIdx];inkIdx=(inkIdx+1)%POOL.length;
  p.setAttribute('d','M'+inkMid.x.toFixed(1)+' '+inkMid.y.toFixed(1)+'Q'+inkLast.x.toFixed(1)+' '+inkLast.y.toFixed(1)+' '+mid.x.toFixed(1)+' '+mid.y.toFixed(1));
  p.setAttribute('stroke',CIRC_COLS[inkCol]);p.setAttribute('stroke-width',Math.min(4.5,2+.045*dist).toFixed(2));
  if(p._a)p._a.cancel();p._a=p.animate([{opacity:.58},{opacity:0}],{duration:680,easing:'ease-in',fill:'forwards'});
  inkMid=mid;inkLast={x,y};inkT=inkPrevT=now;
},{passive:true});
d.addEventListener('pointerleave',inkReset);addEventListener('blur',inkReset);

/* ---------- headings rise word by word; fades ---------- */
function split(el,wrap){const walk=node=>{Array.from(node.childNodes).forEach(n=>{if(n.nodeType===3){const parts=n.textContent.split(/(\s+)/),frag=d.createDocumentFragment();parts.forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(d.createTextNode(p));return}frag.appendChild(wrap(p))});n.replaceWith(frag)}else if(n.nodeType===1&&!n.classList.contains('sr')&&n.namespaceURI!==NS)walk(n)})};walk(el)}
if(!reduced)$$('.rise').forEach(h=>split(h,p=>{const o=d.createElement('span');o.className='wm';const i=d.createElement('span');i.className='wi';i.textContent=p;o.appendChild(i);return o}));
const lineDelays=h=>{let top=null,line=-1;$$('.wm',h).forEach(w=>{const t=w.offsetTop;if(top===null||Math.abs(t-top)>4){line++;top=t}w.firstChild.style.setProperty('--dl',(line*.08)+'s')})};
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting||(e.intersectionRatio<.25&&e.intersectionRect.height<innerHeight*.3))return;const el=e.target;if(el.classList.contains('rise'))lineDelays(el);el.classList.add('in');rio.unobserve(el)}),{threshold:[0,.05,.1,.25],rootMargin:'0px 0px -6% 0px'});
$$('.rise,.fade').forEach(el=>{if(reduced)el.classList.add('in');else rio.observe(el)});

/* ---------- support answers open to their height and rise in line by line ---------- */
const faqPrep=[];
if(!reduced)$$('.doc details').forEach(dt=>{
  const sm=$('summary',dt),a=$('.a',dt);if(!sm||!a)return;let an=null,ws=null,want=dt.open;
  const prep=()=>{if(!ws){split(a,p=>{const w=d.createElement('span');w.className='aw';w.textContent=p;return w});ws=$$('.aw',a)}};faqPrep.push(prep);
  sm.addEventListener('click',e=>{
    e.preventDefault();
    const from=dt.open?a.getBoundingClientRect().height:0;
    if(an){an.onfinish=null;an.cancel();an=null}
    want=!(dt.open&&!dt.classList.contains('closing'));a.style.overflow='hidden';
    if(want){
      dt.classList.remove('closing');dt.open=true;
      prep();
      const to=a.offsetHeight;
      an=a.animate([{height:from+'px'},{height:to+'px'}],{duration:580,easing:'cubic-bezier(.22,1,.36,1)'});
      if(from<2){let top=null,line=-1;ws.forEach(w=>{const t=w.offsetTop;if(top===null||Math.abs(t-top)>4){line++;top=t}w.animate([{opacity:0,transform:'translateY(.7em)'},{opacity:1,transform:'none'}],{duration:720,delay:70+line*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})});a.animate([{filter:'blur(5px)'},{filter:'blur(0px)'}],{duration:520+line*65,easing:'cubic-bezier(.22,1,.36,1)'})}
      an.onfinish=()=>{an=null;a.style.overflow=''};
    }else{
      dt.classList.add('closing');
      an=a.animate([{height:from+'px',opacity:1},{height:'0px',opacity:0}],{duration:420,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
      an.onfinish=()=>{const f=an;an=null;dt.open=false;dt.classList.remove('closing');a.style.overflow='';f.cancel()};
    }
  });
});

/* ---------- magnetic buttons ---------- */
if(!reduced&&mFine.matches){root.classList.add('magon');$$('.mag').forEach(b=>{
  const SLOW='transform .6s cubic-bezier(.22,1,.36,1),background-color .25s,box-shadow .4s',FAST='transform .12s cubic-bezier(.22,1,.36,1),background-color .25s,box-shadow .4s';
  let mx=0,my=0,down=false;const set=()=>{b.style.transform='translate('+mx.toFixed(1)+'px,'+my.toFixed(1)+'px)'+(down?' scale(.96)':'')};b.style.transition=SLOW;
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();mx=(e.clientX-r.left-r.width/2)/r.width*10;my=(e.clientY-r.top-r.height/2)/r.height*8;set()});
  b.addEventListener('pointerdown',()=>{down=true;b.style.transition=FAST;set()});
  b.addEventListener('pointerup',()=>{if(down){down=false;set()}});
  b.addEventListener('pointerleave',()=>{down=false;mx=my=0;b.style.transition=SLOW;b.style.transform=''});
})}

/* ---------- footer giant wordmark: fitted to the width, letters rise, then the objects drop on ---------- */
const giant=$('#giant'),gL=$$('.giant .gl');let gTop=0,gH=1,gLanded=false;
function fitGiant(){if(!giant)return;giant.style.fontSize='100px';const gw=Array.from(giant.children).reduce((a,c)=>a+c.offsetWidth,0),gp=parseFloat(getComputedStyle(giant).paddingLeft)||0;giant.style.fontSize=(100*(giant.clientWidth-2*gp)/gw*.99).toFixed(2)+'px';gTop=docTop(giant);gH=giant.offsetHeight}
function updGiant(){if(!giant||reduced)return;const q=clamp((H-(gTop-sy))/(gH+60),0,1);gL.forEach((el,i)=>{const e=eOut(clamp(q*1.55-i*.08,0,1));el.style.setProperty('--gy',((1-e)*100).toFixed(2)+'%')});const land=q>.97;if(land!==gLanded){gLanded=land;giant.classList.toggle('landed',land)}}

/* ---------- loop ---------- */
function measure(){W=innerWidth;H=innerHeight;maxYc=0;measureNav();fitGiant();dirty=true}
function frame(now){
  const dt=clamp((now-last)/1000,0,.05);last=now;let more=false;
  if(SS.active){SS.cur=lerp(SS.cur,SS.tgt,1-Math.exp(-6*dt));if(Math.abs(SS.tgt-SS.cur)<.4){SS.cur=SS.tgt;SS.active=false}else more=true;SS.set=SS.cur;scrollTo(0,SS.cur);dirty=true}
  if(dirty){dirty=false;sy=scrollY;navUpd();updGiant()}
  if(more)requestAnimationFrame(frame);else running=false;
}
addEventListener('scroll',()=>{if(SS.active&&Math.abs(scrollY-SS.set)>3)SS.active=false;if(!SS.active){SS.cur=SS.tgt=scrollY}dirty=true;inkReset();kick()},{passive:true});
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{measure();kick()},120)});
/* answers opening change the page's height: re-measure the headings and the footer */
if('ResizeObserver' in window){let mh=0,mt;const ro=new ResizeObserver(()=>{const h=mainEl.offsetHeight;if(Math.abs(h-mh)<2)return;mh=h;clearTimeout(mt);mt=setTimeout(()=>{measure();kick()},160)});ro.observe(mainEl);(window.__syllaboObservers=window.__syllaboObservers||[]).push(ro,rio)}
measure();kick();drawCirc();setTimeout(()=>navEl.classList.add('ready'),60);
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(()=>{measure();if(curA&&circ.style.opacity==='1')placeCirc(curA);kick()});
addEventListener('load',()=>{measure();kick();
  /* split the answers into words while idle, so the first click on one only animates */
  const idle=window.requestIdleCallback||(f=>setTimeout(f,200));faqPrep.forEach(f=>idle(f))});
})();
