const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all stores
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().query('SELECT * FROM stores');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL Error:', err.originalError); // Log the original SQL error
    res.status(500).json({ msg: 'Database error', error: err.message, originalError: err.originalError });
  }
});

// CREATE a new store
router.post('/', async (req, res) => {
  const { name, email, phone, address, website, logo_url, plan_id, plan_expiry_date, price_916, price_999 } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('name', sql.NVarChar(255), name)
      .input('email', sql.NVarChar(255), email)
      .input('phone', sql.NVarChar(50), phone)
      .input('address', sql.NVarChar(500), address)
      .input('website', sql.NVarChar(255), website)
      .input('logo_url', sql.NVarChar(500), logo_url)
      .input('plan_id', sql.UniqueIdentifier, plan_id)
      .input('plan_expiry_date', sql.Date, plan_expiry_date)
      .input('price_916', sql.Decimal(10, 2), price_916)
      .input('price_999', sql.Decimal(10, 2), price_999)
      .execute('dbo.sp_Store_Create');
    res.status(201).json({ msg: 'Store created successfully' });
  } catch (err) {
    console.error('Error creating store:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message, originalError: err.originalError });
  }
});

// UPDATE a store
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, owner_name, email, phone, address, website, logo_url, plan_id, plan_expiry_date, price_916, price_999 } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(255), name)
      .input('owner_name', sql.NVarChar(255), owner_name)
      .input('email', sql.NVarChar(255), email)
      .input('phone', sql.NVarChar(50), phone)
      .input('address', sql.NVarChar(500), address)
      .input('website', sql.NVarChar(255), website)
      .input('logo_url', sql.NVarChar(500), logo_url)
      .input('plan_id', sql.UniqueIdentifier, plan_id)
      .input('plan_expiry_date', sql.Date, plan_expiry_date)
      .input('price_916', sql.Decimal(10, 2), price_916)
      .input('price_999', sql.Decimal(10, 2), price_999)
      .execute('dbo.sp_Store_Update');
    res.json({ msg: 'Store updated successfully' });
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE a store
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .execute('dbo.sp_Store_Delete');
    res.json({ msg: 'Store deleted successfully' });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
