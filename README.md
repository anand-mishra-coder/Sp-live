# LiveClass Pro

A Firebase + WebRTC coaching platform starter designed to be deployable as a real project.

## Included
- Firebase Email/Password + Google authentication
- Student / Teacher / Admin role gates
- Firestore-backed courses, schedules, recordings, notes, tests, results, notifications, leaderboard
- Real-time Firestore chat, polls, live tests, announcements and attendance
- Real WebRTC camera/microphone streaming with Firestore signaling
- Camera/mic device selection, mute/unmute, front/back camera switching where supported, replaceTrack()
- Reconnect handling, connection state, fullscreen and Picture-in-Picture
- Responsive premium dark EdTech UI
- Admin and teacher live controls
- Firestore security rules

## Important production scaling note
The included WebRTC implementation is a Firestore-signaled peer-to-peer room suitable for small rooms/testing. Browser-to-browser mesh is not appropriate for 50-100+ viewers because the teacher must maintain many peer connections.

For 50-100+ real students, keep the same Firebase data/control plane but replace `js/webrtc.js` media transport with an SFU such as LiveKit, mediasoup, Janus, or an equivalent managed SFU. The UI already separates media transport from chat/poll/test/attendance data so this migration is isolated.

## Setup
1. Create a Firebase project.
2. Enable Authentication -> Email/Password and Google.
3. Create Firestore Database.
4. Copy the Firebase web config into `js/firebase.js`.
5. Publish Firestore rules from `firestore.rules`.
6. Create your first user using signup/login, then change that user's Firestore `users/{uid}.role` to `admin` in the Firebase console.
7. Add teachers by changing their role to `teacher`.
8. Serve the folder from localhost or HTTPS (camera/mic require a secure context; localhost is allowed).
9. Open `index.html`.

## Admin data model
The app uses a single `users/{uid}` document with a `role` field (`student`, `teacher`, `admin`) plus the collections listed in `firestore.rules`.

## WebRTC
A teacher/admin creates a `liveSessions/{sessionId}` document. Each viewer creates a peer connection to the broadcaster. Signaling is isolated by session:
`liveSessions/{sessionId}/offers`, `answers`, `candidates/{peerId}/items`.

For a classroom with many viewers, migrate only the media layer to an SFU.
