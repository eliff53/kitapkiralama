import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gizliAnahtar';

// Kitap değerlendirmelerini getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'Kitap ID gerekli' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        bookId: parseInt(bookId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Ortalama puanı hesapla
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Reviews error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni değerlendirme ekle
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const { bookId, rating, comment } = await req.json();

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçersiz değerlendirme' }, { status: 400 });
    }

    // Kullanıcının bu kitabı kiralayıp kiralamadığını kontrol et
    const hasRented = await prisma.rental.findFirst({
      where: {
        userId: userId,
        bookId: parseInt(bookId)
      }
    });

    if (!hasRented) {
      return NextResponse.json({ error: 'Bu kitabı kiraladıktan sonra değerlendirebilirsiniz' }, { status: 403 });
    }

    // Mevcut değerlendirmeyi kontrol et
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        bookId: parseInt(bookId)
      }
    });

    if (existingReview) {
      // Mevcut değerlendirmeyi güncelle
      const updatedReview = await prisma.review.update({
        where: {
          id: existingReview.id
        },
        data: {
          rating: rating,
          comment: comment || null
        }
      });

      return NextResponse.json({ success: true, review: updatedReview });
    } else {
      // Yeni değerlendirme oluştur
      const newReview = await prisma.review.create({
        data: {
          userId: userId,
          bookId: parseInt(bookId),
          rating: rating,
          comment: comment || null
        }
      });

      return NextResponse.json({ success: true, review: newReview });
    }
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 