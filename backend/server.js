const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = require('./app');
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
