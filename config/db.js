const mongoose = require('mongoose');

// Get connection URI from environment vars. In development, from a .env file
const mongoURI = process.env.MONGOURI;

// Connects to the server
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.log(`MongoDB Connection Failed. Exiting: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
