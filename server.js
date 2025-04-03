const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 8000;

// importing mongodb (setting up to talk to our db)
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

// password hashing and hash comparison
// commonly used for securely storing passwords in databases
const bcrypt = require("bcrypt");

// step 1. Passport Setup
const passport = require("passport"); // The main middleware for authentication.
// Enables flash messages for showing errors (e.g., invalid login attempts)
const flash = require("express-flash");
// Manages sessions to persist user login state across requests
const session = require("express-session");

// step 2. Passport Initialization
// configure Passport in your server.js and provide the helper functions for retrieving users from your database.
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => await db.collection("users").findOne({ email }), // Fetch user by email
  async (id) => await db.collection("users").findOne({ _id: id }) // Fetch user by ID
);

// were using ejs as our template
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors());

// replaces body parser (allows us to go into the request obj)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(flash()); // using flash

// step 3. Session Setup
// This sets up Express sessions, necessary for Passport to store authenticated user data.
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Used to sign and encrypt the session cookie
    resave: false, // Prevents resaving session if unchanged
    saveUninitialized: false, // Prevents saving empty sessions
  })
); // manage user sessions

// step 4. Passport Middleware
// Activates Passport for your app
app.use(passport.initialize()); // Initialize Passport middleware
// Enables Passport to store and retrieve user data across requests
app.use(passport.session()); // store variables to be persisted across the session

let db,
  dbConnectionStr = process.env.DB_STRING,
  dbName = "client-tracker";

// this connects to our db
MongoClient.connect(dbConnectionStr).then((client) => {
  console.log(`Connected to ${dbName} Database`);
  db = client.db(dbName);
});

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

// Ensure users can only access certain pages (like /) if they're logged in
function checkAuthenticated(request, response, next) {
  // check if there's a user thats authenticated
  if (request.isAuthenticated()) {
    return next();
  }
  response.redirect("/login");
}

function checkNotAuthenticated(request, response, next) {
  if (request.isAuthenticated()) {
    return response.redirect("/");
  }
  next();
}

app.get("/login", checkNotAuthenticated, (request, response) => {
  // This passes the flash messages to the EJS template under the messages variable.
  response.render("login.ejs", { messages: request.flash() });
});

app.get("/register", checkNotAuthenticated, (request, response) => {
  response.render("register.ejs");
});

// handle get requests from the main route
app.get("/", checkAuthenticated, (request, response) => {
  db.collection("clients")
    .find({ userId: request.user._id })
    .toArray()
    .then((data) => {
      // console.log(data);
      response.render("index.ejs", { info: data });
    })
    .catch((error) => console.error(error));
});

// /login post route to authenticate users using Passport
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/", // Redirect to the main page on success
    failureRedirect: "/login", // Redirect back to the login page on failure
    failureFlash: true, // Enable flash messages for failed logins
  })
);

app.post("/register", checkNotAuthenticated, async (request, response) => {
  // create new user with correct hashed password
  try {
    // hash the password which we can store in db
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    await db.collection("users").insertOne({
      name: request.body.name,
      email: request.body.email,
      password: hashedPassword,
    });
    response.redirect("/login");
  } catch (error) {
    console.error(error);
    response.redirect("/register");
  }
});

app.post("/logout", (request, response) => {
  // clears the user’s session and removes their authentication state
  request.logOut((error) => {
    if (error) {
      console.error("Error during logout:", error);
      return response.status(500).send("Logout failed");
    }
    response.redirect("/login");
  });
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
      userId: request.user._id, // Link to logged-in user
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

/*
Why This Works Together
1. Authentication: The LocalStrategy validates users.
2. Session Management: The user’s _id is stored in the session, enabling persistence.
3. Route Protection: Middleware like checkAuthenticated ensures only logged-in users access protected routes.
*/

app.listen(PORT, () => console.log(`server is listening on port ${PORT}`));
