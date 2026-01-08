'use client';
import { useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // XÓA DÒNG NÀY
import { createClient } from '@/utils/supabase/client'; // THÊM DÒNG NÀY
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2 } from 'lucide-react';

export default function DepositPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('Nhựa');
  const [weight, setWeight] = useState('');
  
  const supabase = createClient(); // ĐỔI THÀNH HÀM NÀY
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chụp ảnh hoặc chọn ảnh phế liệu!");
      return;
    }
    setLoading(true);

    try {
      // 1. Lấy thông tin người dùng
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập để tiếp tục!');

      let imageUrl = '';

      // 2. Tải ảnh lên Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`; // Đặt tên file theo User ID để dễ quản lý

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('waste-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      imageUrl = fileName;

      // 3. Lưu thông tin vào bảng waste_posts
      const { error: dbError } = await supabase.from('waste_posts').insert({
        user_id: user.id,
        type: type,
        weight: parseFloat(weight),
        status: 'pending',
        image_url: imageUrl, 
      });

      if (dbError) throw dbError;

      alert('Đăng tin thành công! Người thu gom sẽ sớm liên hệ.');
      router.push('/');
      router.refresh(); // Làm mới dữ liệu trang chủ
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-green-600 p-6 text-white text-center">
        <h1 className="text-xl font-bold">Đăng tin thu gom</h1>
      </div>

      <form onSubmit={handleUpload} className="max-w-md mx-auto mt-6 p-6 bg-white rounded-2xl shadow-sm">
        {/* Chụp ảnh/Chọn ảnh */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh phế liệu</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center relative overflow-hidden">
            {file ? (
              <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" />
            ) : (
              <>
                <Camera className="text-gray-400 mb-2" size={32} />
                <span className="text-sm text-gray-400">Chụp hoặc chọn ảnh</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Chọn loại rác */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại phế liệu</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option>Nhựa</option>
            <option>Giấy</option>
            <option>Kim loại</option>
            <option>Thiết bị điện tử</option>
          </select>
        </div>

        {/* Khối lượng ước tính */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Khối lượng ước tính (kg)</label>
          <input 
            type="number" 
            placeholder="Ví dụ: 2.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu thu gom'}
        </button>
      </form>
    </main>
  );
}