import mysql from 'mysql2/promise';

export async function connectDB() {
  const sslBase64 = process.env.DB_SSL_CA_BASE64;
  const sslBuffer = sslBase64 ? Buffer.from(sslBase64, 'base64').toString('utf8') : undefined;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 4000),
    ssl: sslBuffer ? { ca: sslBuffer } : undefined,
  });

  return connection;
}
