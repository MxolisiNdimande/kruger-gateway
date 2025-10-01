import express from 'express';
import { query, run } from '../database/db.js';
import { authenticateToken, requireRole } from './auth.js';

const router = express.Router();

// 🆕 MAIN ENDPOINT - GET all wildlife sightings (public)
router.get('/', async (req, res) => {
  try {
    console.log('🐾 Fetching all wildlife sightings...');
    
    // Try the enhanced query first, fallback to basic query if it fails
    let sightings;
    try {
      sightings = await query(`
        SELECT 
          ws.*,
          pg.gate_name,
          pg.location as gate_location,
          u.first_name as reporter_first_name,
          u.last_name as reporter_last_name
        FROM wildlife_sightings ws
        LEFT JOIN park_gates pg ON ws.gate_id = pg.id
        LEFT JOIN users u ON ws.reported_by = u.id
        ORDER BY ws.created_at DESC
      `);
    } catch (error) {
      console.log('⚠️ Enhanced query failed, using basic query...');
      sightings = await query(`
        SELECT 
          ws.*,
          pg.gate_name,
          pg.location as gate_location
        FROM wildlife_sightings ws
        LEFT JOIN park_gates pg ON ws.gate_id = pg.id
        ORDER BY ws.created_at DESC
      `);
    }
    
    console.log(`✅ Found ${sightings.length} wildlife sightings`);
    res.json(sightings);
  } catch (error) {
    console.error('❌ Error fetching wildlife sightings:', error);
    res.status(500).json({ error: 'Failed to fetch wildlife sightings' });
  }
});

// GET statistics summary (public) - FIXED VERSION
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching wildlife statistics...');
    
    // Total sightings count
    const totalCount = await query('SELECT COUNT(*) as count FROM wildlife_sightings');
    
    // Count by animal type
    const byAnimal = await query(`
      SELECT animal_type, COUNT(*) as count 
      FROM wildlife_sightings 
      GROUP BY animal_type 
      ORDER BY count DESC
    `);
    
    // Count by probability
    const byProbability = await query(`
      SELECT probability, COUNT(*) as count 
      FROM wildlife_sightings 
      GROUP BY probability 
      ORDER BY count DESC
    `);
    
    // Count by gate
    const byGate = await query(`
      SELECT pg.gate_name, COUNT(ws.id) as count 
      FROM park_gates pg
      LEFT JOIN wildlife_sightings ws ON pg.id = ws.gate_id
      GROUP BY pg.id 
      ORDER BY count DESC
    `);
    
    // Recent activity (last 7 days)
    const recentActivity = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM wildlife_sightings 
      WHERE created_at > datetime('now', '-7 days')
      GROUP BY DATE(created_at) 
      ORDER BY date DESC
    `);
    
    // Try to get top reporters, but handle if users table doesn't have the columns
    let topReporters = [];
    try {
      topReporters = await query(`
        SELECT 
          u.first_name,
          u.last_name,
          COUNT(ws.id) as sighting_count
        FROM wildlife_sightings ws
        JOIN users u ON ws.reported_by = u.id
        GROUP BY ws.reported_by
        ORDER BY sighting_count DESC
        LIMIT 5
      `);
    } catch (error) {
      console.log('⚠️ Top reporters query failed, skipping...');
      // If users table doesn't have the columns, just return empty array
    }
    
    res.json({
      total: totalCount[0].count,
      byAnimal,
      byProbability,
      byGate,
      recentActivity,
      topReporters,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET all gates with current sightings (public)
router.get('/gates', async (req, res) => {
  try {
    const gates = await query(`
      SELECT 
        pg.*,
        COUNT(ws.id) as sighting_count,
        MAX(ws.created_at) as last_updated
      FROM park_gates pg
      LEFT JOIN wildlife_sightings ws ON pg.id = ws.gate_id
      GROUP BY pg.id
      ORDER BY pg.gate_name
    `);
    
    res.json(gates);
  } catch (error) {
    console.error('Error fetching gates:', error);
    res.status(500).json({ error: 'Failed to fetch gates data' });
  }
});

// GET sightings for a specific gate (public)
router.get('/gates/:gateId/sightings', async (req, res) => {
  try {
    const { gateId } = req.params;
    
    let sightings;
    try {
      sightings = await query(`
        SELECT 
          ws.*,
          pg.gate_name,
          u.first_name as reporter_first_name,
          u.last_name as reporter_last_name
        FROM wildlife_sightings ws
        JOIN park_gates pg ON ws.gate_id = pg.id
        LEFT JOIN users u ON ws.reported_by = u.id
        WHERE ws.gate_id = ?
        ORDER BY ws.created_at DESC
      `, [gateId]);
    } catch (error) {
      console.log('⚠️ Enhanced gate sightings query failed, using basic query...');
      sightings = await query(`
        SELECT 
          ws.*,
          pg.gate_name
        FROM wildlife_sightings ws
        JOIN park_gates pg ON ws.gate_id = pg.id
        WHERE ws.gate_id = ?
        ORDER BY ws.created_at DESC
      `, [gateId]);
    }
    
    res.json(sightings);
  } catch (error) {
    console.error('Error fetching gate sightings:', error);
    res.status(500).json({ error: 'Failed to fetch gate sightings' });
  }
});

// GET best gates for specific animals (public)
router.get('/best-gates', async (req, res) => {
  try {
    const { animals } = req.query;
    
    if (!animals) {
      return res.status(400).json({ error: 'Animals parameter required' });
    }
    
    const animalList = animals.split(',');
    const placeholders = animalList.map(() => '?').join(',');
    
    let bestGates;
    try {
      bestGates = await query(`
        SELECT 
          pg.gate_name,
          ws.animal_type,
          ws.probability,
          ws.confidence,
          ws.notes,
          ws.created_at,
          u.first_name as reporter_first_name,
          u.last_name as reporter_last_name
        FROM wildlife_sightings ws
        JOIN park_gates pg ON ws.gate_id = pg.id
        LEFT JOIN users u ON ws.reported_by = u.id
        WHERE ws.animal_type IN (${placeholders})
          AND ws.probability IN ('high', 'medium')
          AND ws.created_at > datetime('now', '-7 days')
        ORDER BY 
          ws.probability DESC,
          ws.confidence DESC,
          ws.created_at DESC
      `, animalList);
    } catch (error) {
      console.log('⚠️ Enhanced best gates query failed, using basic query...');
      bestGates = await query(`
        SELECT 
          pg.gate_name,
          ws.animal_type,
          ws.probability,
          ws.confidence,
          ws.notes,
          ws.created_at
        FROM wildlife_sightings ws
        JOIN park_gates pg ON ws.gate_id = pg.id
        WHERE ws.animal_type IN (${placeholders})
          AND ws.probability IN ('high', 'medium')
          AND ws.created_at > datetime('now', '-7 days')
        ORDER BY 
          ws.probability DESC,
          ws.confidence DESC,
          ws.created_at DESC
      `, animalList);
    }
    
    res.json(bestGates);
  } catch (error) {
    console.error('Error fetching best gates:', error);
    res.status(500).json({ error: 'Failed to fetch best gates data' });
  }
});

// GET Big Five summary for all gates (public)
router.get('/big-five-summary', async (req, res) => {
  try {
    const bigFive = ['lion', 'elephant', 'leopard', 'rhino', 'buffalo'];
    const placeholders = bigFive.map(() => '?').join(',');
    
    const summary = await query(`
      SELECT 
        ws.*,
        pg.gate_name
      FROM wildlife_sightings ws
      JOIN park_gates pg ON ws.gate_id = pg.id
      WHERE ws.animal_type IN (${placeholders})
        AND ws.created_at > datetime('now', '-30 days')
      ORDER BY ws.created_at DESC
    `, bigFive);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching Big Five summary:', error);
    res.status(500).json({ error: 'Failed to fetch Big Five summary' });
  }
});

// GET single sighting by ID (public)
router.get('/sightings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sighting = await query(`
      SELECT 
        ws.*, 
        pg.gate_name
      FROM wildlife_sightings ws
      JOIN park_gates pg ON ws.gate_id = pg.id
      WHERE ws.id = ?
    `, [id]);
    
    if (sighting.length === 0) {
      return res.status(404).json({ error: 'Sighting not found' });
    }
    
    res.json(sighting[0]);
  } catch (error) {
    console.error('Error fetching sighting:', error);
    res.status(500).json({ error: 'Failed to fetch sighting' });
  }
});

// GET all sightings with filters (public)
router.get('/sightings', async (req, res) => {
  try {
    const { limit, offset, animal, gate, probability } = req.query;
    
    let queryStr = `
      SELECT 
        ws.*, 
        pg.gate_name
      FROM wildlife_sightings ws
      JOIN park_gates pg ON ws.gate_id = pg.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Add filters if provided
    if (animal) {
      conditions.push('ws.animal_type = ?');
      params.push(animal);
    }
    
    if (gate) {
      conditions.push('pg.gate_name = ?');
      params.push(gate);
    }
    
    if (probability) {
      conditions.push('ws.probability = ?');
      params.push(probability);
    }
    
    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryStr += ' ORDER BY ws.created_at DESC';
    
    // Add pagination if provided
    if (limit) {
      queryStr += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        queryStr += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }
    
    const sightings = await query(queryStr, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM wildlife_sightings ws 
      JOIN park_gates pg ON ws.gate_id = pg.id
    `;
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const countResult = await query(countQuery, params.slice(0, conditions.length));
    
    res.json({
      sightings,
      total: countResult[0].total,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null
    });
  } catch (error) {
    console.error('Error fetching all sightings:', error);
    res.status(500).json({ error: 'Failed to fetch sightings' });
  }
});

// Temporarily comment out the protected routes until database is fixed
/*
// POST new sighting report (protected - ranger/admin only)
router.post('/sightings', authenticateToken, requireRole('ranger'), async (req, res) => {
  // ... your protected routes
});

// Other protected routes...
*/

export default router;