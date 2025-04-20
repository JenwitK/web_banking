import mysql from 'mysql2/promise';
import fs from 'fs';


export async function connectDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
      ca: fs.readFileSync(process.env.DB_SSL_CA),
    },
  });

  return connection;
}
