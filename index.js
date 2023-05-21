const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 2000;

// mediaware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efhcwjr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const toyCollection = client.db("toyRobots").collection("AddToy");

    const indexKeys = { toyName: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "ToyName" }; // Replace index_name with the desired index name
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    // ?q=${searchQuery}

    app.get("/getToyByText/:text", async (req, res) => {
      const searchText = req.params.text;
      const src = req.query.q;
      console.log(searchText);
      // const result = await toyCollection
      //   .find({ toyName: { $regex: src, $options: "i" } })
      //   .toArray();
      // res.send(result);
    });

    app.get("/getJobsByText", async (req, res) => {
      const result = await toyCollection.find({}).toArray();
    });

    // Creating index on two fields

    app.get("/toyall", async (req, res) => {
      const result = await toyCollection.find({}).toArray();
      res.send(result);
    });

    // subCategory

    const subCategoryCollectios = client
      .db("toyRobots")
      .collection("subCategory");

    app.get("/subCategory", async (req, res) => {
      const cursor = subCategoryCollectios.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addToy", async (req, res) => {
      const addToy = req.body;

      console.log(addToy);
      const result = await toyCollection.insertOne(addToy);
      if (result?.insertedId) {
        return res.status(200).send(result);
      } else {
        return res.status(404).send({
          message: "can not insert try again leter",
          status: false,
        });
      }
    });

    app.get("/toyall/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);

      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // updateToy

    app.patch("/updatetoy/:id", async (req, res) => {
      const toyUpdate = req.body;
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          toyName: toyUpdate.name,
          price: toyUpdate.price,
          availableQuantity: toyUpdate.availableQuantity,
          rating: toyUpdate.rating,
          description: toyUpdate.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete

    app.delete("/toyall/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // myToy

    app.get("/mytoy", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // app.get("/mytoy", async (req, res) => {
    //   let query = {};
    //   if (req.query.email) {
    //     query = { email: req.query.email };
    //   }
    //   let sortOption = {};
    //   if (req.query.sort === "a") {
    //     sortOption = { price: 1 }; // Sort in ascending order
    //   } else if (req.query.sort === "desc") {
    //     sortOption = { price: -1 }; // Sort in descending order
    //   }
    //   const result = await toyCollection.find(query).sort(sortOption).toArray();
    //   res.send(result);
    // });

    // app.get('/allData:/text', async (req, res) => {
    //   const
    // } )

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Robots server in running");
});

app.listen(port, () => {
  console.log(`toy robots app listening on port ${port}`);
});
