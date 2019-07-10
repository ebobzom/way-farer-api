const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { config } = require('dotenv');

config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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


module.exports = {
  createUser,
};
