import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken, isAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

// Tüm kullanıcıları listele
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            rentals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcı sil
export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Kendini silmeye çalışıyorsa engelle
    if (user.id === parseInt(userId)) {
      return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 });
    }

    // Kullanıcının kitaplarını ve kiralamalarını da sil
    await prisma.rental.deleteMany({ where: { userId: parseInt(userId) } });
    await prisma.book.deleteMany({ where: { ownerId: parseInt(userId) } });
    await prisma.user.delete({ where: { id: parseInt(userId) } });

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcı rolünü değiştir
export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { userId, role } = await req.json();
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Kullanıcı ID ve rol gerekli' }, { status: 400 });
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }

    // Kendi rolünü değiştirmeye çalışıyorsa engelle
    if (user.id === parseInt(userId)) {
      return NextResponse.json({ error: 'Kendi rolünüzü değiştiremezsiniz' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ 
      message: 'Kullanıcı rolü güncellendi', 
      user: updatedUser
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 