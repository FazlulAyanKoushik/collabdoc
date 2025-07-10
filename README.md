## 📝 ColebDoc: Real-Time Collaborative Document Editor
A full-stack real-time collaborative document editor built with:

* 🧠 CRDT (Yjs) for concurrent editing
* ⚙️ Django REST Framework for APIs
* 🌐 Django Channels + Redis for WebSocket sync
* ⚛️ React.js for frontend UI
* 🧑‍🤝‍🧑 Document sharing with roles (viewer/editor)

<br>

## ⚙️ Features
* ✅ Real-time collaboration (like Google Docs)
* ✅ User registration and login with JWT
* ✅ Document creation and listing
* ✅ CRDT-based editing (using Yjs)
* ✅ WebSocket sync via Django Channels
* ✅ Share documents with other users
* ✅ Autosave CRDT state to backend


## 🧩 Tech Stack
```aiignore
| Layer       | Tech                         |
| ----------- | ---------------------------- |
| Frontend    | React, Axios, Yjs            |
| CRDT        | Yjs, y-textarea, y-websocket |
| Backend API | Django, DRF, SimpleJWT       |
| WebSocket   | Django Channels + Redis      |
| DB          | SQLite / PostgreSQL          |
```


## ✅ To-Do / Enhancements
*  Rich text editor (TipTap, Quill)
*  Presence indicator (who’s online)
*  Chat/comments sidebar
*  Document version history