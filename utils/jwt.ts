import * as jwt from 'jsonwebtoken';

export const generateToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  } as jwt.SignOptions);
};

export const verifyToken = (
  token: string,
): { id: number; email: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      id: number;
      email: string;
    };
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
};
