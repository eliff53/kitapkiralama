"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StarIcon } from '@heroicons/react/24/solid';

interface Book {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  imageUrl: string | null;
  owner: { id: number; name: string; email: string };
  category: { name: string };
  rentals: Array<{
    id: number;
    startDate: string;
    endDate: string;
    user: { name: string };
  }>;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentalLoading, setRentalLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [hasRented, setHasRented] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBook();
      fetchUser();
    }
    if (params.id && user) {
      fetchReviews();
      checkIfUserRented();
    }
  }, [params.id, user]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      // Kullanıcı giriş yapmamış olabilir, bu normal
    }
  };

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}`, {
        credentials: "include"
      });
      const data = await res.json();
      
      if (res.ok) {
        setBook(data);
      } else {
        setError(data.error || "Kitap bulunamadı");
      }
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !book) {
      setTotalPrice(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      setTotalPrice(0);
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const total = diffDays * book.pricePerDay;
    setTotalPrice(total);
  };

  // Tarih değişikliklerinde ücret hesapla
  useEffect(() => {
    calculateTotalPrice();
  }, [startDate, endDate, book]);

  const handleRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Lütfen tarih seçin");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      setError("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      return;
    }

    if (start < new Date()) {
      setError("Başlangıç tarihi bugünden önce olamaz");
      return;
    }

    setRentalLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookId: book?.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Kiralama başarılı!");
        router.push("/profile");
      } else {
        setError(data.error || "Kiralama işlemi başarısız");
      }
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setRentalLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?bookId=${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
        // Kendi değerlendirmesini bul
        if (user) {
          const myReview = data.reviews.find((r: any) => r.user.id === user.id);
          if (myReview) {
            setMyRating(myReview.rating);
            setMyComment(myReview.comment || "");
          }
        }
      }
    } catch {}
  };

  const checkIfUserRented = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/profile`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.rentals) {
        setHasRented(data.rentals.some((r: any) => r.bookId === Number(params.id)));
      }
    } catch {}
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRating) {
      setReviewError("Lütfen puan verin");
      return;
    }
    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookId: params.id,
          rating: myRating,
          comment: myComment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess("Değerlendirmeniz kaydedildi");
        fetchReviews();
      } else {
        setReviewError(data.error || "Bir hata oluştu");
      }
    } catch {
      setReviewError("Sunucu hatası");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 flex items-center justify-center py-16">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bg-gray-100 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || "Kitap bulunamadı"}</div>
          <Link href="/books" className="text-blue-600 hover:underline">
            Kitaplara geri dön
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentlyRented = book.rentals.length > 0;
  const currentRental = book.rentals[0];
  const isOwner = user && book.owner.id === user.id;
  const hasRentals = book.rentals.length > 0;

  return (
    <div className="bg-cream-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-cream-100 rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            {/* Kitap Resmi */}
            <div className="md:w-1/3">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Resim Yok</span>
                </div>
              )}
            </div>

            {/* Kitap Bilgileri */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-600">{book.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {book.category.name}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {book.pricePerDay} TL/gün
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Kitap Sahibi</h3>
                  <p className="text-gray-600">{book.owner.name}</p>
                </div>

                {/* Mevcut Kiralamalar Bilgisi */}
                {hasRentals && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Mevcut Kiralamalar</h3>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {book.rentals.map((rental) => (
                        <li key={rental.id}>
                          {new Date(rental.startDate).toLocaleDateString('tr-TR')} - {new Date(rental.endDate).toLocaleDateString('tr-TR')} arası kiralanmış
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Kiralama Formu */}
              {!isOwner && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4">Kitap Kirala</h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleRental} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Ücret Hesaplama */}
                    {totalPrice > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-900 font-medium">Toplam Ücret:</span>
                          <span className="text-2xl font-bold text-blue-600">{totalPrice} TL</span>
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          {startDate && endDate && (
                            <>
                              {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} gün × {book.pricePerDay} TL/gün
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={rentalLoading || totalPrice === 0}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {rentalLoading ? "İşleniyor..." : "Kirala"}
                    </button>
                  </form>
                </div>
              )}

              {/* Kitap Sahibi Mesajı */}
              {isOwner && (
                <div className="border-t pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Kendi Kitabınız</h3>
                    <p className="text-yellow-700 text-sm">
                      Bu kitabın sahibi sizsiniz. Kendi kitabınızı kiralayamazsınız.
                    </p>
                  </div>
                </div>
              )}

              {/* --- BASİT DEĞERLENDİRME BÖLÜMÜ --- */}
              <div className="border-t pt-6 mt-8">
                <h3 className="text-xl font-semibold mb-2 text-brown-800">Değerlendirmeler</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl text-yellow-500 flex items-center">
                    {averageRating > 0 ? (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={`h-6 w-6 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-brown-200'}`} />
                        ))}
                      </>
                    ) : (
                      <span className="text-brown-400">Henüz puan yok</span>
                    )}
                  </span>
                  {totalReviews > 0 && (
                    <span className="text-brown-700 font-medium">{averageRating} / 5</span>
                  )}
                  <span className="text-brown-500 text-sm">({totalReviews} değerlendirme)</span>
                </div>

                {/* Kendi değerlendirme formu */}
                {user && hasRented && (
                  <form onSubmit={handleReviewSubmit} className="mb-4 mt-2 bg-cream-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setMyRating(star)}
                          className="focus:outline-none"
                        >
                          <StarIcon className={`h-7 w-7 ${myRating >= star ? 'text-yellow-400' : 'text-brown-200'}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-brown-700">{myRating > 0 && `${myRating} yıldız`}</span>
                    </div>
                    <textarea
                      className="w-full p-2 border border-brown-200 rounded bg-cream-50 text-brown-800 mb-2"
                      rows={2}
                      placeholder="Yorumunuz (isteğe bağlı)"
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="bg-brown-600 text-white px-4 py-2 rounded hover:bg-brown-700 disabled:opacity-50"
                    >
                      {reviewLoading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    {reviewError && <div className="text-red-600 text-sm mt-2">{reviewError}</div>}
                    {reviewSuccess && <div className="text-green-700 text-sm mt-2">{reviewSuccess}</div>}
                  </form>
                )}
                {/* Değerlendirme yoksa bilgi */}
                {totalReviews === 0 && (
                  <div className="text-brown-500 text-sm">Henüz değerlendirme yok.</div>
                )}
                {/* Değerlendirme listesi */}
                {reviews.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {reviews.slice(0,5).map((r) => (
                      <div key={r.id} className="bg-cream-50 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400' : 'text-brown-200'}`} />
                          ))}
                          <span className="text-brown-700 text-sm ml-2">{r.user.name}</span>
                          <span className="text-brown-400 text-xs ml-2">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {r.comment && <div className="text-brown-800 text-sm">{r.comment}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* --- /BASİT DEĞERLENDİRME BÖLÜMÜ --- */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 