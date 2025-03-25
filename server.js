const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.use('/homepage', express.static(path.join(__dirname, 'homepage')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/addAuth.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'addAuth.js'));
});

const uri = process.env.MONGODB;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToDatabase().catch(console.dir);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ errors: { general: 'Access denied. No token provided.' } });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ errors: { general: 'Invalid token' } });
  }
};

async function getKey() {
  const db = client.db("geotunes");
  const collection = db.collection('api_data');
  const keyDoc = await collection.findOne({}, { projection: { key: 1, _id: 0 } });
  if (!keyDoc) {
    return await newKey();
  }
  return keyDoc.key;
}

async function newKey() {
  let key = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: "grant_type=client_credentials&client_id=b931d26ffacd40e1bb2a85ff3b82df0e&client_secret=1841d9b707d445d0b4ca9821981c0cc8",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  key = await key.json();
  const db = client.db("geotunes");
  const collection = db.collection('api_data');
  await collection.deleteMany({});
  await collection.insertOne({ "key": key.access_token, "created_at": new Date() });
  console.log("New key generated:", key.access_token);
  return key.access_token;
}

async function playlistRequest(id) {
  let key = await getKey();
  let response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      "Authorization": `Bearer  ${key}`,
    }
  });
  let data = await response.json();
  
  if (data?.error?.message === "The access token expired") {
    key = await newKey();
    response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        "Authorization": `Bearer  ${key}`,
      }
    });
    data = await response.json();
  }
  return data;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage', 'index.html'));
});

app.get('/city-exploration', (req, res) => {
  console.log('Serving city exploration page');
  console.log('Path:', path.join(__dirname, 'cityExploration', 'cityExploration.html'));
  res.sendFile(path.join(__dirname, 'cityExploration', 'cityExploration.html'));
});

app.use('/cityExploration', express.static(path.join(__dirname, 'cityExploration'))); 

app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'Reviews', 'reviewPage.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-auth', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-auth', 'signup.html'));
});

app.use('/user-auth/scripts', express.static(path.join(__dirname, 'user-auth', 'scripts')));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const errors = {};
    
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    const db = client.db("geotunes");
    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email already in use' } });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      created_at: new Date()
    });
    
    const token = jwt.sign(
      { id: result.insertedId.toString(), name, email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, user: { id: result.insertedId.toString(), name, email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ errors: { general: 'Server error during signup' } });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = {};
    
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    const db = client.db("geotunes");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: { general: 'Invalid email or password' } });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ errors: { general: 'Invalid email or password' } });
    }
    
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errors: { general: 'Server error during login' } });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const db = client.db("geotunes");
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(404).json({ errors: { general: 'User not found' } });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ errors: { general: 'Server error' } });
  }
});

try {
  const addSongRoutes = require('./routes/addSongRoutes');
  app.use('/api/songs', addSongRoutes);
} catch (error) {
  console.warn('Warning: addSongRoutes.js not found. Skipping route import.');
}

app.get('/playlist/', async (req, res) => {
  try {
    let city = req.query.city;
    let id = "6UR7T05u7cIsNAuqUE6UV0"; 
    if (city) {
      const db = client.db("geotunes");
      const cityCollection = db.collection("city_playlists");
      const cityPlaylist = await cityCollection.findOne({ city: city.toLowerCase() });
      if (cityPlaylist) {
        id = cityPlaylist.playlist_id;
      }
    }
    const data = await playlistRequest(id);
    res.json(data);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

app.get('/add-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-song.html'));
});

app.post('/add-song', authenticateToken, async (req, res) => {
  try {
    const { title, artist } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "Title and artist are required" });
    }
    const db = client.db("geotunes");
    const collection = db.collection("songs");
    const result = await collection.insertOne({ 
      title, 
      artist, 
      userId: req.user.id,
      createdAt: new Date() 
    });
    res.status(201).json({ message: "Song added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ error: "Failed to add song" });
  }
});

app.get('/get-songs', async (req, res) => {
  try {
    const db = client.db("geotunes");
    const collection = db.collection("songs");
    const songs = await collection.find({}).toArray();
    res.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

app.get('/newkey', async (req, res) => {
  try {
    const key = await newKey();
    res.json({ message: "New Spotify API key generated" });
  } catch (error) {
    console.error("Error generating Spotify API key:", error);
    res.status(500).json({ error: "Failed to generate Spotify API key" });
  }
});

app.get('/locale/:locale', async (req, res) => {
  try {
    const { locale } = req.params;
    const db = client.db("geotunes");
    const collection = db.collection("locales");
    const localeData = await collection.findOne({ name: locale });
    if (localeData) {
      res.json(localeData);
    } else {
      res.status(404).json({ error: "Locale not found" });
    }
  } catch (error) {
    console.error("Error fetching locale:", error);
    res.status(500).json({ error: "Failed to fetch locale" });
  }
});

app.post('/locale/:locale', authenticateToken, async (req, res) => {
  try {
    const { locale } = req.params;
    const db = client.db("geotunes");
    const collection = db.collection("locales");
    const result = await collection.insertOne({ 
      name: locale, 
      userId: req.user.id,
      ...req.body, 
      createdAt: new Date() 
    });
    res.status(201).json({ message: "Locale created successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error creating locale:", error);
    res.status(500).json({ error: "Failed to create locale" });
  }
});

app.put('/locale/:locale', authenticateToken, async (req, res) => {
  try {
    const { locale } = req.params;
    const db = client.db("geotunes");
    const collection = db.collection("locales");
    const result = await collection.updateOne(
      { name: locale },
      { $set: { ...req.body, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ message: "Locale updated successfully", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error updating locale:", error);
    res.status(500).json({ error: "Failed to update locale" });
  }
});

app.delete('/locale/:locale', authenticateToken, async (req, res) => {
  try {
    const { locale } = req.params;
    const db = client.db("geotunes");
    const collection = db.collection("locales");
    const result = await collection.deleteOne({ name: locale });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Locale not found" });
    }
    res.json({ message: "Locale deleted successfully" });
  } catch (error) {
    console.error("Error deleting locale:", error);
    res.status(500).json({ error: "Failed to delete locale" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
