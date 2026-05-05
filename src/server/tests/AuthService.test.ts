/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthService from '../services/AuthService';
import User from '../models/User';
import jwt from 'jsonwebtoken';

vi.mock('../models/User');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      const result = await service.register(userData);

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw an error for duplicate email', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      
      vi.mocked(User.findOne).mockResolvedValue({ _id: 'existing' } as any);

      await expect(service.register(userData)).rejects.toThrow('User already exists with this email');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      const mockFindOne = {
        select: vi.fn().mockResolvedValue(mockUser),
      };

      vi.mocked(User.findOne).mockReturnValue(mockFindOne as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    });

    it('should throw an error when user is not found', async () => {
      const mockFindOne = {
        select: vi.fn().mockResolvedValue(null),
      };

      vi.mocked(User.findOne).mockReturnValue(mockFindOne as any);

      await expect(service.login({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow('Account not found. Please register to continue.');
    });

    it('should throw an error when password is wrong', async () => {
      const mockUser = {
        _id: 'user1',
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      const mockFindOne = {
        select: vi.fn().mockResolvedValue(mockUser),
      };

      vi.mocked(User.findOne).mockReturnValue(mockFindOne as any);

      await expect(service.login({ email: 'test@example.com', password: 'wrongpassword' }))
        .rejects.toThrow('Invalid email or password');
    });
  });
});
