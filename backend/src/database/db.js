import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'kruger_gateway.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initDB();
  }
});

// Initialize database tables
const initDB = () => {
  // Enhanced Users table with authentication support
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'visitor',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table created/verified');
      createDefaultUsers();
    }
  });

  // Park gates table
  db.run(`
    CREATE TABLE IF NOT EXISTS park_gates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gate_name TEXT UNIQUE NOT NULL,
      description TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating park_gates table:', err);
    } else {
      console.log('✅ Park gates table created/verified');
      createSampleGates();
    }
  });

  // Enhanced Wildlife sightings table with reporter support
  db.run(`
    CREATE TABLE IF NOT EXISTS wildlife_sightings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gate_id INTEGER,
      animal_type TEXT NOT NULL,
      probability TEXT NOT NULL,
      confidence TEXT NOT NULL,
      notes TEXT,
      reported_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (gate_id) REFERENCES park_gates(id),
      FOREIGN KEY (reported_by) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating wildlife_sightings table:', err);
    } else {
      console.log('✅ Wildlife sightings table created/verified');
    }
  });

  // Accommodations table
  db.run(`
    CREATE TABLE IF NOT EXISTS accommodations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      star_rating INTEGER,
      guest_rating REAL,
      review_count INTEGER DEFAULT 0,
      price_range TEXT,
      amenities TEXT,
      location TEXT,
      proximity_to_gates TEXT,
      contact_info TEXT,
      website_url TEXT,
      booking_info TEXT,
      is_women_owned INTEGER DEFAULT 0,
      is_eco_friendly INTEGER DEFAULT 0,
      is_family_friendly INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating accommodations table:', err);
    } else {
      console.log('✅ Accommodations table created/verified');
    }
  });

  // Accommodation reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS accommodation_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accommodation_id INTEGER,
      guest_name TEXT,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating accommodation_reviews table:', err);
    } else {
      console.log('✅ Accommodation reviews table created/verified');
    }
  });

  // Accommodation images table
  db.run(`
    CREATE TABLE IF NOT EXISTS accommodation_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accommodation_id INTEGER,
      image_url TEXT NOT NULL,
      caption TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating accommodation_images table:', err);
    } else {
      console.log('✅ Accommodation images table created/verified');
    }
  });

  console.log('✅ Database tables initialized');
};

// Create default users
const createDefaultUsers = () => {
  // Check if users already exist
  db.get('SELECT COUNT(*) as count FROM users', async (err, result) => {
    if (err) {
      console.log('⚠️ Could not check users table, might be first run');
      return;
    }

    if (result.count === 0) {
      console.log('👤 Creating default users...');
      
      try {
        const saltRounds = 12;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const rangerPassword = await bcrypt.hash('ranger123', saltRounds);
        const visitorPassword = await bcrypt.hash('visitor123', saltRounds);

        // Insert default users one by one to avoid transaction issues
        const users = [
          ['admin@krugerpark.com', adminPassword, 'Park', 'Administrator', '+27 123 456 789', 'admin'],
          ['ranger@krugerpark.com', rangerPassword, 'John', 'Ranger', '+27 123 456 788', 'ranger'],
          ['visitor@example.com', visitorPassword, 'Sarah', 'Visitor', '+27 123 456 787', 'visitor']
        ];

        let insertedCount = 0;
        
        users.forEach((user, index) => {
          db.run(`
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, user, function(err) {
            if (err) {
              console.error(`❌ Error creating user ${user[0]}:`, err);
            } else {
              insertedCount++;
              console.log(`✅ Created user: ${user[0]}`);
              
              if (insertedCount === users.length) {
                console.log('🎉 All default users created successfully!');
                console.log('   👑 Admin: admin@krugerpark.com / admin123');
                console.log('   🦁 Ranger: ranger@krugerpark.com / ranger123');
                console.log('   👤 Visitor: visitor@example.com / visitor123');
                createSampleSightings();
              }
            }
          });
        });
      } catch (error) {
        console.error('❌ Error in createDefaultUsers:', error);
      }
    } else {
      console.log('✅ Users table already has data');
    }
  });
};

// Create sample park gates
const createSampleGates = () => {
  db.get('SELECT COUNT(*) as count FROM park_gates', (err, result) => {
    if (err) {
      console.error('❌ Error checking park_gates:', err);
      return;
    }

    if (result.count === 0) {
      console.log('🚪 Inserting sample park gates...');
      db.run(`
        INSERT INTO park_gates (gate_name, description, location) 
        VALUES 
        ('Malelane Gate', 'Southern entrance, great for lions and elephants', 'Southern Kruger'),
        ('Phabeni Gate', 'Near Sabie, good for leopards and buffalo', 'Central Kruger'),
        ('Numbi Gate', 'Close to Hazyview, known for rhino sightings', 'Central Kruger'),
        ('Paul Kruger Gate', 'Main central gate, excellent for Big Five', 'Central Kruger'),
        ('Orpen Gate', 'Western gate, great for cheetah and wild dog', 'Western Kruger')
      `, function(err) {
        if (err) {
          console.error('❌ Error inserting park gates:', err);
        } else {
          console.log('✅ Sample park gates inserted');
        }
      });
    }
  });
};

// Create sample wildlife sightings
const createSampleSightings = () => {
  db.get('SELECT COUNT(*) as count FROM wildlife_sightings', (err, result) => {
    if (err) {
      console.error('❌ Error checking wildlife_sightings:', err);
      return;
    }

    if (result.count === 0) {
      console.log('🐘 Inserting sample wildlife sightings...');
      
      // Get the ranger user ID
      db.get('SELECT id FROM users WHERE role = "ranger" LIMIT 1', (err, ranger) => {
        if (err || !ranger) {
          console.error('❌ Error getting ranger user:', err);
          // Insert sightings without reporter if ranger not found
          insertSightingsWithoutReporter();
          return;
        }

        insertSightingsWithReporter(ranger.id);
      });
    }
  });
};

const insertSightingsWithReporter = (rangerId) => {
  const sightings = [
    [1, 'lion', 'high', 'confirmed', 'Pride of 12 near S25 road, including cubs. Best viewing: sunrise', rangerId],
    [1, 'elephant', 'medium', 'confirmed', 'Herd of 30+ moving toward Crocodile River', rangerId],
    [2, 'leopard', 'medium', 'confirmed', 'Regular sightings near Phabeni dam. Often in marula trees', rangerId],
    [2, 'buffalo', 'high', 'confirmed', 'Large herd of 200+ grazing near entrance gate', rangerId],
    [3, 'rhino', 'low', 'reported', 'Single white rhino spotted near Fayi Loop', rangerId],
    [4, 'lion', 'high', 'confirmed', 'Dominant male and pride frequenting Skukuza area', rangerId],
    [4, 'elephant', 'high', 'confirmed', 'Large breeding herds near Sabie River', rangerId],
    [5, 'leopard', 'medium', 'confirmed', 'Female with cubs seen near Orpen dam', rangerId]
  ];

  let insertedCount = 0;
  
  sightings.forEach((sighting, index) => {
    db.run(`
      INSERT INTO wildlife_sightings 
      (gate_id, animal_type, probability, confidence, notes, reported_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, sighting, function(err) {
      if (err) {
        console.error(`❌ Error inserting sighting ${index + 1}:`, err);
      } else {
        insertedCount++;
        if (insertedCount === sightings.length) {
          console.log('✅ All sample wildlife sightings inserted');
        }
      }
    });
  });
};

const insertSightingsWithoutReporter = () => {
  const sightings = [
    [1, 'lion', 'high', 'confirmed', 'Pride of 12 near S25 road, including cubs. Best viewing: sunrise'],
    [1, 'elephant', 'medium', 'confirmed', 'Herd of 30+ moving toward Crocodile River'],
    [2, 'leopard', 'medium', 'confirmed', 'Regular sightings near Phabeni dam. Often in marula trees'],
    [2, 'buffalo', 'high', 'confirmed', 'Large herd of 200+ grazing near entrance gate'],
    [3, 'rhino', 'low', 'reported', 'Single white rhino spotted near Fayi Loop'],
    [4, 'lion', 'high', 'confirmed', 'Dominant male and pride frequenting Skukuza area'],
    [4, 'elephant', 'high', 'confirmed', 'Large breeding herds near Sabie River'],
    [5, 'leopard', 'medium', 'confirmed', 'Female with cubs seen near Orpen dam']
  ];

  let insertedCount = 0;
  
  sightings.forEach((sighting, index) => {
    db.run(`
      INSERT INTO wildlife_sightings 
      (gate_id, animal_type, probability, confidence, notes) 
      VALUES (?, ?, ?, ?, ?)
    `, sighting, function(err) {
      if (err) {
        console.error(`❌ Error inserting sighting ${index + 1}:`, err);
      } else {
        insertedCount++;
        if (insertedCount === sightings.length) {
          console.log('✅ All sample wildlife sightings inserted (without reporter)');
        }
      }
    });
  });
};

// Promise-based query function
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// For INSERT/UPDATE operations
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Helper function to get user by email
export const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper function to get user by ID
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, first_name, last_name, role, phone, created_at FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export default db;