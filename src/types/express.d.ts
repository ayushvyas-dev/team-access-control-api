declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
      };
      membership?: {
        id: string;
        userId: string;
        organizationId: string;
        role: Role;
      };
    }
  }
}

export {};
