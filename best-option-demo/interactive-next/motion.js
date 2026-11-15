(() => {
  "use strict";
  const root=document.documentElement;
  const stage=document.getElementById("stage");
  const journey=document.getElementById("top");
  const flower=document.getElementById("flowerSystem");
  const arrival=document.getElementById("arrivalCopy");
  const label=document.getElementById("stageLabel");
  const announcement=document.getElementById("phaseAnnouncement");
  const progress=document.getElementById("journeyProgress");
  const seekButtons=[...document.querySelectorAll("[data-seek]")];
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentScene=-1;
  let pending=false;
  let latestProgress=0;
  let pointerX=0,pointerY=0;
  let viewportWidth=window.innerWidth;
  let viewportHeight=window.innerHeight;
  const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=(start,end,value)=>{
    const t=clamp((value-start)/(end-start));
    return t*t*(3-2*t);
  };

  function scrollProgress(){
    const bounds=journey.getBoundingClientRect();
    const scrollRange=Math.max(1,journey.offsetHeight-viewportHeight);
    return clamp(-bounds.top/scrollRange);
  }
  function setScene(scene){
    if(scene===currentScene)return;
    currentScene=scene;
    const names=["01 — BREATHE","02 — BLOOM","03 — BEYOND"];
    const liveNames=["シーン1 呼吸","シーン2 花が広がる","シーン3 新しい世界"];
    label.textContent=names[scene];
    announcement.textContent=liveNames[scene];
    seekButtons.forEach((button,i)=>{
      const active=i===scene;
      button.classList.toggle("is-current",active);
      if(active)button.setAttribute("aria-current","step");
      else button.removeAttribute("aria-current");
    });
  }
  function setProgress(p){
    latestProgress=p;
    const enter=smooth(.08,.41,p);
    const expand=smooth(.39,.76,p);
    const arrive=smooth(.69,.92,p);
    const xMove=smooth(.06,.58,p);
    const scale=1+mix(0,1.5,enter)+mix(0,3.2,expand);
    const shiftX=(viewportWidth<=760?0:-(viewportWidth*(viewportWidth<=1100?.23:.19)))*xMove;
    const shiftY=(viewportWidth<=760?-(viewportHeight*.215)*xMove:-(viewportHeight*.01)*xMove);
    const flowerOpacity=1-.94*smooth(.70,.89,p);
    const heroOpacity=1-smooth(.10,.30,p);
    const portalOpacity=smooth(.24,.40,p)*(1-smooth(.55,.70,p));
    const arrivalOpacity=smooth(.71,.89,p);
    const lightOpacity=smooth(.39,.79,p);
    const bloomRotation=-8+(198*p);
    const pointerScale=(1-smooth(.1,.47,p))*(reduced.matches?0:1);
    stage.style.setProperty("--bloom-scale",scale.toFixed(3));
    stage.style.setProperty("--bloom-rotation",bloomRotation.toFixed(2)+"deg");
    stage.style.setProperty("--shift-x",(shiftX+pointerX*16*pointerScale).toFixed(2)+"px");
    stage.style.setProperty("--shift-y",(shiftY+pointerY*13*pointerScale).toFixed(2)+"px");
    stage.style.setProperty("--flower-opacity",flowerOpacity.toFixed(3));
    stage.style.setProperty("--hero-opacity",heroOpacity.toFixed(3));
    stage.style.setProperty("--hero-y",(-25*smooth(.11,.30,p)).toFixed(1)+"px");
    stage.style.setProperty("--portal-opacity",portalOpacity.toFixed(3));
    stage.style.setProperty("--arrival-opacity",arrivalOpacity.toFixed(3));
    stage.style.setProperty("--light-opacity",lightOpacity.toFixed(3));
    stage.classList.toggle("is-light",p>.72);
    const arrivalActive=p>.80;
    arrival.classList.toggle("is-active",arrivalActive);
    arrival.inert=!arrivalActive;
    arrival.setAttribute("aria-hidden",String(!arrivalActive));
    document.getElementById("portalCopy").setAttribute("aria-hidden",String(portalOpacity<.6));
    const heroActive=heroOpacity>.3;
    document.getElementById("heroCopy").setAttribute("aria-hidden",String(!heroActive));
    progress.style.width=(p*100).toFixed(2)+"%";
    const scene=p<.32?0:p<.70?1:2;
    setScene(scene);
    root.dataset.motionScene=String(scene+1);
    root.dataset.motionProgress=p.toFixed(3);
  }

  function update(){
    pending=false;
    if(reduced.matches){
      stage.classList.remove("is-light");
      root.dataset.motionScene="1";
      root.dataset.motionProgress="0.000";
      arrival.inert=true;
      arrival.setAttribute("aria-hidden","true");
      setScene(0);
      return;
    }
    setProgress(scrollProgress());
  }
  function scheduleUpdate(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(update);
  }
  function resize(){
    viewportWidth=window.innerWidth;
    viewportHeight=window.innerHeight;
    scheduleUpdate();
  }
  addEventListener("scroll",scheduleUpdate,{passive:true});
  addEventListener("resize",resize,{passive:true});
  reduced.addEventListener?.("change",resize);
  if(window.matchMedia("(pointer:fine)").matches){
    stage.addEventListener("pointermove",event=>{
      if(reduced.matches||latestProgress>.42)return;
      const bounds=stage.getBoundingClientRect();
      pointerX=clamp(2*(event.clientX-bounds.left)/bounds.width-1,-1,1);
      pointerY=clamp(2*(event.clientY-bounds.top)/bounds.height-1,-1,1);
      scheduleUpdate();
    },{passive:true});
    stage.addEventListener("pointerleave",()=>{
      pointerX=0;pointerY=0;scheduleUpdate();
    });
  }
  seekButtons.forEach(button=>{
    button.addEventListener("click",()=>{
      const target=clamp(Number(button.dataset.seek)||0);
      if(reduced.matches){
        document.getElementById("review").scrollIntoView({behavior:"auto",block:"start"});
        return;
      }
      const rect=journey.getBoundingClientRect();
      const top=window.scrollY+rect.top+target*Math.max(1,journey.offsetHeight-window.innerHeight);
      window.scrollTo({top,behavior:"smooth"});
    });
  });
  const arrivalLink=arrival.querySelector("a");
  if(arrivalLink){
    arrivalLink.addEventListener("focus",()=>{if(latestProgress<.8&& !reduced.matches)arrivalLink.blur()});
  }
  // Test hooks are read-only and support live QA of screen states without altering UX.
  root.dataset.motionReady="true";
  update();
})();