const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const PG_URL = process.env.DATABASE_URL || 'postgresql://petuser:petpassword@localhost:5432/petradar_db';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/petradar_health';

// Salamanca, GTO — Real coordinates
const SALAMANCA = { lat: 20.5713, lng: -101.1918 };

function nearby(km = 0) {
  const lat = SALAMANCA.lat + (Math.random() - 0.5) * 0.05 * (km + 1);
  const lng = SALAMANCA.lng + (Math.random() - 0.5) * 0.05 * (km + 1);
  return { lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
}

async function seed() {
  const pg = new Pool({ connectionString: PG_URL });
  const mongo = new MongoClient(MONGO_URL);
  await mongo.connect();

  const healthDb = mongo.db('petradar_health');
  const healthCol = healthDb.collection('healthrecords');
  const chatCol = healthDb.collection('chatmessages');
  const activityCol = healthDb.collection('activitylogs');

  // ── Clean ALL tables ──
  console.log('🧹 Limpiando datos anteriores...');
  const sqlTables = ['lost_pets','found_pets','location_history','notifications',
    'community_reports','pets','breeds','veterinaries','users'];
  for (const t of sqlTables) await pg.query(`DELETE FROM ${t}`).catch(() => {});
  await healthCol.deleteMany({});
  await chatCol.deleteMany({});
  await activityCol.deleteMany({});

  // ═══════════════════════════════════════════
  // 1. USERS (30 — variados)
  // ═══════════════════════════════════════════
  const userData = [
    ['ana.garcia@email.com','Ana García','4641234567','Col. Centro'],
    ['luis.hernandez@email.com','Luis Hernández','4642345678','Col. Bellavista'],
    ['maria.lopez@email.com','María López','4643456789','Col. La Gloria'],
    ['carlos.ruiz@email.com','Carlos Ruiz','4644567890','Col. Las Reinas'],
    ['sofia.martinez@email.com','Sofía Martínez','4645678901','Col. El Deportivo'],
    ['pedro.ramirez@email.com','Pedro Ramírez','4646789012','Col. La Moderna'],
    ['laura.torres@email.com','Laura Torres','4647890123','Col. San Antonio'],
    ['jorge.mendoza@email.com','Jorge Mendoza','4648901234','Fracc. Las Fuentes'],
    ['diana.castro@email.com','Diana Castro','4649012345','Fracc. Los Pinos'],
    ['roberto.flores@email.com','Roberto Flores','4641122334','Col. Obrera'],
    ['elena.sanchez@email.com','Elena Sánchez','4642233445','Col. Guanajuato'],
    ['miguel.aguilar@email.com','Miguel Aguilar','4643344556','Barrio de San Juan'],
    ['patricia.morales@email.com','Patricia Morales','4644455667','Col. La Cruz'],
    ['fernando.vargas@email.com','Fernando Vargas','4645566778','Fracc. Los Nogales'],
    ['alejandra.diaz@email.com','Alejandra Díaz','4646677889','Col. San José'],
    ['oscar.jimenez@email.com','Óscar Jiménez','4647788990','Col. El Rosario'],
    ['claudia.medina@email.com','Claudia Medina','4648899001','Fracc. Arboledas'],
    ['ricardo.ortega@email.com','Ricardo Ortega','4649900112','Col. Del Valle'],
    ['carolina.gomez@email.com','Carolina Gómez','4641011123','Col. San Pedro'],
    ['hector.reyes@email.com','Héctor Reyes','4642122234','Fracc. Villa Verde'],
    ['veronica.guzman@email.com','Verónica Guzmán','4643233345','Col. El Pirul'],
    ['arturo.navarro@email.com','Arturo Navarro','4644344456','Col. Lázaro Cárdenas'],
    ['monica.rivera@email.com','Mónica Rivera','4645455567','Fracc. La Luz'],
    ['raul.contreras@email.com','Raúl Contreras','4646566678','Col. Guadalupe'],
    ['gabriela.vega@email.com','Gabriela Vega','4647677789','Col. Santa María'],
    ['alberto.campos@email.com','Alberto Campos','4648788890','Barrio de Santiago'],
    ['adriana.soto@email.com','Adriana Soto','4649899901','Fracc. San Javier'],
    ['eduardo.leon@email.com','Eduardo León','4640900012','Col. Insurgentes'],
    ['marisol.delgado@email.com','Marisol Delgado','4641911123','Col. El Campanario'],
    ['francisco.lara@email.com','Francisco Lara','4642922234','Fracc. Hacienda'],
  ];
  console.log('👤 Creando 30 usuarios...');
  const userIds = [];
  for (const [email, name, phone, city] of userData) {
    const r = await pg.query(
      `INSERT INTO users (id, email, password, name, phone, city, "createdAt")
       VALUES (gen_random_uuid(), $1, '$2b$10$simulatedhashdummy', $2, $3, $4, NOW() - interval '1 day' * floor(random()*90+1))
       RETURNING id`, [email, name, phone, city]
    );
    userIds.push(r.rows[0].id);
  }

  // ═══════════════════════════════════════════
  // 2. BREEDS (20 — catálogo)
  // ═══════════════════════════════════════════
  const breedData = [
    ['Husky Siberiano','dog','Perro de trabajo, pelaje denso, ojos azules o dispares'],
    ['Labrador Retriever','dog','Perro familiar, excelente nadador, pelaje dorado/negro/chocolate'],
    ['Golden Retriever','dog','Perro dócil, pelaje dorado, ideal con niños'],
    ['Bulldog Francés','dog','Perro pequeño, orejas de murciélago, muy sociable'],
    ['Pastor Alemán','dog','Perro guardián, inteligente, leal y protector'],
    ['Chihuahua','dog','Raza mexicana, la más pequeña del mundo, muy valiente'],
    ['Poodle','dog','Perro inteligente, hipoalergénico, disponible en tamaños toy/mini/estándar'],
    ['Dálmata','dog','Pelaje blanco con manchas negras, perro de compañía enérgico'],
    ['Siamés','cat','Gato elegante, ojos azules, puntos de color en extremidades'],
    ['Persa','cat','Gato de pelo largo, cara plana, temperamento tranquilo'],
    ['Bengalí','cat','Gato exótico con pelaje manchado tipo leopardo, muy activo'],
    ['Naranja Atigrado','cat','Gato doméstico común, pelaje naranja con rayas, muy cariñoso'],
    ['Esfinge','cat','Gato sin pelo, muy afectuoso, requiere cuidados especiales de piel'],
    ['Ragdoll','cat','Gato grande y dócil, ojos azules, se relaja completamente al cargarlo'],
    ['Maine Coon','cat','Raza gigante, pelaje denso, excelente cazador, muy amigable'],
    ['Perico Australiano','bird','Ave pequeña, sociable, puede aprender a hablar'],
    ['Canario','bird','Ave canora, plumaje amarillo intenso, fácil de cuidar'],
    ['Hámster Sirio','rodent','Roedor nocturno, solitario, fácil de mantener en casa'],
    ['Conejo Mini Lop','rodent','Conejo de orejas caídas, dócil, ideal como mascota de interior'],
    ['Tortuga de Orejas Rojas','reptile','Tortuga acuática, longeva, necesita terrario con agua'],
  ];
  console.log('🐕 Creando 20 razas...');
  for (const [name, species, desc] of breedData) {
    await pg.query(
      `INSERT INTO breeds (id, name, species, description, "isActive")
       VALUES (gen_random_uuid(), $1, $2, $3, true)`, [name, species, desc]
    );
  }

  // ═══════════════════════════════════════════
  // 3. PETS (26 — cada usuario tiene al menos 1)
  // ═══════════════════════════════════════════
  const dogPhotos = [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=300&fit=crop',
  ];
  const catPhotos = [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=300&h=300&fit=crop',
  ];

  const petData = [];
  const names = [
    'Firulais','Mishi','Rocky','Luna','Max','Nala','Toby','Simba',
    'Coco','Lola','Bruno','Kiara','Zeus','Maya','Thor','Chloe',
    'Dante','Mia','Rex','Bella','Oso','Kira','Chester','Daisy',
    'Taco','Canela',
  ];
  const species = ['dog','dog','dog','cat','dog','cat','dog','cat',
    'dog','dog','dog','cat','dog','cat','dog','cat',
    'dog','cat','dog','cat','dog','cat','dog','cat',
    'dog','dog'];
  const breeds = [
    'Husky Siberiano','Siamés','Labrador Retriever','Persa','Golden Retriever',
    'Bengalí','Bulldog Francés','Naranja Atigrado','Pastor Alemán','Chihuahua',
    'Poodle','Esfinge','Dálmata','Ragdoll','Maine Coon','Siamés',
    'Labrador Retriever','Persa','Golden Retriever','Bengalí','Husky Siberiano',
    'Naranja Atigrado','Poodle','Ragdoll','Chihuahua','Maine Coon'];
  const colors = ['Negro','Blanco','Dorado','Gris','Marrón','Atigrado','Manchado',
    'Crema','Chocolate','Gris y blanco','Negro y fuego','Blanco y negro',
    'Naranja','Gris atigrado','Amarillo','Carey','Azul ruso','Blanco puro',
    'Tricolor','Bicolor','Blanco con negro','Marrón claro','Beige','Rojo',
    'Plateado','Negro azabache'];

  console.log('🐾 Creando 26 mascotas...');
  const petRows = [];
  for (let i = 0; i < 26; i++) {
    const owner = userIds[i % 30];
    const isCat = species[i] === 'cat';
    const photo = isCat ? catPhotos[i % 3] : dogPhotos[i % 3];
    const r = await pg.query(
      `INSERT INTO pets (id, name, species, breed, color, age, "photoUrl", description, "ownerId", "isActive", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, NOW() - interval '1 day' * floor(random()*60+1))
       RETURNING id, name, species, "photoUrl"`,
      [names[i], species[i], breeds[i], colors[i], Math.floor(Math.random()*8)+1, photo,
       `${names[i]} es un ${species[i]==='dog'?'perro':'gato'} ${breeds[i].toLowerCase()} muy querido por su familia. ${species[i]==='dog'?'Le encanta pasear y jugar en el parque.':'Es muy independiente pero cariñoso cuando quiere.'}`,
       owner]
    );
    petRows.push(r.rows[0]);
  }

  // ═══════════════════════════════════════════
  // 4. LOST PETS (10 — en Salamanca)
  // ═══════════════════════════════════════════
  console.log('🔍 Creando 10 reportes de mascotas perdidas...');
  for (let i = 0; i < 10; i++) {
    const c = nearby(Math.floor(i/2));
    const pet = petRows[i];
    const places = [
      'Cerca del Jardín Principal','Por la Av. Revolución','En la colonia Bellavista',
      'Por el Mercado Hidalgo','A un costado del Templo del Señor del Hospital',
      'En la colonia La Gloria','Por la central de autobuses','Cerca del CBTIS',
      'En la Unidad Deportiva','Por la colonia Las Reinas'];
    await pg.query(
      `INSERT INTO lost_pets (id, "petId", description, lat, lng, location, "isActive", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4,
         ST_SetSRID(ST_MakePoint($5, $4), 4326), true,
         NOW() - interval '1 day' * floor(random()*7+1))`,
      [pet.id, `Se perdió ${places[i]}. Es un ${pet.species} ${breeds[i].toLowerCase()}. Responde al nombre de ${pet.name}. Cualquier información contactar al dueño.`,
       c.lat, c.lng, c.lng]
    );
  }

  // ═══════════════════════════════════════════
  // 5. FOUND PETS (8 — en Salamanca)
  // ═══════════════════════════════════════════
  console.log('📢 Creando 8 reportes de mascotas encontradas...');
  for (let i = 0; i < 8; i++) {
    const c = nearby(Math.floor(i/2));
    const randomPetIdx = 10 + i;
    await pg.query(
      `INSERT INTO found_pets (id, "petId", description, lat, lng, location, "matchedLostPetId", "matchDistance", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4,
         ST_SetSRID(ST_MakePoint($5, $4), 4326), $6, $7,
         NOW() - interval '1 day' * floor(random()*5+1))`,
      [petRows[randomPetIdx % 26].id,
       `Encontrado en Salamanca. Parece ser un ${breeds[randomPetIdx%26]} ${species[randomPetIdx%26]==='dog'?'perro':'gato'}. Está en buen estado. Contactar para recuperarlo.`,
       c.lat, c.lng, c.lng, petRows[(10+i+5)%10].id, +(100 + Math.random()*400).toFixed(1)]
    );
  }

  // ═══════════════════════════════════════════
  // 6. LOCATION HISTORY (30 puntos GPS)
  // ═══════════════════════════════════════════
  console.log('📍 Creando 30 puntos de historial GPS...');
  const sources = ['airtag','gps','manual','wifi_triangulation'];
  for (let i = 0; i < 30; i++) {
    const pet = petRows[i % 10];
    const c = nearby(Math.random() > 0.5 ? 1 : 3);
    await pg.query(
      `INSERT INTO location_history (id, "petId", latitude, longitude, address, accuracy, "batteryLevel", source, "recordedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
         NOW() - interval '1 hour' * floor(random()*72+1))`,
      [pet.id, c.lat, c.lng,
       ['Av. Revolución 123','Calle Hidalgo 45','Blvd. Salamanca','Col. Centro'][i%4],
       Math.floor(5 + Math.random()*20), Math.floor(15 + Math.random()*85),
       sources[i%4]]
    );
  }

  // ═══════════════════════════════════════════
  // 7. NOTIFICATIONS (15)
  // ═══════════════════════════════════════════
  console.log('🔔 Creando 15 notificaciones...');
  const notifTypes = ['lost_pet_nearby','found_match','status_update','reminder'];
  const titles = ['¡Mascota perdida cerca!','Posible coincidencia','Actualización de estado',
    'Recordatorio','Alerta de avistamiento'];
  for (let i = 0; i < 15; i++) {
    await pg.query(
      `INSERT INTO notifications (id, "userId", title, message, type, "referenceId", "referenceType", "isRead", "isArchived", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8,
         NOW() - interval '1 hour' * floor(random()*48+1))`,
      [userIds[i % 30], titles[i % 5],
       `Se ha detectado actividad relacionada con tu mascota en la zona de Salamanca.`,
       notifTypes[i % 4], petRows[i % 10].id, 'pet',
       Math.random() > 0.5, false]
    );
  }

  // ═══════════════════════════════════════════
  // 8. COMMUNITY REPORTS (8)
  // ═══════════════════════════════════════════
  console.log('📝 Creando 8 reportes comunitarios...');
  const categories = ['stray_animal','lost_pet_sighting','abuse','dangerous_area','other'];
  const reportTitles = ['Perro callejero en la colonia','Gato avistado cerca del CBTIS',
    'Posible maltrato animal','Zona peligrosa para mascotas','Jauría en la unidad deportiva',
    'Perrito abandonado en el parque','Ave exótica avistada','Criadero clandestino'];
  const statuses = ['pending','pending','verified','verified','resolved','pending','verified','pending'];
  for (let i = 0; i < 8; i++) {
    const c = nearby(Math.floor(i/2));
    await pg.query(
      `INSERT INTO community_reports (id, "reporterId", title, description, category, latitude, longitude, address, "photoUrl", status, upvotes, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         NOW() - interval '1 day' * floor(random()*14+1))`,
      [userIds[i + 20], reportTitles[i],
       `Reporte comunitario en Salamanca, GTO. Se solicita verificación de las autoridades correspondientes.`,
       categories[i % 5], c.lat, c.lng,
       ['Av. Revolución','Calle Hidalgo','Col. Bellavista','Mercado Hidalgo'][i%4],
       'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=300&h=300&fit=crop',
       statuses[i], Math.floor(Math.random()*25)]
    );
  }

  // ═══════════════════════════════════════════
  // 9. VETERINARIES (10 — en Salamanca)
  // ═══════════════════════════════════════════
  console.log('🏥 Creando 10 veterinarias...');
  const vetData = [
    ['Veterinaria Salamanca','464 648 1234','Av. Revolución 450, Centro','general','Lun-Vie 9-18, Sáb 9-14'],
    ['Clínica Animal PetCare','464 641 5678','Calle Hidalgo 234, Col. Bellavista','general','Lun-Sáb 8-20'],
    ['Hospital Veterinario San Francisco','464 643 9012','Blvd. Salamanca 890, Fracc. Las Fuentes','emergency','24 horas'],
    ['Huellitas Vet','464 648 3456','Calle Obregón 67, Col. La Gloria','surgery','Lun-Vie 9-17'],
    ['Centro Veterinario del Bajío','464 645 7890','Calle Morelos 123, Centro','dental','Lun-Vie 10-18, Sáb 10-14'],
    ['VetSalud Integral','464 649 2345','Av. Insurgentes 567, Fracc. Los Nogales','exotic','Lun-Sáb 9-19'],
    ['Clínica Dr. Patas','464 646 6789','Calle Juárez 890, Barrio de San Juan','general','Lun-Vie 9-18'],
    ['Mundo Animal Vet','464 642 1234','Blvd. Faja de Oro 345, Fracc. Villa Verde','general','Lun-Sáb 9-17'],
    ['PetEmergency GTO','464 648 5678','Carretera Salamanca-Irapuato Km 3','emergency','24 horas, 365 días'],
    ['Zoológico Veterinario','464 644 9012','Calle Allende 456, Col. La Cruz','surgery','Lun-Vie 8-20, Sáb 8-16'],
  ];
  const vetRows = [];
  for (const [name, phone, address, specialty, schedule] of vetData) {
    const c = nearby(1);
    const r = await pg.query(
      `INSERT INTO veterinaries (id, name, address, latitude, longitude, phone, specialty, schedule, "isActive", rating, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, $8, NOW())
       RETURNING id`, [name, address, c.lat, c.lng, phone, specialty, schedule, Math.floor(3.5 + Math.random()*1.5)]
    );
    vetRows.push(r.rows[0].id);
  }

  // ═══════════════════════════════════════════
  // 10. HEALTH RECORDS (MongoDB — 40)
  // ═══════════════════════════════════════════
  console.log('🏥 Creando 40 registros de salud (MongoDB)...');
  const healthTypes = ['checkup','vaccine','surgery','medication','lab_test','emergency','dental','grooming'];
  const vets = ['Dr. Ramírez','Dra. Mendoza','Dr. Gutiérrez','Dra. Hernández','Dr. López'];
  const notes = ['Todo en orden. Peso saludable.','Se aplicó refuerzo sin reacciones.',
    'Recuperación satisfactoria.','Seguimiento en 3 meses.','Requiere cambio de dieta.',
    'Ligera infección tratada con antibiótico.','Limpieza dental rutinaria.',
    'Corte de uñas y revisión general.'];
  const healthDocs = [];
  for (let i = 0; i < 40; i++) {
    healthDocs.push({
      petId: petRows[i % 20].id,
      type: healthTypes[i % 8],
      description: `${healthTypes[i%8].charAt(0).toUpperCase()+healthTypes[i%8].slice(1)} de rutina para ${petRows[i%20].name}`,
      veterinarian: vets[i % 5],
      notes: notes[i % 8],
      date: new Date(Date.now() - 86400000 * (Math.random() * 90 + 1)),
    });
  }
  await healthCol.insertMany(healthDocs);

  // ═══════════════════════════════════════════
  // 11. CHAT MESSAGES (MongoDB — 20)
  // ═══════════════════════════════════════════
  console.log('💬 Creando 20 mensajes de chat (MongoDB)...');
  const chatDocs = [];
  const messages = [
    '¡Hola! Creo que vi a tu mascota','¿Dónde fue la última vez que lo viste?',
    'Está cerca del jardín principal','¿Tiene collar?','Sí, collar rojo con placa',
    'Te mandé foto por WhatsApp','¿Podemos coordinarnos para buscarlo?',
    'Gracias por la información','Yo también lo vi ayer por la tarde',
    '¿Es un husky gris?','No, es un labrador dorado','Ah, entonces no es el mismo',
    '¡Qué bueno que apareció!','Estoy en la colonia Bellavista','Voy para allá',
    '¿A qué hora se perdió?','Como a las 5 de la tarde','Estaré atento',
    '¿Ya reportaste en PetRadar?','Sí, ya está el reporte activo',
  ];
  for (let i = 0; i < 20; i++) {
    const sender = userIds[i % 15];
    const receiver = userIds[(i + 5) % 15];
    chatDocs.push({
      petId: petRows[i % 8].id,
      senderId: sender,
      receiverId: receiver,
      message: messages[i],
      type: 'text',
      isRead: Math.random() > 0.3,
      readAt: Math.random() > 0.5 ? new Date(Date.now() - 86400000 * Math.random()) : null,
      createdAt: new Date(Date.now() - 86400000 * (Math.random() * 7 + 1)),
    });
  }
  await chatCol.insertMany(chatDocs);

  // ═══════════════════════════════════════════
  // 12. ACTIVITY LOG (MongoDB — 50)
  // ═══════════════════════════════════════════
  console.log('📊 Creando 50 registros de actividad (MongoDB)...');
  const activityDocs = [];
  const actions = ['register_pet','report_lost','report_found','mark_found',
    'update_profile','view_pet','send_message','scan_qr'];
  for (let i = 0; i < 50; i++) {
    activityDocs.push({
      userId: userIds[i % 30],
      action: actions[i % 8],
      targetId: petRows[i % 20].id,
      targetType: ['pet','lost_pet','found_pet','user','message'][i % 5],
      metadata: { ip: `192.168.1.${Math.floor(Math.random()*255)}`, browser: 'Chrome' },
      ipAddress: `192.168.1.${Math.floor(Math.random()*255)}`,
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      createdAt: new Date(Date.now() - 86400000 * (Math.random() * 30 + 1)),
    });
  }
  await activityCol.insertMany(activityDocs);

  // ── Summary ──
  console.log('\n╔═══════════════════════════════════╗');
  console.log('║   🐾 PETRADAR — DATOS SIMULADOS   ║');
  console.log('║      Salamanca, GTO (20.5713,     ║');
  console.log('║          -101.1918)               ║');
  console.log('╠═══════════════════════════════════╣');
  console.log(`║  👤 ${userIds.length} usuarios`);
  console.log(`║  🐕 ${breedData.length} razas`);
  console.log(`║  🐾 ${petRows.length} mascotas`);
  console.log(`║  🔍 10 perdidas activas`);
  console.log(`║  📢 8 encontradas`);
  console.log(`║  📍 30 puntos GPS`);
  console.log(`║  🔔 15 notificaciones`);
  console.log(`║  📝 8 reportes comunitarios`);
  console.log(`║  🏥 10 veterinarias`);
  console.log(`║  💊 40 registros de salud`);
  console.log(`║  💬 20 mensajes de chat`);
  console.log(`║  📊 50 registros de actividad`);
  console.log('╚═══════════════════════════════════╝');
  console.log('\n✅ 12 tablas pobladas en Salamanca, GTO');

  await pg.end();
  await mongo.close();
}

seed().catch(e => { console.error('❌', e); process.exit(1); });
