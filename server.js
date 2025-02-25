const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Import the "Add a Song" routes
const addSongRoutes = require('./routes/addSongRoutes');

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
    await client.close();
    console.log("ending");
  }
}
run().catch(console.dir);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Use the "Add a Song" routes
app.use('/', addSongRoutes);

// Existing locale routes
app.get('/locale/:locale', (req, res) => {});

app.post('/locale/:locale', (req, res) => {});

app.put('/locale/:locale', (req, res) => {});

app.delete('/locale/:locale', (req, res) => {});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
