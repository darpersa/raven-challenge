import { generateToken, verifyToken } from './jwt';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JWT Utils', () => {
  const mockJwt = jwt as jest.Mocked<typeof jwt>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a token with provided id and user_id', () => {
      const id = 123;
      const userId = 'user-abc-123';
      const expectedToken = 'generated-jwt-token';
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRE = '1h';

      mockJwt.sign.mockReturnValue(expectedToken as any);

      const result = generateToken(id, userId);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id, user_id: userId },
        'test-secret',
        { expiresIn: '1h' },
      );
      expect(result).toBe(expectedToken);
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      const id = 456;
      const userId = 'user-def-456';
      delete process.env.JWT_SECRET;
      mockJwt.sign.mockReturnValue('token' as any);

      generateToken(id, userId);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id, user_id: userId },
        'default-secret',
        expect.any(Object),
      );
    });

    it('should use default expiry when JWT_EXPIRE is not set', () => {
      const id = 789;
      const userId = 'user-ghi-789';
      delete process.env.JWT_EXPIRE;
      mockJwt.sign.mockReturnValue('token' as any);

      generateToken(id, userId);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '24h' },
      );
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify a valid token', () => {
      const token = 'valid-jwt-token';
      const decodedPayload = { id: 123, user_id: 'user-abc' };
      process.env.JWT_SECRET = 'test-secret';

      mockJwt.verify.mockReturnValue(decodedPayload as any);

      const result = verifyToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toEqual(decodedPayload);
    });

    it('should return null for invalid token', () => {
      const token = 'invalid-token';
      process.env.JWT_SECRET = 'test-secret';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = 'expired-token';
      process.env.JWT_SECRET = 'test-secret';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      const token = 'some-token';
      delete process.env.JWT_SECRET;
      mockJwt.verify.mockReturnValue({ id: 1, user_id: 'user' } as any);

      verifyToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'default-secret');
    });

    it('should handle malformed token', () => {
      const token = 'malformed.token';
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      const result = verifyToken(token);

      expect(result).toBeNull();
    });
  });
});
