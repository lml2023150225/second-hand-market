'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-emerald-600 shrink-0">
          🏫 校园二手
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索商品..."
            className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-400"
          />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link href="/publish" className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition">
                发布商品
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-emerald-600 text-sm">
                购物车
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-emerald-600"
                >
                  <span className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.username}</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border py-1">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        个人中心
                      </Link>
                      <Link href="/dashboard/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        我的订单
                      </Link>
                      <Link href="/dashboard/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        我的商品
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                      >
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-emerald-600">
                登录
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
