/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionController from '../controllers/TransactionController';
import TransactionService from '../services/TransactionService';

vi.mock('../services/TransactionService');

describe('TransactionController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      body: {},
      user: { id: 'user1' },
      query: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('transfer', () => {
    it('should complete a transfer successfully', async () => {
      mockReq.body = { fromAccountId: 'acc1', toAccountId: 'acc2', amount: 500 };
      const mockTransaction = { id: 'tx1', amount: 500, flagged: false };
      
      vi.spyOn(TransactionService.prototype, 'transfer').mockResolvedValue(mockTransaction as any);

      await TransactionController.transfer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: '✅ Transfer completed successfully',
        data: { transaction: mockTransaction }
      });
    });

    it('should return 400 if fields are missing', async () => {
      mockReq.body = { fromAccountId: 'acc1' }; // Missing toAccountId and amount

      await TransactionController.transfer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'fromAccountId, toAccountId, and amount are required'
      });
    });
  });

  describe('getTransactions', () => {
    it('should return the transaction list for the user', async () => {
      const mockTransactions = [{ id: 'tx1' }, { id: 'tx2' }];
      vi.spyOn(TransactionService.prototype, 'getUserTransactions').mockResolvedValue(mockTransactions as any);

      await TransactionController.getTransactions(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { transactions: mockTransactions, count: 2 }
      });
      expect(TransactionService.prototype.getUserTransactions).toHaveBeenCalledWith('user1', 50);
    });
  });
});
