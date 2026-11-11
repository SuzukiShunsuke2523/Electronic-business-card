(() => {
  "use strict";
  const doc=document.documentElement;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
  const $=(sel,root=document)=>root.querySelector(sel);
  const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
  const motion=()=>!reduce.matches;
  const deferFrame=(f)=>requestAnimationFrame(f);
  doc.classList.add("has-js");

  // Scroll progress, motion threshold and single-pass reveals.
  const progress=$("#progressLine");
  let scrollQueued=false;
  function onScroll(){
    if(scrollQueued)return;
    scrollQueued=true;
    deferFrame(()=>{
      const height=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      progress.style.width=Math.max(0,Math.min(100,100*scrollY/height))+"%";
      scrollQueued=false;
    });
  }
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll,{passive:true});onScroll();
  function revealEverything(){
    $$("[data-reveal]").forEach(el=>el.classList.add("revealed"));
  }
  if(motion()&&"IntersectionObserver" in window){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("revealed");revealObserver.unobserve(entry.target)}});
    },{threshold:.1,rootMargin:"0px 0px -30px 0px"});
    $$("[data-reveal]").forEach(el=>revealObserver.observe(el));
  }else{revealEverything();}
  reduce.addEventListener?.("change",()=>{if(reduce.matches)revealEverything()});

  // Subtle 3D depth on pointer-capable screens. Nothing moves under reduced motion.
  const cosmos=$("#cosmos");
  const heroArt=$(".hero-art");
  if(cosmos&&heroArt&&window.matchMedia("(pointer:fine)").matches){
    let tiltQueued=false,px=0,py=0;
    heroArt.addEventListener("pointermove",e=>{
      if(!motion())return;
      const b=heroArt.getBoundingClientRect();
      px=(e.clientX-b.left)/b.width-.5;py=(e.clientY-b.top)/b.height-.5;
      if(tiltQueued)return;tiltQueued=true;
      deferFrame(()=>{cosmos.style.setProperty("--rx",(-py*13).toFixed(2)+"deg");cosmos.style.setProperty("--ry",(px*13).toFixed(2)+"deg");tiltQueued=false});
    },{passive:true});
    heroArt.addEventListener("pointerleave",()=>{cosmos.style.setProperty("--rx","0deg");cosmos.style.setProperty("--ry","0deg")});
  }

  // Chapter changes replace the sticky visual without diverting attention from reading.
  const visual=$("#storyVisual"),index=$("#visualIndex"),label=$("#visualTitle"),obj=$("#visualObject");
  const chapterLabels=["PRIVATE","BEGINNER","YOUR PACE"];
  function activateChapter(i){
    if(!visual)return;
    visual.dataset.scene=String(i);
    index.textContent="0"+(i+1);
    label.textContent=chapterLabels[i];
    obj.style.setProperty("--story-rot",[0,95,-75][i]+"deg");
    $$("[data-chapter]").forEach(el=>el.classList.toggle("active",Number(el.dataset.chapter)===i));
  }
  if("IntersectionObserver" in window){
    const chapterObs=new IntersectionObserver(entries=>{
      const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(active)activateChapter(Number(active.target.dataset.chapter));
    },{rootMargin:"-29% 0px -29% 0px",threshold:[0,.12,.3,.5,.7]});
    $$("[data-chapter]").forEach(el=>chapterObs.observe(el));
  }

  // Interactive pricing: content updates immediately, animation remains presentational only.
  const plans={
    trial:{name:"体験レッスン",value:3000,desc:"姿勢やお悩みをうかがい、無理のない動きからスタート。"},
    single:{name:"パーソナルレッスン",value:7000,desc:"その日の状態・目標に合わせる1対1のレッスン。"},
    ticket:{name:"4回チケット",value:26000,desc:"50分×4回。続けたい方が自分のペースで選べるプランです。"}
  };
  const format=n=>Math.round(n).toLocaleString("ja-JP");
  let chosen="trial",animatedValue=3000,priceFrame=null;
  const numeric=$("#animatedPrice");
  function animateNumber(target){
    if(priceFrame!==null)cancelAnimationFrame(priceFrame);
    if(!motion()){numeric.textContent=format(target);animatedValue=target;return;}
    const from=animatedValue,start=performance.now(),dur=600;
    function frame(time){
      const t=Math.min(1,(time-start)/dur);
      const eased=1-Math.pow(1-t,3);
      const v=from+(target-from)*eased;
      numeric.textContent=format(v);
      if(t<1)priceFrame=requestAnimationFrame(frame);
      else{animatedValue=target;priceFrame=null;numeric.textContent=format(target);}
    }
    priceFrame=requestAnimationFrame(frame);
  }
  $$("[data-plan]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const name=btn.dataset.plan;
      if(!plans[name])return;
      chosen=name;
      $$("[data-plan]").forEach(b=>{const active=b===btn;b.classList.toggle("selected",active);b.setAttribute("aria-pressed",String(active))});
      $("#planName").textContent=plans[name].name;
      $("#planDescription").textContent=plans[name].desc;
      $("#accessiblePrice").textContent=plans[name].name+"："+format(plans[name].value)+"円";
      animateNumber(plans[name].value);
    });
  });

  // On pointer move, the pricing cards gain a gentle 3D tilt.
  if(window.matchMedia("(pointer:fine)").matches){
    $$("[data-plan]").forEach(card=>{
      card.addEventListener("pointermove",e=>{
        if(!motion())return;
        const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty("--tilt-x",(-y*7)+"deg");
        card.style.setProperty("--tilt-y",(x*8)+"deg");
      },{passive:true});
      card.addEventListener("pointerleave",()=>{card.style.setProperty("--tilt-x","0deg");card.style.setProperty("--tilt-y","0deg")});
    });
  }

  // Interactive text motion presets; replay is explicit, no timers or external libraries.
  const modeLabels={reveal:"REVEAL",type:"TYPING",gradient:"GRADIENT"};
  let selectedMode="reveal";
  const stage=$("#motionOutput");
  function playMode(mode){
    if(!modeLabels[mode])return;
    selectedMode=mode;
    $$("[data-mode]").forEach(btn=>{
      const selected=btn.dataset.mode===mode;
      btn.classList.toggle("active",selected);btn.setAttribute("aria-pressed",String(selected));
    });
    stage.classList.remove("mode-reveal","mode-type","mode-gradient");
    void stage.offsetWidth;
    stage.classList.add("mode-"+mode);
    stage.setAttribute("aria-label","BREATHE / "+modeLabels[mode]);
  }
  $$("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>playMode(btn.dataset.mode)));
  $("#replayMotion").addEventListener("click",()=>playMode(selectedMode));
  playMode("reveal");

  // The booking journey is a real stateful interaction, not a fake link.
  const steps=[
    ["メニューを確認","レッスンの内容・料金・FAQをこのページで確認します。"],
    ["希望日時を相談","実際の店舗なら公式LINE・予約ページから希望日時を相談します。"],
    ["レッスンへ","動きやすい服装で参加し、自分のペースで始めます。"]
  ];
  $$("[data-step]").forEach(btn=>btn.addEventListener("click",()=>{
    const i=Number(btn.dataset.step);
    $$("[data-step]").forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
    $("#stepBig").textContent=String(i+1).padStart(2,"0");
    $("#stepCounter").textContent="STEP "+String(i+1).padStart(2,"0")+" / 03";
    $("#stepTitle").textContent=steps[i][0];
    $("#stepText").textContent=steps[i][1];
    $("#stepTrack").style.width=((i+1)/3*100)+"%";
    const panel=$(".step-preview");
    panel.classList.remove("changed");
    if(motion()){void panel.offsetWidth;panel.classList.add("changed");}
  }));

  // Accessible native dialog: focus management and Escape via browser.
  const dialog=$("#guideDialog");
  let returnFocus=null;
  $("#openGuide").addEventListener("click",()=>{
    returnFocus=document.activeElement;
    $("#dialogPlan").textContent=plans[chosen].name+" / ¥"+format(plans[chosen].value);
    dialog.showModal();
  });
  $$("[data-close]",dialog).forEach(btn=>btn.addEventListener("click",()=>dialog.close()));
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener("close",()=>returnFocus?.focus?.());

  // Native FAQ disclosure remains operable with keyboard and without JavaScript.
  doc.dataset.ready="true";
})();
