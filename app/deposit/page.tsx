'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, MapPin, MessageCircle, CheckCircle } from 'lucide-react'; // Thêm icon

export default function DepositPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // THÊM DÒNG NÀY: Quản lý trạng thái thành công
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('Nhựa');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const getMyLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGettingLocation(false);
        },
        (error) => {
          alert("Không thể lấy vị trí. Vui lòng cấp quyền truy cập GPS.");
          setGettingLocation(false);
        }
      );
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert("Vui lòng chọn ảnh!"); return; }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập!');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('waste-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('waste_posts').insert({
        user_id: user.id,
        type: type,
        weight: parseFloat(weight),
        status: 'pending',
        image_url: fileName, 
        latitude: location?.lat,
        longitude: location?.lng,
      });

      if (dbError) throw dbError;

      // THAY ĐỔI Ở ĐÂY: Thay vì alert và chuyển trang ngay, ta hiện màn hình thành công
      setIsSuccess(true); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // NẾU GỬI THÀNH CÔNG, HIỂN THỊ MÀN HÌNH NÀY
  if (isSuccess) {
    const phoneCollector = process.env.NEXT_PUBLIC_PHONE_COLLECTOR; 
const googleMapsLink = location 
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}` 
    : "Chưa có vị trí";

  // Tạo nội dung tin nhắn không dùng \n mà dùng khoảng cách rõ ràng
  const message = `Chào bạn, mình cần bán ve chai: Loại ${type}, nặng tầm ${weight}kg. Vị trí của mình: ${googleMapsLink}`;
  
  // Quan trọng: Sử dụng encodeURIComponent để bảo vệ nội dung tin nhắn
  const zaloLink = `https://zalo.me/${phoneCollector}?text=${encodeURIComponent(message)}`;

    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="text-green-600" size={60} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng đơn thành công!</h1>
        <p className="text-gray-500 mb-8">Bạn nên nhắn tin Zalo cho người thu gom để đơn được xử lý nhanh nhất.</p>
        
        <div className="w-full space-y-3">
          <a 
            href={zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#0068ff] text-white w-full p-4 rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition"
          >
            <MessageCircle size={20} />
            Nhắn Zalo cho người thu gom
          </a>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full p-4 text-gray-500 font-medium"
          >
            Về trang cá nhân
          </button>
        </div>
      </main>
    );
  }

  // GIỮ NGUYÊN PHẦN RETURN FORM CỦA BẠN Ở DƯỚI...
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

          type="button"

          onClick={getMyLocation}

          className={`w-full mb-4 p-3 rounded-xl border flex items-center justify-center gap-2 ${location ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}

        >

          <MapPin size={18} />

          {gettingLocation ? 'Đang xác vị trí...' : location ? 'Đã lấy vị trí thành công' : 'Chia sẻ vị trí để thu gom nhanh hơn'}

        </button>



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