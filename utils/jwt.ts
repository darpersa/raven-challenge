import * as jwt from 'jsonwebtoken';

export const generateToken = (id: number, user_id: string): string => {
  return jwt.sign({ id, user_id }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  } as jwt.SignOptions);
};

export const verifyToken = (
  token: string,
): { id: number; user_id: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      user_id: string;
    };
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
};
