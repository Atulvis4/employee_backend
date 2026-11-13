import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'employee_dir',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
});

export const promisePool = pool.promise();

// Ensure the employees table exists
export const initializeDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to MySQL successfully via connection pool.');
    await connection.query(createTableQuery);
    console.log('Employees table verified/created.');
    connection.release();
  } catch (error) {
    console.error('Database connection/initialization error:', error.message);
  }
};

export default promisePool;
