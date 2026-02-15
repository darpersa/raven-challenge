import { ExecutionContext } from '@nestjs/common';
import { JwtValidationGuard } from './auth.guards';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../utils/jwt');

describe('JwtValidationGuard', () => {
  let guard: JwtValidationGuard;
  const mockVerifyToken = jwtUtils.verifyToken as jest.MockedFunction<
    typeof jwtUtils.verifyToken
  >;

  beforeEach(() => {
    guard = new JwtValidationGuard();
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    headers: any = {},
    body: any = {},
  ): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers,
          body,
        }),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should return true for valid token and matching user_id from body', () => {
      const userId = 'user-123';
      const token = 'valid-jwt-token';
      const context = createMockExecutionContext(
        { authorization: `Bearer ${token}` },
        { user_id: userId },
      );

      mockVerifyToken.mockReturnValue({ id: 1, user_id: userId });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockVerifyToken).toHaveBeenCalledWith(token);
    });

    it('should return true for valid token and matching user_id from headers', () => {
      const userId = 'user-456';
      const token = 'valid-jwt-token';
      const context = createMockExecutionContext({
        authorization: `Bearer ${token}`,
        user_id: userId,
      });

      mockVerifyToken.mockReturnValue({ id: 2, user_id: userId });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false for invalid token', () => {
      const userId = 'user-789';
      const token = 'invalid-token';
      const context = createMockExecutionContext(
        { authorization: `Bearer ${token}` },
        { user_id: userId },
      );

      mockVerifyToken.mockReturnValue(null);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false for mismatching user_id', () => {
      const userId = 'user-123';
      const token = 'valid-jwt-token';
      const context = createMockExecutionContext(
        { authorization: `Bearer ${token}` },
        { user_id: userId },
      );

      mockVerifyToken.mockReturnValue({ id: 1, user_id: 'different-user' });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when authorization header is missing', () => {
      const context = createMockExecutionContext({}, { user_id: 'user-123' });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should return false when authorization header format is invalid', () => {
      const context = createMockExecutionContext(
        { authorization: 'InvalidFormat' },
        { user_id: 'user-123' },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(false);
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should return false when user_id is missing', () => {
      const token = 'valid-jwt-token';
      const context = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      mockVerifyToken.mockReturnValue({ id: 1, user_id: 'user-123' });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should prefer body user_id over header user_id', () => {
      const bodyUserId = 'user-from-body';
      const headerUserId = 'user-from-header';
      const token = 'valid-jwt-token';
      const context = createMockExecutionContext(
        { authorization: `Bearer ${token}`, user_id: headerUserId },
        { user_id: bodyUserId },
      );

      mockVerifyToken.mockReturnValue({ id: 1, user_id: bodyUserId });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('checkTokenValidity', () => {
    it('should return true when token is valid and user_id matches', () => {
      const token = 'valid-token';
      const userId = 'user-123';
      mockVerifyToken.mockReturnValue({ id: 1, user_id: userId });

      const result = guard.checkTokenValidity(token, userId);

      expect(result).toBe(true);
    });

    it('should return false when token is invalid', () => {
      const token = 'invalid-token';
      const userId = 'user-123';
      mockVerifyToken.mockReturnValue(null);

      const result = guard.checkTokenValidity(token, userId);

      expect(result).toBe(false);
    });

    it('should return false when user_id does not match', () => {
      const token = 'valid-token';
      const userId = 'user-123';
      mockVerifyToken.mockReturnValue({ id: 1, user_id: 'different-user' });

      const result = guard.checkTokenValidity(token, userId);

      expect(result).toBe(false);
    });
  });
});
