import { requireAuth, getCurrentUser, logout } from '/user-auth/scripts/authHelpers.js';
import api from '/user-auth/scripts/api.js';

api.setToken(localStorage.getItem('authToken'));

if (!requireAuth()) {
    throw new Error("Unauthorized");
}

document.addEventListener('DOMContentLoaded', () => {
    api.setToken(localStorage.getItem('authToken'));
    console.log("Auth token at profile load:", localStorage.getItem('authToken'));
    const form = document.getElementById('profile-form');
    const statusMessage = document.getElementById('status-message');
    const deleteBtn = document.getElementById('delete-account-button');
    const savedEventsContainer = document.getElementById('saved-events');

    async function loadProfile() {
        try {
            const response = await api.get('/api/user/profile');
            const user = response.user;
            form.name.value = user.name || '';
            form.email.value = user.email || '';
            form.spotify_id.value = user.spotify_id || '';
        } catch (err) {
            console.error("Failed to load profile:", err);
        }
    }

    async function loadSavedEvents() {
        try {
            const res = await api.get('/api/user/events');
            const events = res.savedEvents || [];

            if (events.length === 0) {
                savedEventsContainer.innerHTML = '<p class="empty-playlist">No saved events yet.</p>';
                return;
            }

            const list = document.createElement('ul');
            list.className = 'playlist-list';

            events.forEach(event => {
                const item = document.createElement('li');
                item.className = 'playlist-item';
                item.innerHTML = `
                    <div>
                        <div class="song-title">${event.name}</div>
                        <div class="song-artist">${event.date} - ${event.location?.address || ''}</div>
                    </div>
                    <button data-id="${event._id}" class="remove-event">Remove</button>
                `;
                list.appendChild(item);
            });

            savedEventsContainer.innerHTML = '';
            savedEventsContainer.appendChild(list);

            document.querySelectorAll('.remove-event').forEach(button => {
                button.addEventListener('click', async () => {
                    const eventId = button.getAttribute('data-id');
                    if (confirm('Are you sure you want to remove this event?')) {
                        await api.delete(`/api/user/events/${eventId}`);
                        loadSavedEvents();
                    }
                });
            });
        } catch (err) {
            console.error('Failed to load saved events:', err);
            savedEventsContainer.innerHTML = '<p class="empty-playlist">Error loading events.</p>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            spotify_id: form.spotify_id.value.trim()
        };

        try {
            const result = await api.put('/api/user/profile', data);
            statusMessage.className = 'status-message success';
            statusMessage.textContent = 'Profile updated successfully!';
        } catch (err) {
            console.error(err);
            statusMessage.className = 'status-message error';
            statusMessage.textContent = 'Failed to update profile.';
        }
        statusMessage.style.display = 'block';
    });

    deleteBtn.addEventListener('click', async () => {
        if (!confirm('This will permanently delete your account. Are you sure?')) return;
        try {
            await api.delete('/api/user/profile');
            alert('Account deleted.');
            logout();
        } catch (err) {
            console.error(err);
            alert('Failed to delete account.');
        }
    });

    loadProfile();
    loadSavedEvents();
});
