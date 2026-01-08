'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { Wallet, ArrowRightLeft, Loader2 } from 'lucide-react';

export default function RedeemPage() {
  const [amount, setAmount] = useState(20000); // 20k, 50k, 100k
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('Momo');
  const [loading, setLoading] = useState(false);
const supabase = createClient();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const pointsNeeded = amount / 10; // Giả sử 10đ = 1 điểm

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vui lòng đăng nhập");

      // 1. Kiểm tra số dư điểm
      const { data: userData } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if ((userData?.points || 0) < pointsNeeded) {
        throw new Error("Bạn không đủ điểm để đổi gói này!");
      }

      // 2. Trừ điểm người dùng
      await supabase
        .from('user_points')
        .update({ points: userData!.points - pointsNeeded })
        .eq('user_id', user.id);

      // 3. Tạo lệnh rút tiền
      await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount_money: amount,
        points_spent: pointsNeeded,
        phone_number: phone,
        provider: provider,
        status: 'pending'
      });

      alert("Yêu cầu đã được gửi! Tiền sẽ về ví bạn trong vòng 24h.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
          <Wallet /> Đổi điểm thưởng
        </h1>

        <form onSubmit={handleRedeem} className="bg-white p-6 rounded-3xl shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chọn số tiền muốn nhận</label>
            <div className="grid grid-cols-3 gap-2">
              {[20000, 50000, 100000].map(val => (
                <button
                  key={val} type="button"
                  onClick={() => setAmount(val)}
                  className={`p-3 rounded-xl border-2 transition ${amount === val ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}
                >
                  {val/1000}k
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Cần {amount/10} điểm để đổi</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ví nhận tiền</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-xl outline-none"
              value={provider} onChange={(e) => setProvider(e.target.value)}
            >
              <option>Momo</option>
              <option>Zalopay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Số điện thoại ví</label>
            <input 
              type="tel" placeholder="09xxxxxxxx" required
              className="w-full p-4 bg-gray-50 rounded-xl outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft size={20} />}
            Đổi ngay
          </button>
        </form>
      </div>
    </main>
  );
}