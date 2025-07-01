"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserStats {
  totalRentals: number;
  booksCount: number;
  activeRentals: number;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setUserStats({
          totalRentals: data.totalRentals || 0,
          booksCount: data.books?.length || 0,
          activeRentals: data.rentals?.length || 0
        });
      }
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-300 flex items-center justify-center">
        <div className="text-lg text-brown-800">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brown-800 mb-4">🏠 Hoş Geldiniz!</h1>
          <p className="text-xl text-brown-600">Kitap kiralama platformuna hoş geldiniz. Ne yapmak istiyorsunuz?</p>
        </div>
        {/* İstatistikler */}
        {userStats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-cream-100 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-brown-600 mb-2">{userStats.totalRentals}</div>
              <div className="text-brown-600">Toplam Kiralama</div>
            </div>
            <div className="bg-cream-100 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-brown-600 mb-2">{userStats.booksCount}</div>
              <div className="text-brown-600">Eklediğim Kitaplar</div>
            </div>
            <div className="bg-cream-100 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-brown-600 mb-2">{userStats.activeRentals}</div>
              <div className="text-brown-600">Aktif Kiralamalar</div>
            </div>
          </div>
        )}
        {/* Ana Aksiyonlar */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            href="/books"
            className="bg-brown-600 text-white p-8 rounded-xl shadow-lg hover:bg-brown-700 transition duration-300 transform hover:scale-105 text-center"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Kitapları Görüntüle</h3>
            <p className="text-cream-100">Tüm kitapları keşfedin ve kiralayın</p>
          </Link>
          <Link
            href="/books/add"
            className="bg-brown-600 text-white p-8 rounded-xl shadow-lg hover:bg-brown-700 transition duration-300 transform hover:scale-105 text-center"
          >
            <div className="text-4xl mb-4">➕</div>
            <h3 className="text-xl font-semibold mb-2">Kitap Ekle</h3>
            <p className="text-cream-100">Kitaplarınızı sisteme ekleyin</p>
          </Link>
          <Link
            href="/profile"
            className="bg-brown-600 text-white p-8 rounded-xl shadow-lg hover:bg-brown-700 transition duration-300 transform hover:scale-105 text-center"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Profilim</h3>
            <p className="text-cream-100">Profil bilgilerinizi yönetin</p>
          </Link>
          <Link
            href="/messages"
            className="bg-brown-600 text-white p-8 rounded-xl shadow-lg hover:bg-brown-700 transition duration-300 transform hover:scale-105 text-center"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Mesajlar</h3>
            <p className="text-cream-100">Diğer kullanıcılarla iletişim kurun</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 