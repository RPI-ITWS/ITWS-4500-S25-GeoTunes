// user-auth/scripts/authHelpers.js
import api from './api.js';

// Handle successful authentication (after login or signup)
export function handleSuccessfulAuth(userData) {
    // Store token in localStorage and API service
    if (userData && userData.token) {
        api.setToken(userData.token);
    }
    
    // Store user info if provided
    if (userData && userData.user) {
        localStorage.setItem('user', JSON.stringify(userData.user));
    }
    
    // Redirect to homepage or previous page
    const intendedUrl = localStorage.getItem('intendedUrl') || '/';
    localStorage.removeItem('intendedUrl');
    window.location.href = intendedUrl;
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Get current user data
export function getCurrentUser() {
    try {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Logout user
export function logout() {
    api.clearToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Save current URL before redirecting to login
export function saveIntendedUrl() {
    localStorage.setItem('intendedUrl', window.location.pathname);
}

// Redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        saveIntendedUrl();
        window.location.href = '/login';
        return false;
    }
    return true;
}