import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import * as Y from 'yjs';
import { getAccessToken } from '../auth/authService';
import SharePanel from './SharePanel';
import { TextAreaBinding } from 'y-textarea';

function Editor({ doc, onBack }) {
    const ydoc = useRef(new Y.Doc()).current;
    const textareaRef = useRef(null);
    const socketRef = useRef(null);

    // ✅ Safe WebSocket send
    const safeSend = (message) => {
        const socket = socketRef.current;
        if (!socket) return;

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            socket.addEventListener('open', () => {
                socket.send(JSON.stringify(message));
            }, { once: true });
        }
    };

    // Load saved CRDT state
    useEffect(() => {
        const fetchDoc = async () => {
            const res = await axios.get(`http://localhost:8000/api/documents/${doc.id}/`, {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            const crdt = res.data.crdt_state;
            if (crdt && Object.values(crdt).length > 0) {
                const update = new Uint8Array(Object.values(crdt));
                Y.applyUpdate(ydoc, update);
            }
        };

        fetchDoc();
    }, [doc.id, ydoc]);

    // WebSocket sync
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000/ws/crdt/');
        socketRef.current = socket;

        safeSend({
            action: 'subscribe',
            request_id: 'sub-1',
            doc_id: doc.id,
        });

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'receive_delta') {
                const delta = new Uint8Array(Object.values(data.delta));
                Y.applyUpdate(ydoc, delta);
            }
        };

        const sendUpdate = (update) => {
            safeSend({
                action: 'send_delta',
                request_id: `delta-${Date.now()}`,
                doc_id: doc.id,
                delta: Array.from(update),
            });
        };

        const onUpdate = (update) => {
            sendUpdate(update);
        };

        ydoc.on('update', onUpdate);

        return () => {
            safeSend({
                action: 'unsubscribe',
                request_id: 'unsub-1',
                doc_id: doc.id,
            });
            socket.close();
            ydoc.off('update', onUpdate);
        };
    }, [doc.id, ydoc]);

    // Bind textarea to Yjs
    useEffect(() => {
        const ytext = ydoc.getText('shared-text');
        const binding = new TextAreaBinding(ytext, textareaRef.current);
        return () => binding.destroy();
    }, [ydoc]);

    // Autosave to backend
    useEffect(() => {
        const interval = setInterval(() => {
            const update = Y.encodeStateAsUpdate(ydoc);
            axios.patch(
                `http://localhost:8000/api/documents/${doc.id}/`,
                { crdt_state: Array.from(update) },
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            ).catch((err) => console.error('Autosave error:', err));
        }, 5000);

        return () => clearInterval(interval);
    }, [doc.id, ydoc]);

    return (
        <div>
            <h2>Editing: {doc.title}</h2>
            <button onClick={onBack}>← Back to documents</button>
            <textarea ref={textareaRef} rows={20} cols={80} />
            <SharePanel docId={doc.id} />
        </div>
    );
}

export default Editor;
