// reference https://www.geekster.in/articles/dotenv-npm-package/#:~:text=The%20dotenv%20npm%20Package%20provides,out%20of%20the%20source%20code.
console.log('Server starting...');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const signupRoutes = require('./routes/signup');
const destinationRoutes = require('./routes/destinations');
const hotelsRoutes = require('./routes/hotels');

app.use('/api/signup', signupRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

