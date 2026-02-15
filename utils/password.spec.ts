import { hashPassword, comparePasswords } from './password';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('Password Utils', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'mySecretPassword123';
      const salt = 'test-salt';
      const hashedPassword = 'hashed-password-string';

      mockBcrypt.genSalt.mockResolvedValue(salt as any);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as any);

      const result = await hashPassword(password);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(hashedPassword);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      mockBcrypt.genSalt
        .mockResolvedValueOnce('salt1' as any)
        .mockResolvedValueOnce('salt2' as any);
      mockBcrypt.hash
        .mockResolvedValueOnce('hash1' as any)
        .mockResolvedValueOnce('hash2' as any);

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe('hash1');
      expect(hash2).toBe('hash2');
      expect(mockBcrypt.genSalt).toHaveBeenCalledTimes(2);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'correctPassword';
      const hashedPassword = 'hashed-correct-password';
      mockBcrypt.compare.mockResolvedValue(true as any);

      const result = await comparePasswords(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongPassword';
      const hashedPassword = 'hashed-correct-password';
      mockBcrypt.compare.mockResolvedValue(false as any);

      const result = await comparePasswords(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = 'hashed-password';
      mockBcrypt.compare.mockResolvedValue(false as any);

      const result = await comparePasswords(password, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
