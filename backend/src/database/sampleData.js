import { run, query } from './db.js';

export const insertSampleData = async () => {
  try {
    console.log('🦁 Inserting sample Kruger Park data...');
    
    // First, check if gates already exist
    const existingGates = await query('SELECT COUNT(*) as count FROM park_gates');
    
    if (existingGates[0].count === 0) {
      // Insert Kruger Park gates
      await run(
        `INSERT INTO park_gates (gate_name, description, location) 
         VALUES 
         ('Malelane Gate', 'Southern entrance, great for lions and elephants', '{"lat": -25.4658, "lng": 31.5383}'),
         ('Phabeni Gate', 'Near Sabie, good for leopards and buffalo', '{"lat": -25.0242, "lng": 31.2431}'),
         ('Numbi Gate', 'Close to Hazyview, known for rhino sightings', '{"lat": -25.1600, "lng": 31.1983}'),
         ('Paul Kruger Gate', 'Main central gate, excellent for Big Five', '{"lat": -24.9986, "lng": 31.4964}'),
         ('Orpen Gate', 'Western gate, great for cheetah and wild dog', '{"lat": -24.4719, "lng": 31.3869}'),
         ('Punda Maria Gate', 'Northern gate, birding paradise', '{"lat": -22.7036, "lng": 31.0158}')`
      );
      console.log('✅ Park gates inserted');
    }

    // Check if sightings exist
    const existingSightings = await query('SELECT COUNT(*) as count FROM wildlife_sightings');
    
    if (existingSightings[0].count === 0) {
      // Insert sample wildlife sightings
      await run(
        `INSERT INTO wildlife_sightings 
         (gate_id, animal_type, probability, confidence, notes) 
         VALUES 
         (1, 'lion', 'high', 'confirmed', 'Pride of 12 near S25 road, including cubs. Best viewing: sunrise'),
         (1, 'elephant', 'medium', 'confirmed', 'Herd of 30+ moving toward Crocodile River'),
         (2, 'leopard', 'medium', 'confirmed', 'Regular sightings near Phabeni dam. Often in marula trees'),
         (2, 'buffalo', 'high', 'confirmed', 'Large herd of 200+ grazing near entrance gate'),
         (3, 'rhino', 'low', 'reported', 'Single white rhino spotted near Fayi Loop'),
         (4, 'lion', 'high', 'confirmed', 'Dominant male and pride frequenting Skukuza area'),
         (4, 'leopard', 'medium', 'reported', 'Female with cubs seen near Transport Dam'),
         (5, 'cheetah', 'medium', 'confirmed', 'Brothers hunting on Orpen plains'),
         (6, 'elephant', 'high', 'confirmed', 'Large breeding herds near Punda Maria')`
      );
      console.log('✅ Wildlife sightings inserted');
    }

    console.log('🎉 Sample data setup complete!');
  } catch (error) {
    console.log('Sample data already exists or error:', error.message);
  }
};