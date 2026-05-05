/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoanController from '../controllers/LoanController';
import LoanService from '../services/LoanService';

vi.mock('../services/LoanService');

describe('LoanController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      body: {},
      user: { id: 'user1' },
      params: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  describe('apply', () => {
    it('should submit a loan application successfully', async () => {
      mockReq.body = { amount: 10000, purpose: 'Home', termMonths: 24 };
      const mockLoan = { id: 'loan1', amount: 10000 };
      
      vi.spyOn(LoanService.prototype, 'applyForLoan').mockResolvedValue(mockLoan as any);

      await LoanController.apply(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Loan application submitted successfully',
        data: { loan: mockLoan }
      });
    });

    it('should return 400 if fields are missing', async () => {
      mockReq.body = { amount: 10000 };

      await LoanController.apply(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Amount, purpose, and termMonths are required'
      });
    });
  });

  describe('getLoans', () => {
    it('should return loans for the authenticated user', async () => {
      const mockLoans = [{ id: 'loan1' }, { id: 'loan2' }];
      vi.spyOn(LoanService.prototype, 'getLoansByUserId').mockResolvedValue(mockLoans as any);

      await LoanController.getLoans(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { loans: mockLoans, count: 2 }
      });
    });
  });

  describe('updateStatus', () => {
    it('should approve a loan successfully', async () => {
      mockReq.params.id = 'loan1';
      mockReq.body.status = 'approved';
      const mockLoan = { id: 'loan1', status: 'approved' };

      vi.spyOn(LoanService.prototype, 'updateLoanStatus').mockResolvedValue(mockLoan as any);

      await LoanController.updateStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Loan application approved successfully',
        data: { loan: mockLoan }
      });
    });

    it('should reject a loan successfully', async () => {
      mockReq.params.id = 'loan1';
      mockReq.body.status = 'rejected';
      const mockLoan = { id: 'loan1', status: 'rejected' };

      vi.spyOn(LoanService.prototype, 'updateLoanStatus').mockResolvedValue(mockLoan as any);

      await LoanController.updateStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Loan application rejected successfully',
        data: { loan: mockLoan }
      });
    });
  });
});
