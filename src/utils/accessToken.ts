import jwt, { type JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined");
}

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sessionId: string;
}

export const createAccessToken = (
  userId: string,
  sessionId: string,
): string => {
  return jwt.sign(
    {
      sub: userId,
      sessionId,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.sessionId !== "string"
  ) {
    throw new Error("Invalid access token");
  }

  return decoded as AccessTokenPayload;
};
