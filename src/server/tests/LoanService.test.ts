/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoanService from '../services/LoanService';
import Loan from '../models/Loan';

vi.mock('../models/Loan');

describe('LoanService', () => {
  let service: LoanService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LoanService();
  });

  describe('applyForLoan', () => {
    it('should successfully apply for a loan', async () => {
      const input = { amount: 10000, purpose: 'Home', termMonths: 12 };
      const expectedMonthlyPayment = (10000 * 1.1) / 12;

      const mockSave = vi.fn().mockResolvedValue({
        _id: 'loan1',
        userId: 'u1',
        ...input,
        interestRate: 10.0,
        monthlyPayment: parseFloat(expectedMonthlyPayment.toFixed(2)),
        status: 'pending'
      });

      // Mock the Loan constructor
      vi.mocked(Loan).mockImplementation(function() {
        return { save: mockSave };
      } as any);

      const result = await service.applyForLoan('u1', input);

      expect(result.amount).toBe(10000);
      expect(result.monthlyPayment).toBe(parseFloat(expectedMonthlyPayment.toFixed(2)));
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getLoansByUserId', () => {
    it('should return loans for a user', async () => {
      const mockLoans = [{ _id: 'loan1' }, { _id: 'loan2' }];
      const mockFind = {
        sort: vi.fn().mockResolvedValue(mockLoans),
      };

      vi.mocked(Loan.find).mockReturnValue(mockFind as any);

      const result = await service.getLoansByUserId('u1');

      expect(result).toEqual(mockLoans);
      expect(Loan.find).toHaveBeenCalledWith({ userId: 'u1' });
      expect(mockFind.sort).toHaveBeenCalledWith({ appliedAt: -1 });
    });
  });

  describe('updateLoanStatus', () => {
    it('should update loan status to approved and set approvedAt date', async () => {
      const mockLoan = { _id: 'loan1', status: 'approved' };
      vi.mocked(Loan.findByIdAndUpdate).mockResolvedValue(mockLoan as any);

      const result = await service.updateLoanStatus('loan1', 'approved' as any);

      expect(result).toEqual(mockLoan);
      expect(Loan.findByIdAndUpdate).toHaveBeenCalledWith(
        'loan1',
        expect.objectContaining({ status: 'approved', approvedAt: expect.any(Date) }),
        { new: true }
      );
    });

    it('should update loan status to rejected', async () => {
      const mockLoan = { _id: 'loan1', status: 'rejected' };
      vi.mocked(Loan.findByIdAndUpdate).mockResolvedValue(mockLoan as any);

      const result = await service.updateLoanStatus('loan1', 'rejected' as any);

      expect(result).toEqual(mockLoan);
      expect(Loan.findByIdAndUpdate).toHaveBeenCalledWith(
        'loan1',
        { status: 'rejected' },
        { new: true }
      );
    });
  });
});
