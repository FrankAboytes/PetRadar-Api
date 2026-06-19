import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/auth/user.entity';
import { Pet } from '../src/pets/pet.entity';
import { AppModule } from '../src/app.module';

describe('Base de Datos Relacional — PostgreSQL (PDF 4.2)', () => {
  let userRepo: Repository<User>;
  let petRepo: Repository<Pet>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepo = moduleFixture.get(getRepositoryToken(User));
    petRepo = moduleFixture.get(getRepositoryToken(Pet));
  });

  afterEach(async () => {
    await petRepo.delete({});
    await userRepo.delete({});
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  describe('CRUD completo', () => {
    it('debe crear un usuario con todos los campos', async () => {
      const saved = await userRepo.save(userRepo.create({
        email: 'test@crud.com',
        password: 'hashed123',
        name: 'CRUD Test',
      }));

      expect(saved.id).toBeDefined();
      expect(saved.email).toBe('test@crud.com');
      expect(saved.createdAt).toBeDefined();
    });

    it('debe leer un usuario por email', async () => {
      await userRepo.save(userRepo.create({
        email: 'find@test.com', password: 'hash', name: 'Finder',
      }));

      const found = await userRepo.findOne({ where: { email: 'find@test.com' } });
      expect(found).toBeDefined();
      expect(found!.name).toBe('Finder');
    });

    it('debe actualizar nombre de usuario', async () => {
      const saved = await userRepo.save(userRepo.create({
        email: 'update@test.com', password: 'hash', name: 'Old Name',
      }));

      await userRepo.update(saved.id, { name: 'New Name' });
      const updated = await userRepo.findOne({ where: { id: saved.id } });
      expect(updated!.name).toBe('New Name');
    });

    it('debe eliminar usuario', async () => {
      const user = await userRepo.save(userRepo.create({
        email: 'delete@test.com', password: 'hash', name: 'To Delete',
      }));

      await userRepo.delete(user.id);
      const found = await userRepo.findOne({ where: { id: user.id } });
      expect(found).toBeNull();
    });
  });

  describe('Constraints', () => {
    it('UNIQUE: no permite emails duplicados', async () => {
      await userRepo.save(userRepo.create({
        email: 'unique@test.com', password: 'hash', name: 'First',
      }));

      await expect(
        userRepo.save(userRepo.create({
          email: 'unique@test.com', password: 'hash2', name: 'Second',
        }))
      ).rejects.toThrow();
    });

    it('debe crear mascota con FK a usuario', async () => {
      const user = await userRepo.save(userRepo.create({
        email: 'owner@test.com', password: 'hash', name: 'Owner',
      }));

      const pet = petRepo.create({
        name: 'FK Pet', species: 'dog', ownerId: user.id,
      });
      const savedPet = await petRepo.save(pet);
      expect(savedPet.ownerId).toBe(user.id);
    });
  });
});
