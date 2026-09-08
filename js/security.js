import { auth, db, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";
import { Auth } from "./auth.js";

export async function logActivity(type, detail={}) {
  if(!auth.currentUser) return;
  await setDoc(doc(db,"users",auth.currentUser.uid), {
    lastActivity:{type,detail,at:serverTimestamp()}
  }, {merge:true});
}

export async function currentProfile() {
  if(!auth.currentUser) return null;
  const s=await getDoc(doc(db,"users",auth.currentUser.uid));
  return s.exists()?s.data():null;
}

export async function guardStaff() {
  const p=await currentProfile();
  if(!p || !["admin","teacher"].includes(p.role)) { location.href="dashboard.html"; return null; }
  return p;
}

export { Auth };
