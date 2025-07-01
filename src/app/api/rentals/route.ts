import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const { bookId, startDate, endDate } = await req.json();
    
    if (!bookId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    // Kitabın mevcut durumunu kontrol et
    const book = await prisma.book.findUnique({
      where: { id: parseInt(bookId) },
      include: {
        rentals: {
          where: {
            endDate: { gte: new Date() } // Aktif kiralamalar
          }
        }
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Kitap bulunamadı' }, { status: 404 });
    }

    if (book.rentals.length > 0) {
      return NextResponse.json({ error: 'Bu kitap şu anda kiralanmış durumda' }, { status: 409 });
    }

    // Seçilen tarihlerle çakışan başka bir kiralama var mı kontrol et
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' }, { status: 400 });
    }

    if (start < new Date()) {
      return NextResponse.json({ error: 'Başlangıç tarihi bugünden önce olamaz' }, { status: 400 });
    }

    // Çakışan kiralama var mı?
    const overlappingRental = await prisma.rental.findFirst({
      where: {
        bookId: parseInt(bookId),
        // (A başla < B bitiş) ve (A bitiş > B başla) ise çakışma vardır
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });
    if (overlappingRental) {
      return NextResponse.json({ error: 'Bu tarihlerde kitap zaten kiralanmış' }, { status: 409 });
    }

    // Gün sayısını hesapla
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * book.pricePerDay;

    const rental = await prisma.rental.create({
      data: {
        userId: user.id,
        bookId: parseInt(bookId),
        startDate: start,
        endDate: end,
        totalPrice,
      },
      include: {
        book: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      message: 'Kiralama başarılı',
      rental: {
        id: rental.id,
        bookTitle: rental.book.title,
        userName: rental.user.name,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalPrice: rental.totalPrice,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcının kiralamalarını listele
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      where: { userId: user.id },
      include: {
        book: { select: { title: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Kullanıcı kendi kiralamasını iptal edebilir
export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }
    const { rentalId } = await req.json();
    if (!rentalId) {
      return NextResponse.json({ error: 'Kiralama ID gerekli' }, { status: 400 });
    }
    // Kiralamanın kullanıcıya ait olup olmadığını kontrol et
    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental || rental.userId !== user.id) {
      return NextResponse.json({ error: 'Bu kiralamayı iptal etme yetkiniz yok' }, { status: 403 });
    }
    await prisma.rental.delete({ where: { id: rentalId } });
    return NextResponse.json({ message: 'Kiralama başarıyla iptal edildi' });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 