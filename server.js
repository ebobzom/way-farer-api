const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const {
  createUser, signinUser, addBus, createTrip, getTrips,
} = require('./api/db/dbGethersAndSetters');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/auth/signup', createUser);
app.post('/auth/signin', signinUser);
app.post('/auth/bus', addBus);
app.post('/auth/trip', createTrip);
app.get('/auth/trip', getTrips);

app.listen(port, () => `Server runnig on port ${port}`);
module.exports = app;
