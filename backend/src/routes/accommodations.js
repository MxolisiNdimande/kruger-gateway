import express from 'express';
import { query, run } from '../database/db.js';

const router = express.Router();

// GET all accommodations with filters
router.get('/', async (req, res) => {
  try {
    const { type, minRating, maxPrice, amenities, gateProximity, featured } = req.query;
    
    let queryStr = `
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ai.image_url) as images,
        AVG(ar.rating) as average_rating,
        COUNT(ar.id) as total_reviews
      FROM accommodations a
      LEFT JOIN accommodation_images ai ON a.id = ai.accommodation_id
      LEFT JOIN accommodation_reviews ar ON a.id = ar.accommodation_id
      WHERE 1=1
    `;
    
    const conditions = [];
    const params = [];
    
    // Apply filters
    if (type) {
      conditions.push('a.type = ?');
      params.push(type);
    }
    
    if (minRating) {
      conditions.push('(a.guest_rating >= ? OR a.star_rating >= ?)');
      params.push(parseFloat(minRating), parseInt(minRating));
    }
    
    if (maxPrice) {
      const priceMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
      const maxPriceValue = priceMap[maxPrice];
      conditions.push('CASE a.price_range WHEN "$" THEN 1 WHEN "$$" THEN 2 WHEN "$$$" THEN 3 WHEN "$$$$" THEN 4 END <= ?');
      params.push(maxPriceValue);
    }
    
    if (amenities) {
      const amenityList = amenities.split(',');
      amenityList.forEach(amenity => {
        conditions.push('a.amenities LIKE ?');
        params.push(`%${amenity}%`);
      });
    }
    
    if (gateProximity) {
      conditions.push('a.proximity_to_gates LIKE ?');
      params.push(`%${gateProximity}%`);
    }
    
    if (featured === 'true') {
      conditions.push('a.guest_rating >= 4.5');
    }
    
    if (conditions.length > 0) {
      queryStr += ' AND ' + conditions.join(' AND ');
    }
    
    queryStr += ' GROUP BY a.id ORDER BY a.guest_rating DESC, a.star_rating DESC';
    
    console.log('🏨 Fetching accommodations with query:', queryStr, 'Params:', params);
    
    const accommodations = await query(queryStr, params);
    
    // Process images from string to array and ensure guest_rating is number
    const processedAccommodations = accommodations.map(acc => ({
      ...acc,
      images: acc.images ? acc.images.split(',') : [],
      average_rating: acc.average_rating ? parseFloat(acc.average_rating).toFixed(1) : null,
      guest_rating: parseFloat(acc.guest_rating) || 0,
      star_rating: parseInt(acc.star_rating) || 0,
      review_count: parseInt(acc.review_count) || 0
    }));
    
    console.log(`✅ Found ${processedAccommodations.length} accommodations`);
    res.json(processedAccommodations);
  } catch (error) {
    console.error('❌ Error fetching accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations: ' + error.message });
  }
});

// GET single accommodation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🏨 Fetching accommodation with ID: ${id}`);
    
    const accommodation = await query(`
      SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT ai.image_url) as images,
        AVG(ar.rating) as average_rating,
        COUNT(ar.id) as total_reviews
      FROM accommodations a
      LEFT JOIN accommodation_images ai ON a.id = ai.accommodation_id
      LEFT JOIN accommodation_reviews ar ON a.id = ar.accommodation_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (accommodation.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found' });
    }
    
    const reviews = await query(
      'SELECT * FROM accommodation_reviews WHERE accommodation_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const result = {
      ...accommodation[0],
      images: accommodation[0].images ? accommodation[0].images.split(',') : [],
      average_rating: accommodation[0].average_rating ? parseFloat(accommodation[0].average_rating).toFixed(1) : null,
      guest_rating: parseFloat(accommodation[0].guest_rating) || 0,
      star_rating: parseInt(accommodation[0].star_rating) || 0,
      review_count: parseInt(accommodation[0].review_count) || 0,
      reviews: reviews
    };
    
    console.log(`✅ Found accommodation: ${result.name}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching accommodation:', error);
    res.status(500).json({ error: 'Failed to fetch accommodation' });
  }
});

// POST new accommodation
router.post('/', async (req, res) => {
  try {
    const {
      name, type, description, star_rating, guest_rating, price_range,
      amenities, location, proximity_to_gates, contact_info, website_url,
      booking_info, is_women_owned, is_eco_friendly, is_family_friendly
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    console.log(`🏨 Creating new accommodation: ${name}`);
    
    const result = await run(
      `INSERT INTO accommodations (
        name, type, description, star_rating, guest_rating, price_range,
        amenities, location, proximity_to_gates, contact_info, website_url,
        booking_info, is_women_owned, is_eco_friendly, is_family_friendly
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, type, description, star_rating, guest_rating, price_range,
        amenities, location, proximity_to_gates, contact_info, website_url,
        booking_info, is_women_owned || 0, is_eco_friendly || 0, is_family_friendly || 0
      ]
    );
    
    const newAccommodation = await query(
      'SELECT * FROM accommodations WHERE id = ?',
      [result.id]
    );
    
    console.log(`✅ Created accommodation with ID: ${result.id}`);
    res.status(201).json(newAccommodation[0]);
  } catch (error) {
    console.error('❌ Error creating accommodation:', error);
    res.status(500).json({ error: 'Failed to create accommodation' });
  }
});

// POST new review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { guest_name, rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }
    
    console.log(`🏨 Adding review for accommodation ID: ${id}`);
    
    await run(
      'INSERT INTO accommodation_reviews (accommodation_id, guest_name, rating, comment) VALUES (?, ?, ?, ?)',
      [id, guest_name, rating, comment]
    );
    
    // Update accommodation's average rating
    const avgResult = await query(
      'SELECT AVG(rating) as new_rating, COUNT(*) as review_count FROM accommodation_reviews WHERE accommodation_id = ?',
      [id]
    );
    
    await run(
      'UPDATE accommodations SET guest_rating = ?, review_count = ?, updated_at = datetime("now") WHERE id = ?',
      [avgResult[0].new_rating, avgResult[0].review_count, id]
    );
    
    console.log(`✅ Added review for accommodation ID: ${id}`);
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// GET accommodations by gate proximity
router.get('/gate/:gateName', async (req, res) => {
  try {
    const { gateName } = req.params;
    
    console.log(`🏨 Fetching accommodations near gate: ${gateName}`);
    
    const accommodations = await query(`
      SELECT a.*, AVG(ar.rating) as average_rating
      FROM accommodations a
      LEFT JOIN accommodation_reviews ar ON a.id = ar.accommodation_id
      WHERE a.proximity_to_gates LIKE ?
      GROUP BY a.id
      ORDER BY a.guest_rating DESC
    `, [`%${gateName}%`]);
    
    console.log(`✅ Found ${accommodations.length} accommodations near ${gateName}`);
    res.json(accommodations);
  } catch (error) {
    console.error('❌ Error fetching accommodations by gate:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

export default router;