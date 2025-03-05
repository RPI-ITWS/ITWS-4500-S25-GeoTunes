const express = require('express')
const app = express()
const port = 3000
const cors = require("cors")
const path = require('path');
const bodyParser = require('body-parser');

// dangerous, must change in production
app.use(cors({
  origin: "*", // Allows any origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allows all HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allows common headers
  credentials: true // Allows cookies, authentication headers, etc.
}));
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://leei8:2sja71D1GTEUprrA@cluster0.2path.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = client.db("geotunes");

async function spotifyRequest() {
  let key = await getKey();
  let response = await fetch("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {
    headers: {
      "Authorization": `Bearer  ${key}`,
    }
  });
  let data = await response.json();
  console.log(data);
  if (data?.error?.message === "The access token expired") {
    key = await newKey();
    response = await fetch("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {
      headers: {
        "Authorization": `Bearer  ${key}`,
      }
    });
    data = await response.json();
  }
  return data;
}

async function playlistRequest(id) {
  let key = await getKey();
  let response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      "Authorization": `Bearer  ${key}`,
    }
  });
  let data = await response.json();
  console.log(data);
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

// gets a new key from spotify, places it into the database, and then returns the value
async function newKey() {
  let key = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: "grant_type=client_credentials&client_id=b931d26ffacd40e1bb2a85ff3b82df0e&client_secret=1841d9b707d445d0b4ca9821981c0cc8",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  key = await key.json();
  const collection = db.collection('api_data');
  await collection.deleteMany({});
  await collection.insertOne({ "key": key.access_token, "created_at": new Date() });
  console.log("New key:", key);
  return key.access_token;
}

async function getKey() {
  const collection = db.collection('api_data');
  const key = await collection.findOne({}, { projection: { key: 1, _id: 0 } });
  console.log("key", key);
  return key["key"];
}

async function run() {
  console.log("running");
  try {
    console.log("connecting");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error:", error);
  } finally {

  }
}

run().catch(console.dir);

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Temporary in-memory storage (replace with MongoDB later)
let songs = [];

app.get('/playlist/', async (req, res) => {
  let city = req.query.city;
  let id = "6UR7T05u7cIsNAuqUE6UV0";
  data = await playlistRequest(id);
  res.json(data);
})

app.post('/locale/:locale', async (req, res) => {
  const collection = db.collection("api_data");
  let data = await (spotifyRequest());
  console.log(data);
})

app.post('/users/signup', (req, res) => {
  console.log("Signup Post Request");
  const collection = db.collection("users");
  const body = req.body;
  console.log(body);
  const name = body.name;
  const spotifyId = body.spotify_id;
  const password = body.password;
  const email = body.email;
  collection.insertOne({ "name": name, "spotify_id": spotifyId, "password": password, "email": email });
  console.log("added user");
  res.json({ "success": true })
})

app.post('/users/login', async (req, res) => {
  console.log("Login Post Request");
  const collection = db.collection("users");
  const body = req.body;
  console.log(body);
  const email = body.email;
  const password = body.password;
  const account = await collection.findOne({ "email": email }, { projection: { email: 1, password: 1, _id: 0 } });
  if (account === null) {
    console.log("No Account");
    res.json({ "success": false });
  } else {
    console.log("email: " + account.email + " password: " + account.password);
    if (account.password === password) {
      res.json({ "success": true })
    }
    else {
      res.json({ "success": false });
    }
  }
})

// Serve "Add a Song" HTML page
app.get('/add-song', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-song.html'));
});


// Handle song submission
app.post('/add-song', (req, res) => {
  const { title, artist } = req.body;
  if (title && artist) {
    songs.push({ title, artist });
    res.status(201).send({ message: "Song added successfully!" });
  } else {
    res.status(400).send({ error: "Invalid song data" });
  }
});

// Get playlist (for frontend)
app.get('/get-songs', (req, res) => {
  res.json(songs);
});

app.get('/newkey', async (req, res) => {
  await newKey();
})

// Existing Locale Routes (unchanged)
app.get('/locale/:locale', (req, res) => { });

app.put('/locale/:locale', (req, res) => { });

app.delete('/locale/:locale', (req, res) => { });

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
