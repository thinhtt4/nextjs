'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { Check, MapPin, Trash2, Loader2, Navigation } from 'lucide-react';

export default function CollectorPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('waste_posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleConfirm = async (postId: string, userId: string, weight: number) => {
    setProcessingId(postId);
    try {
      // 1. Cập nhật trạng thái đơn hàng thành 'done'
      await supabase
        .from('waste_posts')
        .update({ status: 'done' })
        .eq('id', postId);

      // 2. Cộng điểm cho người dùng (ví dụ: 1kg = 100 điểm)
      const pointsToAdd = Math.floor(weight * 100);
      
      // Lấy điểm hiện tại
      const { data: currentPoints } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

      // Cập nhật điểm mới
      await supabase
        .from('user_points')
        .update({ points: (currentPoints?.points || 0) + pointsToAdd })
        .eq('user_id', userId);

      alert(`Đã xác nhận thành công! Đã cộng ${pointsToAdd} điểm cho người dùng.`);
      fetchRequests(); // Tải lại danh sách
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-green-600 font-bold">Đang tìm đơn hàng mới...</div>;

  return (
    <main className="min-h-screen bg-slate-900 p-6 text-white">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-green-400">Bảng điều khiển Thu Gom</h1>
        <p className="text-slate-400 text-sm">Danh sách các hộ gia đình đang chờ bạn</p>
      </header>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-3xl">
            <Trash2 className="mx-auto text-slate-600 mb-2" size={48} />
            <p className="text-slate-500">Hiện tại không có đơn hàng nào chờ thu gom.</p>
          </div>
        ) : (
          requests.map((item) => (
            <div key={item.id} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    {item.type}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{item.weight} kg phế liệu</h3>
                </div>
                {item.image_url && (
                   <img 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/waste-images/${item.image_url}`} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-600"
                    alt="Rác thải"
                   />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                <MapPin size={14} />
                <span>Khu vực: Quận 1, TP.HCM</span>
              </div>
              {item.latitude && item.longitude && (
                <a 
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 w-full flex items-center justify-center gap-2 text-blue-400 border border-blue-400/30 py-2 rounded-2xl text-sm hover:bg-blue-400/10 transition"
                >
                    <Navigation size={16} />
                    Xem vị trí trên Google Maps
                </a>
                )}

              <button
                onClick={() => handleConfirm(item.id, item.user_id, item.weight)}
                disabled={processingId === item.id}
                className="w-full bg-green-500 hover:bg-green-600 text-slate-900 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {processingId === item.id ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                Xác nhận đã thu gom
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}