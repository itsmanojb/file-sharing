require('dotenv').config()
const mongoose = require('mongoose')

function connectDB() {

  const connectionString = process.env.MONGODB_CONNECTION_URL;
  mongoose.connect(
    connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
  );

  const connection = mongoose.connection;
  connection.once('open', () => {
    console.log(`Database connected`);
  })
    .catch((err) => {
      console.log('Database connection failed', err);
      process.exit(1);
    });
}

module.exports = connectDB;