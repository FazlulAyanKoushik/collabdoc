import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken, logout } from '../auth/authService';

function DocumentList({ onSelect }) {
    const [docs, setDocs] = useState([]);
    const [title, setTitle] = useState('');

    const fetchDocs = async () => {
        try {
            console.log('Access token:', getAccessToken());

            const res = await axios.get('http://localhost:8000/api/documents/', {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            setDocs(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Logging out.');
                logout();
                window.location.reload();
            } else {
                console.error('Fetch failed:', err);
            }
        }
    };

    const createDoc = async () => {
        try {
            const res = await axios.post(
                'http://localhost:8000/api/documents/',
                { title },
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            );
            setTitle('');
            fetchDocs();
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Logging out.');
                logout();
                window.location.reload();
            } else {
                console.error('Doc creation failed:', err);
            }
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    return (
        <div>
            <h2>Your Documents</h2>
            <input
                placeholder="New doc title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={createDoc}>Create</button>

            <ul>
                {docs.map((doc) => (
                    <li key={doc.id}>
                        <button onClick={() => onSelect(doc)}>{doc.title}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DocumentList;
