require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Use true for Azure, false for local dev
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Change to true for local dev / self-signed certs
    }
};

let pool;

const connect = async () => {
    if (pool) {
        return pool;
    }
    try {
        pool = await new sql.ConnectionPool(dbConfig).connect();
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database Connection Failed!', err);
        pool = null; // Reset pool on failure
        throw err; // Re-throw error to be caught by the caller
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not connected. Call connect() first.');
    }
    return pool;
};

module.exports = {
    connect,
    getPool
};
