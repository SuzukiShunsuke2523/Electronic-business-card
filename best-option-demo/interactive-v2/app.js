
(()=>{"use strict";
const plans={trial:{name:"体験レッスン",price:"¥3,000",unit:"50分 / 1回",description:"姿勢やお悩みを伺いながら、無理なく始める体験コースです。",next:"メニューを確認 → 希望日時を相談"},single:{name:"パーソナルレッスン",price:"¥7,000",unit:"50分 / 1回",description:"その日の体調や目標に合わせた1対1のレッスンです。",next:"内容を確認 → 希望日時を相談"},ticket:{name:"4回チケット",price:"¥26,000",unit:"50分 × 4回",description:"継続したい方の4回分のチケット。1回あたり¥6,500です。",next:"回数と条件を確認 → 希望日時を相談"}};
let current="trial";const $=id=>document.getElementById(id);
const replay=(id)=>{const e=$(id);e?.classList.remove("refresh");if(e){void e.offsetWidth;e.classList.add("refresh")}};
document.querySelectorAll("[data-plan]").forEach(button=>button.addEventListener("click",()=>{current=button.dataset.plan;const p=plans[current];document.querySelectorAll("[data-plan]").forEach(b=>{b.setAttribute("aria-pressed",String(b===button));b.querySelector(".choice-note").textContent=b===button?"● 選択中":"○ 選択する"});$("chosenName").textContent=p.name;$("chosenPrice").textContent=p.price;$("chosenUnit").textContent=p.unit;$("chosenText").textContent=p.description;$("chosenNext").textContent=p.next;replay("liveTotal")}));
const steps=[["メニューを確認","このページでレッスン内容や料金、FAQを確認します。"],["希望日時を相談","実際のサイトでは、公式LINEや予約ページで希望日時を相談します。"],["体験レッスンへ","動きやすい服装で参加し、無理なく始めます。"]];
document.querySelectorAll("[data-step]").forEach(button=>button.addEventListener("click",()=>{const i=Number(button.dataset.step);document.querySelectorAll("[data-step]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));$("stepArt").textContent="0"+(i+1);$("stepKicker").textContent="STEP 0"+(i+1)+" / 03";$("stepName").textContent=steps[i][0];$("stepDetail").textContent=steps[i][1];$("stepMark").textContent="0"+(i+1)+" — 03";replay("stepLive");replay("stepArt")}));
const modal=$("reservationModal");let oldFocus;
const open=()=>{oldFocus=document.activeElement;$("modalPlan").textContent=plans[current].name+"（"+plans[current].price+"）";if(typeof modal.showModal==="function")modal.showModal()};
const close=()=>{if(modal.open){modal.close();oldFocus?.focus?.()}};
document.querySelectorAll("[data-open-guide],#showGuide").forEach(b=>b.addEventListener("click",open));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",close));
modal?.addEventListener("click",event=>{if(event.target===modal)close()});
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){const nodes=[...document.querySelectorAll(".motion")];document.documentElement.classList.add("js-motion");const obs=new IntersectionObserver(items=>items.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");obs.unobserve(entry.target)}}),{threshold:0.08,rootMargin:"0px 0px -24px 0px"});nodes.forEach(el=>obs.observe(el))}
})();
