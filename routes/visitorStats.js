const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET visitor stats: live counts from sp_GetUniqueVisitors + manual counts from unique_visitor table
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();

    // Live counts from stored procedure
    const liveResult = await pool.request().execute('dbo.sp_GetUniqueVisitors');
    const liveRow = liveResult.recordset && liveResult.recordset[0] ? liveResult.recordset[0] : null;

    // Manual counts from unique_visitor table
    const manualResult = await pool.request()
      .query('SELECT id, title, visitor_count, created_at, updated_at FROM dbo.unique_visitor ORDER BY created_at');

    res.json({
      live: liveRow,
      manual: manualResult.recordset || [],
    });
  } catch (err) {
    console.error('Error fetching visitor stats:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// UPDATE manual visitor counts in unique_visitor table
router.post('/manual', async (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: 'items array required' });
  }

  try {
    const pool = db.getPool();

    // Update each row by id
    for (const item of items) {
      if (!item.id || typeof item.visitor_count !== 'number') continue;

      await pool.request()
        .input('id', sql.UniqueIdentifier, item.id)
        .input('visitor_count', sql.Int, item.visitor_count)
        .query('UPDATE dbo.unique_visitor SET visitor_count = @visitor_count, updated_at = SYSUTCDATETIME() WHERE id = @id');
    }

    res.json({ msg: 'Manual visitor counts updated successfully' });
  } catch (err) {
    console.error('Error updating manual visitor counts:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

module.exports = router;
