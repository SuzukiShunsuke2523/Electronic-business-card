(() => {
  "use strict";
  const plans={
    trial:{name:"体験レッスン",price:"¥3,000",duration:"50分",description:"初めての方に。レッスンの内容を知るための50分です。"},
    single:{name:"パーソナルレッスン",price:"¥7,000",duration:"50分",description:"その日のコンディションや目標に合わせて取り組む1回です。"},
    ticket:{name:"4回チケット",price:"¥26,000",duration:"50分 × 4回",description:"自分のペースで続けたい方に向けた、4回分のチケットです。"}
  };
  const $=id=>document.getElementById(id);
  let selected="trial";
  const dialog=$("booking-dialog");
  let previousFocus=null;
  function animateSummary(){
    const summary=document.querySelector(".selected-summary");
    if(!summary||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    summary.classList.remove("changed");
    void summary.offsetWidth;
    summary.classList.add("changed");
  }
  document.querySelectorAll("[data-plan]").forEach(button=>{
    button.addEventListener("click",()=>{
      const id=button.dataset.plan;
      if(!plans[id])return;
      selected=id;
      for(const b of document.querySelectorAll("[data-plan]")){
        const active=b===button;
        b.classList.toggle("is-selected",active);
        b.setAttribute("aria-pressed",String(active));
        const label=b.querySelector("[data-choice-label]");
        if(label)label.textContent=active?"選択中":"選択する";
      }
      $("selected-title").textContent=plans[id].name;
      $("selected-description").textContent=plans[id].description;
      $("selected-price").replaceChildren(document.createTextNode(plans[id].price+" "),(()=>{
        const s=document.createElement("small");s.textContent="/ "+plans[id].duration;return s;
      })());
      animateSummary();
    });
  });
  function closeGuide(){if(dialog?.open)dialog.close();}
  document.querySelectorAll("[data-open-guide]").forEach(button=>button.addEventListener("click",()=>{
    if(!dialog)return;
    previousFocus=document.activeElement;
    $("guide-plan").textContent=plans[selected].name+"（"+plans[selected].price+"）";
    dialog.showModal();
  }));
  document.querySelectorAll("[data-close-guide]").forEach(button=>button.addEventListener("click",closeGuide));
  dialog?.addEventListener("click",event=>{if(event.target===dialog)closeGuide();});
  dialog?.addEventListener("close",()=>previousFocus?.focus?.());
  const motionReduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  if(!motionReduced.matches&&"IntersectionObserver" in window){
    const all=[...document.querySelectorAll(".reveal")];
    document.documentElement.classList.add("js-motion");
    const observer=new IntersectionObserver(items=>{
      for(const item of items){
        if(item.isIntersecting){
          item.target.classList.add("is-visible");
          observer.unobserve(item.target);
        }
      }
    },{threshold:.08,rootMargin:"0px 0px -25px 0px"});
    for(const item of all)observer.observe(item);
    motionReduced.addEventListener?.("change",()=>{
      if(motionReduced.matches){
        for(const item of all)item.classList.add("is-visible");
      }
    });
  }
  document.documentElement.dataset.ready="true";
})();