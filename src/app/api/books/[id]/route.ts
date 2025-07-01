import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id);
    
    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Geçersiz kitap ID' }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
        rentals: {
          where: {
            endDate: { gte: new Date() } // Aktif kiralamalar
          },
          include: {
            user: { select: { name: true } }
          }
        }
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Kitap bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 