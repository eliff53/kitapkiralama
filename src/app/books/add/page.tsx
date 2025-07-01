"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

export default function AddBookPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Kategorileri çek
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      const data = await res.json();
      setCategories(data);
    } catch {}
  };

  // Kitap ekleme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, pricePerDay, categoryId, imageUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Kitap başarıyla eklendi!");
        setTimeout(() => router.push("/books"), 1000);
      } else {
        setError(data.error || "Kitap eklenemedi");
      }
    } catch {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setImageUrl(data.imageUrl);
      else setError(data.error || "Resim yüklenemedi");
    } catch {
      setError("Resim yüklenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-cream-300 py-8">
      <div className="max-w-xl mx-auto bg-cream-100 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-brown-800 text-center">Kitap Ekle</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded">{success}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fiyat (TL/gün)</label>
            <input
              type="number"
              min="1"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kapak Fotoğrafı</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
            {imageUrl && <img src={imageUrl} alt="Kapak" className="mt-2 h-32 object-cover rounded" />}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? "Ekleniyor..." : "Kitabı Ekle"}
          </button>
        </form>
      </div>
    </div>
  );
} 