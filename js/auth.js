import {
  auth, db, googleProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile,
  doc, getDoc, setDoc, serverTimestamp
} from "./firebase.js";

export const Auth = {
  async ensureUser(user, name="") {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:user.uid, name:name || user.displayName || "Student",
        email:user.email || "", photoURL:user.photoURL || "",
        role:"student", xp:0, level:1, streak:0, attendance:0,
        createdAt:serverTimestamp(), lastLogin:serverTimestamp()
      });
    } else {
      await setDoc(ref, {lastLogin:serverTimestamp()}, {merge:true});
    }
    return (await getDoc(ref)).data();
  },
  async email(email,password,name) {
    const credential = await createUserWithEmailAndPassword(auth,email,password);
    if (name) await updateProfile(credential.user,{displayName:name});
    return this.ensureUser(credential.user,name);
  },
  async login(email,password) {
    const credential = await signInWithEmailAndPassword(auth,email,password);
    return this.ensureUser(credential.user);
  },
  async google() {
    const credential = await signInWithPopup(auth,googleProvider);
    return this.ensureUser(credential.user);
  },
  async role() {
    if (!auth.currentUser) return null;
    const s=await getDoc(doc(db,"users",auth.currentUser.uid));
    return s.exists()?s.data().role:null;
  },
  logout(){ return signOut(auth); },
  watch(cb){ return onAuthStateChanged(auth, async u => cb(u, u?await this.ensureUser(u):null)); }
};

export function requireAuth({roles=[], redirect="login.html"}={}) {
  return new Promise(resolve=>{
    const unsub=Auth.watch(async (u,p)=>{
      if(!u){ location.href=redirect; return; }
      if(roles.length && !roles.includes(p.role)){ location.href="dashboard.html"; return; }
      unsub(); resolve({user:u,profile:p});
    });
  });
}
