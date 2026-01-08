'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Coins, Package, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const supabase = createClient(); 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Lấy điểm số
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .single();
      
      if (pointsData) setPoints(pointsData.points);

      // 2. Lấy lịch sử thu gom
      const { data: historyData } = await supabase
        .from('waste_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (historyData) setHistory(historyData);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu xanh...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header Profile */}
      <div className="bg-green-600 p-8 text-white rounded-b-[3rem] shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Chào hiệp sĩ xanh!</h1>
        <p className="opacity-80 text-sm">Cảm ơn bạn đã bảo vệ môi trường hôm nay</p>
        
        {/* Điểm số */}
        <div className="mt-6 bg-white/20 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <Coins className="text-white" />
          </div>
          <div>
            <p className="text-xs opacity-80">Tổng điểm tích lũy</p>
            <p className="text-2xl font-black">{points.toLocaleString()} điểm</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Lịch sử thu gom</h2>
        
        {history.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <Package className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-400">Bạn chưa có đơn thu gom nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.status === 'done' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {item.status === 'done' ? (
                      <CheckCircle2 className="text-green-600" size={20} />
                    ) : (
                      <Clock className="text-orange-600" size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.type}</h3>
                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-700">{item.weight} kg</p>
                  <p className={`text-[10px] font-bold uppercase ${item.status === 'done' ? 'text-green-500' : 'text-orange-500'}`}>
                    {item.status === 'done' ? 'Hoàn thành' : 'Đang chờ'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}