"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBook, FaUserShield, FaTachometerAlt, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaEnvelope } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  // Kullanıcı bilgisini çek
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // Çıkış işlemi
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-cream-100 shadow py-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-brown-800">Kitap Kiralama</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaTachometerAlt />Anasayfa</Link>
              <Link href="/books" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaBook />Kitaplar</Link>
              <Link href="/messages" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaEnvelope />Mesajlar</Link>
              <Link href="/profile" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaUser />Profil</Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaUserShield />Admin Panel</Link>
              )}
                <button
                  onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                <FaSignOutAlt />Çıkış Yap
                </button>
            </>
            ) : (
            <>
              <Link href="/login" className="flex items-center gap-1 text-brown-700 hover:text-brown-900 font-medium"><FaSignInAlt />Giriş Yap</Link>
              <Link href="/register" className="flex items-center gap-1 bg-brown-600 text-white px-4 py-2 rounded hover:bg-brown-700 transition text-sm"><FaUserPlus />Kayıt Ol</Link>
            </>
            )}
        </div>
      </div>
    </nav>
  );
} 