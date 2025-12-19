const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET trends data filtered by store, metric, and time range
router.get('/', async (req, res) => {
  try {
    const { storeId, metric, range } = req.query;
    
    const pool = db.getPool();
    
    // If metric is 'visitors', return visitor stats
    if (metric === 'visitors') {
      const visitorResult = await pool.request().execute('dbo.sp_GetUniqueVisitors');
      const live = visitorResult.recordset[0] || {};
      
      // Build time-series data based on range
      let data = [];
      const now = new Date();
      
      switch (range) {
        case '1D':
          // Generate hourly data for 24 hours
          for (let i = 23; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.H24 || 0) * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        case '7D':
          // Generate daily data for 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.D7 || 0) / 7 * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        case '1M':
          // Generate daily data for 30 days
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.M1 || 0) / 30 * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        case '3M':
          // Generate weekly data for 3 months
          for (let i = 12; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.M3 || 0) / 13 * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        case '6M':
          // Generate weekly data for 6 months
          for (let i = 25; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.M6 || 0) / 26 * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        case '1Y':
          // Generate monthly data for 1 year
          for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
            data.push({
              date: date.toISOString(),
              value: Math.floor((live.Y1 || 0) / 12 * (0.8 + Math.random() * 0.4))
            });
          }
          break;
        default:
          data = [];
      }
      
      return res.json({ data, metric: 'visitors', range });
    }
    
    // For gold prices (916 or 999)
    if (!storeId) {
      return res.status(400).json({ msg: 'storeId is required for price metrics' });
    }
    
    // Get current store price
    const storeResult = await pool.request()
      .input('Id', sql.UniqueIdentifier, storeId)
      .execute('dbo.sp_Store_GetById');
    
    if (storeResult.recordset.length === 0) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    const store = storeResult.recordset[0];
    const basePrice = metric === 'gold916' ? store.price_916 : store.price_999;
    
    if (!basePrice) {
      return res.json({ data: [], metric, range, storeId });
    }
    
    // Generate synthetic time-series data based on range
    let data = [];
    const now = new Date();
    
    switch (range) {
      case '1D':
        // Hourly data for 24 hours
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.02; // ±1% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      case '7D':
        // Daily data for 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.03; // ±1.5% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      case '1M':
        // Daily data for 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.04; // ±2% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      case '3M':
        // Weekly data for 3 months
        for (let i = 12; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.05; // ±2.5% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      case '6M':
        // Weekly data for 6 months
        for (let i = 25; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.06; // ±3% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      case '1Y':
        // Monthly data for 1 year
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
          const variance = (Math.random() - 0.5) * 0.08; // ±4% variance
          data.push({
            date: date.toISOString(),
            value: parseFloat((basePrice * (1 + variance)).toFixed(2))
          });
        }
        break;
      default:
        data = [];
    }
    
    res.json({ data, metric, range, storeId, storeName: store.name });
  } catch (err) {
    console.error('Error fetching trends:', err);
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

module.exports = router;
