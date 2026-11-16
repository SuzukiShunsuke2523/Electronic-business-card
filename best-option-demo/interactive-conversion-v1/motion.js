(() => {
  "use strict";
  const root=document.documentElement;
  const body=document.body;
  const story=document.getElementById("motion-story");
  const stage=document.getElementById("morph-sticky");
  const pricing=document.querySelector(".pricing-section");
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
  let scrollQueued=false,lastPhase=-1,p=0,playing=false,playFrame=null;
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
  // Original conversion-v1/app.js updates the selected plan and its exact
  // price immediately. No number interpolation, typewriter or count-up.
  // This layer changes only the decorative background at a measured pace.
  // The base conversion-v1/app.js is responsible for immediate, accessible
  // state and exact (non-animated) yen amounts. This layer only visualizes
  // selection with a slow rising bloom. FAQ animation below is unchanged.
  const choices=new Set(["trial","single","ticket"]);
  const selectionGrid=document.querySelector(".plan-grid");
  const summaryTitle=document.getElementById("selected-title");
  const summaryDescription=document.getElementById("selected-description");
  const summaryContainer=document.querySelector(".selected-summary");
  const softEase="cubic-bezier(.18,.75,.2,1)";
  let previousCopy=null;
  let selectedAnimations=[];

  // Capture the outgoing description before conversion-v1/app.js replaces it.
  selectionGrid?.addEventListener("click",event=>{
    const button=event.target.closest("[data-plan]");
    if(!button||!selectionGrid.contains(button))return;
    previousCopy={
      title:summaryTitle?.textContent||"",
      description:summaryDescription?.textContent||""
    };
  },true);

  function cancelSelectionMotion(){
    for(const animation of selectedAnimations){
      try{animation.cancel()}catch(_){}
    }
    selectedAnimations=[];
    summaryContainer?.querySelectorAll(".selection-copy-ghost").forEach(el=>el.remove());
  }
  function floatIn(element,delay){
    if(!element||typeof element.animate!=="function")return;
    const animation=element.animate([
      {opacity:0,transform:"translateY(18px)",filter:"blur(6px)"},
      {offset:.5,opacity:.57,transform:"translateY(7px)",filter:"blur(2px)"},
      {opacity:1,transform:"translateY(0px)",filter:"blur(0px)"}
    ],{duration:1160,delay,easing:softEase,fill:"both"});
    selectedAnimations.push(animation);
    animation.onfinish=()=>{animation.cancel();};
  }
  function fadeOutgoing(element,oldText){
    if(!element||!oldText||typeof element.animate!=="function"||!summaryContainer)return;
    const ghost=element.cloneNode(false);
    ghost.removeAttribute("id");
    ghost.textContent=oldText;
    ghost.className="selection-copy-ghost";
    ghost.setAttribute("aria-hidden","true");
    ghost.style.position="absolute";
    ghost.style.pointerEvents="none";
    ghost.style.left=element.offsetLeft+"px";
    ghost.style.top=element.offsetTop+"px";
    ghost.style.width=element.offsetWidth+"px";
    ghost.style.margin="0";
    summaryContainer.appendChild(ghost);
    const animation=ghost.animate([
      {opacity:.95,transform:"translateY(0px)",filter:"blur(0px)"},
      {opacity:0,transform:"translateY(-7px)",filter:"blur(4px)"}
    ],{duration:540,easing:softEase,fill:"forwards"});
    selectedAnimations.push(animation);
    animation.onfinish=()=>ghost.remove();
  }

  document.querySelectorAll("[data-plan]").forEach(button=>{
    button.addEventListener("click",()=>{
      const key=button.dataset.plan;
      if(!choices.has(key)||!pricing)return;
      pricing.dataset.activePlan=key;
      root.dataset.selectedPlan=key;
      cancelSelectionMotion();

      // Choice text was removed from the cards. The check circle and
      // softly rising 3D card convey the selected state, while aria-pressed
      // and exact yen values remain managed by conversion-v1/app.js.
      // Keep the previous copy briefly visible while the new words float up.
      // Skip ghosts for a second click on the same plan.
      if(previousCopy&&previousCopy.title!==summaryTitle?.textContent){
        fadeOutgoing(summaryTitle,previousCopy.title);
        fadeOutgoing(summaryDescription,previousCopy.description);
      }
      floatIn(summaryTitle,160);
      floatIn(summaryDescription,270);
      previousCopy=null;
    });
  });
  if(pricing)pricing.dataset.activePlan="trial";

  // Native details/summary retain their keyboard semantics. Animate the
  // container's actual height instead of showing the answer instantly.
  // While closing, keep details open until the collapse finishes.
  const faqAnimations=new WeakMap();
  document.querySelectorAll(".faq-list details").forEach(details=>{
    const summary=details.querySelector("summary");
    if(!summary)return;
    summary.addEventListener("click",event=>{
      if(typeof details.animate!=="function")return; // Native fallback
      event.preventDefault();
      const previousTarget=details.dataset.faqTarget;
      const isCurrentlyTargetOpen=previousTarget===undefined?details.open:previousTarget==="true";
      const shouldOpen=!isCurrentlyTargetOpen;
      const fromHeight=details.getBoundingClientRect().height;
      const existing=faqAnimations.get(details);
      if(existing){existing.cancel();faqAnimations.delete(details);}
      details.style.height=fromHeight+"px";
      details.classList.add("faq-expanding");
      if(shouldOpen)details.open=true;
      const css=getComputedStyle(details);
      const border=(parseFloat(css.borderTopWidth)||0)+(parseFloat(css.borderBottomWidth)||0);
      const targetHeight=shouldOpen
        ? Math.max(details.scrollHeight+border,summary.offsetHeight+border)
        : summary.offsetHeight+border;
      details.dataset.faqTarget=String(shouldOpen);
      const animation=details.animate(
        [{height:fromHeight+"px"},{height:targetHeight+"px"}],
        {duration:wantsReduced()?480:920,easing:calmEase}
      );
      faqAnimations.set(details,animation);
      animation.onfinish=()=>{
        if(faqAnimations.get(details)!==animation)return;
        if(!shouldOpen)details.open=false;
        details.style.removeProperty("height");
        details.classList.remove("faq-expanding");
        faqAnimations.delete(details);
      };
    });
  });
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