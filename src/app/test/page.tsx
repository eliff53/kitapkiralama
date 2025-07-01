export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Tailwind CSS Çalışıyor!
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Eğer bu sayfa güzel görünüyorsa, Tailwind CSS düzgün yüklenmiş demektir.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-2xl mb-2">🔵</div>
            <div className="font-semibold text-blue-800">Mavi</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-2xl mb-2">🟢</div>
            <div className="font-semibold text-green-800">Yeşil</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="text-2xl mb-2">🔴</div>
            <div className="font-semibold text-red-800">Kırmızı</div>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold">
          Test Butonu
        </button>
      </div>
    </div>
  );
} 