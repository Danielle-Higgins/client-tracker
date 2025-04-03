// all passport related information goes here

// one of the authentication strategies offered by Passport
// used for authenticating users with a username and password stored locally in your database
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

function initialize(passport, getUserByEmail, getUserById) {
  // function that authenticate our user
  const authenticateUser = async (email, password, done) => {
    // Fetch the user from the database using their email.
    const user = await getUserByEmail(email);
    // check if there's a user
    if (user === null) {
      return done(null, false, { message: "No user found with that email" });
    }

    try {
      // Compare the password the user enters with the hashed password stored in the database using bcrypt.compare
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        // If authentication succeeds: Pass the user object.
        return done(null, user); // Authentication successful
      } else {
        // If authentication fails: Pass false with a message.
        return done(null, false, { message: "Incorrect Password" });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      // If there’s an error: Pass the error object.
      return done(error); // had error with app
    }
  };

  // step 1. Authentication Strategy
  // we want to use local strategy, what is our username called
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  // step 2. Serialization
  // after a successful login, Passport serializes the user’s ID into the session (so they remain logged in).
  // When a user logs in, Passport calls serializeUser.
  passport.serializeUser((user, done) => {
    // You store the user’s _id (unique identifier) in the session cookie.
    done(null, user._id); // Store the user ID in the session
  });

  // step 3. Deserialization
  // When the user makes a new request, Passport retrieves the session and calls deserializeUser
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(ObjectId.createFromHexString(id)); // Convert ID to ObjectId
      done(null, user); // Attach the user object to `req.user`
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error, null);
    }
  });
}

module.exports = initialize;
