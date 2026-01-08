'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Kiểm tra user hiện tại khi load trang
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Lắng nghe thay đổi trạng thái đăng nhập (đăng nhập/đăng xuất)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link href="/" className="text-xl font-bold text-green-600">
        Ve Chai Công Nghệ
      </Link>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user.user_metadata.full_name || 'Người dùng'}
              </span>
              <img 
                src={user.user_metadata.avatar_url || 'https://via.placeholder.com/40'} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-green-500 p-0.5"
              />
            </Link>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}