import mysql from 'mysql2/promise';

export async function connectDB() {
  try {
    const sslCa = process.env.DB_SSL_CA;

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 4000,
      ssl: sslCa ? { ca: Buffer.from(sslCa, 'utf8') } : undefined,
    });

    console.log('✅ Connected to TiDB!');
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to TiDB:', error);
    throw error;
  }
}
