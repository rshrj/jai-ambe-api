// Setup dotenv only in development mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');

// Connect to MongoDB server
const connectDB = require('./config/db');
connectDB();

const app = express();

// Parse request bodies as JSON
app.use(express.json());
app.use(passport.initialize());

require('./utils/auth/passport');

// Log each request using morgan
app.use(morgan('combined'));

// Enable CORS, any origin
// TODO: Restrict CORS policy in production
app.use(cors());

// Test Async error handling
// const asyncHandler = require('./utils/error/asyncHandler');
// app.use('/', asyncHandler((req, res)=>{
//     throw new Error('Some error occured');
//     return res.send('Done')
// }));


// Route handlers
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/property', require('./routes/property'));
app.use('/testimonial', require('./routes/testimonial'));
app.use('/website', require('./routes/website'));

// For Error Handling
// app.use((err, req, res, next)=>{ 
//   console.log(err);
//   return res.send('Something went wrong.')
// });

// Port to listen on
const port = process.env.PORT || 5000;

app.listen(5000, () => console.log(`Express is listening on port ${port}`));
