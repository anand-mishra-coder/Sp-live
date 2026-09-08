import { Auth } from "./auth.js";
import { auth, db, collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp } from "./firebase.js";

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

export function toast(message,type="info"){
  let box=$("#toast");
  if(!box){box=document.createElement("div");box.id="toast";box.className="toast-stack";document.body.append(box);}
  const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=message; box.append(el);
  setTimeout(()=>el.remove(),3500);
}
export function fmtTime(v){
  const d=v?.toDate?v.toDate():(v?new Date(v):new Date());
  return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}
export function fmtDate(v){
  const d=v?.toDate?v.toDate():(v?new Date(v):new Date());
  return d.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"});
}
export function showLoading(on=true){
  document.body.classList.toggle("loading",on);
}

function wireNav(profile){
  $$(".nav-link").forEach(a=>a.classList.toggle("active",a.pathname.split("/").pop()===location.pathname.split("/").pop()));
  const name=profile?.name || auth.currentUser?.displayName || "Student";
  $$(".user-name").forEach(x=>x.textContent=name);
  $$(".user-role").forEach(x=>x.textContent=profile?.role||"student");
  $$(".avatar").forEach(x=>x.textContent=name.slice(0,1).toUpperCase());
  const staff=["admin.html","admin-live.html","teacher.html"];
  $$(".staff-only").forEach(x=>x.style.display=profile&&["admin","teacher"].includes(profile.role)?"":"none");
  $$(".admin-only").forEach(x=>x.style.display=profile?.role==="admin"?"":"none");
}

async function boot(){
  const page=document.body.dataset.page||"";
  if(page==="public"){ wireNav(null); return; }
  Auth.watch(async (u,p)=>{
    if(!u){ location.href="login.html"; return; }
    wireNav(p);
    if(page==="staff" && !["admin","teacher"].includes(p.role)) location.href="dashboard.html";
    if(page==="admin" && p.role!=="admin") location.href="dashboard.html";
  });
  $$(".logout").forEach(b=>b.onclick=()=>Auth.logout());
  const liveRef=query(collection(db,"liveSessions"),where("status","==","live"),limit(1));
  onSnapshot(liveRef,s=>$$(".live-now-count").forEach(x=>x.textContent=s.size));
}
document.addEventListener("DOMContentLoaded",boot);
export { $, $$, esc };
