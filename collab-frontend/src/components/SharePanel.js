import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getAccessToken } from '../auth/authService';

function SharePanel({ docId }) {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('viewer');
    const [message, setMessage] = useState('');
    const [collaborators, setCollaborators] = useState([]);

    const fetchCollaborators = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/permissions/', {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            const filtered = res.data.filter((perm) => perm.document === docId);
            setCollaborators(filtered);
        } catch (err) {
            console.error('Failed to fetch collaborators', err);
        }
    }, [docId]);

    const handleShare = async () => {
        try {
            const userRes = await axios.get(`http://localhost:8000/api/users/?search=${username}`, {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });

            if (userRes.data.length === 0) {
                setMessage('User not found');
                return;
            }

            const userId = userRes.data[0].id;

            await axios.post(
                'http://localhost:8000/api/permissions/',
                {
                    user_id: userId,
                    document: docId,
                    role: role,
                },
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            );

            setMessage(`Shared with ${username} as ${role}`);
            setUsername('');
            fetchCollaborators();
        } catch (err) {
            console.error(err);
            setMessage('Error sharing document');
        }
    };

    const handleRemove = async (permissionId) => {
        try {
            await axios.delete(`http://localhost:8000/api/permissions/${permissionId}/`, {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            });
            fetchCollaborators();
        } catch (err) {
            console.error('Failed to remove collaborator', err);
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    return (
        <div style={{ marginTop: 30 }}>
            <h4>Share this document</h4>
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
            </select>
            <button onClick={handleShare}>Share</button>
            <p>{message}</p>

            <h5>Collaborators:</h5>
            <ul>
                {collaborators.map((c) => (
                    <li key={c.id}>
                        {c.user.username} — {c.role}{' '}
                        <button onClick={() => handleRemove(c.id)} style={{ color: 'red' }}>
                            🗑 Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SharePanel;
