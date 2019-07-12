const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createUser } = require('./api/db/dbGethersAndSetters');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/api/v1/auth/signup', createUser);

app.listen(port, () => `Server runnig on port ${port}`);
module.exports = app;
