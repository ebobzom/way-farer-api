const pg = require('pg');

const con = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
con.connect();
con.query('drop table if exists person');

con.query('create table person(user_id serial primary key not null, first_name varchar(50) not null, last_name varchar(50) not null, password varchar not null, is_admin boolean not null, email varchar(50) not null)', () => {
  con.end();
});
