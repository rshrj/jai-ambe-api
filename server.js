// Setup dotenv only in development mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const passport = require("passport");

// Connect to MongoDB server
const connectDB = require("./config/db");
connectDB();

const app = express();

app.use(express.static("./public"));

// Parse request bodies as JSON
app.use(express.json());
app.use(passport.initialize());

require("./utils/auth/passport");

// Route handlers
app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/property", require("./routes/property"));
app.use("/testimonial", require("./routes/testimonial"));
app.use("/website", require("./routes/website"));

// Port to listen on
const port = process.env.PORT || 5000;

app.listen(5000, () => console.log(`Express is listening on port ${port}`));
