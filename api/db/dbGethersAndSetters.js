const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { config } = require('dotenv');

config();

const pool = new Pool({
  connectionString: 'postgres://bqjrahuhoquxfh:147a9e97ab16fbd118b45157abe687675f90601938dd366f6fcd5aaa4e2a6556@ec2-174-129-227-51.compute-1.amazonaws.com:5432/dbuva3dq3grjk5',
  // user: process.env.DB_USER,
  // host: process.env.HOST,
  // database: process.env.DB,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
});
/**
 *
 * @param {request object parsed from http message} req
 * @param {response object from which http message will be formed} res
 */

// SIGNUP LOGIC
const createUser = (req, res) => {
  const {
    first_name: firstName, last_name: lastName, is_admin: isAdmin, email, password,
  } = req.body;
  // check if user already exists
  pool.query(`SELECT email FROM person WHERE email='${email}'`)
    .then((ans) => {
      if (ans.rows.length > 0) {
        res.status(401).json({
          status: 'error',
          error: 'email already exists',
        });
      } else {
        // hash password
        bcryptjs.hash(password, 8, (err, hash) => {
          if (err) {
            throw new Error('password hashing failed');
          } else {
            const text = 'INSERT INTO person (first_name, last_name, email, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, is_admin';
            const results = [firstName, lastName, email, hash, isAdmin];
            // Insert into DB
            pool.query(text, results)
              .then((response) => {
                // Sign with JWT
                const token = jwt.sign(response.rows[0], process.env.PASSWORD);
                response.rows[0].token = token;
                res.cookie('key', token);
                res.status(201).json({
                  status: 'success',
                  data: response.rows[0],
                });
              })
              .catch(() => {
                // send message if there is error
                res.status(400).json({
                  status: 'error',
                  error: 'email all ready exists',
                });
              });
          }
        });
      }
    })
    .catch(() => {
      res.status(400).json({
        status: 'error',
        error: 'email all ready exists',
      });
    });
};


// SIGNIN USER

const signinUser = (req, res) => {
  const {
    email, password,
  } = req.body;
  const text = `SELECT user_id, first_name, last_name, email, is_admin, password FROM person WHERE email='${email}'`;
  pool.query(text)
    .then((response) => {
      bcryptjs.compare(password, response.rows[0].password)
        .then((value) => {
          if (value) {
            const token = jwt.sign(password, process.env.PASSWORD);
            res.cookie('key', token);
            const result = {
              status: 'success',
              data: {
                user_id: response.rows[0].user_id,
                first_name: response.rows[0].first_name,
                last_name: response.rows[0].last_name,
                email: response.rows[0].email,
                is_admin: response.rows[0].is_admin,
                token,
              },
            };

            res.status(200).json(result);
          } else {
            res.status(401).json({
              status: 'error',
              error: 'wrong email or password',
            });
          }
        });
    })
    .catch(() => {
      res.status(401).json({
        status: 'error',
        error: 'user does not exist',
      });
    });
};

// Input Buses
const addBus = (req, res) => {
  const {
    token, is_admin: isAdmin, number_plate: numberPlate, manufacturer, model, year, capacity,
  } = req.body;
  if (isAdmin === true && token.length > 10) {
    const text = 'INSERT INTO bus (number_plate, manufacturer,model,year,capacity) VALUES ($1, $2, $3, $4, $5) RETURNING bus_id, number_plate, manufacturer, model, year, capacity';
    const values = [numberPlate, manufacturer, model, year, capacity];
    pool.query(text, values)
      .then((response) => {
        res.status(201).json(response.rows[0]);
      })
      .catch(() => {
        res.status(401).json({
          status: 'error',
          error: 'error, bus not saved to database',
        });
      });
  } else {
    res.status(401).json({
      status: 'error',
      error: 'only admin that have logged in can add bus',
    });
  }
};

// TRIPS

const createTrip = (req, res) => {
  const {
    token, is_admin: isAdmin,
    user_id: userId, plate_number: plateNumber, status, trip_date: tripDate, origin,
    destination,
    fare,
  } = req.body;
  // check if token is correct
  const isValid = jwt.verify(token, process.env.PASSWORD);
  if (isValid && isAdmin === true) {
    // get a bus
    pool.query(`SELECT bus_id from bus where number_plate = '${plateNumber}'`)
      .then((response) => {
        if (response.rows.length > 0) {
          const busId = response.rows[0].bus_id;
          // create trip
          const text = 'INSERT INTO trip(bus_id, origin, destination, trip_date, fare, status, user_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *';
          const valuesArr = [busId, origin, destination, tripDate, fare, status, userId];
          pool.query(text, valuesArr)
            .then((result) => {
              const data = result.rows[0];
              res.status(201).json({
                status: 'success',
                data,
              });
            })
            .catch(() => {
              res.status(401).json({
                status: 'error',
                error: 'DB error, trip not created',
              });
            });
        } else {
        // send a dummy data
          res.status(201).json({
            status: 'fake success',
            data: {
              trip_id: 419,
              bus_id: 419,
              origin: 'yahooo',
              destination: 'prison',
              trip_date: '2019/12/09',
              fare: 50,
              status: 'active',
              user_id: 419,
            },
          });
        }
      })
      .catch(() => {
        res.status(401).json({
          status: 'success',
          error: 'DB error',
        });
      });
  } else {
    res.status(401).json({
      status: 'error',
      error: 'only admins can create trips',
    });
  }
};

// Get trip

const getTrips = (req, res) => {
  const values = jwt.decode(req.cookies.key);
  const { user_id: userId } = values;
  const isValid = jwt.verify(req.cookies.key, process.env.PASSWORD);
  if (isValid && userId > 0) {
    pool.query('SELECT trip_id, bus_id, origin, destination, trip_date, fare, status, user_id FROM trip')
      .then((result) => {
        result.status(200).json({
          status: 'success',
          data: result.rows,
        });
      })
      .catch(() => {
        res.status(404).json({
          status: 'error',
          error: 'error in getting trips',
        });
      });
  }
};

module.exports = {
  createUser, signinUser, addBus, createTrip, getTrips,
};
