document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("add-song-form");
  const playlist = document.getElementById("playlist");

  form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const title = document.getElementById("song-title").value.trim();
      const artist = document.getElementById("artist-name").value.trim();

      if (title && artist) {
          // Send data to the backend (API request)
          const response = await fetch("/add-song", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, artist })
          });

          if (response.ok) {
              // Add the song to the playlist
              const listItem = document.createElement("li");
              listItem.textContent = `${title} - ${artist}`;
              playlist.appendChild(listItem);

              // Clear input fields
              form.reset();
          } else {
              alert("Error adding song. Please try again.");
          }
      }
  });

  // Fetch existing songs on page load
  async function fetchPlaylist() {
      const response = await fetch("/get-songs");
      if (response.ok) {
          const songs = await response.json();
          playlist.innerHTML = songs.map(song => `<li>${song.title} - ${song.artist}</li>`).join("");
      }
  }

  fetchPlaylist();
});
