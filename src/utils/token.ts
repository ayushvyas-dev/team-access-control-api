import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.config.js';
import crypto from 'crypto';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sessionId: string;
  type: 'access';
}

export const createToken = (
  userId: string,
  sessionId: string,
  type: 'access' | 'refresh',
  expiresIn?: SignOptions['expiresIn'],
): string => {
  const secret =
    type === 'access'
      ? config.ACCESS_TOKEN_SECRET
      : config.REFRESH_TOKEN_SECRET;
  const tokenExpiresIn =
    expiresIn ??
    (type === 'access'
      ? (config.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'])
      : config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60);
  return jwt.sign(
    {
      sub: userId,
      sessionId,
      type,
    },
    secret,
    {
      expiresIn: tokenExpiresIn,
      jwtid: crypto.randomUUID(),
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

  if (
    typeof decoded === 'string' ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.sessionId !== 'string' ||
    decoded.type !== 'access'
  ) {
    throw new Error('Invalid access token');
  }

  return decoded as AccessTokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
