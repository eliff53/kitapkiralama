
# 📚 Kitap Kiralama Sistemi

## 📖 Proje Hakkında

Bu proje, kullanıcıların kendi kitaplarını diğer kullanıcılara kiralayabileceği veya diğer kullanıcıların kitaplarını kiralayabileceği bir web platformudur. Kitap sahipleri, kitaplarını günlük fiyat belirleyerek sisteme ekleyebilir ve kitap kiralamak isteyenler bu kitapları belirli tarih aralıklarında kiralayabilirler.

### Temel Özellikler

- **Kitap İşlemleri**
  - Kitap ekleme ve düzenleme
  - Kitap arama ve filtreleme
  - Kategori bazlı listeleme
  - Kitap detay görüntüleme
  - Kitap kiralama ve iade etme

- **Kullanıcı Sistemi**
  - Üyelik ve giriş işlemleri
  - Profil yönetimi
  - Kullanıcılar arası mesajlaşma
  - Kitap yorumlama ve puanlama

- **Admin Paneli**
  - Kullanıcı yönetimi
  - Kitap istatistikleri
  - Haftanın kitabı belirleme
  - Sistem raporları

## 🛠️ Kullanılan Teknolojiler

- **Frontend**
  - Next.js 14 (App Router)
  - TailwindCSS (UI tasarımı)
  - React Icons (ikonlar)

- **Backend**
  - Next.js API Routes
  - Prisma (ORM)
  - SQLite (veritabanı)

## ⚙️ Kurulum

1. **Projeyi Bilgisayarınıza İndirin**
   ```bash
   git clone https://github.com/kullaniciadi/kitapkiralama1.git
   cd kitapkiralama1
   ```

2. **Gerekli Paketleri Yükleyin**
   ```bash
   npm install
   ```

3. **Veritabanı Ayarları**
   - `.env` dosyası oluşturun:
     ```env
     DATABASE_URL="file:./prisma/dev.db"
     ```
   - Veritabanını hazırlayın:
     ```bash
     npx prisma migrate dev
     ```
   - Örnek verileri yükleyin:
     ```bash
     npx prisma db seed
     ```

4. **Projeyi Çalıştırın**
   ```bash
   npm run dev
   ```
   Tarayıcınızda `http://localhost:3000` adresine giderek projeyi görüntüleyebilirsiniz.

## 👤 Örnek Hesaplar

### Admin Hesabı
- **E-posta:** admin@admin.com
- **Şifre:** 123456

### Test Kullanıcı Hesabı
- **E-posta:** test@test.com
- **Şifre:** 123456

## 📱 Ekran Görüntüleri ve Özellikler

### Kullanıcı Paneli
- Ana sayfa ve kitap listeleme
- Kitap detay sayfası
- Kiralama takvimi ve ödeme
- Mesajlaşma sistemi
- Profil yönetimi
- Kitap yorum ve puanlama

### Admin Paneli
- Kullanıcı listesi ve yönetimi
- Kitap istatistikleri
- Haftanın kitabı seçimi
- Sistem raporları ve analizler

## 📁 Proje Yapısı

```
src/
├── app/                 # Sayfa bileşenleri
│   ├── admin/          # Admin paneli sayfaları
│   ├── books/          # Kitap işlemleri sayfaları
│   ├── messages/       # Mesajlaşma sayfaları
│   └── profile/        # Profil sayfaları
├── components/         # Ortak kullanılan bileşenler
└── lib/               # Yardımcı fonksiyonlar
prisma/
├── schema.prisma      # Veritabanı şeması
└── seed.ts           # Örnek veri scripti
```

## 🔒 Güvenlik

- Kullanıcı kimlik doğrulama ve yetkilendirme
- Admin paneli erişim kontrolü
- Güvenli mesajlaşma sistemi
- Veri şifreleme ve güvenliği








