// This file handles adding authentication functionality to pages
// Place this in your project root

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    // Get the navigation element to add auth buttons
    const navElement = document.querySelector('nav') || document.querySelector('header');
    
    if (navElement) {
    // Create auth container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    
    if (token && user) {
        // User is logged in
        authContainer.innerHTML = `
        <span class="welcome-text">Welcome, ${user.name}</span>
        <button id="logout-btn" class="auth-btn">Logout</button>
        `;
        
        // Add event listener for logout
        setTimeout(() => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/';
            });
        }
        }, 0);
        
    } else {
        // User is not logged in
        authContainer.innerHTML = `
        <a href="/login" class="auth-btn login-btn">Login</a>
        <a href="/signup" class="auth-btn signup-btn">Sign Up</a>
        `;
    }
    
    // Append to nav
    navElement.appendChild(authContainer);
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    .auth-container {
        display: flex;
        align-items: center;
        margin-left: auto;
    }
    
    .welcome-text {
        margin-right: 15px;
    }
    
    .auth-btn {
        padding: 8px 16px;
        margin-left: 10px;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
    }
    
    .login-btn {
        background-color: transparent;
        border: 1px solid #333;
        color: #333;
    }
    
    .signup-btn, #logout-btn {
        background-color: #333;
        color: white;
        border: none;
    }
    `;
    
    document.head.appendChild(style);
});