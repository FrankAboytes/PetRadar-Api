const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const PG_URL = process.env.DATABASE_URL || 'postgresql://petuser:petpassword@localhost:5432/petradar_db';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/petradar_health';

async function seed() {
  const pg = new Pool({ connectionString: PG_URL });
  const mongo = new MongoClient(MONGO_URL);
  await mongo.connect();
  const healthDb = mongo.db('petradar_health');
  const healthCol = healthDb.collection('healthrecords');

  // Clean
  await pg.query('DELETE FROM lost_pets'); await pg.query('DELETE FROM found_pets');
  await pg.query('DELETE FROM pets'); await pg.query('DELETE FROM users');
  await healthCol.deleteMany({});

  // Users
  const users = [
    ['ana@email.com', 'Ana García', '5533445566'],
    ['luis@email.com', 'Luis Hernández', '5511223344'],
    ['maria@email.com', 'María López', '5566778899'],
    ['carlos@email.com', 'Carlos Ruiz', '5599887766'],
    ['sofia@email.com', 'Sofía Martínez', '5544332211'],
  ];
  console.log('👤 Creando 5 usuarios...');
  for (const [email, name, phone] of users) {
    await pg.query(
      "INSERT INTO users (id, email, password, name, phone, \"createdAt\") VALUES (gen_random_uuid(), $1, '$2b$10$simulatedhashdummy', $2, $3, NOW())",
      [email, name, phone]
    );
  }
  const { rows: userIds } = await pg.query('SELECT id, name FROM users');

  // Pets with photos
  const petPhotos = {
    dog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
    cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
  };

  const pets = [
    ['Firulais', 'dog', 'Husky Siberiano', 'Gris y blanco', 3, 'Firulais es muy juguetón y le encanta correr en el parque. Tiene un collar rojo con placa dorada. Es amigable con otros perros pero desconfía de extraños. Responde a silbidos.', petPhotos.dog, userIds[0].id],
    ['Mishi', 'cat', 'Siamés', 'Crema con puntos marrones', 2, 'Mishi es una gata muy tranquila que le gusta dormir en lugares cálidos. Tiene ojos azules muy característicos de su raza. Lleva un collar morado con cascabel.', petPhotos.cat, userIds[1].id],
    ['Rocky', 'dog', 'Labrador Retriever', 'Dorado', 4, 'Rocky es un labrador muy activo, le encanta nadar y jugar con pelotas. Tiene una mancha blanca en el pecho. Es muy dócil y se acerca a cualquier persona.', petPhotos.dog, userIds[2].id],
    ['Luna', 'cat', 'Persa', 'Blanco', 1, 'Luna es una gatita persa muy peluda. Es tímida pero cariñosa una vez que toma confianza. Tiene un mechón de pelo entre los ojos muy característico.', petPhotos.cat, userIds[2].id],
    ['Max', 'dog', 'Golden Retriever', 'Dorado claro', 5, 'Max es el perro más amigable del vecindario. Le encantan los niños y siempre mueve la cola. Tiene una pequeña cicatriz en la oreja izquierda. Lleva pañuelo azul.', petPhotos.dog, userIds[3].id],
    ['Nala', 'cat', 'Bengalí', 'Manchado', 2, 'Nala es una gata muy curiosa y atlética. Tiene un pelaje exótico con manchas como de leopardo. Le encanta trepar y observar todo desde arriba.', petPhotos.cat, userIds[3].id],
    ['Toby', 'dog', 'Bulldog Francés', 'Negro atigrado', 2, 'Toby es pequeño pero con mucha personalidad. Ronca cuando duerme y le encanta que le rasquen la pancita. Tiene una mancha blanca en la nariz.', petPhotos.dog, userIds[4].id],
    ['Simba', 'cat', 'Naranja', 'Atigrado naranja', 3, 'Simba es un gato callejero rescatado, muy agradecido y cariñoso. Tiene la punta de la cola doblada. Siempre quiere estar cerca de sus dueños.', petPhotos.cat, userIds[4].id],
  ];
  console.log('🐾 Creando 8 mascotas...');
  for (const [name, species, breed, color, age, desc, photo, owner] of pets) {
    await pg.query(
      "INSERT INTO pets (id, name, species, breed, color, age, \"photoUrl\", description, \"ownerId\", \"isActive\", \"createdAt\") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, NOW())",
      [name, species, breed, color, age, photo, desc, owner]
    );
  }
  const { rows: petRows } = await pg.query('SELECT id, name, species, "photoUrl" FROM pets');

  // Lost pets (4 reports near Ciudad de México)
  const lostCoords = [
    [19.4270, -99.1676, petRows[0].id],
    [19.4328, -99.1330, petRows[2].id],
    [19.4260, -99.1700, petRows[4].id],
    [19.4310, -99.1350, petRows[5].id],
  ];
  console.log('🔍 Creando 4 reportes de mascotas perdidas...');
  for (const [lat, lng, petId] of lostCoords) {
    await pg.query(
      "INSERT INTO lost_pets (id, \"petId\", description, lat, lng, location, \"isActive\", \"createdAt\") VALUES (gen_random_uuid(), $1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $4), 4326), true, NOW() - interval '1 day' * floor(random()*5+1))",
      [petId, 'Se perdió cerca de esta zona. Cualquier información es valiosa.', lat, lng, lng]
    );
  }

  // Health records in MongoDB
  console.log('🏥 Creando registros de salud en MongoDB...');
  for (const p of petRows.slice(0, 4)) {
    await healthCol.insertMany([
      { petId: p.id, type: 'checkup', description: 'Chequeo general anual', veterinarian: 'Dr. Ramírez', notes: 'Todo en orden. Peso saludable.', date: new Date(Date.now() - 86400000 * 30) },
      { petId: p.id, type: 'vaccine', description: 'Vacuna antirrábica', veterinarian: 'Dra. Mendoza', notes: 'Refuerzo anual aplicado sin reacciones.', date: new Date(Date.now() - 86400000 * 15) },
    ]);
  }

  console.log('\n✅ Datos simulados creados:');
  console.log(`   👤 ${userIds.length} usuarios`);
  console.log(`   🐾 ${petRows.length} mascotas`);
  console.log('   🔍 4 mascotas perdidas (activas)');
  console.log(`   🏥 ${4*2} registros de salud (NoSQL/MongoDB)`);
  console.log('\n🎭 La app ahora se ve "viva" con datos simulados.');

  await pg.end();
  await mongo.close();
}

seed().catch(console.error);
