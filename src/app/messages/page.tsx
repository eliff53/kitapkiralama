"use client";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include"
      });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error("Kullanıcı bilgisi alınamadı:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      } else {
        setError(data.error || "Mesajlar yüklenemedi");
      }
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Kullanıcılar yüklenemedi:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiver || !messageContent.trim()) {
      setError("Alıcı seçin ve mesaj yazın");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: parseInt(selectedReceiver),
          content: messageContent.trim()
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Mesaj gönderildi");
        setMessageContent("");
        setSelectedReceiver("");
        fetchMessages(); // Mesaj listesini yenile
      } else {
        setError(data.error || "Mesaj gönderilemedi");
      }
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setSending(false);
    }
  };

  const isOwnMessage = (message: Message) => {
    return currentUser && message.sender.id === currentUser.id;
  };

  const getReceivedMessages = () => {
    if (!currentUser) return [];
    return messages.filter(msg => msg.receiver.id === currentUser.id);
  };

  const getSentMessages = () => {
    if (!currentUser) return [];
    return messages.filter(msg => msg.sender.id === currentUser.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-cream-300 py-16">
        <div className="text-lg text-brown-800">Yükleniyor...</div>
      </div>
    );
  }

  const receivedMessages = getReceivedMessages();
  const sentMessages = getSentMessages();

  return (
    <div className="bg-cream-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-brown-800">Mesajlar</h1>

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mesaj Gönderme */}
          <div className="bg-cream-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-brown-800">Yeni Mesaj Gönder</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-brown-700">Alıcı</label>
                <select
                  value={selectedReceiver}
                  onChange={(e) => setSelectedReceiver(e.target.value)}
                  className="w-full p-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 bg-cream-50 text-brown-800"
                  required
                >
                  <option value="">Kullanıcı seçin</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-brown-700">Mesaj</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 bg-cream-50 text-brown-800"
                  placeholder="Mesajınızı yazın..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-brown-600 text-white py-3 rounded-lg hover:bg-brown-700 transition disabled:opacity-50"
              >
                {sending ? "Gönderiliyor..." : "Mesaj Gönder"}
              </button>
            </form>
          </div>

          {/* Gelen Mesajlar */}
          <div className="bg-cream-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-brown-800">
              Gelen Mesajlar ({receivedMessages.length})
            </h2>
            {receivedMessages.length === 0 ? (
              <div className="text-brown-500 text-center py-8">
                Henüz gelen mesaj yok
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {receivedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg bg-cream-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-brown-800">
                        {message.sender.name} → Sen
                      </div>
                      <div className="text-xs text-brown-600">
                        {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="text-brown-700">{message.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gönderilen Mesajlar */}
        <div className="mt-8">
          <div className="bg-cream-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-brown-800">
              Gönderilen Mesajlar ({sentMessages.length})
            </h2>
            {sentMessages.length === 0 ? (
              <div className="text-brown-500 text-center py-8">
                Henüz mesaj göndermemişsiniz
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg bg-brown-100 ml-8"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-brown-800">
                        Sen → {message.receiver.name}
                      </div>
                      <div className="text-xs text-brown-600">
                        {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="text-brown-700">{message.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 