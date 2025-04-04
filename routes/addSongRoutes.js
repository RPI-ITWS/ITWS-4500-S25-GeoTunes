// In your server.js
app.post('/api/songs', async (req, res) => {
  try {
      const { title, artist } = req.body;
      
      if (!title || !artist) {
          return res.status(400).json({ error: "Title and artist are required" });
      }

      const result = await db.collection('songs').insertOne({
          title,
          artist,
          created_at: new Date()
      });
      
      res.status(201).json({
          _id: result.insertedId,
          title,
          artist,
          created_at: new Date()
      });
      
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/songs', async (req, res) => {
  try {
      const songs = await db.collection('songs')
          .find()
          .sort({ created_at: -1 })
          .toArray();
          
      res.json(songs);
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});