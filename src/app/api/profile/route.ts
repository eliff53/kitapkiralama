import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        books: {
          include: {
            rentals: {
              where: { endDate: { gte: new Date() } },
              include: { user: { select: { name: true } } }
            },
            category: { select: { name: true } }
          }
        },
        rentals: {
          include: {
            book: { select: { title: true, imageUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Toplam kiralama sayısı
    const totalRentals = await prisma.rental.count({ where: { userId: user.id } });

    return NextResponse.json({ ...userProfile, totalRentals });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const { name, address } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Ad gerekli' }, { status: 400 });
    }

    const userProfile = await prisma.user.update({
      where: { id: user.id },
      data: { name, address },
      select: { id: true, name: true, email: true, role: true, address: true }
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 