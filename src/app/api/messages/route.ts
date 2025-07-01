import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Kullanıcının mesajlarını listele (gönderilen ve alınan)
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }



    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Yeni mesaj gönder
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const { receiverId, content } = await req.json();
    
    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Alıcı ve mesaj içeriği gerekli' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    // Kendine mesaj göndermeyi engelle
    if (user.id === parseInt(receiverId)) {
      return NextResponse.json({ error: 'Kendinize mesaj gönderemezsiniz' }, { status: 400 });
    }

    // Alıcının var olduğunu kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Alıcı bulunamadı' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: parseInt(receiverId),
        content: content.trim()
      },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      }
    });

    return NextResponse.json({
      message: 'Mesaj gönderildi',
      data: message
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 