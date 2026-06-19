import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { HealthRecord } from '../src/health/health.schema';
import { ChatMessage } from '../src/chat/chat.schema';

describe('Base de Datos NoSQL — MongoDB (PDF 4.3)', () => {
  let healthModel: Model<typeof HealthRecord>;
  let chatModel: Model<typeof ChatMessage>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    healthModel = moduleFixture.get(getModelToken(HealthRecord.name));
    chatModel = moduleFixture.get(getModelToken(ChatMessage.name));
  });

  afterEach(async () => {
    await healthModel.deleteMany({});
    await chatModel.deleteMany({});
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  describe('Documentos', () => {
    it('debe crear health record', async () => {
      const record = await healthModel.create({
        petId: 'pet-123', type: 'vaccine',
        description: 'Rabia', date: new Date(),
        veterinarian: 'Dr. Pérez',
      });
      expect(record._id).toBeDefined();
      expect(record.type).toBe('vaccine');
    });

    it('debe crear mensaje de chat', async () => {
      const msg = await chatModel.create({
        petId: 'pet-456', senderId: 'user-1',
        receiverId: 'user-2',
        message: 'Encontré a tu mascota',
        type: 'text',
      });
      expect(msg.message).toBe('Encontré a tu mascota');
      expect(msg.createdAt).toBeDefined();
    });
  });

  describe('Consultas', () => {
    it('debe filtrar por tipo', async () => {
      await healthModel.create({ petId: 'p1', type: 'vaccine', description: 'Vac1', date: new Date() });
      await healthModel.create({ petId: 'p1', type: 'checkup', description: 'Check', date: new Date() });

      const vaccines = await healthModel.find({ type: 'vaccine' }).exec();
      expect(vaccines).toHaveLength(1);
    });

    it('debe ordenar por fecha descendente', async () => {
      await healthModel.create({ petId: 'p2', type: 'checkup', description: 'Viejo', date: new Date('2024-01-01') });
      await healthModel.create({ petId: 'p2', type: 'checkup', description: 'Reciente', date: new Date('2026-01-01') });

      const results = await healthModel.find({ petId: 'p2' }).sort({ date: -1 }).exec();
      expect(results[0].description).toBe('Reciente');
    });
  });
});
