import { ydoc } from './ydoc';
import * as Y from 'yjs';

let socket = null;
let isConnected = false;
let docIdGlobal = null;
const messageQueue = [];

export function connectWebSocket(docId) {
    docIdGlobal = docId;

    socket = new WebSocket(`ws://localhost:8000/ws/crdt/`);

    socket.onopen = () => {
        console.log('✅ WebSocket connected');
        isConnected = true;

        // Ensure send happens only when socket is ready
        waitForSocketReady(() => {
            const subscribeMsg = {
                action: 'subscribe',
                request_id: 'sub-1',
                doc_id: docIdGlobal,
            };
            socket.send(JSON.stringify(subscribeMsg));

            // Flush queue
            while (messageQueue.length > 0) {
                socket.send(JSON.stringify(messageQueue.shift()));
            }
        });
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'receive_delta') {
            const delta = new Uint8Array(Object.values(data.delta));
            Y.applyUpdate(ydoc, delta);
        }
    };

    socket.onclose = () => {
        console.log('❌ WebSocket disconnected');
        isConnected = false;
    };
}

function waitForSocketReady(callback) {
    const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            callback();
        }
    }, 50);
}

export function sendDeltaToServer(delta) {
    const message = {
        action: 'send_delta',
        request_id: `delta-${Date.now()}`,
        doc_id: docIdGlobal || 1,
        delta: Array.from(delta),
    };

    if (isConnected && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        messageQueue.push(message);
    }
}
