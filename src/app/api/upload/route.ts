import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }
    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece resim dosyaları kabul edilir' }, { status: 400 });
    }
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    // Dosya adını benzersiz yap
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    // Uploads klasörünü oluştur
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    // Dosyayı kaydet
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    // URL'i döndür
    const imageUrl = `/uploads/${fileName}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Dosya yükleme hatası' }, { status: 500 });
  }
} 