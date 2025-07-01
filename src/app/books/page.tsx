"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Book {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  imageUrl: string | null;
  owner: { id: number; name: string };
  category: { name: string };
  createdAt: string;
  isBookOfTheWeek?: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 500); // 500ms bekle

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        credentials: "include"
      });
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/books?${params}`, {
        credentials: "include"
      });
      const data = await res.json();
      
      if (res.ok) {
        setBooks(data);
      } else {
        console.error("Kitaplar yüklenemedi:", data.error);
        setBooks([]);
      }
    } catch (error) {
      console.error("Kitaplar yüklenemedi:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-cream-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brown-800 mb-4">
            📚 Kitaplar
          </h1>
          <p className="text-xl text-brown-600 max-w-2xl mx-auto">
            Binlerce kitap arasından size uygun olanı bulun ve hemen kiralayın
          </p>
        </div>

        {/* Add Book Button */}
        <div className="flex justify-center mb-8">
          <Link
            href="/books/add"
            className="bg-brown-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brown-700 transition duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <span>➕</span>
            Kitap Ekle
          </Link>
        </div>

        {/* Filtreler */}
        <div className="bg-cream-100 p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-6 text-brown-800">🔍 Filtreler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-brown-700">Arama</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kitap adını yazın..."
                  className="w-full p-4 pl-12 border border-brown-300 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-transparent transition duration-200 text-brown-900"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-brown-400">🔍</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-brown-700">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-4 border border-brown-300 rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-transparent transition duration-200 text-brown-900"
              >
                <option value="">📚 Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-cream-200 text-brown-700 py-4 rounded-xl hover:bg-cream-300 transition duration-200 font-medium"
              >
                🗑️ Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Kitap Listesi */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-lg text-brown-800">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brown-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <div className="text-2xl font-semibold text-brown-800 mb-2">Kitap bulunamadı</div>
            <div className="text-brown-600">Farklı arama kriterleri deneyin veya yeni kitap ekleyin</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <div key={book.id} className="bg-cream-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-2 relative">
                {/* Haftanın Kitabı Rozeti */}
                {book.isBookOfTheWeek && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      ⭐ Haftanın Kitabı
                    </span>
                  </div>
                )}
                {book.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover transition duration-300 hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-brown-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {book.category.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center">
                    <div className="text-6xl text-brown-300">📚</div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-brown-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {book.category.name}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-brown-800 line-clamp-2">{book.title}</h3>
                  <p className="text-brown-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-green-700 font-semibold text-lg">{book.pricePerDay} TL/gün</span>
                    <span className="text-xs text-brown-500">{book.owner.name}</span>
                  </div>
                  <Link
                    href={`/books/${book.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Kirala / Detay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 