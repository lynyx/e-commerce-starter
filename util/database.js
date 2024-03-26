require('dotenv').config({ path: `./environments/${process.env.NODE_ENV}.env` });
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

let _db;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const mongoConnect = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    _db = client.db('shop');
    
    // Send a ping to confirm a successful connection
    await _db.command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (e) {
    console.error('Error while connecting to MongoDB:', e.message);
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  
  throw new Error('DB not found');
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
exports.client = client;
