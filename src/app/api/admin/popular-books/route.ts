import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gizliAnahtar';

export async function GET(req: NextRequest) {
  try {
    // Token kontrolü
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    }

    // En çok kiralanan kitapları getir
    const popularBooks = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        pricePerDay: true,
        imageUrl: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        rentals: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            rentals: true
          }
        }
      },
      orderBy: {
        rentals: {
          _count: 'desc'
        }
      },
      take: 20 // En çok kiralanan 20 kitap
    });

    // Toplam gelir hesaplama
    const booksWithStats = popularBooks.map(book => {
      const totalRevenue = book.rentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
      const activeRentals = book.rentals.filter(rental => 
        new Date(rental.endDate) > new Date()
      ).length;

      return {
        ...book,
        totalRevenue,
        activeRentals,
        totalRentals: book._count.rentals
      };
    });

    return NextResponse.json(booksWithStats);
  } catch (error) {
    console.error('Popular books error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 