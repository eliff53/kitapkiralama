import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Kitap listeleme
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const where: any = {};
    if (search) {
      where.title = { contains: search };
    }
    if (category) {
      where.categoryId = parseInt(category);
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Books fetch error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kitap ekleme
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const { title, description, pricePerDay, categoryId, imageUrl } = await req.json();
    
    if (!title || !description || !pricePerDay || !categoryId) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        title,
        description,
        pricePerDay: parseFloat(pricePerDay),
        categoryId: parseInt(categoryId),
        ownerId: user.id,
        imageUrl: imageUrl || null,
      },
      include: {
        owner: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Book creation error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kitap silme
export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('id');
    
    if (!bookId) {
      return NextResponse.json({ error: 'Kitap ID gerekli' }, { status: 400 });
    }

    // Kitabın kullanıcıya ait olduğunu kontrol et
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) },
      include: { rentals: true }
    });

    if (!book) {
      return NextResponse.json({ error: 'Kitap bulunamadı' }, { status: 404 });
    }

    if (book.ownerId !== user.id) {
      return NextResponse.json({ error: 'Bu kitabı silme yetkiniz yok' }, { status: 403 });
    }

    // Aktif kiralama varsa silmeye izin verme
    const activeRentals = book.rentals.filter(rental => new Date(rental.endDate) > new Date());
    if (activeRentals.length > 0) {
      return NextResponse.json({ error: 'Aktif kiralama olan kitap silinemez' }, { status: 400 });
    }

    // Kitabı sil
    await prisma.book.delete({
      where: { id: parseInt(bookId) }
    });

    return NextResponse.json({ message: 'Kitap başarıyla silindi' });
  } catch (error) {
    console.error('Book deletion error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kitap güncelleme (haftanın kitabı seçimi için)
export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }
    const { bookId, isBookOfTheWeek } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: 'Kitap ID gerekli' }, { status: 400 });
    }
    // Önce tüm kitaplardan haftanın kitabı işaretini kaldır
    await prisma.book.updateMany({ data: { isBookOfTheWeek: false } });
    // Sonra seçilen kitabı haftanın kitabı yap
    const updated = await prisma.book.update({
      where: { id: parseInt(bookId) },
      data: { isBookOfTheWeek: !!isBookOfTheWeek },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 