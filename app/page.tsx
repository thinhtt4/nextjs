import Link from 'next/link';
import { Recycle, Truck, Coins, ArrowRight } from 'lucide-react';

export default function Home() {
  const priceList = [
    { type: 'Nhựa (PET)', price: '5,000đ/kg', icon: '🥤' },
    { type: 'Giấy các loại', price: '3,500đ/kg', icon: '📦' },
    { type: 'Kim loại', price: '15,000đ/kg', icon: '🥫' },
  ];

  return (
    <main className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <header className="bg-green-600 py-12 px-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Ve Chai Công Nghệ</h1>
        <p className="text-lg mb-8 opacity-90">Biến rác thải thành điểm thưởng và quà tặng</p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="bg-white text-green-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-green-100 transition">
            Bắt đầu ngay
          </Link>
             <Link href="/dashboard" className="bg-white text-green-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-green-100 transition">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Stats/Price List */}
      <section className="max-w-4xl mx-auto -mt-8 bg-white rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {priceList.map((item, index) => (
          <div key={index} className="flex flex-col items-center p-4 border-b md:border-b-0 md:border-r last:border-0 border-gray-100">
            <span className="text-3xl mb-2">{item.icon}</span>
            <h3 className="font-medium text-gray-500">{item.type}</h3>
            <p className="text-xl font-bold text-green-600">{item.price}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">Quy trình 3 bước</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="text-green-600" />
            </div>
            <h3 className="font-bold mb-2">1. Phân loại</h3>
            <p className="text-gray-600 text-sm">Gom giấy, nhựa, kim loại sạch tại nhà.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="text-green-600" />
            </div>
            <h3 className="font-bold mb-2">2. Đặt lịch</h3>
            <p className="text-gray-600 text-sm">Chọn thời gian, người thu gom sẽ đến tận nơi.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="text-green-600" />
            </div>
            <h3 className="font-bold mb-2">3. Nhận điểm</h3>
            <p className="text-gray-600 text-sm">Tích điểm đổi quà hoặc tiền mặt qua ví.</p>
          </div>
        </div>
      </section>
    </main>
  );
}