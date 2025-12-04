const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all stores
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().query('SELECT * FROM stores WHERE is_deleted = 0');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL Error:', err.originalError); // Log the original SQL error
    res.status(500).json({ msg: 'Database error', error: err.message, originalError: err.originalError });
  }
});

// GET a single store by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = db.getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, id)
      .execute('dbo.sp_Store_GetById');
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ msg: 'Store not found' });
    }
  } catch (err) {
    console.error('SQL Error:', err.originalError); // Log the original SQL error
    res.status(500).json({ msg: 'Database error', error: err.message, originalError: err.originalError });
  }
});

// CREATE a new store
router.post('/', async (req, res) => {
  const { name, owner_name, email, phone, address, website, logo_url, plan_id, plan_expiry_date, price_916, price_999 } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('Name', sql.NVarChar(255), name)
      .input('OwnerName', sql.NVarChar(200), owner_name)
      .input('Email', sql.NVarChar(254), email)
      .input('Phone', sql.NVarChar(30), phone)
      .input('Address', sql.NVarChar(500), address)
      .input('Website', sql.NVarChar(500), website)
      .input('LogoUrl', sql.NVarChar(1000), logo_url)
      .input('PlanId', sql.UniqueIdentifier, plan_id)
      .input('PlanExpiaryDate', sql.DateTime2, plan_expiry_date)
      .input('Price916', sql.Decimal(12, 2), price_916)
      .input('Price999', sql.Decimal(12, 2), price_999)
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
      .input('Id', sql.UniqueIdentifier, id)
      .input('Name', sql.NVarChar(255), name)
      .input('OwnerName', sql.NVarChar(200), owner_name)
      .input('Email', sql.NVarChar(254), email)
      .input('Phone', sql.NVarChar(30), phone)
      .input('Address', sql.NVarChar(500), address)
      .input('Website', sql.NVarChar(500), website)
      .input('LogoUrl', sql.NVarChar(1000), logo_url)
      .input('PlanId', sql.UniqueIdentifier, plan_id)
      .input('PlanExpiaryDate', sql.DateTime2, plan_expiry_date)
      .input('Price916', sql.Decimal(12, 2), price_916)
      .input('Price999', sql.Decimal(12, 2), price_999)
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
      .input('Id', sql.UniqueIdentifier, id)
      .execute('dbo.sp_Store_Delete');
    res.json({ msg: 'Store deleted successfully' });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
