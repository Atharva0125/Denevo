export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10 px-6 text-center text-sm text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-purple-600 text-white font-bold text-xs flex items-center justify-center">D</div>
          <span className="font-semibold text-gray-800">Denevo</span>
          <span className="text-gray-400">— From Promise to Done.</span>
        </div>
        <p>© 2026 Denevo. Built in India.</p>
      </div>
    </footer>
  );
}