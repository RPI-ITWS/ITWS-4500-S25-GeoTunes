const express = require('express');
const router = express.Router();

const songs = []; // Temporary in-memory storage (replace with MongoDB later)

// Route: Serve "Add a Song" page
router.get('/add-song', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Add a Song - GeoTunes</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; background-color: #f5e6d3; }
        .container { max-width: 500px; margin: auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); }
        input, button { padding: 10px; margin: 5px; width: 90%; border-radius: 5px; border: 1px solid #ccc; }
        button { background: #2e7d32; color: white; cursor: pointer; }
        button:hover { background: #1a5a23; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Add a Song to the Playlist</h2>
        <form action="/add-song" method="POST">
          <input type="text" name="title" placeholder="Song Title" required><br>
          <input type="text" name="artist" placeholder="Artist Name" required><br>
          <button type="submit">Add Song</button>
        </form>
      </div>
      <h3>Current Playlist</h3>
      <ul>
        ${songs.map(song => `<li>${song.title} - ${song.artist}</li>`).join('')}
      </ul>
    </body>
    </html>
  `);
});

// Route: Handle song submission
router.post('/add-song', (req, res) => {
  const { title, artist } = req.body;
  if (title && artist) {
    songs.push({ title, artist });
  }
  res.redirect('/add-song'); // Refresh page to show updated playlist
});

module.exports = router;
