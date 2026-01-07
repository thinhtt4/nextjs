'use client';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2 text-green-700">Chào mừng bạn!</h1>
        <p className="text-gray-500 mb-8">Hãy đăng nhập để cùng bảo vệ môi trường</p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 p-4 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
          Tiếp tục với Google
        </button>

        <p className="mt-8 text-xs text-gray-400">
          Bằng cách đăng nhập, bạn đồng ý với Điều khoản của Ve Chai Công Nghệ
        </p>
      </div>
    </div>
  );
}