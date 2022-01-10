// Setup dotenv only in development mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const cors = require('cors');

// Automatically delete stray uploads every 30 minutes
const { deleteStrayUploads } = require('./utils/uploads/scheduleDelete');
deleteStrayUploads();

// Connect to MongoDB server
const connectDB = require('./config/db');
connectDB();

const app = express();

//To serve static files or uploaded files
app.use('/api/v1', express.static('./public'));

// Parse request bodies as JSON
app.use(express.json());
app.use(passport.initialize());

require('./utils/auth/passport');

// Log each request using morgan
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('combined'));
}

// Enable CORS, any origin
// TODO: Restrict CORS policy in production
app.use(cors());

// Trust Reverse Proxy
app.set('trust proxy', true);

// Test Async error handling
// const asyncHandler = require('./utils/error/asyncHandler');
// app.use('/', asyncHandler((req, res)=>{
//     throw new Error('Some error occured');
//     return res.send('Done')
// }));

// Route handlers
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/listings', require('./routes/listings'));
app.use('/api/v1/testimonials', require('./routes/testimonials'));
app.use('/api/v1/callbackrequests', require('./routes/callbackrequests'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/settings', require('./routes/settings'));

app.use('*', (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: 'Page not found',
    toasts: ['Page not found']
  });
});

// For Error Handling
// app.use((err, req, res, next)=>{
//   console.log(err);
//   return res.send('Something went wrong.')
// });

// Port to listen on
const port = process.env.PORT || 5000;

app.listen(5000, () => console.log(`Express is listening on port ${port}`));
