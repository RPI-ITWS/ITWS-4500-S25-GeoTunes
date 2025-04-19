import api from './api.js';

export function handleSuccessfulAuth(userData) {
    if (userData && userData.token) {
        api.setToken(userData.token);
    }
    if (userData && userData.user) {
        localStorage.setItem('user', JSON.stringify(userData.user));
    }
    resetInactivityTimer();
    const intendedUrl = localStorage.getItem('intendedUrl') || '/city-exploration';
    localStorage.removeItem('intendedUrl');
    window.location.href = intendedUrl;
}

export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

export function getCurrentUser() {
    try {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

export function logout() {
    api.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('intendedUrl');
    clearTimeout(window.__logoutTimeout);
    window.location.href = '/login';
}

export function saveIntendedUrl() {
    localStorage.setItem('intendedUrl', window.location.pathname);
}

export function requireAuth() {
    if (!isAuthenticated()) {
        saveIntendedUrl();
        window.location.href = '/login';
        return false;
    }
    return true;
}

export function resetInactivityTimer() {
    clearTimeout(window.__logoutTimeout);
    window.__logoutTimeout = setTimeout(() => {
        alert('Session expired due to inactivity. Logging out.');
        logout();
    }, 30 * 60 * 1000); // 30 minutes
}

['click', 'mousemove', 'keydown', 'scroll'].forEach(evt => {
    window.addEventListener(evt, () => {
        if (isAuthenticated()) {
            resetInactivityTimer();
        }
    });
});

export function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = '/city-exploration';
    }
}
