// all passport related information goes here

// one of the authentication strategies offered by Passport
// used for authenticating users with a username and password stored locally in your database
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

function initialize(passport, getUserByEmail, getUserById) {
  // function that authenticate our user
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email); // get user by email
    // check if there's a user
    if (user === null) {
      return done(null, false, { message: "No user found with that email" });
    }

    try {
      // check if the passwords match
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        return done(null, user); // Authentication successful
      } else {
        return done(null, false, { message: "Incorrect Password" });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return done(error); // had error with app
    }
  };

  // we want to use local strategy, what is our username called
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  // after a successful login, Passport serializes the user’s ID into the session (so they remain logged in).
  passport.serializeUser((user, done) => {
    done(null, user._id); // Store the user ID in the session
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(ObjectId.createFromHexString(id)); // Convert ID to ObjectId
      done(null, user);
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error, null);
    }
  });
}

module.exports = initialize;
