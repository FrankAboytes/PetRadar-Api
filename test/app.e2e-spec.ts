// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('PetRadar API — Integration Tests (e2e)', () => {
  let app: INestApplication;

  const testUser = {
    email: `e2e_${Date.now()}@test.com`,
    password: 'E2ETestPass123!',
    name: 'E2E Tester',
  };

  let token: string;
  let petId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return 201 + token with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      token = res.body.access_token;
    });

    it('should return 401 when email is taken', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(401);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'test123', name: 'No Email' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 201 + JWT with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);
      expect(res.body.access_token).toBeDefined();
    });

    it('should return 401 with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpass' })
        .expect(401);
    });

    it('should return 401 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'noone@nowhere.com', password: 'test123' })
        .expect(401);
    });
  });

  describe('POST /pets', () => {
    it('should return 201 when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Firulais', species: 'dog', breed: 'Labrador', color: 'Café', age: 3 })
        .expect(201);
      expect(res.body.name).toBe('Firulais');
      petId = res.body.id;
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/pets')
        .send({ name: 'NoToken', species: 'dog' })
        .expect(401);
    });

    it('should return 400 when species is missing', async () => {
      await request(app.getHttpServer())
        .post('/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Incomplete' })
        .expect(400);
    });
  });

  describe('GET /pets', () => {
    it('should return user pets when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .get('/pets')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/pets').expect(401);
    });
  });

  describe('GET /pets/:id', () => {
    it('should return pet details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/pets/${petId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.id).toBe(petId);
    });

    it('should return 404 for non-existent pet', async () => {
      await request(app.getHttpServer())
        .get('/pets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /health', () => {
    it('should return 200 with status', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.status).toBe('ok');
    });
  });
});
