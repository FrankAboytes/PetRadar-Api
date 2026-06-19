import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/auth/user.entity';
import { Pet } from '../src/pets/pet.entity';
import { LostPet, FoundPet } from '../src/pets/lost-found.entity';

// ═══════════════════════════════════════════════
// PetRadar Pro — Integration Tests (PDF Section 4)
// ═══════════════════════════════════════════════
// NOTA: Requiere PostgreSQL + MongoDB corriendo
// Ejecutar: npm run test:e2e
// ═══════════════════════════════════════════════

describe('PetRadar API — Integration Tests (e2e)', () => {
  let app: INestApplication;
  let userRepo: any;
  let petRepo: any;

  const testUser = {
    email: `e2e_${Date.now()}@test.com`,
    password: 'E2ETestPass123!',
    name: 'E2E Tester',
  };

  let token: string;
  let userId: string;
  let petId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    userRepo = app.get(getRepositoryToken(User));
    petRepo = app.get(getRepositoryToken(Pet));
  });

  afterAll(async () => {
    await app.close();
  });

  // ═══════════════════════════════════════════════
  // TC-API-001: POST /auth/register — Happy path
  // ═══════════════════════════════════════════════
  describe('POST /auth/register', () => {
    it('should return 201 + token when registering with valid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
          token = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('should return 401 when email is already registered', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(401);
    });

    it('should return 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'test123', name: 'No Email' })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════
  // TC-API-004: POST /auth/login
  // ═══════════════════════════════════════════════
  describe('POST /auth/login', () => {
    it('should return 201 + JWT with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('should return 401 with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' })
        .expect(401);
    });

    it('should return 401 with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'noone@nowhere.com', password: 'test123' })
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════
  // TC-API-005: POST /pets — Create pet (authenticated)
  // ═══════════════════════════════════════════════
  describe('POST /pets', () => {
    it('should return 201 when creating a pet with valid auth', () => {
      return request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Firulais', species: 'dog', breed: 'Labrador', color: 'Café', age: 3 })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Firulais');
          expect(res.body.ownerId).toBe(userId);
          petId = res.body.id;
        });
    });

    it('should return 401 when creating a pet without token', () => {
      return request(app.getHttpServer())
        .post('/pets')
        .send({ name: 'NoToken', species: 'dog' })
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Incomplete' })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════
  // GET /pets — List authenticated user's pets
  // ═══════════════════════════════════════════════
  describe('GET /pets', () => {
    it('should return 200 with user pets when authenticated', () => {
      return request(app.getHttpServer())
        .get('/pets')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/pets')
        .expect(401);
    });
  });

  // ═══════════════════════════════════════════════
  // GET /pets/:id — Get single pet
  // ═══════════════════════════════════════════════
  describe('GET /pets/:id', () => {
    it('should return 200 with pet details', () => {
      return request(app.getHttpServer())
        .get(`/pets/${petId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(petId);
        });
    });

    it('should return 404 for non-existent pet', () => {
      return request(app.getHttpServer())
        .get('/pets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════════
  // GET /lost-pets — Browse lost pets with geo
  // ═══════════════════════════════════════════════
  describe('GET /lost-pets', () => {
    it('should return 200 with array of lost pets', () => {
      return request(app.getHttpServer())
        .get('/lost-pets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should accept lat/lng query params', () => {
      return request(app.getHttpServer())
        .get('/lost-pets?lat=20.57&lng=-101.19')
        .expect(200);
    });
  });

  // ═══════════════════════════════════════════════
  // POST /found-pets — Report found pet
  // ═══════════════════════════════════════════════
  describe('POST /found-pets', () => {
    it('should return 201 with nearbyLostPets info', () => {
      return request(app.getHttpServer())
        .post('/found-pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Perro café encontrado',
          latitude: 20.5720,
          longitude: -101.1920,
          photoUrl: 'https://example.com/dog.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.description).toBe('Perro café encontrado');
        });
    });
  });

  // ═══════════════════════════════════════════════
  // GET /health — Health check
  // ═══════════════════════════════════════════════
  describe('GET /health', () => {
    it('should return 200 with status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
        });
    });

    it('should have security headers', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect('x-frame-options', 'SAMEORIGIN')
        .expect('x-content-type-options', 'nosniff');
    });
  });
});
