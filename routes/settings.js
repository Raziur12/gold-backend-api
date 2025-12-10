const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all settings
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().execute('dbo.sp_get_all_settings');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// GET single setting by key
router.get('/:key', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('key', sql.NVarChar(100), req.params.key)
      .execute('dbo.sp_get_setting');

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ msg: 'Setting not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// CREATE or UPDATE setting (upsert)
router.post('/', async (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ msg: 'key is required' });
  }

  try {
    const pool = db.getPool();
    await pool.request()
      .input('key', sql.NVarChar(100), key)
      .input('value', sql.NVarChar(500), value ?? '')
      .execute('dbo.sp_create_setting');

    res.json({ msg: 'Setting saved successfully' });
  } catch (err) {
    console.error('Error saving setting:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// DELETE setting by key
router.delete('/:key', async (req, res) => {
  try {
    const pool = db.getPool();
    await pool.request()
      .input('key', sql.NVarChar(100), req.params.key)
      .execute('dbo.sp_delete_setting');

    res.json({ msg: 'Setting deleted successfully' });
  } catch (err) {
    console.error('Error deleting setting:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

module.exports = router;
