const express = require('express');
const router = express.Router();
const db = require('../config/sqlite-db');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const { checkExportDataQuota } = require('../middleware/quotaMiddleware');

// Get all tables in the database
router.get('/tables', authMiddleware, checkExportDataQuota, async (req, res) => {
  try {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching tables' });
      }
      
      const tableNames = tables.map(table => table.name);
      res.json({ tables: tableNames });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get table structure
router.get('/table/:tableName/structure', authMiddleware, checkExportDataQuota, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching table structure' });
      }
      
      res.json({ columns });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get table data
router.get('/table/:tableName/data', authMiddleware, checkExportDataQuota, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 1000, offset = 0 } = req.query;
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Get total count
    db.get(`SELECT COUNT(*) as total FROM ${tableName}`, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching data count' });
      }
      
      // Get data
      db.all(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching table data' });
        }
        
        res.json({
          data: rows,
          total: countResult.total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export table as CSV
router.get('/table/:tableName/csv', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Get table structure first
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching table structure' });
      }
      
      const columnNames = columns.map(col => col.name);
      
      // Get all data
      db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching table data' });
        }
        
        // Convert to CSV
        let csv = columnNames.join(',') + '\n';
        
        rows.forEach(row => {
          const values = columnNames.map(col => {
            const value = row[col];
            // Handle null values, escape commas and quotes
            if (value === null || value === undefined) {
              return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          });
          csv += values.join(',') + '\n';
        });
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.csv"`);
        res.send(csv);
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export table as JSON
router.get('/table/:tableName/json', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Get all data
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching table data' });
      }
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.json"`);
      res.json({
        table: tableName,
        exportedAt: new Date().toISOString(),
        totalRecords: rows.length,
        data: rows
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export entire database as JSON
router.get('/database/json', async (req, res) => {
  try {
    // Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching tables' });
      }
      
      const tableNames = tables.map(table => table.name);
      const databaseExport = {
        exportedAt: new Date().toISOString(),
        database: 'lms-database.sqlite',
        tables: {}
      };
      
      let completedTables = 0;
      
      // Export each table
      tableNames.forEach(tableName => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          completedTables++;
          
          if (!err) {
            databaseExport.tables[tableName] = {
              totalRecords: rows.length,
              data: rows
            };
          }
          
          // When all tables are processed, send the response
          if (completedTables === tableNames.length) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="lms_database_export_${Date.now()}.json"`);
            res.json(databaseExport);
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching tables' });
      }
      
      const tableNames = tables.map(table => table.name);
      const stats = {
        totalTables: tableNames.length,
        tables: {}
      };
      
      let completedTables = 0;
      
      tableNames.forEach(tableName => {
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
          completedTables++;
          
          if (!err) {
            stats.tables[tableName] = result.count;
          }
          
          if (completedTables === tableNames.length) {
            res.json(stats);
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
