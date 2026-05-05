import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { authService, accountService, transactionService, loanService } from '../../services/bankingService';

const mockStorage: Record<string, string> = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
  },
  writable: true
});

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const server = setupServer(
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: { user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' }, token: 'mock-jwt-token' }
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${API_BASE}/accounts`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'acc1', type: 'checking', balance: 1000 },
        { id: 'acc2', type: 'savings', balance: 5000 }
      ]
    });
  }),

  http.post(`${API_BASE}/transactions/transfer`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.amount > 0 && body.fromAccountId && body.toAccountId) {
      return HttpResponse.json({
        success: true,
        data: { id: 'txn1', ...body, status: 'completed' }
      });
    }
    return HttpResponse.json({ message: 'Invalid transfer details' }, { status: 400 });
  }),

  http.post(`${API_BASE}/loans/apply`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.amount > 0) {
      return HttpResponse.json({
        success: true,
        data: { id: 'loan1', ...body, status: 'pending' }
      });
    }
    return HttpResponse.json({ message: 'Invalid loan details' }, { status: 400 });
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});

describe('Banking Integration Tests', () => {
  describe('User login flow', () => {
    it('should login successfully and return token', async () => {
      const response = await authService.login('test@example.com', 'password123');
      expect(response.success).toBe(true);
      expect(response.data.token).toBe('mock-jwt-token');
      expect(response.data.user.email).toBe('test@example.com');
    });

    it('should fail with invalid credentials', async () => {
      await expect(authService.login('wrong@example.com', 'pass')).rejects.toThrow();
    });
  });

  describe('Fetch accounts flow', () => {
    it('should fetch user accounts successfully', async () => {
      // Mock local storage to simulate logged in state
      localStorage.setItem('ps_token', 'mock-jwt-token');
      
      const response = await accountService.getAll();
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data[0].id).toBe('acc1');
    });
  });

  describe('Fund transfer flow', () => {
    it('should transfer funds successfully', async () => {
      const response = await transactionService.transfer('acc1', 'acc2', 500, 'Test transfer');
      expect(response.success).toBe(true);
      expect(response.data.amount).toBe(500);
      expect(response.data.status).toBe('completed');
    });
  });

  describe('Loan application flow', () => {
    it('should apply for a loan successfully', async () => {
      const response = await loanService.apply(10000, 'Home Renovation', 24);
      expect(response.success).toBe(true);
      expect(response.data.amount).toBe(10000);
      expect(response.data.status).toBe('pending');
    });
  });
});
