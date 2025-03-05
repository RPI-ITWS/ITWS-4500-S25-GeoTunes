// public/scripts/login.js
import api from './api.js';
import { validateLogin } from './validation.js';
import { handleSuccessfulAuth } from './authHelpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorBanner = document.getElementById('error-banner');
  const loginButton = document.getElementById('login-button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    errorBanner.style.display = 'none';
    document.getElementById('error-email').textContent = '';
    document.getElementById('error-password').textContent = '';

    const formData = {
      email: form.email.value.trim(),
      password: form.password.value.trim()
    };

    // Client-side validation
    const errors = validateLogin(formData);
    if (Object.keys(errors).length > 0) {
      if (errors.email) {
        document.getElementById('error-email').textContent = errors.email;
      }
      if (errors.password) {
        document.getElementById('error-password').textContent = errors.password;
      }
      return;
    }

    // Set loading state
    loginButton.disabled = true;
    loginButton.innerHTML =
      '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';

    try {
      let response = await api.post('http://localhost:3000/users/login', formData);
      let resJson = await response.json();
      console.log(resJson);
      // On successful login, redirect or handle accordingly.
      handleSuccessfulAuth();
    } catch (err) {
      const responseErrors = err.response?.data?.errors || { general: 'Login failed' };
      if (responseErrors.general) {
        errorBanner.textContent = responseErrors.general;
        errorBanner.style.display = 'block';
      }
      if (responseErrors.email) {
        document.getElementById('error-email').textContent = responseErrors.email;
      }
      if (responseErrors.password) {
        document.getElementById('error-password').textContent = responseErrors.password;
      }
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'LOG IN';
    }
  });
});
