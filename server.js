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
const client = new MongoClient(uri);

const connectToDatabase = async () => {
    try {
        await client.connect();

        // Explicitly use the 'geotunes' database
        const db = client.db("geotunes");

        console.log("Connected to MongoDB!");
        console.log("Using database:", db.databaseName);

        const collections = await db.listCollections().toArray();
        return db;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
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
    // console.log('Serving city exploration page');
    // console.log('Path:', path.join(__dirname, 'cityExploration', 'cityExploration.html'));
    res.sendFile(path.join(__dirname, 'cityExploration', 'cityExploration.html'));
});

app.use('/cityExploration', express.static(path.join(__dirname, 'cityExploration')));

app.get('/reviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'Reviews', 'reviewPage.html'));
});

app.use('/profile', express.static(path.join(__dirname, 'profile')));

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile', 'profile.html'));
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
        spotify_id: req.body.spotify_id || "",
        savedEvents: []
        });
        
        const token = jwt.sign(
        { id: result.insertedId.toString(), name, email },
        JWT_SECRET,
        { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
        token, 
        user: { 
            id: result.insertedId.toString(), 
            name, 
            email, 
            spotify_id: req.body.spotify_id || "" 
        } 
        });
        console.log("User inserted:", result.insertedId);
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
        console.log(user);
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
    res.sendFile(path.join(__dirname, 'addSong', 'add-song.html'));
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

app.use('/about', express.static(path.join(__dirname, 'about')));

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about', 'about.html'));
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

// app.get('/node/info', async (req, res) => {
app.get('/info', async (req, res) => {
    try {
        const city = req.query.city;
        console.log(city)
        if (!city) {
            return res.status(400).json({ error: "City name is required" });
        }

        const db = client.db("geotunes");
        const collection = db.collection("location_entries");

        const cityData = await collection.findOne(
            {
                cityName: { $regex: city.trim(), $options: 'i' }
            },
            {
                projection: { cityName: 1, description: 1, _id: 0 }
            }
        );        
        if (!cityData) {
            console.log("No match for city:", city);
            return res.status(404).json({ info: "No information available for this city." });
        }

        console.log("Found match:", cityData.cityName);
        res.json({
            info: `<strong>${cityData.cityName}</strong><br><br>${cityData.description}`
        });

    } catch (err) {
        console.error("Error fetching city info:", err);
        res.status(500).json({ info: "Server error while retrieving city info." });
    }
});      

// app.get('/node/events', async (req, res) => {
app.get('/events', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: "City name is required" });
        }

        const db = client.db("geotunes");
        const eventsCollection = db.collection("events");

        const events = await eventsCollection.find({
            "location.city": { $regex: `^${city.trim()}$`, $options: 'i' }
        }).toArray();

        res.json({ events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Server error fetching events" });
    }
});

app.post('/api/user/events', authenticateToken, async (req, res) => {
    try {
        const db = client.db("geotunes");
        const users = db.collection("users");
        const events = db.collection("events");

        const { eventId } = req.body;
        if (!eventId) return res.status(400).json({ error: "Event ID is required" });

        const eventObjId = new ObjectId(eventId);
        const event = await events.findOne({ _id: eventObjId });
        if (!event) return res.status(404).json({ error: "Event not found" });

        const updateResult = await users.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $addToSet: { savedEvents: eventObjId } } // prevents duplicates
        );

        res.json({ message: "Event saved", updateResult });
    } catch (error) {
        console.error("Error saving event:", error);
        res.status(500).json({ error: "Failed to save event" });
    }
});

app.get('/api/user/events', authenticateToken, async (req, res) => {
    try {
        const db = client.db("geotunes");
        const users = db.collection("users");
        const events = db.collection("events");

        const user = await users.findOne({ _id: new ObjectId(req.user.id) });
        if (!user || !user.savedEvents) return res.json({ savedEvents: [] });

        const savedEvents = await events.find({ _id: { $in: user.savedEvents } }).toArray();
        res.json({ savedEvents });
    } catch (error) {
        console.error("Error retrieving saved events:", error);
        res.status(500).json({ error: "Failed to retrieve saved events" });
    }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, spotify_id } = req.body;

        const db = client.db("geotunes");
        const users = db.collection("users");

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (spotify_id !== undefined) updateFields.spotify_id = spotify_id;

        const result = await users.updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: "No changes made to profile" });
        }

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

app.delete('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const db = client.db("geotunes");
        const users = db.collection("users");

        const result = await users.deleteOne({ _id: new ObjectId(req.user.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found or already deleted" });
        }

        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

app.delete('/api/user/events/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const db = client.db("geotunes");
        const users = db.collection("users");

        const result = await users.updateOne(
            { _id: new ObjectId(req.user.id) },
            { $pull: { savedEvents: new ObjectId(eventId) } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Event not found in saved list" });
        }

        res.json({ message: "Event removed from saved list" });
    } catch (error) {
        console.error("Error removing event:", error);
        res.status(500).json({ error: "Failed to remove event" });
    }
});

app.get('/api/feed', async (req, res) => {
    try {
      const { city } = req.query;
      const db = client.db('geotunes');
      const posts = await db.collection('posts')
        .find({ city })
        .sort({ timestamp: -1 })
        .toArray();
      res.json(posts);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post('/api/feed', async (req, res) => {
    try {
      const { city, content, username } = req.body;
  
      const db = client.db('geotunes');
      await db.collection('posts').insertOne({
        city,
        content,
        username: username || 'Anonymous',
        timestamp: new Date()
      });
  
      res.status(201).json({ message: 'Post created' });
    } catch (error) {
      console.error('Failed to post to feed:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
    
app.use('/feed', express.static(path.join(__dirname, 'socialFeed')));

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'socialFeed', 'social.html'));
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
