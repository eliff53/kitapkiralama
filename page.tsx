"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  address: string | null;
  createdAt: string;
  _count: {
    books: number;
    rentals: number;
  };
}

interface PopularBook {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  imageUrl: string | null;
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  totalRevenue: number;
  activeRentals: number;
  totalRentals: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchPopularBooks();
    fetchBooks();
    fetch("/api/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCurrentUserId(data.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error || "Kullanıcılar yüklenemedi");
      }
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularBooks = async () => {
    try {
      const res = await fetch("/api/admin/popular-books", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setPopularBooks(data);
      } else {
        console.error("Popüler kitaplar yüklenemedi:", data.error);
      }
    } catch (err) {
      console.error("Popüler kitaplar yüklenemedi:", err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setBooks(data);
    } catch {}
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Kullanıcı başarıyla silindi");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.error || "Kullanıcı silinemedi");
      }
    } catch (err) {
      setError("Sunucu hatası");
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          role: newRole 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Kullanıcı rolü güncellendi");
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole("");
        fetchUsers();
      } else {
        setError(data.error || "Rol güncellenemedi");
      }
    } catch (err) {
      setError("Sunucu hatası");
    }
  };

  const handleSetBookOfTheWeek = async (bookId: number) => {
    try {
      const res = await fetch("/api/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookId, isBookOfTheWeek: true }),
      });
      if (res.ok) {
        fetchBooks();
        setSuccess("Haftanın kitabı seçildi");
      }
    } catch {}
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-cream-300 py-16">
        <div className="text-lg text-brown-800">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-cream-300 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brown-800">Admin Paneli</h1>
          <div className="text-sm text-brown-600">
            Toplam {users.length} kullanıcı, {popularBooks.length} kitap istatistiği
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-cream-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-brown-600 text-white'
                : 'text-brown-700 hover:text-brown-800'
            }`}
          >
            👥 Kullanıcılar
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'books'
                ? 'bg-brown-600 text-white'
                : 'text-brown-700 hover:text-brown-800'
            }`}
          >
            📊 İstatistikler
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-cream-100 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      İstatistikler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-cream-100 divide-y divide-cream-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-cream-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-brown-800">
                            {user.name}
                          </div>
                          <div className="text-sm text-brown-600">
                            {user.email}
                          </div>
                          {user.address && (
                            <div className="text-xs text-brown-500">
                              {user.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-600">
                        <div>Kitap: {user._count.books}</div>
                        <div>Kiralama: {user._count.rentals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-600">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openRoleModal(user)}
                            className={`text-brown-600 hover:text-brown-800 ${currentUserId === user.id ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            disabled={currentUserId === user.id}
                          >
                            Rol Değiştir
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="bg-cream-100 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Kitap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Sahip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      İstatistikler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                      Gelir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-cream-100 divide-y divide-cream-200">
                  {popularBooks.map((book, index) => (
                    <tr key={book.id} className="hover:bg-cream-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {book.imageUrl ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={book.imageUrl} 
                                alt={book.title} 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-brown-200 flex items-center justify-center">
                                <span className="text-brown-600 text-lg">📚</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-brown-800">
                              #{index + 1} {book.title}
                            </div>
                            <div className="text-sm text-brown-600">
                              {book.pricePerDay} ₺/gün
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brown-100 text-brown-800">
                          {book.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brown-800">{book.owner.name}</div>
                        <div className="text-sm text-brown-600">{book.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-600">
                        <div>Toplam: {book.totalRentals}</div>
                        <div>Aktif: {book.activeRentals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {book.totalRevenue.toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kitaplar Listesi (Admin) */}
        <div className="bg-cream-100 rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Kitaplar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-brown-700 uppercase">Başlık</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-brown-700 uppercase">Sahip</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-brown-700 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-cream-100 divide-y divide-cream-200">
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-4 py-2">{book.title}</td>
                    <td className="px-4 py-2">{book.owner?.name || "-"}</td>
                    <td className="px-4 py-2">
                      {book.isBookOfTheWeek ? (
                        <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-semibold">Haftanın Kitabı</span>
                      ) : (
                        <button
                          onClick={() => handleSetBookOfTheWeek(book.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Haftanın Kitabı Yap
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rol Değiştirme Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {selectedUser.name} için rol değiştir
              </h3>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleRoleChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Güncelle
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Silme Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Kullanıcıyı sil
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedUser.name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sil
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 