'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, MapPin, MessageCircle, CheckCircle, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai"; // 1. Import Gemini

export default function DepositPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); // Trạng thái AI đang đọc ảnh
  const [isSuccess, setIsSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('Nhựa');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // 2. Hàm xử lý AI
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setAnalyzing(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Chuyển file ảnh sang Base64 để gửi cho AI
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(selectedFile);
      });

      const prompt = "Đây là ảnh phế liệu. Hãy phân loại nó vào 1 trong 4 nhóm: Nhựa, Giấy, Kim loại, Thiết bị điện tử. Ước tính khối lượng (kg) nếu đầy túi trong ảnh. Trả về kết quả theo định dạng JSON: {\"type\": \"...\", \"weight\": ...}";

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: selectedFile.type } }
      ]);

      const responseText = result.response.text();
      // Tìm và bóc tách JSON từ phản hồi của AI
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setType(data.type);
        setWeight(data.weight.toString());
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getMyLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGettingLocation(false);
        },
        (error) => {
          alert("Không lấy được GPS.");
          setGettingLocation(false);
        }
      );
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Vui lòng đăng nhập!');

      const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('waste-images').upload(fileName, file);

      const { error: dbError } = await supabase.from('waste_posts').insert({
        user_id: user.id,
        type,
        weight: parseFloat(weight),
        status: 'pending',
        image_url: fileName, 
        latitude: location?.lat,
        longitude: location?.lng,
      });

      if (dbError) throw dbError;
      setIsSuccess(true); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-green-600 p-6 text-white text-center">
        <h1 className="text-xl font-bold">AI Thu Gom Ve Chai</h1>
      </div>

      <form onSubmit={handleUpload} className="max-w-md mx-auto mt-6 p-6 bg-white rounded-2xl shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chụp ảnh phế liệu</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
            {file ? (
              <>
                <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <Sparkles className="animate-bounce mb-2" />
                    <p className="text-xs font-bold">AI đang phân loại...</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <Camera className="text-gray-400 mb-2" size={32} />
                <span className="text-sm text-gray-400">Nhấn để chụp ảnh</span>
              </>
            )}
            <input 
              type="file" accept="image/*" capture="environment"
              onChange={handleFileChange} // Sử dụng hàm thay đổi ảnh mới
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 italic">AI gợi ý Loại</label>
            <input 
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full p-3 rounded-xl border bg-yellow-50 border-yellow-200 outline-none font-bold text-green-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 italic">AI gợi ý Cân nặng</label>
            <input 
              type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 rounded-xl border bg-yellow-50 border-yellow-200 outline-none font-bold text-green-700"
            />
          </div>
        </div>

        <button 
          type="button" onClick={getMyLocation}
          className={`w-full mb-4 p-3 rounded-xl border flex items-center justify-center gap-2 ${location ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200'}`}
        >
          <MapPin size={18} />
          {gettingLocation ? 'Lấy tọa độ...' : location ? 'Đã định vị' : 'Xác định vị trí'}
        </button>

        <button 
          type="submit" disabled={loading || analyzing}
          className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu ngay'}
        </button>
      </form>
    </main>
  );
}