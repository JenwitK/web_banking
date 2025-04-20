import mysql from 'mysql2/promise';

export async function connectDB() {
  try {
    // แปลง '\n' ให้เป็นบรรทัดใหม่จริง ๆ
    const sslCa = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: sslCa ? { ca: sslCa } : undefined,
    });

    console.log('✅ Connected to TiDB!');
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to TiDB:', error);
    throw error;
  }
}
