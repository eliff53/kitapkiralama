import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gizliAnahtar';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log('Login attempt for:', email);
    console.log('JWT_SECRET used:', JWT_SECRET);
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role, name: user.name });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json({ error: 'Şifre yanlış' }, { status: 401 });
    }
    
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    };
    
    console.log('Creating token with payload:', tokenPayload);
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Token generated successfully');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    // Cookie ayarlarını güncelle
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });
    
    console.log('Cookie string created:', cookie.substring(0, 50) + '...');
    
    const response = NextResponse.json({ 
      message: 'Giriş başarılı', 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
    
    response.headers.set('Set-Cookie', cookie);
    
    console.log('Cookie set successfully for user:', user.email);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 