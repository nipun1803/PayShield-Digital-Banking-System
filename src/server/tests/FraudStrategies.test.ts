/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HighValueStrategy from '../patterns/strategy/HighValueStrategy';
import RapidTransactionStrategy from '../patterns/strategy/RapidTransactionStrategy';
import NewRecipientStrategy from '../patterns/strategy/NewRecipientStrategy';
import Transaction from '../models/Transaction';

vi.mock('../models/Transaction');

describe('FraudStrategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HighValueStrategy', () => {
    it('should flag transactions above threshold', async () => {
      const strategy = new HighValueStrategy(50000);
      const transaction = { amount: 60000 };
      
      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(true);
      expect(result.ruleName).toBe('HighValueStrategy');
      expect(result.severity).toBe('medium');
    });

    it('should assign high severity for very large amounts', async () => {
      const strategy = new HighValueStrategy(50000);
      const transaction = { amount: 150000 };
      
      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('should pass normal transactions below threshold', async () => {
      const strategy = new HighValueStrategy(50000);
      const transaction = { amount: 10000 };
      
      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(false);
      expect(result.ruleName).toBe('HighValueStrategy');
    });
  });

  describe('RapidTransactionStrategy', () => {
    it('should flag rapid repeated transactions', async () => {
      const strategy = new RapidTransactionStrategy(60000, 3);
      const transaction = { fromAccount: 'acc1' };
      
      vi.mocked(Transaction.countDocuments).mockResolvedValue(3 as any);

      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(true);
      expect(result.ruleName).toBe('RapidTransactionStrategy');
      expect(result.severity).toBe('high');
      expect(Transaction.countDocuments).toHaveBeenCalledWith({
        fromAccount: 'acc1',
        timestamp: { $gte: expect.any(Date) }
      });
    });

    it('should pass if below transaction limit in window', async () => {
      const strategy = new RapidTransactionStrategy(60000, 3);
      const transaction = { fromAccount: 'acc1' };
      
      vi.mocked(Transaction.countDocuments).mockResolvedValue(1 as any);

      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(false);
    });
  });

  describe('NewRecipientStrategy', () => {
    it('should flag transfers to new/unknown recipients', async () => {
      const strategy = new NewRecipientStrategy();
      const transaction = { fromAccount: 'acc1', toAccount: 'acc2' };
      
      vi.mocked(Transaction.countDocuments).mockResolvedValue(0 as any);

      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(true);
      expect(result.ruleName).toBe('NewRecipientStrategy');
      expect(result.severity).toBe('low');
      expect(Transaction.countDocuments).toHaveBeenCalledWith({
        fromAccount: 'acc1',
        toAccount: 'acc2'
      });
    });

    it('should pass if previous transactions exist', async () => {
      const strategy = new NewRecipientStrategy();
      const transaction = { fromAccount: 'acc1', toAccount: 'acc2' };
      
      vi.mocked(Transaction.countDocuments).mockResolvedValue(5 as any);

      const result = await strategy.analyze(transaction as any, {} as any);

      expect(result.flagged).toBe(false);
    });
  });
});
