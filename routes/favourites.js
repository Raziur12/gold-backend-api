const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// Get all favourite store_ids for a visitor
router.get('/:visitor_id', async (req, res) => {
  const { visitor_id } = req.params;
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('visitor_id', sql.UniqueIdentifier, visitor_id)
      .query('SELECT store_id FROM dbo.store_favourites WHERE visitor_id = @visitor_id');
    res.json(result.recordset.map(r => r.store_id));
  } catch (err) {
    console.error('Error fetching favourites:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Add a favourite store for a visitor
router.post('/add', async (req, res) => {
  const { visitor_id, store_id } = req.body;

  if (!visitor_id || !store_id) {
    return res.status(400).json({ msg: 'visitor_id and store_id are required' });
  }

  try {
    const pool = db.getPool();
    await pool.request()
      .input('visitor_id', sql.UniqueIdentifier, visitor_id)
      .input('store_id', sql.UniqueIdentifier, store_id)
      .execute('dbo.sp_FavouriteStore_Add');
    res.json({ msg: 'Store added to favourites successfully' });
  } catch (err) {
    console.error('Error adding favourite store:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Remove a favourite store for a visitor
router.post('/remove', async (req, res) => {
  const { visitor_id, store_id } = req.body;

  if (!visitor_id || !store_id) {
    return res.status(400).json({ msg: 'visitor_id and store_id are required' });
  }

  try {
    const pool = db.getPool();
    await pool.request()
      .input('visitor_id', sql.UniqueIdentifier, visitor_id)
      .input('store_id', sql.UniqueIdentifier, store_id)
      .execute('dbo.sp_FavouriteStore_Remove');
    res.json({ msg: 'Store removed from favourites successfully' });
  } catch (err) {
    console.error('Error removing favourite store:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
