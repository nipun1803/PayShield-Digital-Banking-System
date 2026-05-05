/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountController from '../controllers/AccountController';
import AccountService from '../services/AccountService';

vi.mock('../services/AccountService');

describe('AccountController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      body: {},
      user: { id: 'user1' }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      mockReq.body = { type: 'savings' };
      const mockAccount = { id: 'acc1', type: 'savings', balance: 0 };
      
      vi.spyOn(AccountService.prototype, 'createAccount').mockResolvedValue(mockAccount as any);

      await AccountController.createAccount(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'savings account created successfully',
        data: { account: mockAccount }
      });
    });

    it('should return 400 if type is missing', async () => {
      mockReq.body = {};

      await AccountController.createAccount(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account type is required (savings or checking)'
      });
    });
  });

  describe('getAccounts', () => {
    it('should return accounts for authenticated user', async () => {
      const mockAccounts = [{ id: 'acc1' }, { id: 'acc2' }];
      vi.spyOn(AccountService.prototype, 'getAccountsByUserId').mockResolvedValue(mockAccounts as any);

      await AccountController.getAccounts(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { accounts: mockAccounts, count: 2 }
      });
    });
  });
});
