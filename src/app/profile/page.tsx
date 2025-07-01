"use client";
import { useEffect, useState } from "react";

// Kitap ve kiralama tipleri
interface Book {
  id: number;
  title: string;
  category: { name: string };
  rentals: Array<{ id: number; user: { name: string }; endDate: string }>;
}

interface Rental {
  id: number;
  book: { title: string; imageUrl: string | null };
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  address: string | null;
  books: Book[];
  rentals: Rental[];
  totalRentals: number;
}

export default function ProfilePage() {
  // State tanımları
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  // Profil bilgisini çek
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditName(data.name);
        setEditAddress(data.address || "");
      } else {
        setError(data.error || "Profil yüklenemedi");
      }
    } catch {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  // Bilgi güncelleme
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess("");
    setEditError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName, address: editAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditSuccess("Bilgiler güncellendi");
        fetchProfile();
      } else {
        setEditError(data.error || "Güncelleme başarısız");
      }
    } catch {
      setEditError("Sunucu hatası");
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    if (newPassword.length < 6) {
      setPwError("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess("Şifre başarıyla değiştirildi");
        setPassword("");
        setNewPassword("");
      } else {
        setPwError(data.error || "Şifre değiştirme başarısız");
      }
    } catch {
      setPwError("Sunucu hatası");
    }
  };

  // Kitap silme
  const handleDeleteBook = async (bookId: number) => {
    if (!confirm("Bu kitabı silmek istediğinizden emin misiniz?")) return;
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const res = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteSuccess("Kitap başarıyla silindi");
        fetchProfile();
      } else {
        setDeleteError(data.error || "Kitap silinirken hata oluştu");
      }
    } catch {
      setDeleteError("Sunucu hatası");
    }
  };

  // Kiralama iptal
  const handleCancelRental = async (rentalId: number) => {
    if (!confirm("Bu kiralamayı iptal etmek istediğinizden emin misiniz?")) return;
    setCancelError("");
    setCancelSuccess("");
    try {
      const res = await fetch("/api/rentals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rentalId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelSuccess("Kiralama başarıyla iptal edildi");
        fetchProfile();
      } else {
        setCancelError(data.error || "Kiralama iptal edilemedi");
      }
    } catch {
      setCancelError("Sunucu hatası");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-cream-300 py-16">
        <div className="text-lg text-brown-800">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center bg-cream-300 py-16">
        <div className="text-red-600 text-lg">{error || "Profil bulunamadı"}</div>
      </div>
    );
  }

  return (
    <div className="bg-cream-300 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-brown-800 text-center">Profilim</h1>
        {/* Kişisel Bilgiler ve Şifre */}
        <div className="bg-cream-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-brown-800">Kişisel Bilgiler</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Bilgileri Güncelle
            </button>
            {editSuccess && <div className="text-green-600 text-sm mt-2">{editSuccess}</div>}
            {editError && <div className="text-red-600 text-sm mt-2">{editError}</div>}
          </form>
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Şifre Değiştir</h3>
            <form onSubmit={handlePasswordChange} className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Mevcut şifre"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Yeni şifre (en az 6 karakter)"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Şifre Değiştir
              </button>
              {pwSuccess && <div className="text-green-600 text-sm mt-2">{pwSuccess}</div>}
              {pwError && <div className="text-red-600 text-sm mt-2">{pwError}</div>}
            </form>
          </div>
        </div>
        {/* Eklediğim Kitaplar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Eklediğim Kitaplar</h2>
          {deleteError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{deleteError}</div>}
          {deleteSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{deleteSuccess}</div>}
          {profile.books.length === 0 ? (
            <div className="text-center text-gray-600">Henüz kitap eklememişsiniz.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {profile.books.map((book) => (
                <div key={book.id} className="bg-cream-100 rounded-lg shadow p-4">
                  <h3 className="font-semibold mb-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Kategori: {book.category.name}</p>
                  <p className="text-sm text-gray-600 mb-3">Aktif kiralama: {book.rentals.length}</p>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="w-full bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition text-sm"
                  >
                    Kitabı Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Kiralama Geçmişim */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Kiralama Geçmişim</h2>
          {cancelError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{cancelError}</div>}
          {cancelSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{cancelSuccess}</div>}
          {profile.rentals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">Henüz kitap kiralamamışsınız.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {profile.rentals.map((rental) => {
                const isActive = new Date(rental.endDate) > new Date();
                return (
                  <div key={rental.id} className="bg-cream-100 rounded-lg shadow p-4">
                    {rental.book.imageUrl && (
                      <img
                        src={rental.book.imageUrl}
                        alt={rental.book.title}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h3 className="font-semibold mb-2">{rental.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-green-600 mb-2">{rental.totalPrice} TL</p>
                    {isActive ? (
                      <button
                        onClick={() => handleCancelRental(rental.id)}
                        className="w-full bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition text-sm mb-1"
                      >
                        Kiralamayı İptal Et
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500">Süre doldu</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 