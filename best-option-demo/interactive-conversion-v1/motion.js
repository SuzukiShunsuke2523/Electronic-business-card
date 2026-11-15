(() => {
  "use strict";
  const root=document.documentElement;
  const body=document.body;
  const story=document.getElementById("motion-story");
  const stage=document.getElementById("morph-sticky");
  const pricing=document.querySelector(".pricing-section");
  const price=document.getElementById("selected-price");
  const photo=document.querySelector(".motion-hero-photo");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  // Test override lets us verify the iPhone accessibility case in a normal browser.
  const forcedReduced=new URLSearchParams(window.location.search).get("qa-reduced")==="1";
  let optIn=false;
  const wantsReduced=()=>reduced.matches||forcedReduced;
  const motionEnabled=()=>!wantsReduced()||optIn;
  const playbackButton=document.getElementById("morph-play");
  const imageFrame=document.getElementById("morph-image-frame");
  const motionVars=["--morph-frame-dark","--morph-img-scale","--morph-photo-b-opacity","--morph-intro-opacity","--morph-wide-opacity","--morph-finale-opacity","--morph-light-opacity"];
  function resetStaticScene(){
    if(!imageFrame||!stage)return;
    for(const prop of ["width","height","left","top","borderRadius"])imageFrame.style[prop]="";
    for(const prop of motionVars)stage.style.removeProperty(prop);
    stage.classList.remove("is-full");
    document.getElementById("morph-intro-copy").setAttribute("aria-hidden","false");
    document.getElementById("morph-wide-copy").setAttribute("aria-hidden","true");
    document.getElementById("morph-finale-copy").setAttribute("aria-hidden","true");
    root.dataset.morphProgress="0.000";
    root.dataset.morphPhase="1";
    root.dataset.morphPhotoB="0.000";
  }
  function syncReducedState(){
    const isReduced=wantsReduced();
    body.dataset.motionReduced=String(isReduced);
    body.dataset.motionOptin=String(optIn);
    body.classList.toggle("js-motion",motionEnabled());
    if(!motionEnabled())resetStaticScene();
    root.dataset.motionPreference=isReduced?(optIn?"manual-opt-in":"reduced-static"):"normal";
    if(playbackButton)playbackButton.textContent=isReduced&&!optIn?"▶ 動きを再生する":"▶ 自動で変化を見る";
  }
  function enableOnRequest(){
    if(!wantsReduced()||optIn)return false;
    optIn=true;
    syncReducedState();
    return true;
  }
  const phaseButtons=[...document.querySelectorAll("[data-morph-seek]")];
  const intro=document.getElementById("morph-intro-copy");
  const wide=document.getElementById("morph-wide-copy");
  const finale=document.getElementById("morph-finale-copy");
  const progressBar=document.getElementById("morph-progress-bar");
  const counter=document.getElementById("morph-counter");
  const live=document.getElementById("morph-live");
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const ease=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
  const lerp=(a,b,t)=>a+(b-a)*t;
  let scrollQueued=false,lastPhase=-1,p=0,playing=false,playFrame=null,numberFrame=null,numberValue=3000;
  let lastWidth=window.innerWidth,lastHeight=window.innerHeight;
  const set=(key,value)=>stage.style.setProperty(key,value);
  function getProgress(){
    if(!story||!stage)return 0;
    const h=document.querySelector(".site-header").offsetHeight||80;
    const range=Math.max(1,story.offsetHeight-stage.offsetHeight);
    return clamp((h-story.getBoundingClientRect().top)/range);
  }
  function phaseFor(v){return v<.36?0:v<.75?1:2;}
  function updateScene(v){
    if(!motionEnabled())return;
    p=v;
    const open=ease(.08,.66,v);
    const second=ease(.72,.9,v);
    const introOpacity=1-ease(.09,.31,v);
    const wideOpacity=ease(.37,.52,v)*(1-ease(.7,.81,v));
    const finaleOpacity=ease(.77,.90,v);
    const w=lastWidth,h=Math.max(460,stage.getBoundingClientRect().height);
    const mobile=w<=610,tablet=w<=860;
    const startW=mobile?Math.min(w*.68,310):tablet?Math.min(w*.42,430):Math.min(w*.36,540);
    const startH=mobile?h*.52:h*.73;
    const startX=mobile?w*.5:tablet?w*.73:w*.73;
    const startY=mobile?h*.7:h*.5;
    const width=lerp(startW,w+4,open);
    const height=lerp(startH,h+4,open);
    const x=lerp(startX,w*.5,open);
    const y=lerp(startY,h*.5,open);
    const radius=Math.max(0,lerp(Math.min(startW*.51,215),0,open));
    const radTail=Math.max(0,lerp(10,0,open));
    const frame=document.getElementById("morph-image-frame");
    frame.style.width=width.toFixed(1)+"px";
    frame.style.height=height.toFixed(1)+"px";
    frame.style.left=x.toFixed(1)+"px";
    frame.style.top=y.toFixed(1)+"px";
    frame.style.borderRadius=radius.toFixed(1)+"px "+radius.toFixed(1)+"px "+radTail.toFixed(1)+"px "+radTail.toFixed(1)+"px";
    set("--morph-frame-dark",String(lerp(.13,.74,ease(.32,.75,v)).toFixed(3)));
    set("--morph-img-scale",String(lerp(1.06,1.0,open).toFixed(3)));
    set("--morph-photo-b-opacity",String(second.toFixed(3)));
    set("--morph-intro-opacity",String(introOpacity.toFixed(3)));
    set("--morph-wide-opacity",String(wideOpacity.toFixed(3)));
    set("--morph-finale-opacity",String(finaleOpacity.toFixed(3)));
    set("--morph-light-opacity",String(ease(.26,.58,v).toFixed(3)));
    stage.classList.toggle("is-full",open>.7);
    intro.setAttribute("aria-hidden",String(introOpacity<.15));
    wide.setAttribute("aria-hidden",String(wideOpacity<.35));
    finale.setAttribute("aria-hidden",String(finaleOpacity<.35));
    const phase=phaseFor(v);
    if(phase!==lastPhase){
      lastPhase=phase;
      const names=["シーン1 縦長の写真","シーン2 写真が画面全体へ広がる","シーン3 別の写真へ切り替わる"];
      live.textContent=names[phase];
      counter.textContent=String(phase+1).padStart(2,"0")+" / 03";
      for(let i=0;i<phaseButtons.length;i++){
        const selected=i===phase;
        phaseButtons[i].classList.toggle("is-active",selected);
        phaseButtons[i].setAttribute("aria-pressed",String(selected));
      }
    }
    progressBar.style.width=(v*100).toFixed(2)+"%";
    root.dataset.morphPhase=String(phase+1);
    root.dataset.morphOpen=open.toFixed(3);
    root.dataset.morphPhotoB=second.toFixed(3);
    root.dataset.morphProgress=v.toFixed(3);
  }
  function onScroll(){
    scrollQueued=false;
    if(motionEnabled())updateScene(getProgress());
    if(photo&&motionEnabled()){
      const rect=photo.getBoundingClientRect();
      if(rect.top<lastHeight&&rect.bottom>0){
        const shift=clamp((rect.top-lastHeight*.24)/lastHeight,-1,1);
        photo.style.setProperty("--hero-parallax",(shift*-16).toFixed(1)+"px");
      }
    }
  }
  function queueScroll(){
    if(scrollQueued)return;
    scrollQueued=true;
    requestAnimationFrame(onScroll);
  }
  function targetY(progress){
    const header=document.querySelector(".site-header").offsetHeight||80;
    const position=story.getBoundingClientRect().top+window.scrollY-header;
    return position+Math.max(0,story.offsetHeight-stage.offsetHeight)*clamp(progress);
  }
  function stopPlayback(){
    if(playFrame!==null)cancelAnimationFrame(playFrame);
    playFrame=null;playing=false;
  }
  function playTransition(){
    if(!motionEnabled())return;
    stopPlayback();
    const from=getProgress(),to=from>.8?0:.96;
    const initial=window.scrollY,final=targetY(to),duration=1650;
    playing=true;
    let begin=null;
    function frame(time){
      if(!playing)return;
      if(begin===null)begin=time;
      const t=clamp((time-begin)/duration);
      window.scrollTo(0,lerp(initial,final,t*t*(3-2*t)));
      if(t<1){playFrame=requestAnimationFrame(frame);}else{window.scrollTo(0,final);stopPlayback();root.dataset.morphPlayFinished="true";}
    }
    playFrame=requestAnimationFrame(frame);
  }
  phaseButtons.forEach(button=>button.addEventListener("click",()=>{
    stopPlayback();
    const target=Number(button.dataset.morphSeek);
    if(enableOnRequest()){
      // Wait for the compact accessible fallback to expand into the scroll stage.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        lastWidth=innerWidth;lastHeight=innerHeight;
        window.scrollTo(0,targetY(target));queueScroll();
      }));
      return;
    }
    if(!motionEnabled())return;
    const scrollTarget=targetY(target);
    // An explicit scene choice is allowed even with an OS preference to reduce motion.
    window.scrollTo({top:scrollTarget,behavior:wantsReduced()?"instant":"smooth"});
    queueScroll();
  }));
  if(playbackButton)playbackButton.addEventListener("click",()=>{
    if(enableOnRequest()){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        lastWidth=innerWidth;lastHeight=innerHeight;
        window.scrollTo(0,targetY(0));queueScroll();
        requestAnimationFrame(playTransition);
      }));
    }else playTransition();
  });
  window.addEventListener("wheel",()=>{if(playing)stopPlayback()},{passive:true});
  window.addEventListener("touchstart",()=>{if(playing)stopPlayback()},{passive:true});
  window.addEventListener("scroll",queueScroll,{passive:true});
  window.addEventListener("resize",()=>{lastWidth=window.innerWidth;lastHeight=window.innerHeight;queueScroll()},{passive:true});
  reduced.addEventListener?.("change",()=>{
    stopPlayback();
    // A new OS preference must never auto-start motion.
    optIn=false;
    syncReducedState();
    queueScroll();
  });
  // Price selection remains the original functional pricing logic from conversion-v1.
  // These additions are purely presentational and never submit a booking.
  const amounts={trial:3000,single:7000,ticket:26000};
  function format(n){return Math.round(n).toLocaleString("ja-JP");}
  function animateNumber(target){
    if(numberFrame!==null)cancelAnimationFrame(numberFrame);
    if(!motionEnabled()||!price){numberValue=target;return;}
    const startValue=numberValue,start=performance.now(),duration=520;
    let text=price.firstChild;
    if(!text||text.nodeType!==3){price.insertBefore(document.createTextNode(""),price.firstChild);text=price.firstChild;}
    const render=(v)=>{text.textContent="¥"+format(v)+" ";};
    function frame(now){
      const t=clamp((now-start)/duration);
      const value=lerp(startValue,target,1-Math.pow(1-t,4));
      render(value);
      numberValue=value;
      if(t<1)numberFrame=requestAnimationFrame(frame);
      else{numberFrame=null;numberValue=target;render(target);}
    }
    numberFrame=requestAnimationFrame(frame);
  }
  document.querySelectorAll("[data-plan]").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.plan;
    if(!Object.hasOwn(amounts,key))return;
    pricing.dataset.activePlan=key;
    const summary=document.querySelector(".selected-summary");
    const selectedPrice=document.getElementById("selected-price");
    for(const el of [summary,selectedPrice]){
      if(!el)continue;
      el.classList.remove("changed");void el.offsetWidth;el.classList.add("changed");
    }
    animateNumber(amounts[key]);
  }));
  if(pricing)pricing.dataset.activePlan="trial";
  const obs=("IntersectionObserver" in window&&!wantsReduced())?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    }
  },{threshold:.12}):null;
  for(const element of document.querySelectorAll(".promise-card,.experience-pictures")){
    if(obs)obs.observe(element);else element.classList.add("is-visible");
  }
  root.classList.add("motion-live");
  syncReducedState();
  root.dataset.motionRebuildReady="true";
  queueScroll();
})();