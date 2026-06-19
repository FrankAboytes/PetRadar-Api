import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: 'uuid-123',
    email: 'test@email.com',
    password: 'hashed_password_here',
    name: 'Test User',
    phone: null,
    city: null,
    createdAt: new Date(),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt_token_123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const registerDto = {
      email: 'new@email.com',
      password: 'SecurePass123!',
      name: 'New User',
    };

    it('should register a new user when email is not taken', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
      expect(result.access_token).toBe('jwt_token_123');
      expect(result.user.email).toBe('test@email.com');
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login()', () => {
    const loginDto = {
      email: 'test@email.com',
      password: 'SecurePass123!',
    };

    it('should return a token when credentials are valid', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result.access_token).toBe('jwt_token_123');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile()', () => {
    it('should return user data without password', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await authService.getProfile('uuid-123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      jest.clearAllMocks();
      mockUserRepo.findOne.mockResolvedValue(null);
      const result = await authService.getProfile('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile()', () => {
    it('should update only provided fields', async () => {
      jest.clearAllMocks();
      const updateData = { name: 'Updated Name', phone: '555-1234' };
      mockUserRepo.update.mockResolvedValue({ affected: 1 });
      mockUserRepo.findOne
        .mockResolvedValueOnce({ ...mockUser, name: 'Updated Name', phone: '555-1234' });

      const result = await authService.updateProfile('uuid-123', updateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith('uuid-123', {
        name: 'Updated Name',
        phone: '555-1234',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should ignore undefined and null fields', async () => {
      jest.clearAllMocks();
      const updateData = { name: undefined, phone: null, city: 'Salamanca' };

      await authService.updateProfile('uuid-123', updateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith('uuid-123', {
        city: 'Salamanca',
      });
    });
  });
});
