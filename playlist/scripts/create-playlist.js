import { getCurrentUser } from '/user-auth/scripts/authHelpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-playlist-form');
  const errorBanner = document.getElementById('error-banner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playlistName = document.getElementById('playlist').value.trim();
    const description = document.getElementById('description').value.trim();
    const city = document.getElementById('city').value.trim();

    const user = getCurrentUser();
    if (!user) {
      showError("You must be logged in to create a playlist.");
      return;
    }

    const email = user.email;

    // 🧠 Collect track & artist pairs
    const trackEntries = document.querySelectorAll('.track-entry');
    const tracks = [];

    trackEntries.forEach(entry => {
      const trackName = entry.querySelector('input[name="trackName"]').value.trim();
      const artistName = entry.querySelector('input[name="artistName"]').value.trim();
      if (trackName && artistName) {
        tracks.push({ track: trackName, artist: artistName });
      }
    });

    if (!playlistName || !description || tracks.length === 0) {
      showError("Please complete all required fields and add at least one track.");
      return;
    }

    const playlist = {
      name: playlistName,
      description,
      city,
      tracks
    };

    try {
      const res = await fetch('/playlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, playlist })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create playlist.');
      }

      window.location.href = '/'; // Or wherever you want to go next
    } catch (err) {
      showError(err.message || "Something went wrong.");
    }
  });

  function showError(message) {
    errorBanner.style.display = 'block';
    errorBanner.textContent = message;
  }

  // Add track inputs
  const addTrackBtn = document.getElementById('add-track-btn');
  addTrackBtn.addEventListener('click', () => {
    const newEntry = document.createElement('div');
    newEntry.className = 'track-entry input-field';
    newEntry.innerHTML = `
      <input type="text" name="trackName" placeholder="Track name" required />
      <input type="text" name="artistName" placeholder="Artist name" required />
    `;
    document.getElementById('track-list').appendChild(newEntry);
  });
});

