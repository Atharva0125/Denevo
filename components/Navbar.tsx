import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full px-5 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          D
        </div>
        <span className="font-bold text-lg text-gray-900 tracking-tight">Denevo</span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-gray-600 hover:text-purple-600 px-2.5 py-1.5"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold bg-purple-600 text-white px-3.5 py-1.5 rounded-full hover:bg-purple-700 transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}