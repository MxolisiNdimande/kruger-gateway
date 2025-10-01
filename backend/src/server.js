import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import wildlifeRoutes from './routes/wildlife.js';
import accommodationsRoutes from './routes/accommodations.js';
import authRoutes from './routes/auth.js'; // Add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Add this
app.use('/api/wildlife', wildlifeRoutes);
app.use('/api/accommodations', accommodationsRoutes);

// ... rest of your server.js code

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🦁 Kruger Gateway Discoveries API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      setup: {
        wildlife: '/api/setup-data',
        accommodations: '/api/setup-accommodations'
      },
      wildlife: {
        all: '/api/wildlife',
        gates: '/api/wildlife/gates',
        sightings: '/api/wildlife/sightings',
        stats: '/api/wildlife/stats',
        bigFive: '/api/wildlife/big-five-summary'
      },
      accommodations: {
        all: '/api/accommodations',
        byId: '/api/accommodations/:id',
        byGate: '/api/accommodations/gate/:gateName',
        reviews: '/api/accommodations/:id/reviews'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kruger Gateway API is running!',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// Database test
app.get('/api/test-db', async (req, res) => {
  try {
    const { query } = await import('./database/db.js');
    const result = await query('SELECT datetime("now") as current_time');
    res.json({ 
      database: 'Connected successfully', 
      current_time: result[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Debug endpoint to check database content
app.get('/api/debug/data', async (req, res) => {
  try {
    const { query } = await import('./database/db.js');
    
    const gates = await query('SELECT * FROM park_gates');
    const sightings = await query('SELECT * FROM wildlife_sightings');
    const accommodations = await query('SELECT * FROM accommodations');
    const accommodationReviews = await query('SELECT * FROM accommodation_reviews');
    const accommodationImages = await query('SELECT * FROM accommodation_images');
    
    res.json({
      gates_count: gates.length,
      sightings_count: sightings.length,
      accommodations_count: accommodations.length,
      reviews_count: accommodationReviews.length,
      images_count: accommodationImages.length,
      gates: gates,
      sightings: sightings,
      accommodations: accommodations,
      reviews: accommodationReviews,
      images: accommodationImages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple GET endpoint to insert sample wildlife data
app.get('/api/setup-data', async (req, res) => {
  try {
    const { run, query } = await import('./database/db.js');
    
    console.log('🦁 Setting up sample Kruger Park data...');
    
    // Clear existing data
    await run('DELETE FROM wildlife_sightings');
    await run('DELETE FROM park_gates');
    
    // Insert park gates
    await run(`
      INSERT INTO park_gates (gate_name, description) 
      VALUES 
      ('Malelane Gate', 'Southern entrance, great for lions and elephants'),
      ('Phabeni Gate', 'Near Sabie, good for leopards and buffalo'),
      ('Numbi Gate', 'Close to Hazyview, known for rhino sightings'),
      ('Paul Kruger Gate', 'Main central gate, excellent for Big Five'),
      ('Orpen Gate', 'Western gate, great for cheetah and wild dog')
    `);
    
    // Insert wildlife sightings with current timestamps
    await run(`
      INSERT INTO wildlife_sightings 
      (gate_id, animal_type, probability, confidence, notes, created_at) 
      VALUES 
      (1, 'lion', 'high', 'confirmed', 'Pride of 12 near S25 road, including cubs. Best viewing: sunrise', datetime('now')),
      (1, 'elephant', 'medium', 'confirmed', 'Herd of 30+ moving toward Crocodile River', datetime('now')),
      (2, 'leopard', 'medium', 'confirmed', 'Regular sightings near Phabeni dam. Often in marula trees', datetime('now')),
      (2, 'buffalo', 'high', 'confirmed', 'Large herd of 200+ grazing near entrance gate', datetime('now')),
      (3, 'rhino', 'low', 'reported', 'Single white rhino spotted near Fayi Loop', datetime('now')),
      (4, 'lion', 'high', 'confirmed', 'Dominant male and pride frequenting Skukuza area', datetime('now')),
      (4, 'elephant', 'high', 'confirmed', 'Large breeding herds near Sabie River', datetime('now')),
      (5, 'leopard', 'medium', 'confirmed', 'Female with cubs seen near Orpen dam', datetime('now'))
    `);
    
    res.json({ 
      success: true, 
      message: '✅ Sample data loaded successfully! 🦁🐘',
      data_loaded: {
        gates: 5,
        sightings: 8
      },
      test_urls: [
        'http://localhost:5000/api/wildlife',
        'http://localhost:5000/api/wildlife/gates',
        'http://localhost:5000/api/wildlife/big-five-summary'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup accommodations sample data
app.get('/api/setup-accommodations', async (req, res) => {
  try {
    const { run, query } = await import('./database/db.js');
    
    console.log('🏨 Setting up sample accommodations data...');
    
    // Clear existing data
    await run('DELETE FROM accommodation_reviews');
    await run('DELETE FROM accommodation_images');
    await run('DELETE FROM accommodations');
    
    console.log('✅ Cleared existing accommodation data');
    
    // Insert sample accommodations
    const accommodationsResult = await run(`
      INSERT INTO accommodations (
        name, type, description, star_rating, guest_rating, review_count, price_range,
        amenities, location, proximity_to_gates, contact_info, website_url, booking_info,
        is_women_owned, is_eco_friendly, is_family_friendly
      ) VALUES 
      (
        'Lion Sands Game Reserve', 'Lodge', 'Luxury safari experience with river views', 5, 4.9, 234, '$$$$',
        'pool,spa,wifi,restaurant,bar,safari', 'Sabi Sand Game Reserve', 'Malelane Gate, Paul Kruger Gate',
        '+27 123 456 789', 'https://lionsands.com', 'Book directly via website or preferred travel agent',
        0, 1, 1
      ),
      (
        'Singita Lebombo Lodge', 'Lodge', 'Contemporary luxury lodge overlooking Nwanetsi River', 5, 4.8, 189, '$$$$',
        'pool,spa,wifi,restaurant,bar,game_drives', 'Kruger National Park', 'Paul Kruger Gate, Phabeni Gate',
        '+27 123 456 788', 'https://singita.com', 'Advanced booking required, all-inclusive packages',
        0, 1, 0
      ),
      (
        'Jock Safari Lodge', 'Lodge', 'First private concession in Kruger National Park', 4, 4.7, 156, '$$$',
        'pool,wifi,restaurant,bar,safari,bush_walks', 'Fitzpatrick Gate', 'Malelane Gate',
        '+27 123 456 787', 'https://jocksafarilodge.com', 'Direct booking available, family packages',
        0, 1, 1
      ),
      (
        'Hamiltons Tented Camp', 'Tented Camp', 'Luxury tented camp with vintage safari ambiance', 4, 4.6, 98, '$$$',
        'pool,wifi,restaurant,bar,game_drives', 'Imbali Safari Lodge', 'Numbi Gate',
        '+27 123 456 786', 'https://hamiltonstentedcamp.com', 'Email or phone booking, romantic packages',
        1, 1, 0
      ),
      (
        'Pafuri Camp', 'Camp', 'Wilderness experience in Kruger''s northern region', 3, 4.4, 76, '$$',
        'wifi,restaurant,bar,game_drives,bird_watching', 'Pafuri Gate', 'Punda Maria Gate',
        '+27 123 456 785', 'https://pafuricamp.com', 'Online booking, wilderness experiences',
        0, 1, 1
      ),
      (
        'Satara Rest Camp', 'Rest Camp', 'Popular camp known for excellent lion sightings', 3, 4.3, 345, '$$',
        'pool,restaurant,shop,petrol_station,campground', 'Central Kruger', 'Orpen Gate, Paul Kruger Gate',
        '+27 123 456 784', 'https://sanparks.org', 'Book via SANParks website, self-catering available',
        0, 0, 1
      )
    `);
    
    console.log('✅ Inserted 6 accommodations');
    
    // Insert sample images
    await run(`
      INSERT INTO accommodation_images (accommodation_id, image_url, caption, is_primary) VALUES
      (1, '/images/lion-sands-1.jpg', 'Main lodge area', 1),
      (1, '/images/lion-sands-2.jpg', 'Luxury suite', 0),
      (2, '/images/singita-1.jpg', 'River view suite', 1),
      (3, '/images/jock-1.jpg', 'Swimming pool area', 1),
      (4, '/images/hamiltons-1.jpg', 'Luxury tent interior', 1),
      (5, '/images/pafuri-1.jpg', 'Wilderness camp', 1),
      (6, '/images/satara-1.jpg', 'Rest camp facilities', 1)
    `);
    
    console.log('✅ Inserted 7 images');
    
    // Insert sample reviews
    await run(`
      INSERT INTO accommodation_reviews (accommodation_id, guest_name, rating, comment) VALUES
      (1, 'Sarah Johnson', 5, 'Absolutely incredible experience! The guides were knowledgeable and the accommodation was luxurious.'),
      (1, 'Michael Brown', 4, 'Wonderful stay, but quite expensive. Worth it for a special occasion.'),
      (2, 'Emma Wilson', 5, 'Best safari experience of our lives. The attention to detail was exceptional.'),
      (3, 'David Thompson', 4, 'Great family-friendly lodge. Kids loved the pool and game drives.'),
      (4, 'Lisa Chen', 5, 'Romantic and intimate. Perfect for our honeymoon.'),
      (5, 'James Miller', 4, 'Authentic wilderness experience. Bird watching was spectacular.'),
      (6, 'Karen Davis', 4, 'Great value for money. Perfect for families on a budget.')
    `);
    
    console.log('✅ Inserted 7 reviews');
    
    // Verify the data was inserted
    const accommodationsCount = await query('SELECT COUNT(*) as count FROM accommodations');
    const reviewsCount = await query('SELECT COUNT(*) as count FROM accommodation_reviews');
    const imagesCount = await query('SELECT COUNT(*) as count FROM accommodation_images');
    
    res.json({ 
      success: true, 
      message: '✅ Sample accommodations data loaded successfully! 🏨',
      data_loaded: {
        accommodations: accommodationsCount[0].count,
        images: imagesCount[0].count,
        reviews: reviewsCount[0].count
      },
      test_urls: [
        'http://localhost:5000/api/accommodations',
        'http://localhost:5000/api/accommodations/1',
        'http://localhost:5000/api/accommodations/gate/Malelane'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error setting up accommodations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to setup accommodations: ' + error.message,
      details: error.stack
    });
  }
});

// Reset all data
app.get('/api/reset-all', async (req, res) => {
  try {
    const { run } = await import('./database/db.js');
    
    await run('DELETE FROM accommodation_reviews');
    await run('DELETE FROM accommodation_images');
    await run('DELETE FROM accommodations');
    await run('DELETE FROM wildlife_sightings');
    await run('DELETE FROM park_gates');
    
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🐾 Wildlife API: http://localhost:5000/api/wildlife`);
  console.log(`🏨 Accommodations API: http://localhost:5000/api/accommodations`);
  console.log(`📊 Setup URLs:`);
  console.log(`   - Wildlife data: http://localhost:5000/api/setup-data`);
  console.log(`   - Accommodations: http://localhost:5000/api/setup-accommodations`);
  console.log(`   - Debug data: http://localhost:5000/api/debug/data`);
});