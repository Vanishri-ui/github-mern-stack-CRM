import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            // Ideally verify token with backend here, but for now we trust persistence or decode it
            // For simplicity in this demo, we can just assume user if we stored it or fetch it
            // Let's fetch user profile if possible, or just decode if we had jwt-decode
            // We'll fetch from /api/users/me equivalent or just keep it simple
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
        }
        setLoading(false); // Stop loading after check
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, user: res.data.user };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post('/api/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, user: res.data.user };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
