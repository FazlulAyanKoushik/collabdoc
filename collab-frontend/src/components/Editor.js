import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as Y from 'yjs';
import { getAccessToken } from '../auth/authService';
import SharePanel from './SharePanel';

function Editor({ doc, onBack }) {
    const textAreaRef = useRef(null);
    const [text, setText] = useState('');
    const ydoc = useRef(new Y.Doc()).current;
    const ytext = ydoc.getText('shared-text');
    const socketRef = useRef(null);
    const hasChanges = useRef(false);

    const safeSend = (socket, message) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            socket.addEventListener(
                'open',
                () => socket.send(JSON.stringify(message)),
                { once: true }
            );
        }
    };

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
                setText(ytext.toString());
            }
        };

        fetchDoc();
        ytext.observe(() => {
            setText(ytext.toString());
            hasChanges.current = true;
        });

        return () => {
            ytext.unobserve();
        };
    }, [doc.id, ydoc, ytext]);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/crdt/`);
        socketRef.current = socket;

        safeSend(socket, {
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

        return () => {
            safeSend(socket, {
                action: 'unsubscribe',
                request_id: 'unsub-1',
                doc_id: doc.id,
            });
            socket.close();
        };
    }, [doc.id, ydoc]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        ytext.delete(0, ytext.length);
        ytext.insert(0, newVal);

        const update = Y.encodeStateAsUpdate(ydoc);
        hasChanges.current = true;

        safeSend(socketRef.current, {
            action: 'send_delta',
            request_id: `delta-${Date.now()}`,
            doc_id: doc.id,
            delta: Array.from(update),
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (hasChanges.current) {
                const update = Y.encodeStateAsUpdate(ydoc);
                axios.patch(
                    `http://localhost:8000/api/documents/${doc.id}/`,
                    { crdt_state: Array.from(update) },
                    {
                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                        },
                    }
                ).then(() => {
                    hasChanges.current = false;
                }).catch((err) => {
                    console.error('Autosave failed:', err);
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [doc.id, ydoc]);

    return (
        <div>
            <h2>Editing: {doc.title}</h2>
            <button onClick={onBack}>← Back to documents</button>
            <textarea
                ref={textAreaRef}
                rows={20}
                cols={80}
                value={text}
                onChange={handleChange}
            />
            <SharePanel docId={doc.id} />
        </div>
    );
}

export default Editor;
