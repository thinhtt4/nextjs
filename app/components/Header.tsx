'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, LogOut, UserCircle } from 'lucide-react'; // Thêm icon cho đẹp
import { type User } from '@supabase/supabase-js';
export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/'); // Quay về trang chủ khi đăng xuất
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    router.refresh(); // Làm mới lại trang để cập nhật trạng thái
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm relative">
      <Link href="/" className="text-xl font-bold text-green-600">
        Ve Chai Công Nghệ
      </Link>

      <div className="relative">
        {user ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
            >
              <img 
                src={user.user_metadata.avatar_url || 'https://via.placeholder.com/40'} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-green-500 p-0.5"
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-32 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowDropdown(false)}
                >
                  <UserCircle size={18} />
                  Chỉnh sửa Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            )}
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