"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, address }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setError(data.error || "Bir hata oluştu");
    }
  };

  return (
    <div className="flex items-center justify-center bg-cream-300 py-16">
      <form
        onSubmit={handleSubmit}
        className="bg-cream-100 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-brown-800">Kayıt Ol</h2>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-brown-700">Ad Soyad</label>
          <input
            type="text"
            className="w-full border border-brown-300 px-3 py-2 rounded focus:outline-none focus:ring focus:border-brown-400 text-brown-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-brown-700">E-posta</label>
          <input
            type="email"
            className="w-full border border-brown-300 px-3 py-2 rounded focus:outline-none focus:ring focus:border-brown-400 text-brown-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-brown-700">Şifre</label>
          <input
            type="password"
            className="w-full border border-brown-300 px-3 py-2 rounded focus:outline-none focus:ring focus:border-brown-400 text-brown-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-brown-700">Adres</label>
          <input
            type="text"
            className="w-full border border-brown-300 px-3 py-2 rounded focus:outline-none focus:ring focus:border-brown-400 text-brown-900"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brown-600 text-white py-2 rounded hover:bg-brown-700 transition"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  );
} 