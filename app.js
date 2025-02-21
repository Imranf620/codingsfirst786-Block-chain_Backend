require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;
const Function = require('./Functions');
const Worker = require('./Worker');
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL;

app.use(bodyParser.json());
app.use(cors());

const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Retrying connection to MongoDB...');
    setTimeout(connectToMongo, 5000);
  }
};

connectToMongo();

app.post('/api/profile', Function.ProfileCreation);
app.put('/update/profile/:id', Function.updateUserProfile);
app.get('/user/:walletAddress', Function.getUserByWalletAddress);
app.get('/refferal/:ID', Function.UserRefferalData);
app.get('/getMembers/:ID', Function.TotalDataApi);
app.get('/getalldata/:ID', Function.fetchReferredUsers);
app.get('/get24hrsUSDT', Function.getLast24HoursUSDT);

setInterval(Worker.WorkerFun, 10000);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
