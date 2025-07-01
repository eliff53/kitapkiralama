import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserInfo {
  id: number;
  email: string;
  role: string;
  name: string;
}

// JWT secret key - tüm API'lerde aynı olmalı
const JWT_SECRET = process.env.JWT_SECRET || 'gizliAnahtar';

// Cookie'den token'ı al ve kullanıcı bilgilerini döndür
export function getUserFromToken(request: NextRequest): UserInfo | null {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as UserInfo;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Header'dan kullanıcı bilgilerini al (eski yöntem - geriye uyumluluk için)
export function getUserFromHeaders(request: NextRequest): UserInfo | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  const userName = request.headers.get('x-user-name');
  if (!userId || !userEmail || !userRole || !userName) return null;
  return {
    id: parseInt(userId),
    email: userEmail,
    role: userRole,
    name: userName
  };
}

// Admin kontrolü
export function isAdmin(user: UserInfo | null): boolean {
  return user?.role === 'ADMIN';
}

// Kullanıcı kontrolü
export function isAuthenticated(user: UserInfo | null): boolean {
  return user !== null;
} 