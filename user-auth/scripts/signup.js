import api from './api.js';
import { validateSignup } from './validation.js';
import { handleSuccessfulAuth } from './authHelpers.js';

document.addEventListener('DOMContentLoaded', () => {
const form = document.getElementById('signup-form');
const errorBanner = document.getElementById('error-banner');
const signupButton = document.getElementById('signup-button');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorBanner.style.display = 'none';
    document.getElementById('error-name').textContent = '';
    document.getElementById('error-email').textContent = '';
    document.getElementById('error-password').textContent = '';
    document.getElementById('error-confirmPassword').textContent = '';

    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim(),
        confirmPassword: form.confirmPassword.value.trim()
    };

    const errors = validateSignup(formData);
    if (Object.keys(errors).length > 0) {
    if (errors.name) {
        document.getElementById('error-name').textContent = errors.name;
    }
    if (errors.email) {
        document.getElementById('error-email').textContent = errors.email;
    }
    if (errors.password) {
        document.getElementById('error-password').textContent = errors.password;
    }
    if (errors.confirmPassword) {
        document.getElementById('error-confirmPassword').textContent = errors.confirmPassword;
    }
    return;
    }

    signupButton.disabled = true;
    signupButton.innerHTML =
    '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';

    try {
    const userData = await api.post('/api/auth/signup', formData);
    console.log('Signup successful:', userData);
    
    handleSuccessfulAuth(userData);
    } catch (err) {
    console.error('Signup error:', err);
    const responseErrors = err.response?.data?.errors || { general: 'Signup failed' };
    if (responseErrors.general) {
        errorBanner.textContent = responseErrors.general;
        errorBanner.style.display = 'block';
    }
    if (responseErrors.name) {
        document.getElementById('error-name').textContent = responseErrors.name;
    }
    if (responseErrors.email) {
        document.getElementById('error-email').textContent = responseErrors.email;
    }
    if (responseErrors.password) {
        document.getElementById('error-password').textContent = responseErrors.password;
    }
    if (responseErrors.confirmPassword) {
        document.getElementById('error-confirmPassword').textContent = responseErrors.confirmPassword;
    }
    } finally {
    signupButton.disabled = false;
    signupButton.textContent = 'SIGN UP';
    }
});
});