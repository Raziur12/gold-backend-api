const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// Log a visitor interaction (e.g. favourite click)
router.post('/', async (req, res) => {
  const { session_id, user_agent, device_type, page_type, page_url, store_id } = req.body;

  if (!session_id || !page_type || !page_url || !store_id) {
    return res.status(400).json({ msg: 'session_id, page_type, page_url and store_id are required' });
  }

  // Determine IP address from request
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const ipAddress = Array.isArray(rawIp)
    ? rawIp[0]
    : (rawIp || '').split(',')[0].trim();

  try {
    const pool = db.getPool();
    await pool.request()
      .input('session_id', sql.NVarChar(100), session_id)
      .input('ip_address', sql.NVarChar(50), ipAddress)
      .input('user_agent', sql.NVarChar(500), user_agent || '')
      .input('device_type', sql.NVarChar(50), device_type || '')
      .input('page_type', sql.NVarChar(50), page_type)
      .input('page_url', sql.NVarChar(1000), page_url)
      .input('store_id', sql.UniqueIdentifier, store_id)
      .execute('dbo.sp_Visitor_Insert');

    res.json({ msg: 'Visitor logged successfully' });
  } catch (err) {
    console.error('Error logging visitor:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
