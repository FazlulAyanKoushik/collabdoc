import React, { useState, useEffect } from 'react';
import Login from './auth/Login';
import Register from './auth/Register';
import { getAccessToken, logout } from './auth/authService';
import DocumentList from './components/DocumentList';
import Editor from './components/Editor';

function App() {
    const [view, setView] = useState('login');
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
                    Already have an account?{' '}
                    <button onClick={() => setView('login')}>Login</button>
                </p>
            </>
        ) : (
            <>
                <Login onLogin={() => setIsLoggedIn(true)} />
                <p>
                    Don’t have an account?{' '}
                    <button onClick={() => setView('register')}>Register</button>
                </p>
            </>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <button onClick={handleLogout}>Logout</button>

            {!selectedDoc ? (
                <>
                    <h1>Welcome to Collab Editor</h1>
                    <DocumentList onSelect={(doc) => setSelectedDoc(doc)} />
                </>
            ) : (
                <Editor doc={selectedDoc} onBack={() => setSelectedDoc(null)} />
            )}
        </div>
    );
}

export default App;
