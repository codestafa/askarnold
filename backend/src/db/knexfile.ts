import dotenv from 'dotenv';
import path from 'path';

// Dynamically resolve the path to the .env file
const envPath = path.resolve(__dirname, "../../.env");
console.log(envPath);
dotenv.config({ path: envPath });



const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}`;

const knexfile = {
  development: {
    client: 'pg',
    connection: connectionString,
    searchPath: ['knex', 'public'],
    migrations: {
      directory: '../db/migrations',
    },
    seeds: { directory: './data/seeds' },
  },

  testing: {
    client: 'pg',
    connection: connectionString,
    searchPath: ['knex', 'public'],
    migrations: {
      directory: '../db/migrations',
    },
    seeds: { directory: './data/seeds' },
  },

  production: {
    client: 'pg',
    connection: connectionString,
    searchPath: ['knex', 'public'],
    migrations: {
      directory: '../db/migrations',
    },
    seeds: { directory: './data/seeds' },
  },
};

export default knexfile;
