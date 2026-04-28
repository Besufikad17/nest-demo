export interface JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
}

export interface JwtUser {
  user: User;
}
