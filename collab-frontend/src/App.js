import React, { useState, useEffect } from 'react';
import Login from './auth/Login';
import Register from './auth/Register';
import { getAccessToken, logout } from './auth/authService';
import DocumentList from './components/DocumentList';

function App() {
    const [view, setView] = useState('login'); // 'login', 'register', or 'editor'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const token = getAccessToken();
        if (token) setIsLoggedIn(true);
    }, []);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setSelectedDoc(null);
        setView('login');
    };

    if (!isLoggedIn) {
        return view === 'register' ? (
            <>
                <Register onRegistered={() => setView('login')} />
                <p>
                    Already have an account? <button onClick={() => setView('login')}>Login</button>
                </p>
            </>
        ) : (
            <>
                <Login onLogin={() => setIsLoggedIn(true)} />
                <p>
                    Don’t have an account? <button onClick={() => setView('register')}>Register</button>
                </p>
            </>
        );
    }

    if (!selectedDoc) {
        return (
            <div style={{ padding: 20 }}>
                <h1>Welcome to Collab Editor</h1>
                <button onClick={handleLogout}>Logout</button>
                <DocumentList onSelect={(doc) => setSelectedDoc(doc)} />
            </div>
        );
    }

    // 🧠 Next step: insert the Yjs editor component here
    return (
        <div style={{ padding: 20 }}>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => setSelectedDoc(null)}>← Back to documents</button>
            <h2>Editing: {selectedDoc.title}</h2>
            <p>(Real-time editor coming next)</p>
        </div>
    );
}

export default App;
