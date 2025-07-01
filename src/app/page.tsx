import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-300">
      {/* Hero Bölümü */}
      <div className="bg-cream-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-brown-800 mb-6">
              Kitap Kiralama Platformu
            </h1>
            <p className="text-xl text-brown-600 mb-8 max-w-3xl mx-auto">
              Kitaplarınızı paylaşın, başkalarının kitaplarını kiralayın. Modern ve güvenli kitap kiralama deneyimi.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="bg-brown-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-brown-700 transition"
              >
                Hemen Kayıt Ol
              </Link>
              <Link
                href="/login"
                className="bg-cream-200 text-brown-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-cream-300 transition"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Özellikler Bölümü */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-brown-800 mb-12">
          Neden Kitap Kiralama Platformu?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-cream-100 p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-4 text-brown-800">Kitap Paylaşımı</h3>
            <p className="text-brown-600">Kitaplarınızı diğer kullanıcılarla paylaşın ve gelir elde edin.</p>
          </div>
          <div className="bg-cream-100 p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-4 text-brown-800">Güvenli Kiralama</h3>
            <p className="text-brown-600">Tarih bazlı kiralama sistemi ile kitapları güvenle kiralayın.</p>
          </div>
          <div className="bg-cream-100 p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-4 text-brown-800">Kullanıcı İletişimi</h3>
            <p className="text-brown-600">Kitap sahipleri ile doğrudan iletişim kurun.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-cream-200 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brown-800 mb-12">
            Nasıl Çalışır?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-brown-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brown-800">Kayıt Olun</h3>
              <p className="text-brown-600 text-sm">
                Hızlıca hesap oluşturun ve platforma katılın
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brown-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brown-800">Kitap Ekleyin</h3>
              <p className="text-brown-600 text-sm">
                Kitaplarınızı sisteme ekleyin ve kiralama başlatın
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brown-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brown-800">Kiralayın</h3>
              <p className="text-brown-600 text-sm">
                Diğer kullanıcıların kitaplarını kiralayın
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brown-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brown-800">Kazanın</h3>
              <p className="text-brown-600 text-sm">
                Kitaplarınızı kiralayarak gelir elde edin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-brown-800 text-cream-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-cream-200">
            © 2024 Kitap Kiralama Platformu. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
