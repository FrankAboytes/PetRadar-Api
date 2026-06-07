import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: any;
  let jwtService: JwtService;

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
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════
  // register()
  // ═══════════════════════════════════════════════

  describe('register()', () => {
    const registerDto = {
      email: 'new@email.com',
      password: 'SecurePass123!',
      name: 'New User',
    };

    it('should register a new user when email is not taken', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10);
      expect(result.access_token).toBe('jwt_token_123');
      expect(result.user.email).toBe('test@email.com');
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ═══════════════════════════════════════════════
  // login()
  // ═══════════════════════════════════════════════

  describe('login()', () => {
    const loginDto = {
      email: 'test@email.com',
      password: 'SecurePass123!',
    };

    it('should return a token when credentials are valid', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result.access_token).toBe('jwt_token_123');
      expect(bcrypt.compare).toHaveBeenCalledWith('SecurePass123!', mockUser.password);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should find user with password field selected', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await authService.login(loginDto);

      // Assert
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        select: ['id', 'email', 'password', 'name'],
      });
    });
  });

  // ═══════════════════════════════════════════════
  // getProfile()
  // ═══════════════════════════════════════════════

  describe('getProfile()', () => {
    it('should return user data without password', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await authService.getProfile('uuid-123');

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@email.com');
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await authService.getProfile('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════
  // updateProfile()
  // ═══════════════════════════════════════════════

  describe('updateProfile()', () => {
    it('should update only provided fields', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', phone: '555-1234' };
      mockUserRepo.update.mockResolvedValue({ affected: 1 });
      mockUserRepo.findOne
        .mockResolvedValueOnce({ ...mockUser, name: 'Updated Name', phone: '555-1234' });

      // Act
      const result = await authService.updateProfile('uuid-123', updateData);

      // Assert
      expect(mockUserRepo.update).toHaveBeenCalledWith('uuid-123', {
        name: 'Updated Name',
        phone: '555-1234',
      });
      expect(result.name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password');
    });

    it('should ignore undefined and null fields', async () => {
      // Arrange
      const updateData = { name: undefined, phone: null, city: 'Salamanca' };

      // Act
      await authService.updateProfile('uuid-123', updateData);

      // Assert
      expect(mockUserRepo.update).toHaveBeenCalledWith('uuid-123', {
        city: 'Salamanca',
      });
    });
  });
});
