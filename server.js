// importing express and cors
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 8000;

// importing mongodb (setting up to talk to our db)
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

// were using ejs as out template
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors());

// replaces body parser (allows us to go into the request obj)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let db,
  dbConnectionStr = process.env.DB_STRING,
  dbName = "client-tracker";

// this connects to our db
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
  (client) => {
    console.log(`Connected to ${dbName} Database`);
    db = client.db(dbName);
  }
);

// generate id for the clients (returns a promise)
function generateId() {
  return db
    .collection("clients")
    .find({}, { projection: { _id: 0 } })
    .toArray()
    .then((data) => {
      const maxId =
        data.length > 0 ? Math.max(...data.map((obj) => Number(obj.id))) : 0;
      return String(maxId + 1);
    });
}

// handle get requests from the main route
app.get("/", (request, response) => {
  db.collection("clients")
    .find({}, { projection: { _id: 0 } })
    .toArray()
    .then((data) => {
      // console.log(data);
      response.render("index.ejs", { info: data });
    })
    .catch((error) => console.error(error));
});

// handle post request from form
app.post("/addClient", async (request, response) => {
  // console.log(request.body);
  try {
    // wait for the ID to be generated
    const newId = await generateId();

    await db.collection("clients").insertOne({
      id: newId,
      name: request.body.clientName,
      email: request.body.clientEmail,
      job: request.body.clientJob,
      rate: request.body.clientRate,
    });
    console.log("client added");
    response.redirect("/"); // refreshing the page (get request)
  } catch (error) {
    console.error(error);
    response.status(500).send("Error adding client");
  }
});

// handle delete request from delete button click
app.delete("/deleteClient", (request, response) => {
  // console.log(request.body);
  db.collection("clients")
    .deleteOne({ id: request.body.id })
    .then((result) => {
      console.log("client deleted");
      response.json("client deleted");
    })
    .catch((error) => console.error(error));
});

// handle put request from update button click
app.put("/updateClient", (request, response) => {
  // console.log(request.body);
  db.collection("clients")
    .updateOne(
      { id: request.body.id }, // find the match
      {
        $set: {
          name: request.body.clientName,
          email: request.body.clientEmail,
          job: request.body.clientJob,
          rate: request.body.clientRate,
        },
      }
    )
    .then((result) => {
      console.log("updated client");
      response.json("updated client");
    })
    .catch((error) => console.error(error));
});

app.listen(PORT, () => console.log(`server is listening on port ${PORT}`));
