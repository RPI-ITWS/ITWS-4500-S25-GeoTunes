// user-auth/scripts/api.js
const API_BASE_URL = ''; // empty string means same domain

class Api {
constructor() {
    this.token = localStorage.getItem('authToken');
}

setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
}

clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
}

getHeaders() {
    const headers = {
    'Content-Type': 'application/json'
    };

    if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
}

async get(url) {
    try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: this.getHeaders()
    });

    if (!response.ok) {
        const error = await response.json();
        throw { response: { data: error }, status: response.status };
    }

    return await response.json();
    } catch (error) {
    console.error('API GET error:', error);
    throw error;
    }
}

async post(url, data) {
    try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw { response: { data: error }, status: response.status };
    }

    return await response.json();
    } catch (error) {
    console.error('API POST error:', error);
    throw error;
    }
}

async put(url, data) {
    try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw { response: { data: error }, status: response.status };
    }

    return await response.json();
    } catch (error) {
    console.error('API PUT error:', error);
    throw error;
    }
}

async delete(url) {
    try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: this.getHeaders()
    });

    if (!response.ok) {
        const error = await response.json();
        throw { response: { data: error }, status: response.status };
    }

    return await response.json();
    } catch (error) {
    console.error('API DELETE error:', error);
    throw error;
    }
}
}

export default new Api();