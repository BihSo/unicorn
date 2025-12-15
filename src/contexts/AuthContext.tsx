import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface AuthContextType {
    token: string | null;
    refreshToken: string | null;
    user: any | null;
    isAuthenticated: boolean;
    login: (token: string, refreshToken: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState<any | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');

        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        else localStorage.removeItem('refreshToken');

        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [token, refreshToken, user]);

    // Listen for token updates from axios interceptors
    useEffect(() => {
        const handleTokenRefresh = () => {
            const newToken = localStorage.getItem('token');
            const newRefreshToken = localStorage.getItem('refreshToken');
            const savedUser = localStorage.getItem('user');

            if (newToken) setToken(newToken);
            if (newRefreshToken) setRefreshToken(newRefreshToken);
            if (savedUser) setUser(JSON.parse(savedUser));
        };

        window.addEventListener('token-refreshed', handleTokenRefresh);

        // Optional: Listen for storage events (multi-tab support)
        window.addEventListener('storage', handleTokenRefresh);

        return () => {
            window.removeEventListener('token-refreshed', handleTokenRefresh);
            window.removeEventListener('storage', handleTokenRefresh);
        };
    }, []);

    // Proactive Token Refresh Logic
    useEffect(() => {
        if (!token) return;

        let refreshTimeout: NodeJS.Timeout;

        const scheduleRefresh = () => {
            try {
                const decoded: any = jwtDecode(token);
                const exp = decoded.exp * 1000;
                const now = Date.now();
                // Refresh 1 minute before expiry
                const timeUntilRefresh = exp - now - (60 * 1000);

                if (timeUntilRefresh > 0) {
                    console.log(`Token refresh scheduled in ${Math.floor(timeUntilRefresh / 1000)} seconds`);
                    refreshTimeout = setTimeout(performRefresh, timeUntilRefresh);
                } else {
                    // Token effectively expired or about to expire, refresh immediately
                    console.log('Token near expiry, refreshing immediately...');
                    performRefresh();
                }
            } catch (error) {
                console.error('Error decoding token for refresh scheduling:', error);
            }
        };

        const performRefresh = async () => {
            const currentRefreshToken = localStorage.getItem('refreshToken');
            if (!currentRefreshToken) return;

            try {
                // Use a clean axios instance to avoid interceptors attaching the potentially expired token
                const response = await axios.post('/api/v1/auth/refresh-token', {
                    token: currentRefreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update LocalStorage
                localStorage.setItem('token', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Notify App
                window.dispatchEvent(new Event('token-refreshed'));

                // IMPORTANT: The state update happens via the other useEffect listening to 'token-refreshed'
                // But we should re-schedule immediately if the component doesn't unmount
            } catch (error) {
                console.error('Proactive refresh failed:', error);
                // If proactive refresh fails, we generally let the interceptor handle the eventual 401
                // or we could force logout here. For now, let's just clear the token if it's definitely invalid.
                // logout(); 
            }
        };

        scheduleRefresh();

        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
        };
    }, [token]);

    const login = (newToken: string, newRefreshToken: string, newUser: any) => {
        // Store in localStorage IMMEDIATELY (synchronously) before state update
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Then update React state
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, refreshToken, user, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
