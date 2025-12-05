const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().execute('dbo.sp_Subscription_GetAll');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// GET a single subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .execute('dbo.sp_Subscription_GetById');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// CREATE a new subscription
router.post('/', async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('price', sql.Decimal(10, 2), price)
      .input('billing_cycle', sql.NVarChar(100), billing_cycle)
      .input('features', sql.NVarChar(500), features)
      .execute('dbo.sp_Subscription_Create');
    res.json({ msg: 'Subscription created successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// UPDATE a subscription
router.put('/:id', async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('name', sql.NVarChar(100), name)
      .input('price', sql.Decimal(10, 2), price)
      .input('billing_cycle', sql.NVarChar(100), billing_cycle)
      .input('features', sql.NVarChar(500), features)
      .execute('dbo.sp_Subscription_Update');
    res.json({ msg: 'Subscription updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE a subscription
router.delete('/:id', async (req, res) => {
  try {
    const pool = db.getPool();
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .execute('dbo.sp_Subscription_Delete');
    res.json({ msg: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
