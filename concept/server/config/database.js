const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Password', // Change this to your MySQL root password
  database: 'rota_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('MySQL database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = pool;
