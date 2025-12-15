const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all inquiries with optional status filter
router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    const pool = db.getPool();
    const request = pool.request();

    if (status) {
      request.input('status', sql.NVarChar(20), status);
    } else {
      request.input('status', sql.NVarChar(20), null);
    }

    const result = await request.execute('dbo.sp_inquiries_get_all');
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching inquiries:', err.originalError || err);
    res.status(500).json({ msg: 'Database error', error: err.message, originalError: err.originalError });
  }
});

module.exports = router;
