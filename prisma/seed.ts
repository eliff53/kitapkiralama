import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Test kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test Kullanıcı',
      password: hashedPassword,
      role: 'USER'
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin Kullanıcı',
      password: hashedPassword,
      role: 'ADMIN'
    },
  });

  // Kategoriler oluştur
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Roman' },
      update: {},
      create: { name: 'Roman' },
    }),
    prisma.category.upsert({
      where: { name: 'Bilim Kurgu' },
      update: {},
      create: { name: 'Bilim Kurgu' },
    }),
    prisma.category.upsert({
      where: { name: 'Tarih' },
      update: {},
      create: { name: 'Tarih' },
    }),
    prisma.category.upsert({
      where: { name: 'Bilim' },
      update: {},
      create: { name: 'Bilim' },
    }),
  ]);

  console.log('Seed tamamlandı!');
  console.log('Test kullanıcısı:', testUser.email);
  console.log('Admin kullanıcısı:', adminUser.email);
  console.log('Kategoriler:', categories.map(c => c.name));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 