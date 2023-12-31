const express = require('express');
const app = express();
// var jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dncugdy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usercollection = client.db("bistroDb").collection("users");
        const menucollection = client.db("bistroDb").collection("menu");
        const reviewscollection = client.db("bistroDb").collection("reviews");
        const cartscollection = client.db("bistroDb").collection("carts");
        app.get('/menu', async (req, res) => {
            const result = await menucollection.find().toArray();
            res.send(result)
        })
        app.get('/reviews', async (req, res) => {
            const result = await reviewscollection.find().toArray();
            res.send(result)
        })

        // user related api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usercollection.findOne(query);
            if (existingUser) {
                return res.send({message: 'user already exists', insertedId: null })
            }
            const result = await usercollection.insertOne(user)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const result = await usercollection.find().toArray();
            res.send(result)
        })
        app.patch('/users/admin/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updateDoc ={
                $set:{
                    role: 'admin'                
                }
            }
            const result = await usercollection.updateOne(filter, updateDoc);
            res.send(result)

        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usercollection.deleteOne(query);
            res.send(result)
        })
        // carts collection

        app.post('/carts', async (req, res) => {
            const cartItem = req.body;
            const result = await cartscollection.insertOne(cartItem)
            res.send(result)
        })
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await cartscollection.find(query).toArray();
            res.send(result)
        })
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartscollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('boss is sitting')
})
app.listen(port, () => {
    console.log(`bistro boss is running ${port}`)
})