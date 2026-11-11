(() => {
"use strict";
const video=document.getElementById("heroVideo");
const wrap=document.getElementById("mediaHero");
const toggle=document.getElementById("videoToggle");
const label=document.getElementById("videoToggleText");
const glyph=document.getElementById("videoToggleIcon");
const reduce=matchMedia("(prefers-reduced-motion: reduce)");
let userPaused=false;
function setStatus(paused){
 if(!toggle)return;
 label.textContent=paused?"PLAY VIDEO":"PAUSE VIDEO";
 glyph.textContent=paused?"▶":"Ⅱ";
 toggle.setAttribute("aria-pressed",String(paused));
 toggle.setAttribute("aria-label",paused?"背景動画を再生する":"背景動画を一時停止する");
}
async function start(){
 if(!video||reduce.matches||userPaused)return;
 try{await video.play();wrap.classList.add("video-ready");setStatus(false);}
 catch(e){setStatus(true);}
}
function stop(){if(!video)return;video.pause();setStatus(true)}
if(video){
 video.addEventListener("loadeddata",()=>wrap.classList.add("video-ready"),{once:true});
 video.addEventListener("playing",()=>{wrap.classList.add("video-ready");setStatus(false)});
 video.addEventListener("error",()=>{wrap.classList.remove("video-ready");setStatus(true);toggle.title="現在、動画を読み込めません。背景写真をご覧ください。"});
 toggle.addEventListener("click",()=>{
    if(video.paused){userPaused=false;start()}
    else {userPaused=true;stop()}
 });
 if(reduce.matches){stop();}
 else{start();}
 if("IntersectionObserver" in window){
   const obs=new IntersectionObserver(entries=>{
     const visible=entries[0]?.isIntersecting;
     if(!visible){video.pause()}
     else if(!userPaused&&!reduce.matches)start();
   },{threshold:.08});
   obs.observe(wrap);
 }
 reduce.addEventListener?.("change",()=>{if(reduce.matches)stop();else if(!userPaused)start()});
}
// Change actual photos along with the 3 scroll chapters driven by v3.js.
const story=document.getElementById("storyVisual");
const storyPhoto=document.getElementById("storyPhoto");
if(story&&storyPhoto){
 const images=[
 "https://images.pexels.com/photos/25596679/pexels-photo-25596679/free-photo-of-fit-woman-exercising-on-pilates-reformer.jpeg?auto=compress&dpr=1&h=750&w=1260",
 "https://images.pexels.com/photos/25599837/pexels-photo-25599837.jpeg?cs=srgb&dl=pexels-ahmetkurt-25599837.jpg&fm=jpg",
 "https://images.pexels.com/photos/33360051/pexels-photo-33360051.jpeg?cs=srgb&dl=pexels-ahmetkurt-33360051.jpg&fm=jpg"
 ];
 const srcCache=new Set();
 images.forEach(src=>{const img=new Image();img.decoding="async";img.src=src;});
 let scene="0",seq=0;
 const swap=()=>{
   const next=story.dataset.scene||"0";
   if(next===scene)return;
   scene=next;
   const n=Number(scene);if(!Number.isInteger(n)||n<0||n>=images.length)return;
   const target=images[n];
   const current=++seq;
   storyPhoto.classList.add("swap");
   const img=new Image();
   img.onload=()=>{
      if(current!==seq)return;
      storyPhoto.src=target;
      requestAnimationFrame(()=>storyPhoto.classList.remove("swap"));
   };
   img.onerror=()=>{if(current===seq)storyPhoto.classList.remove("swap")};
   img.src=target;
 };
 new MutationObserver(swap).observe(story,{attributes:true,attributeFilter:["data-scene"]});
}
// Photos and footage are Pexels stock, and do not depict the fictional LUNOA business.
document.documentElement.dataset.mediaReady="true";
})();