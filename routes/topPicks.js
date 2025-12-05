const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all top pick stores
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().execute('dbo.sp_TopPicks_Get');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL Error:', err.originalError);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// Remove a store from top picks
router.delete('/:store_id', async (req, res) => {
  const { store_id } = req.params;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('store_id', sql.UniqueIdentifier, store_id)
      .execute('dbo.sp_TopPicks_Remove');
    res.json({ msg: 'Store removed from top picks successfully' });
  } catch (err) {
    console.error('Error removing from top picks:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add a store to top picks
router.post('/:store_id', async (req, res) => {
  const { store_id } = req.params;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('store_id', sql.UniqueIdentifier, store_id)
      .execute('dbo.sp_TopPicks_Add');
    res.json({ msg: 'Store added to top picks successfully' });
  } catch (err) {
    console.error('Error adding to top picks:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
