const express = require('express')
const app = express()
const port = 3000

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

async function spotifyRequest() {
  let key = getKey();
  let data = await fetch("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {
    headers: {
      "Authorization": `Bearer  ${key}`,
    }
  });
  if (data["error"]["message"] === "The access token expired") {
    key = await newKey();
    data = await fetch("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {
      headers: {
        "Authorization": `Bearer  ${key}`,
      }
    });
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
  const db = client.db("geotunes");
  const collection = db.collection('api_data');
  collection.dropIndexes();
  collection.insertOne({ "key": key });
  return key["access_token"];
}

async function getKey() {
  const db = client.db("geotunes");
  const collection = db.collection('api_data');
  const key = await collection.findOne({}, { projection: { key: 1, _id: 0 } });
  return key["key"];
}

async function run() {
  console.log("running");
  try {
    console.log("connecting");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Ensures that the client will close when you finish/error
  }
}

run().catch(console.dir);

app.use(express.static('public'))

app.get('/locale/:locale', (req, res) => {
})

app.post('/locale/:locale', (req, res) => {
  const db = client.db("geotunes");
  const collection = db.collection("api_data");
  const key = collection.find("key");
})

app.put('/locale/:locale', (req, res) => {
})

app.delete('/locale/:locale', (req, res) => {
})

app.listen(port, () => {
  console.log('Listening on *:3000')
})

