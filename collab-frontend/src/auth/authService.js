import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export async function registerUser(username, password) {
    return axios.post(`${API_URL}/auth/register/`, { username, password });
}

export async function loginUser(username, password) {
    const res = await axios.post(`${API_URL}/auth/token/`, { username, password });
    const tokens = res.data;
    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    return tokens;
}

export function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
}

export function getAccessToken() {
    return localStorage.getItem('access');
}
