import {db,doc,setDoc,addDoc,collection,onSnapshot,query,where,serverTimestamp} from "./firebase.js";

const ICE={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};
export class Broadcaster {
  constructor(sessionId, localVideo, onState=()=>{}) {this.sessionId=sessionId;this.localVideo=localVideo;this.onState=onState;this.peers=new Map();this.stream=null;this.unsubs=[]}
  async start(stream){
    this.stream=stream;this.localVideo.srcObject=stream;
    this.unsubs.push(onSnapshot(collection(db,"liveSessions",this.sessionId,"offers"),snap=>snap.docChanges().forEach(c=>this.handleOffer(c.doc.id,c.doc.data()))));
    this.onState("broadcasting");
  }
  async handleOffer(peerId,offer){
    if(this.peers.has(peerId))return;
    const pc=new RTCPeerConnection(ICE);this.peers.set(peerId,pc);
    this.stream.getTracks().forEach(t=>pc.addTrack(t,this.stream));
    pc.onicecandidate=e=>e.candidate&&addDoc(collection(db,"liveSessions",this.sessionId,"candidates",peerId,"items"),{from:"teacher",candidate:e.candidate.toJSON(),createdAt:serverTimestamp()});
    pc.onconnectionstatechange=()=>{if(["failed","disconnected","closed"].includes(pc.connectionState))this.peers.delete(peerId);this.onState(pc.connectionState)};
    const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
    await setDoc(doc(db,"liveSessions",this.sessionId,"answers",peerId),{sdp:answer.sdp,type:answer.type});
    onSnapshot(query(collection(db,"liveSessions",this.sessionId,"candidates",peerId,"items"),where("from","==","student")),s=>s.docChanges().forEach(c=>pc.addIceCandidate(c.doc.data().candidate).catch(()=>{})));
    await pc.setRemoteDescription(offer);
  }
  replaceTrack(kind,newTrack){for(const pc of this.peers.values())pc.getSenders().find(s=>s.track?.kind===kind)?.replaceTrack(newTrack)}
  stop(){this.peers.forEach(p=>p.close());this.unsubs.forEach(u=>u());this.peers.clear()}
}

export class Viewer {
  constructor(sessionId,video,onState=()=>{}){this.sessionId=sessionId;this.video=video;this.onState=onState;this.pc=null;this.unsubs=[]}
  async start(){
    this.pc=new RTCPeerConnection(ICE);this.pc.addTransceiver("video",{direction:"recvonly"});this.pc.addTransceiver("audio",{direction:"recvonly"});
    this.pc.ontrack=e=>{if(e.streams[0])this.video.srcObject=e.streams[0]};
    this.pc.onconnectionstatechange=()=>this.onState(this.pc.connectionState);
    const peerId=crypto.randomUUID();
    this.pc.onicecandidate=e=>e.candidate&&addDoc(collection(db,"liveSessions",this.sessionId,"candidates","teacher","items"),{from:"student",peerId,candidate:e.candidate.toJSON(),createdAt:serverTimestamp()});
    const offer=await this.pc.createOffer();await this.pc.setLocalDescription(offer);
    await setDoc(doc(db,"liveSessions",this.sessionId,"offers",peerId),{sdp:offer.sdp,type:offer.type,peerId,createdAt:serverTimestamp()});
    this.unsubs.push(onSnapshot(doc(db,"liveSessions",this.sessionId,"answers",peerId),async s=>{if(s.exists()&&!this.pc.currentRemoteDescription)await this.pc.setRemoteDescription(s.data())}));
    this.unsubs.push(onSnapshot(query(collection(db,"liveSessions",this.sessionId,"candidates",peerId,"items"),where("from","==","teacher")),s=>s.docChanges().forEach(c=>this.pc.addIceCandidate(c.doc.data().candidate).catch(()=>{}))));
    return peerId;
  }
  stop(){this.unsubs.forEach(u=>u());this.pc?.close()}
}
